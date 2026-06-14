import { chunkText } from './chunking.service.js'
import { createEmbedding } from './embedding.service.js'
import { TOP_K } from './rag.constants.js'
import { type AskRagResponse, type LatestDocumentResponse, type UploadDocumentResponse } from './rag.types.js'
import { extractTextFromPdf } from './pdf.service.js'
import { generateRagAnswer } from './openai-rag.service.js'
import { clearRagData, documentExists, documentHasChunks, getLatestDocument, saveDocumentWithChunks, searchSimilarChunks } from './vector.repository.js'

export const uploadDocument = async (file: Express.Multer.File): Promise<UploadDocumentResponse> => {
  const text = await extractTextFromPdf(file.buffer)
  const chunks = chunkText(text)

  if (!chunks.length) {
    throw new Error('PDF does not contain extractable text')
  }

  const embeddedChunks = [] as Array<{ chunkIndex: number; content: string; embedding: number[] }>

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.content)
    embeddedChunks.push({ ...chunk, embedding })
  }

  const { documentId } = await saveDocumentWithChunks({
    fileName: file.originalname,
    chunks: embeddedChunks,
  })

  return {
    documentId,
    fileName: file.originalname,
    chunksCount: embeddedChunks.length,
  }
}

export const askQuestion = async (question: string, documentId: string): Promise<AskRagResponse> => {
  const exists = await documentExists(documentId)

  if (!exists) {
    throw new Error('Document does not exist')
  }

  const hasChunks = await documentHasChunks(documentId)

  if (!hasChunks) {
    throw new Error('Document has no indexed chunks. Re-upload the PDF.')
  }

  const questionEmbedding = await createEmbedding(question)

  const chunks = await searchSimilarChunks({
    documentId,
    questionEmbedding,
    limit: TOP_K,
  })

  const answer = await generateRagAnswer(question, chunks)

  return { answer, chunks }
}

export const clearRagDatabase = async (): Promise<{ deletedChunks: number; deletedDocuments: number }> => {
  return clearRagData()
}

export const getLatestRagDocument = async (): Promise<LatestDocumentResponse | null> => {
  return getLatestDocument()
}
