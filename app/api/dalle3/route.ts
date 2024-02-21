import OpenAI from 'openai'

// import { auth } from '@/auth'
export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY
const resource = process.env.AZURE_OPENAI_RESOURCE
const model = process.env.AZURE_OPENAI_MODEL_DALLE
const apiVersion = process.env.AZURE_OPENAI_VERSION

export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json
  // const user = (await auth())?.user

  // if (!user) {
  //   return new Response('Unauthorized', {
  //     status: 401
  //   })
  // }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${model}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  })

  const res  = await openai.images.generate({
    model,
    prompt: messages[messages.length-1]['content'],
    n:1
  })

  if (!res.data || res.data.length == 0) {
    return new Response('Bad Request', {
      status: 400
    })
  }

  return new Response(JSON.stringify(res.data[0]))
}
