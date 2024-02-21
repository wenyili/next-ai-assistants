// import { kv } from '@vercel/kv'
import { OpenAIStream } from '@/app/lib/chat/openai-stream'
import { StreamingTextResponse } from '@/app/lib/chat/streaming-text-response'
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/app/lib/utils'

// export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY
const resource = process.env.AZURE_OPENAI_RESOURCE
const model = process.env.AZURE_OPENAI_MODEL
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
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
    //   const payload = {
    //     id,
    //     title,
    //     userId,
    //     createdAt,
    //     path,
    //     messages: [
    //       ...messages,
    //       {
    //         content: completion,
    //         role: 'assistant'
    //       }
    //     ]
    //   }
    //   await kv.hmset(`chat:${id}`, payload)
    //   await kv.zadd(`user:chat:${userId}`, {
    //     score: createdAt,
    //     member: `chat:${id}`
    //   })
    }
  })

  return new StreamingTextResponse(stream)
}
