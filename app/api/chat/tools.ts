import { ChatCompletionTool } from "openai/resources/index.mjs";

const TOOLS: Record<string, ChatCompletionTool> = {
    "text_to_image": {
        "type": "function",
        "function": {
            "name": "text_to_image",
            "description": "draw an image according to text",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "a prompt to draw"
                    }
                },
                "required": ["prompt"]
            }
        }
    },
    "get_weather": {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "get current weather or weather forecast for the next four days",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "a city to get weather"
                    },
                    "extensions": {
                        "type": "string",
                        "description": "Optional values: base/all\nbase: returns current weather\nall: returns forecasted weather"
                    }
                },
                "required": ["city"]
            }
        }
    }
}

const getTools = (keys: string[]) => {
    const tools = []
    for (const key of keys) {
        tools.push(TOOLS[key])
    }
    return tools;
}

export { getTools };