// Import necessary libraries
import OpenAI, { toFile } from 'openai';
import { NextResponse } from "next/server";

// export const runtime = 'edge'

const apiKey = process.env.AZURE_OPENAI_API_KEY_WHISPER
const resource = process.env.AZURE_OPENAI_RESOURCE_WHISPER
const deployemntName = process.env.AZURE_OPENAI_MODEL_WHISPER
const apiVersion = process.env.AZURE_OPENAI_VERSION

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${deployemntName}`,
    defaultQuery: { 'api-version': apiVersion },
    defaultHeaders: { 'api-key': apiKey },
})

function getExt(mimeType: string) {
    const mimetype = mimeType.split(";")[0]
    if (mimetype.split("/")[1] === "webm") {
        return "webm"
    }
    return "mp4"
}

export async function POST(req: Request) {
    const buffer = await req.blob()
    try {
        const file = await toFile(buffer, `speech.${getExt(buffer.type)}`, {type: buffer.type})
        // Convert the audio data to text
        const translation = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
        });
        // Return the transcribed text in the response
        return NextResponse.json({result: translation.text}, {status:200});
    } catch(error: any) {
        // Handle any errors that occur during the request
        if (error.response) {
            console.error(error.response.status, error.response.data);
            return NextResponse.json({ error: error.response.data }, {status:500});
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            return NextResponse.json({ error: error.message }, {status:500});
        }
    }
}