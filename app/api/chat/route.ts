import { OpenAIStream } from '@/app/lib/chat/openai-stream'
import { StreamingTextResponse } from '@/app/lib/chat/streaming-text-response'
import OpenAI from 'openai'
import { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs'
import { getTools } from './tools'
export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY
const resource = process.env.AZURE_OPENAI_RESOURCE
const model = process.env.AZURE_OPENAI_MODEL
const model4 = process.env.AZURE_OPENAI_MODEL_GPT4
const model4vision = process.env.AZURE_OPENAI_MODEL_GPT4_VISION
const modelDalle3 = process.env.AZURE_OPENAI_MODEL_DALLE
const apiVersion = process.env.AZURE_OPENAI_VERSION

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, modelName = "gpt-3.5-turbo", stream = true, tools = [] } = json

  let deployemntName = model
  if (modelName === 'gpt-4-vision') {
    deployemntName = model4vision
  } else if (modelName === 'gpt-4') {
    deployemntName = model4
  } else if (modelName === 'dall-e-3') {
    deployemntName = modelDalle3
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${deployemntName}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  })

  try {
    if (deployemntName === modelDalle3) {
      const res  = await openai.images.generate({
        model,
        prompt: messages[messages.length-1]['content'],
        n:1
      })
      return new Response(JSON.stringify(res.data[0]))
    } else if (stream) {
      const options:ChatCompletionCreateParamsStreaming = {
        model: modelName,
        messages,
        temperature: 0.7,
        stream: true,
      }

      const t = getTools(tools)
      if (t && t.length > 0) {
        options.tools = t
      }

      if (modelName === 'gpt-4-vision') {
        options.max_tokens = 4096
      }
      const res = await openai.chat.completions.create(options)
      const stream = OpenAIStream(res)
      return new StreamingTextResponse(stream)
    } else {
      const res = await openai.chat.completions.create({
        model: modelName,
        messages,
        temperature: 0.7,
        stream: false,
      })
      return new Response(JSON.stringify(res.choices[0].message))
    }
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    console.error(errorMessage)
    return new Response(errorMessage, {
      status: errorCode
    })
  }
}
