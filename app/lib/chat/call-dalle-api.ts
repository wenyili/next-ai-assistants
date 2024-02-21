import { parseComplexResponse } from './parse-complex-response';
import {
    IdGenerator,
    Message,
    JSONValue,
} from './type';
import { COMPLEX_HEADER, createChunkDecoder } from './utils';

export async function callDalleApi({
    api,
    messages,
    body,
    credentials,
    headers,
    abortController,
    appendMessage,
    restoreMessagesOnFailure,
    onResponse,
    onUpdate,
    onFinish,
    generateId,
}: {
    api: string;
    messages: Omit<Message, 'id'>[];
    body: Record<string, any>;
    credentials?: RequestCredentials;
    headers?: HeadersInit;
    abortController?: () => AbortController | null;
    restoreMessagesOnFailure: () => void;
    appendMessage: (message: Message) => void;
    onResponse?: (response: Response) => void | Promise<void>;
    onUpdate: (merged: Message[], data: JSONValue[] | undefined) => void;
    onFinish?: (message: Message) => void;
    generateId: IdGenerator;
}) {
    const response = await fetch(api, {
        method: 'POST',
        body: JSON.stringify({
            messages,
            ...body,
        }),
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        signal: abortController?.()?.signal,
        credentials,
    }).catch(err => {
        restoreMessagesOnFailure();
        throw err;
    });
    
    if (onResponse) {
        try {
            await onResponse(response);
        } catch (err) {
            throw err;
        }
    }
    
    if (!response.ok) {
        restoreMessagesOnFailure();
        throw new Error(
            (await response.text()) || 'Failed to fetch the chat response.',
        );
    }
    
    if (!response.body) {
        throw new Error('The response body is empty.');
    }
    
    const reader = response.body.getReader();
    const createdAt = new Date();
    const decode = createChunkDecoder(false);
    
    // TODO-STREAMDATA: Remove this once Stream Data is not experimental
    let streamedResponse = '';
    const replyId = generateId();
    let responseMessage: Message = {
        id: replyId,
        createdAt,
        content: '',
        role: 'assistant',
    };
    
    // TODO-STREAMDATA: Remove this once Stream Data is not experimental
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        // Update the chat state with the new message tokens.
        streamedResponse += decode(value);
        
        // The request has been aborted, stop reading the stream.
        if (abortController?.() === null) {
            reader.cancel();
            break;
        }
    }

    const data = JSON.parse(streamedResponse)  
    responseMessage['content'] = `![${data["revised_prompt"]}](${data["url"]})`;
    appendMessage({ ...responseMessage });
    
    if (onFinish) {
        onFinish(responseMessage);
    }
    
    return responseMessage;
}
