import { Router } from 'express'
import { answerFromChunks } from '../rag/rag.chat.js'
import { clearRagChunks } from '../rag/rag.db.js'
import { ingestPdfDocument } from '../rag/rag.documents.js'
import { logRagError, logRagStep, previewText } from '../rag/rag.logger.js'
import { retrieveRelevantChunks } from '../rag/rag.retrieval.js'

const router = Router()

type ErrorResponse = {
  error: string
}

type RagIngestBody = {
  filePath?: unknown
  documentName?: unknown
}

type RagIngestResponse = {
  documentName: string
  chunksCount: number
}

type RagAskBody = {
  question?: unknown
}

type RagAskResponse = {
  answer: string
  sources: Array<{
    documentName: string
    page: number
    chunkIndex: number
    similarity: number
  }>
}

type RagClearResponse = {
  deletedRows: number
}

router.post<never, RagIngestResponse | ErrorResponse, RagIngestBody>('/api/rag/ingest', async (req, res) => {
  const startedAt = Date.now()

  try {
    const filePath = req.body?.filePath
    const documentName = req.body?.documentName

    logRagStep('ingest.request', 'Received PDF ingestion request.', {
      filePath,
      documentName,
    })

    if (typeof filePath !== 'string' || !filePath.trim()) {
      logRagStep('ingest.validation', 'Rejected request because filePath is missing or invalid.')
      res.status(400).json({ error: 'filePath is required.' })
      return
    }

    if (typeof documentName !== 'string' || !documentName.trim()) {
      logRagStep('ingest.validation', 'Rejected request because documentName is missing or invalid.')
      res.status(400).json({ error: 'documentName is required.' })
      return
    }

    logRagStep('ingest.validation', 'Request body is valid. Starting PDF ingestion.', {
      filePath,
      documentName,
    })

    const result = await ingestPdfDocument({
      filePath,
      documentName,
    })

    logRagStep('ingest.response', 'PDF ingestion finished successfully.', {
      documentName: result.documentName,
      chunksCount: result.chunksCount,
      durationMs: Date.now() - startedAt,
    })

    res.json(result)
  } catch (error) {
    logRagError('ingest.error', 'PDF ingestion failed before a successful response.', error)
    res.status(500).json({ error: 'RAG ingestion failed.' })
  }
})

router.post<never, RagClearResponse | ErrorResponse>('/api/rag/clear', async (_req, res) => {
  const startedAt = Date.now()

  try {
    logRagStep('clear.request', 'Received request to clear all RAG document chunks.')

    const deletedRows = await clearRagChunks()

    logRagStep('clear.response', 'RAG document chunks were cleared successfully.', {
      deletedRows,
      durationMs: Date.now() - startedAt,
    })

    res.json({ deletedRows })
  } catch (error) {
    logRagError('clear.error', 'Failed to clear RAG document chunks.', error)
    res.status(500).json({ error: 'RAG clear failed.' })
  }
})

router.post<never, RagAskResponse | ErrorResponse, RagAskBody>('/api/rag/ask', async (req, res) => {
  const startedAt = Date.now()

  try {
    const question = req.body?.question

    logRagStep('ask.request', 'Received RAG question request.', {
      questionPreview: typeof question === 'string' ? previewText(question) : question,
    })

    if (typeof question !== 'string' || !question.trim()) {
      logRagStep('ask.validation', 'Rejected request because question is missing or invalid.')
      res.status(400).json({ error: 'question is required.' })
      return
    }

    logRagStep('ask.validation', 'Request body is valid. Starting retrieval.', {
      questionPreview: previewText(question),
    })

    const chunks = await retrieveRelevantChunks(question)
    const answer = await answerFromChunks(question, chunks)

    logRagStep('ask.response', 'RAG answer generated successfully.', {
      sourcesCount: chunks.length,
      answerPreview: previewText(answer),
      durationMs: Date.now() - startedAt,
    })

    res.json({
      answer,
      sources: chunks.map((chunk) => ({
        documentName: chunk.documentName,
        page: chunk.page,
        chunkIndex: chunk.chunkIndex,
        similarity: chunk.similarity,
      })),
    })
  } catch (error) {
    logRagError('ask.error', 'RAG question answering failed before a successful response.', error)
    res.status(500).json({ error: 'RAG question answering failed.' })
  }
})

export default router
