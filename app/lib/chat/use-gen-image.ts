import { nanoid } from '@/app/lib/utils'
import { type UseChatOptions, Message, UseChatHelpers, CreateMessage, ChatRequestOptions, ChatRequest, IdGenerator, JSONValue } from '@/app/lib/chat/type'
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import useSWR, { KeyedMutator } from 'swr';
import { callDalleApi } from './call-dalle-api';

const getResponse = async (
    api: string,
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
) => {
    const previousMessages = messagesRef.current;
    mutate(chatRequest.messages, false);
  
    return await callDalleApi({
        api,
        messages: chatRequest.messages,
        body: {
            data: chatRequest.data,
            ...extraMetadataRef.current.body,
            ...chatRequest.options?.body,
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
  

export function useGenImage({
    api = '/api/dalle3',
    id,
    initialMessages,
    initialInput = '',
    sendExtraMessageFields,
    onResponse,
    onFinish,
    onError,
    credentials,
    headers,
    body,
    generateId = nanoid,
  }: Omit<UseChatOptions, 'api'> & {
    // api?: string | StreamingReactResponseAction;
    api?: string;
    key?: string;
  } = {}): UseChatHelpers {
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

    // console.log(messages)

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
        
                getResponse(
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
                ),
    
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
            mutate(messages, false);
            messagesRef.current = messages;
        },
        [mutate],
    );
  
    // Input state and handlers.
    const [input, setInput] = useState(initialInput);
  
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
    
            append(
            {
                content: input,
                role: 'user',
                createdAt: new Date(),
            },
            options,
            );
            setInput('');
        },
        [input, append],
    );
  
    const handleInputChange = (e: any) => {
          setInput(e.target.value);
    };
  
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
        handleSubmit,
        isLoading,
        data: streamData,
    };
}