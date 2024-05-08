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
                    "province": {
                        "type": "string",
                        "description": "要查询的省份全称，如果是直辖市，则返回'中华人民共和国'"
                    },
                    "city": {
                        "type": "string",
                        "description": "要查询的城市全称，带上市、区、县、自治区这些字"
                    },
                    "extensions": {
                        "type": "string",
                        "description": "Optional values: base/all\nbase: returns current weather\nall: returns forecasted weather"
                    }
                },
                "required": ["province", "city", "extensions"]
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