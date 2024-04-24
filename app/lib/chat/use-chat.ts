import { nanoid } from '@/app/lib/utils'
import { type UseChatOptions, Message, UseChatHelpers, CreateMessage, ChatRequestOptions, ChatRequest, IdGenerator, JSONValue, Content } from '@/app/lib/chat/type'
import { processChatStream } from '@/app/lib/chat/process-chat-stream'
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { ReactResponseRow, experimental_StreamingReactResponse } from './streaming-react-response';
import { callChatApi } from './call-chat-api';

type StreamingReactResponseAction = (payload: {
    messages: Message[];
    data?: Record<string, string>;
}) => Promise<experimental_StreamingReactResponse>;

  
async function readRow(promise: Promise<ReactResponseRow>, 
    responseMessage: Message, 
    chatRequest: ChatRequest,
    mutate: KeyedMutator<Message[]>
) {
    const { content, ui, next } = await promise;

    // TODO: Handle function calls.
    responseMessage['content'] = content;
    responseMessage['ui'] = await ui;

    mutate([...chatRequest.messages, { ...responseMessage }], false);

    if (next) {
      await readRow(next, responseMessage, chatRequest, mutate);
    }
}

const getStreamedResponse = async (
    api: string | StreamingReactResponseAction,
    chatRequest: ChatRequest,
    mutate: KeyedMutator<Message[]>,
    mutateStreamData: KeyedMutator<JSONValue[] | undefined>,
    existingData: JSONValue[] | undefined,
    extraMetadataRef: React.MutableRefObject<any>,
    messagesRef: React.MutableRefObject<Message[]>,
    abortControllerRef: React.MutableRefObject<AbortController | null>,
    generateId: IdGenerator,
    onFinish?: (message: Message) => void,
    onResponse?: (response: Response) => void | Promise<void>,
    sendExtraMessageFields?: boolean,
) => {
    // Do an optimistic update to the chat state to show the updated messages
    // immediately.
    const previousMessages = messagesRef.current;
    mutate(chatRequest.messages, false);
  
    const constructedMessagesPayload = sendExtraMessageFields
        ? chatRequest.messages
        : chatRequest.messages.map(
            ({ role, content, name, function_call, tool_calls, tool_call_id }) => ({
                role,
                content,
                tool_call_id,
                ...(name !== undefined && { name }),
                ...(function_call !== undefined && {
                    function_call: function_call,
                }),
                ...(tool_calls !== undefined && {
                    tool_calls: tool_calls,
                }),
            }),
        );
  
    if (typeof api !== 'string') {
        // In this case, we are handling a Server Action. No complex mode handling needed.
    
        const replyId = generateId();
        const createdAt = new Date();
        let responseMessage: Message = {
            id: replyId,
            createdAt,
            content: '',
            role: 'assistant',
        };
    
        try {
            const promise = api({
                messages: constructedMessagesPayload as Message[],
                data: chatRequest.data,
            }) as Promise<ReactResponseRow>;
            await readRow(promise, responseMessage, chatRequest, mutate);
        } catch (e) {
            // Restore the previous messages if the request fails.
            mutate(previousMessages, false);
            throw e;
        }
    
        if (onFinish) {
            onFinish(responseMessage);
        }
    
        return responseMessage;
    }

    const imageMessage = chatRequest.messages.filter((item) => typeof item.content !== "string" )
  
    return await callChatApi({
        api,
        messages: constructedMessagesPayload,
        body: {
            modelName:　imageMessage.length > 0 && chatRequest.modelName == "gpt-4" ? "gpt-4-vision" : chatRequest.modelName,
            data: chatRequest.data,
            ...extraMetadataRef.current.body,
            ...chatRequest.options?.body,
            ...(chatRequest.functions !== undefined && {
            functions: chatRequest.functions,
            }),
            ...(chatRequest.function_call !== undefined && {
            function_call: chatRequest.function_call,
            }),
            ...(chatRequest.tools !== undefined && {
            tools: chatRequest.tools,
            }),
            ...(chatRequest.tool_choice !== undefined && {
            tool_choice: chatRequest.tool_choice,
            }),
        },
        credentials: extraMetadataRef.current.credentials,
        headers: {
            ...extraMetadataRef.current.headers,
            ...chatRequest.options?.headers,
        },
        abortController: () => abortControllerRef.current,
        appendMessage(message) {
            mutate([...chatRequest.messages, message], false);
        },
        restoreMessagesOnFailure() {
            mutate(previousMessages, false);
        },
        onResponse,
        onUpdate(merged, data) {
            mutate([...chatRequest.messages, ...merged], false);
            mutateStreamData([...(existingData || []), ...(data || [])], false);
        },
        onFinish,
        generateId,
    });
};

const MODEL_NAME: Record<string, string> = {
    "GPT3.5": "gpt-3.5-turbo",
    "GPT4": "gpt-4",
    "Dalle3": "dall-e-3"
}
  

export function useChat({
    api = '/api/chat',
    model = 'GPT3.5',
    id,
    initialMessages,
    initialInput = '',
    sendExtraMessageFields,
    experimental_onFunctionCall,
    experimental_onToolCall,
    onResponse,
    onFinish,
    onError,
    credentials,
    headers,
    body,
    generateId = nanoid,
  }: UseChatOptions & {
    key?: string;
  } = {}): UseChatHelpers {
    let modelName = MODEL_NAME[model]
   
    // Generate a unique id for the chat if not provided.
    const hookId = useId();
    const idKey = id ?? hookId;
    // const chatKey = typeof api === 'string' ? [api, idKey] : idKey;
    const chatKey = idKey;
  
    // Store a empty array as the initial messages
    // (instead of using a default parameter value that gets re-created each time)
    // to avoid re-renders:
    const [initialMessagesFallback] = useState([]);
  
    // Store the chat state in SWR, using the chatId as the key to share states.
    const { data: messages, mutate } = useSWR<Message[]>(
      [chatKey, 'messages'],
      null,
      { fallbackData: initialMessages ?? initialMessagesFallback },
    );

    // We store loading state in another hook to sync loading states across hook invocations
    const { data: isLoading = false, mutate: mutateLoading } = useSWR<boolean>(
      [chatKey, 'loading'],
      null,
    );

    const { data: streamData, mutate: mutateStreamData } = useSWR<
      JSONValue[] | undefined
    >([chatKey, 'streamData'], null);
  
    const { data: error = undefined, mutate: setError } = useSWR<
      undefined | Error
    >([chatKey, 'error'], null);
  
    // Keep the latest messages in a ref.
    const messagesRef = useRef<Message[]>(messages || []);
    useEffect(() => {
      messagesRef.current = messages || [];
    }, [messages]);
  
    // Abort controller to cancel the current API call.
    const abortControllerRef = useRef<AbortController | null>(null);
  
    const extraMetadataRef = useRef({
      credentials,
      headers,
      body,
    });
  
    useEffect(() => {
      extraMetadataRef.current = {
        credentials,
        headers,
        body,
      };
    }, [credentials, headers, body]);
  
    const triggerRequest = useCallback(
        async (chatRequest: ChatRequest) => {
            try {
                mutateLoading(true);
                setError(undefined);
        
                const abortController = new AbortController();
                abortControllerRef.current = abortController;
        
                await processChatStream({
                    getStreamedResponse: () =>
                        getStreamedResponse(
                            api,
                            chatRequest,
                            mutate,
                            mutateStreamData,
                            streamData!,
                            extraMetadataRef,
                            messagesRef,
                            abortControllerRef,
                            generateId,
                            onFinish,
                            onResponse,
                            sendExtraMessageFields,
                        ),
                    experimental_onFunctionCall,
                    experimental_onToolCall,
                    updateChatRequest: chatRequestParam => {
                        chatRequest = chatRequestParam;
                    },
                    getCurrentMessages: () => messagesRef.current,
                });
    
                abortControllerRef.current = null;
            } catch (err) {
                // Ignore abort errors as they are expected.
                if ((err as any).name === 'AbortError') {
                    abortControllerRef.current = null;
                    return null;
                }
        
                if (onError && err instanceof Error) {
                    onError(err);
                }
        
                setError(err as Error);
            } finally {
                mutateLoading(false);
                setImages([])
            }
        },
        [
            mutate,
            mutateLoading,
            api,
            extraMetadataRef,
            onResponse,
            onFinish,
            onError,
            setError,
            mutateStreamData,
            streamData,
            sendExtraMessageFields,
            experimental_onFunctionCall,
            experimental_onToolCall,
            messagesRef,
            abortControllerRef,
            generateId,
        ],
    );
  
    const append = useCallback(
        async (
            message: Message | CreateMessage,
            {
                options,
                functions,
                function_call,
                tools,
                tool_choice,
                data,
            }: ChatRequestOptions = {},
        ) => {
            if (!message.id) {
                message.id = generateId();
            }
    
            const chatRequest: ChatRequest = {
                messages: messagesRef.current.concat(message as Message),
                modelName,
                options,
                data,
                ...(functions !== undefined && { functions }),
                ...(function_call !== undefined && { function_call }),
                ...(tools !== undefined && { tools }),
                ...(tool_choice !== undefined && { tool_choice }),
            };
    
            return triggerRequest(chatRequest);
        },
        [triggerRequest, generateId],
    );
  
    const reload = useCallback(
        async ({
            options,
            functions,
            function_call,
            tools,
            tool_choice,
        }: ChatRequestOptions = {}) => {
            if (messagesRef.current.length === 0) return null;
    
            // Remove last assistant message and retry last user message.
            const lastMessage = messagesRef.current[messagesRef.current.length - 1];
            if (lastMessage.role === 'assistant') {
            const chatRequest: ChatRequest = {
                messages: messagesRef.current.slice(0, -1),
                modelName,
                options,
                ...(functions !== undefined && { functions }),
                ...(function_call !== undefined && { function_call }),
                ...(tools !== undefined && { tools }),
                ...(tool_choice !== undefined && { tool_choice }),
            };
    
            return triggerRequest(chatRequest);
            }
    
            const chatRequest: ChatRequest = {
            messages: messagesRef.current,
                modelName,
                options,
                ...(functions !== undefined && { functions }),
                ...(function_call !== undefined && { function_call }),
                ...(tools !== undefined && { tools }),
                ...(tool_choice !== undefined && { tool_choice }),
            };
    
            return triggerRequest(chatRequest);
        },
        [triggerRequest],
    );
  
    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);
  
    const setMessages = useCallback(
        (messages: Message[]) => {
            if (messages.length === 0) {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                    abortControllerRef.current = null;
                }
            }
            mutate(messages, false);
            messagesRef.current = messages;
        },
        [mutate],
    );
  
    // Input state and handlers.
    const [input, setInput] = useState(initialInput);
    const [images, setImages] = useState<string[]>([]);
  
    const handleSubmit = useCallback(
        (
            e: React.FormEvent<HTMLFormElement>,
            options: ChatRequestOptions = {},
            metadata?: Object,
        ) => {
            if (metadata) {
            extraMetadataRef.current = {
                ...extraMetadataRef.current,
                ...metadata,
            };
            }
    
            e.preventDefault();
            if (!input) return;
            let content: string | Content[] = input;
            if (images && images.length > 0) {
                content = [{
                    "type": "text",
                    "text": input
                }]
                content = content.concat(images.map((imageUrl) => ({
                    "type": "image_url",
                    "image_url": imageUrl
                })))
            }
    
            append(
            {
                content: content,
                role: 'user',
                createdAt: new Date(),
            },
            options,
            );
            setInput('');
        },
        [input, images, append],
    );
  
    const handleInputChange = (e: any) => {
          setInput(e.target.value);
    };

    const handleSelectImageFile = (file: File) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = async function () {
            if (typeof reader.result === 'string') {
                setImages(prevImages => [...prevImages, reader.result as string])
            }
        }
    }
  
    return {
        messages: messages || [],
        error,
        append,
        reload,
        stop,
        setMessages,
        input,
        setInput,
        handleInputChange,
        images,
        setImages,
        handleSelectImageFile,
        handleSubmit,
        isLoading,
        data: streamData,
    };
}