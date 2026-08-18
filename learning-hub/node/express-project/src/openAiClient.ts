import OpenAI from 'openai'
import './loadEnv.js'
import { MODELS } from './settings/ai.settings.js'

type AgentParams = {
  temperature?: number
  model?: string
  top_p?: number
  top_k?: number
}

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

const apiKey = process.env.OPENAI_API_KEY || 'key'
const defaultModel = MODELS.GPT_4_1_MINI

if (!apiKey) {
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

    return response.output_text
  } catch (error) {
    console.error('Error making OpenAI request:', error)
    throw error
  }
}

export const createEmbedding = async (input: string) => {
  try {
    const response = await openAiClient.embeddings.create({
      model: EMBEDDING_MODEL,
      input,
      dimensions: EMBEDDING_DIMENSIONS,
      encoding_format: 'float',
    })

    return {
      embedding: response.data[0]?.embedding ?? [],
      model: response.model,
      dimensions: EMBEDDING_DIMENSIONS,
      usage: response.usage,
    }
  } catch (error) {
    console.error('Error creating OpenAI embedding:', error)
    throw error
  }
}
