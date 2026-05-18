import pg from 'pg'
import '../loadEnv.js'
import { logRagStep } from './rag.logger.js'

const { Pool } = pg

export type RagChunkRow = {
  id: number
  document_name: string
  page: number
  chunk_index: number
  content: string
  similarity: number
}

const connectionString = process.env.DATABASE_URL

logRagStep('db.config', 'PostgreSQL pool is being configured for RAG.', {
  hasDatabaseUrl: Boolean(connectionString),
})

export const ragPool = new Pool({
  connectionString,
})

const toVector = (embedding: number[]) => `[${embedding.join(',')}]`

export const insertRagChunk = async (params: {
  documentName: string
  page: number
  chunkIndex: number
  content: string
  embedding: number[]
}) => {
  const startedAt = Date.now()

  logRagStep('db.insert', 'Inserting chunk row into rag_document_chunks.', {
    documentName: params.documentName,
    page: params.page,
    chunkIndex: params.chunkIndex,
    contentLength: params.content.length,
    embeddingDimensions: params.embedding.length,
  })

  await ragPool.query(
    `
      INSERT INTO rag_document_chunks (document_name, page, chunk_index, content, embedding)
      VALUES ($1, $2, $3, $4, $5::vector)
    `,
    [params.documentName, params.page, params.chunkIndex, params.content, toVector(params.embedding)],
  )

  logRagStep('db.insert', 'Chunk row inserted successfully.', {
    documentName: params.documentName,
    chunkIndex: params.chunkIndex,
    durationMs: Date.now() - startedAt,
  })
}

export const findSimilarChunks = async (embedding: number[], limit = 5): Promise<RagChunkRow[]> => {
  const startedAt = Date.now()

  logRagStep('db.retrieve', 'Running cosine similarity search in PostgreSQL using pgvector.', {
    embeddingDimensions: embedding.length,
    limit,
  })

  const result = await ragPool.query<RagChunkRow>(
    `
      SELECT
        id,
        document_name,
        page,
        chunk_index,
        content,
        1 - (embedding <=> $1::vector) AS similarity
      FROM rag_document_chunks
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `,
    [toVector(embedding), limit],
  )

  logRagStep('db.retrieve', 'Cosine similarity search finished.', {
    rowsCount: result.rows.length,
    durationMs: Date.now() - startedAt,
    matches: result.rows.map((row) => ({
      documentName: row.document_name,
      page: row.page,
      chunkIndex: row.chunk_index,
      similarity: Number(row.similarity),
    })),
  })

  return result.rows
}

export const clearRagChunks = async (): Promise<number> => {
  const startedAt = Date.now()

  logRagStep('db.clear', 'Deleting all rows from rag_document_chunks.')

  const result = await ragPool.query('DELETE FROM rag_document_chunks')
  const deletedRows = result.rowCount ?? 0

  logRagStep('db.clear', 'RAG chunks table was cleared.', {
    deletedRows,
    durationMs: Date.now() - startedAt,
  })

  return deletedRows
}
