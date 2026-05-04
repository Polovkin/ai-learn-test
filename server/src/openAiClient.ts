import OpenAI from 'openai'
import 'dotenv/config'
import { MODELS } from './settings/ai.settings.js'

type AgentParams = {
  temperature?: number
  model?: string
  top_p?: number
  top_k?: number
}

const apiKey = process.env.OPENAI_API_KEY
const defaultModel = MODELS.GPT_4_1_MINI

if (!apiKey) {
  console.log(process.env)
  throw new Error('OPENAI_API_KEY is not defined')
}

export const openAiClient = new OpenAI({
  apiKey,
})

export const makeRequest = async (prompt: string, params?: AgentParams): Promise<string> => {
  try {
    const response = await openAiClient.responses.create({
      temperature: params?.temperature || 1.5,
      model: params?.model || defaultModel,
      input: prompt,
    })

    console.log('OpenAI response:', response)

    return response.output_text
  } catch (error) {
    console.error('Error making OpenAI request:', error)
    throw error
  }
}
