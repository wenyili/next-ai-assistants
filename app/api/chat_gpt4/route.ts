import { OpenAIStream } from '@/app/lib/chat/openai-stream'
import { StreamingTextResponse } from '@/app/lib/chat/streaming-text-response'
import OpenAI from 'openai'

import { auth } from '@/auth'

// export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY
const resource = process.env.AZURE_OPENAI_RESOURCE
const model = process.env.AZURE_OPENAI_MODEL_GPT4
const apiVersion = process.env.AZURE_OPENAI_VERSION


export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const user = (await auth())?.user

  if (!user) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${model}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  })

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res)

  return new StreamingTextResponse(stream)
}
