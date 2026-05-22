import { chunkText } from './chunking.service.js'
import { createEmbedding } from './embedding.service.js'
import { logRagStep, previewText } from './rag.logger.js'
import { type AskRagResponse, type UploadDocumentResponse } from './rag.types.js'
import { extractTextFromPdf } from './pdf.service.js'
import { generateRagAnswer } from './openai-rag.service.js'
import { clearRagData, documentExists, saveDocumentWithChunks, searchSimilarChunks } from './vector.repository.js'

export const uploadDocument = async (file: Express.Multer.File): Promise<UploadDocumentResponse> => {
  logRagStep('upload.started', 'Started document upload flow.', {
    fileName: file.originalname,
    bytes: file.size,
  })

  const text = await extractTextFromPdf(file.buffer)

  logRagStep('pdf.extracted', 'Extracted PDF text.', {
    textLength: text.length,
  })

  const chunks = chunkText(text)

  if (!chunks.length) {
    throw new Error('PDF does not contain extractable text')
  }

  logRagStep('text.chunked', 'Text chunking finished.', {
    chunksCount: chunks.length,
  })

  const embeddedChunks = [] as Array<{ chunkIndex: number; content: string; embedding: number[] }>

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.content)
    embeddedChunks.push({ ...chunk, embedding })
  }

  logRagStep('embeddings.created', 'Embeddings were created for all chunks.', {
    chunksCount: embeddedChunks.length,
  })

  const { documentId } = await saveDocumentWithChunks({
    fileName: file.originalname,
    chunks: embeddedChunks,
  })

  logRagStep('chunks.saved', 'Document chunks were saved.', {
    documentId,
    chunksCount: embeddedChunks.length,
  })

  return {
    documentId,
    fileName: file.originalname,
    chunksCount: embeddedChunks.length,
  }
}

export const askQuestion = async (question: string, documentId: string): Promise<AskRagResponse> => {
  logRagStep('question.received', 'Started question flow.', {
    documentId,
    questionPreview: previewText(question),
  })

  const exists = await documentExists(documentId)

  if (!exists) {
    throw new Error('Document does not exist')
  }

  const questionEmbedding = await createEmbedding(question)

  logRagStep('question.embedded', 'Question embedding created.', {
    documentId,
  })

  const chunks = await searchSimilarChunks({
    documentId,
    questionEmbedding,
    limit: 3,
  })

  logRagStep('chunks.retrieved', 'Retrieved top similar chunks.', {
    documentId,
    chunksCount: chunks.length,
  })

  const answer = await generateRagAnswer(question, chunks)

  logRagStep('answer.generated', 'Generated final answer.', {
    documentId,
    answerPreview: previewText(answer),
  })

  return { answer, chunks }
}

export const clearRagDatabase = async (): Promise<{ deletedChunks: number; deletedDocuments: number }> => {
  logRagStep('clear.started', 'Started clearing RAG database.')

  const result = await clearRagData()

  logRagStep('clear.completed', 'RAG database was cleared.', result)

  return result
}
