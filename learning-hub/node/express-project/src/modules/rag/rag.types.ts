export type TextChunk = {
  chunkIndex: number
  content: string
}

export type StoredChunkInput = {
  chunkIndex: number
  content: string
  embedding: number[]
}

export type RetrievedChunk = {
  id: string
  chunkIndex: number
  content: string
  similarity: number
}

export type UploadDocumentResponse = {
  documentId: string
  fileName: string
  chunksCount: number
}

export type AskRagResponse = {
  answer: string
  chunks: RetrievedChunk[]
}

export type LatestDocumentResponse = {
  documentId: string
  fileName: string
  chunksCount: number
}
