import { nanoid } from "nanoid";
import { Message, ToolCall, ToolCallHandler } from "./chat/type";

const TOOLS: Record<string, any> = {
    "text_to_image": async (args: Record<string, any>) => {
        const prompt = args['prompt']
        const message: Message = {
            id: nanoid(),
            role: 'user',
            content: prompt
        }
        const response = await fetch('api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: [ message ],
                modelName: 'dall-e-3'
            }),
            headers: {
              'Content-Type': 'application/json',
            }
        })

        const data = await response.json();
        return JSON.stringify(data)
    },
    
    "get_weather": async (args: Record<string, any>) => {
        const province = args['province']
        const city = args['city']
        const extensions = args['extensions']

        const response = await fetch('api/weather', {
            method: 'POST',
            body: JSON.stringify({
                province,
                city,
                extensions
            }),
            headers: {
              'Content-Type': 'application/json',
            }
        })

        const data = await response.json();
        return JSON.stringify(data)
    }
}

export const experimental_onToolCall: ToolCallHandler = async (
    toolCalls: ToolCall[],
): Promise<Message | void>  => {
    const toolCall: ToolCall = toolCalls[0]
    const result = await TOOLS[toolCall.function.name](JSON.parse(toolCall.function.arguments))
    return {
        id: nanoid(),
        tool_call_id: toolCall.id, 
        role: 'tool',
        name: toolCall.function.name,
        content: result
    }
}