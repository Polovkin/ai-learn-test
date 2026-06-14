import { openAiClient } from '../../openAiClient.js'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536
const MAX_RETRIES = 2

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const createEmbedding = async (input: string): Promise<number[]> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await openAiClient.embeddings.create({
        model: EMBEDDING_MODEL,
        input,
        dimensions: EMBEDDING_DIMENSIONS,
        encoding_format: 'float',
      })

      return response.data[0]?.embedding ?? []
    } catch (error) {
      lastError = error

      if (attempt < MAX_RETRIES) {
        await wait((attempt + 1) * 400)
      }
    }
  }

  throw lastError
}
