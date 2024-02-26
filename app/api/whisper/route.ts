// Import necessary libraries
import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import { NextResponse } from "next/server";

// Promisify the exec function from child_process
const util = require('util');

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

export async function POST(req: Request) {
  const buffer = await req.blob()
  try {
    // Convert the audio data to text
    const translation = await openai.audio.transcriptions.create({
        file: await toFile(buffer, 'speech.mp3'),
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
      return NextResponse.json({ error: "An error occurred during your request." }, {status:500});
    }
  }
}