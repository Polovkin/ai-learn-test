import type { Request, Response } from 'express'
import { askQuestion, clearRagDatabase, getLatestRagDocument, uploadDocument } from './rag.service.js'
import { logRagError } from './rag.logger.js'

const sendMessage = (res: Response, status: number, message: string) => {
  res.status(status).json({ message })
}

export const uploadDocumentController = async (req: Request, res: Response) => {
  try {
    const file = req.file

    if (!file) {
      sendMessage(res, 400, 'PDF file is required')
      return
    }

    if (file.mimetype !== 'application/pdf') {
      sendMessage(res, 400, 'Only PDF files are supported')
      return
    }

    const result = await uploadDocument(file)
    res.json(result)
  } catch (error) {
    logRagError('upload.error', 'Upload flow failed.', error)
    sendMessage(
      res,
      error instanceof Error && error.message === 'PDF does not contain extractable text' ? 400 : 500,
      error instanceof Error ? error.message : 'Failed to upload document',
    )
  }
}

export const askQuestionController = async (req: Request, res: Response) => {
  try {
    const question = req.body?.question
    const documentId = req.body?.documentId

    if (typeof question !== 'string' || !question.trim()) {
      sendMessage(res, 400, 'Question is required')
      return
    }

    if (typeof documentId !== 'string' || !documentId.trim()) {
      sendMessage(res, 400, 'documentId is required')
      return
    }

    const result = await askQuestion(question.trim(), documentId.trim())
    res.json(result)
  } catch (error) {
    logRagError('ask.error', 'Question flow failed.', error)

    if (error instanceof Error && error.message === 'Document does not exist') {
      sendMessage(res, 404, error.message)
      return
    }

    if (error instanceof Error && error.message === 'Document has no indexed chunks. Re-upload the PDF.') {
      sendMessage(res, 409, error.message)
      return
    }

    sendMessage(res, 500, error instanceof Error ? error.message : 'Failed to answer question')
  }
}

export const clearRagController = async (_req: Request, res: Response) => {
  try {
    const result = await clearRagDatabase()
    res.json(result)
  } catch (error) {
    logRagError('clear.error', 'Failed to clear RAG database.', error)
    sendMessage(res, 500, 'Failed to clear RAG database')
  }
}

export const getLatestDocumentController = async (_req: Request, res: Response) => {
  try {
    const result = await getLatestRagDocument()
    res.json({ document: result })
  } catch (error) {
    logRagError('latest.error', 'Failed to fetch latest RAG document.', error)
    sendMessage(res, 500, 'Failed to fetch latest RAG document')
  }
}
