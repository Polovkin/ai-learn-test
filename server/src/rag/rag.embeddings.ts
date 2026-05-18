import { openAiClient } from '../openAiClient.js'
import { logRagStep } from './rag.logger.js'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 1536

export const createRagEmbedding = async (input: string): Promise<number[]> => {
  const startedAt = Date.now()

  logRagStep('embedding.request', 'Sending text to OpenAI embeddings API.', {
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    inputLength: input.length,
  })

  const response = await openAiClient.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMENSIONS,
    encoding_format: 'float',
  })

  const embedding = response.data[0]?.embedding ?? []

  logRagStep('embedding.response', 'Received embedding from OpenAI.', {
    model: response.model,
    embeddingDimensions: embedding.length,
    durationMs: Date.now() - startedAt,
  })

  return embedding
}
