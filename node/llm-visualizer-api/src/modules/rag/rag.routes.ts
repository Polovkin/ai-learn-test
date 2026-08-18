import { Router, type RequestHandler } from 'express'
import multer from 'multer'
import {
  askQuestionController,
  clearRagController,
  getLatestDocumentController,
  uploadDocumentController,
} from './rag.controller.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// @types/multer currently resolves Express 4 request types while this API uses Express 5.
const uploadSinglePdf = upload.single('file') as unknown as RequestHandler

router.post('/api/rag/documents', uploadSinglePdf, uploadDocumentController)
router.get('/api/rag/documents/latest', getLatestDocumentController)
router.post('/api/rag/ask', askQuestionController)
router.post('/api/rag/clear', clearRagController)

export default router
