import {
    ChatRequest,
    Message,
    JSONValue,
    ToolCallHandler,
} from './type';
    
// Make sure function call arguments are sent back to the API as a string
function fixFunctionCallArguments(response: ChatRequest) {
    for (const message of response.messages) {
        if (message.tool_calls !== undefined) {
        for (const toolCall of message.tool_calls) {
            if (typeof toolCall === 'object') {
            if (
                toolCall.function.arguments &&
                typeof toolCall.function.arguments !== 'string'
            ) {
                toolCall.function.arguments = JSON.stringify(
                toolCall.function.arguments,
                );
            }
            }
        }
        }
        if (message.function_call !== undefined) {
        if (typeof message.function_call === 'object') {
            if (
            message.function_call.arguments &&
            typeof message.function_call.arguments !== 'string'
            ) {
            message.function_call.arguments = JSON.stringify(
                message.function_call.arguments,
            );
            }
        }
        }
    }
}
  
export async function processChatStream({
    getStreamedResponse,
    experimental_onToolCall,
    updateChatRequest,
    getCurrentMessages,
}: {
    getStreamedResponse: () => Promise<
      Message | { messages: Message[]; data: JSONValue[] }
    >;
    experimental_onToolCall?: ToolCallHandler;
    updateChatRequest: (message: Message) => void;
    getCurrentMessages: () => Message[];
}) {
    while (true) {
        // TODO-STREAMDATA: This should be {  const { messages: streamedResponseMessages, data } =
        // await getStreamedResponse(} once Stream Data is not experimental
        const messagesAndDataOrJustMessage = await getStreamedResponse();

        const streamedResponseMessage = messagesAndDataOrJustMessage as Message;

        // TODO-STREAMDATA: Remove this once Stream Data is not experimental
        if (streamedResponseMessage.tool_calls === undefined ||
                typeof streamedResponseMessage.tool_calls === 'string'
        ) {
            break;
        }

        // If we get here and are expecting a tool call, the message should have one, if not warn and continue
        if (experimental_onToolCall) {
            const toolCalls = streamedResponseMessage.tool_calls;
            if (!(typeof toolCalls === 'object')) {
                console.warn(
                'experimental_onToolCall should not be defined when using functions',
                );
                continue;
            }
            const toolCallResponse: Message | void =
                await experimental_onToolCall(toolCalls);
    
            // If the user does not return anything as a result of the function call, the loop will break.
            if (toolCallResponse === undefined) break;
            // A function call response was returned.
            // The updated chat with function call response will be sent to the API in the next iteration of the loop.
            updateChatRequest(toolCallResponse);
        } else {
            break;
        }
    }
}
  