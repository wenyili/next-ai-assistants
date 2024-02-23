import OpenAI from 'openai'

export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY
const resource = process.env.AZURE_OPENAI_RESOURCE
const model = process.env.AZURE_OPENAI_MODEL_DALLE
const apiVersion = process.env.AZURE_OPENAI_VERSION

export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${model}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
  })

  try {
    const res  = await openai.images.generate({
      model,
      prompt: messages[messages.length-1]['content'],
      n:1
    })

    return new Response(JSON.stringify(res.data[0]))
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    return new Response(errorMessage, {
      status: errorCode
    })
  }
}
