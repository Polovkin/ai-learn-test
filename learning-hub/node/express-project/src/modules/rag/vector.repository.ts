import pg from 'pg'
import '../../loadEnv.js'
import { type RetrievedChunk, type StoredChunkInput } from './rag.types.js'

const { Pool } = pg

const connectionString = process.env.RAG_DATABASE_URL

export const ragPool = new Pool({
  connectionString,
})

const toVector = (embedding: number[]) => `[${embedding.join(',')}]`

export const ensureRagSchema = async (): Promise<void> => {
  const client = await ragPool.connect()

  try {
    await client.query('BEGIN')

    await client.query('CREATE EXTENSION IF NOT EXISTS vector')
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto')

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
      ON document_chunks
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
      ON document_chunks (document_id)
    `)

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

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

export const getLatestDocument = async (): Promise<{
  documentId: string
  fileName: string
  chunksCount: number
} | null> => {
  const result = await ragPool.query<{
    documentId: string
    fileName: string
    chunksCount: string
  }>(
    `
    SELECT
      d.id::text AS "documentId",
      d.file_name AS "fileName",
      COUNT(dc.id)::text AS "chunksCount"
    FROM documents d
    INNER JOIN document_chunks dc ON dc.document_id = d.id
    GROUP BY d.id, d.file_name, d.created_at
    ORDER BY d.created_at DESC
    LIMIT 1
  `,
  )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return {
    documentId: row.documentId,
    fileName: row.fileName,
    chunksCount: Number(row.chunksCount),
  }
}

export const documentHasChunks = async (documentId: string): Promise<boolean> => {
  const result = await ragPool.query<{ exists: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM document_chunks
      WHERE document_id = $1
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
    WITH filtered_chunks AS (
      SELECT id, chunk_index, content, embedding
      FROM document_chunks
      WHERE document_id = $2
    )
    SELECT
      id::text,
      chunk_index AS "chunkIndex",
      content,
      1 - (embedding <=> $1::vector) AS similarity
    FROM filtered_chunks
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

    const existenceResult = await client.query<{
      chunks_exists: string | null
      documents_exists: string | null
    }>(
      `
      SELECT
        to_regclass('public.document_chunks')::text AS chunks_exists,
        to_regclass('public.documents')::text AS documents_exists
    `,
    )

    const chunksExists = Boolean(existenceResult.rows[0]?.chunks_exists)
    const documentsExists = Boolean(existenceResult.rows[0]?.documents_exists)

    if (!chunksExists || !documentsExists) {
      await client.query('ROLLBACK')
      return {
        deletedChunks: 0,
        deletedDocuments: 0,
      }
    }

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
