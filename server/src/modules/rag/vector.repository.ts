import pg from 'pg'
import '../../loadEnv.js'
import { type RetrievedChunk, type StoredChunkInput } from './rag.types.js'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

export const ragPool = new Pool({
  connectionString,
})

const toVector = (embedding: number[]) => `[${embedding.join(',')}]`

export const saveDocumentWithChunks = async (input: {
  fileName: string
  chunks: StoredChunkInput[]
}): Promise<{ documentId: string }> => {
  if (!input.chunks.length) {
    throw new Error('Cannot save document without chunks')
  }

  const client = await ragPool.connect()

  try {
    await client.query('BEGIN')

    const documentResult = await client.query<{ id: string }>(
      `
      INSERT INTO documents (file_name)
      VALUES ($1)
      RETURNING id
    `,
      [input.fileName],
    )

    const documentId = documentResult.rows[0]?.id

    if (!documentId) {
      throw new Error('Failed to create document row')
    }

    for (const chunk of input.chunks) {
      await client.query(
        `
        INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4::vector)
      `,
        [documentId, chunk.chunkIndex, chunk.content, toVector(chunk.embedding)],
      )
    }

    await client.query('COMMIT')

    return { documentId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const documentExists = async (documentId: string): Promise<boolean> => {
  const result = await ragPool.query<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM documents
      WHERE id = $1
    ) AS exists
  `,
    [documentId],
  )

  return Boolean(result.rows[0]?.exists)
}

export const searchSimilarChunks = async (input: {
  documentId: string
  questionEmbedding: number[]
  limit: number
}): Promise<RetrievedChunk[]> => {
  const result = await ragPool.query<RetrievedChunk>(
    `
    SELECT
      id::text,
      chunk_index AS "chunkIndex",
      content,
      1 - (embedding <=> $1::vector) AS similarity
    FROM document_chunks
    WHERE document_id = $2
    ORDER BY embedding <=> $1::vector
    LIMIT $3
  `,
    [toVector(input.questionEmbedding), input.documentId, input.limit],
  )

  return result.rows.map((row) => ({
    ...row,
    similarity: Number(row.similarity),
  }))
}

export const clearRagData = async (): Promise<{ deletedChunks: number; deletedDocuments: number }> => {
  const client = await ragPool.connect()

  try {
    await client.query('BEGIN')

    const chunksResult = await client.query('DELETE FROM document_chunks')
    const documentsResult = await client.query('DELETE FROM documents')

    await client.query('COMMIT')

    return {
      deletedChunks: chunksResult.rowCount ?? 0,
      deletedDocuments: documentsResult.rowCount ?? 0,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
