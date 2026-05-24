import { Router } from 'express'
import multer from 'multer'
import { askQuestionController, clearRagController, getLatestDocumentController, uploadDocumentController } from './rag.controller.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/api/rag/documents', upload.single('file'), uploadDocumentController)
router.get('/api/rag/documents/latest', getLatestDocumentController)
router.post('/api/rag/ask', askQuestionController)
router.post('/api/rag/clear', clearRagController)

export default router
