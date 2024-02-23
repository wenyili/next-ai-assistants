import { OpenAIStream } from '@/app/lib/chat/openai-stream'
import { StreamingTextResponse } from '@/app/lib/chat/streaming-text-response'
import OpenAI from 'openai'

import { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs'
export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY
const resource = process.env.AZURE_OPENAI_RESOURCE
const model = process.env.AZURE_OPENAI_MODEL
const model4 = process.env.AZURE_OPENAI_MODEL_GPT4
const model4vision = process.env.AZURE_OPENAI_MODEL_GPT4_VISION
const apiVersion = process.env.AZURE_OPENAI_VERSION

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, modelName } = json

  let deployemntName = model
  if (modelName === 'gpt-4-vision') {
    deployemntName = model4vision
  } else if (modelName === 'gpt-4') {
    deployemntName = model4
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${deployemntName}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  })

  const options:ChatCompletionCreateParamsStreaming = {
    model: modelName,
    messages,
    temperature: 0.7,
    stream: true,
  }

  if (modelName === 'gpt-4-vision') {
    options.max_tokens = 4096
  }

  try {
    const res = await openai.chat.completions.create(options)

    const stream = OpenAIStream(res)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    return new Response(errorMessage, {
      status: errorCode
    })
  }
}
