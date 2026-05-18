import { findSimilarChunks, type RagChunkRow } from './rag.db.js'
import { createRagEmbedding } from './rag.embeddings.js'
import { logRagStep, previewText } from './rag.logger.js'

export type RetrievedChunk = {
  id: number
  documentName: string
  page: number
  chunkIndex: number
  content: string
  similarity: number
}

export const retrieveRelevantChunks = async (question: string, limit = 5): Promise<RetrievedChunk[]> => {
  const startedAt = Date.now()

  logRagStep('retrieval.start', 'Starting retrieval for user question.', {
    questionPreview: previewText(question),
    limit,
  })

  const embedding = await createRagEmbedding(question)

  logRagStep('retrieval.embedding', 'Question embedding created. Searching for similar chunks.', {
    embeddingDimensions: embedding.length,
  })

  const chunks = await findSimilarChunks(embedding, limit)

  const mappedChunks = chunks.map(mapChunk)

  logRagStep('retrieval.done', 'Relevant chunks were retrieved and mapped for chat context.', {
    chunksCount: mappedChunks.length,
    durationMs: Date.now() - startedAt,
    sources: mappedChunks.map((chunk) => ({
      documentName: chunk.documentName,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      similarity: chunk.similarity,
    })),
  })

  return mappedChunks
}

const mapChunk = (chunk: RagChunkRow): RetrievedChunk => ({
  id: chunk.id,
  documentName: chunk.document_name,
  page: chunk.page,
  chunkIndex: chunk.chunk_index,
  content: chunk.content,
  similarity: Number(chunk.similarity),
})
