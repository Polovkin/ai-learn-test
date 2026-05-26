export type EmbeddingApiResponse = {
  embedding: number[]
  model: string
  dimensions: number
  usage?: {
    prompt_tokens: number
    total_tokens: number
  }
}

export type PromptAssemblyApiResponse = {
  userInput: string
  assembledPrompt: string
  response: string
}

export type UploadRagDocumentResponse = {
  documentId: string
  fileName: string
  chunksCount: number
}

export type AskRagQuestionResponse = {
  answer: string
  chunks: Array<{
    id: string
    chunkIndex: number
    content: string
    similarity: number
  }>
}

export type ClearRagResponse = {
  deletedChunks: number
  deletedDocuments: number
}

export type LatestRagDocumentResponse = {
  document: {
    documentId: string
    fileName: string
    chunksCount: number
  } | null
}

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text()
  let payload: { error?: string; message?: string } = {}

  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Backend API не повернув JSON. Перевір, що Express server запущений.')
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || 'Backend API повернув помилку.')
  }

  return payload as T
}

export const requestEmbedding = async (input: string) => {
  const response = await fetch('/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  })

  return parseJsonResponse<EmbeddingApiResponse>(response)
}

export const requestPromptAssembly = async (userInput: string) => {
  const response = await fetch('/api/prompt-assembly', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userInput }),
  })

  return parseJsonResponse<PromptAssemblyApiResponse>(response)
}

export const uploadRagDocument = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/rag/documents', {
    method: 'POST',
    body: formData,
  })

  return parseJsonResponse<UploadRagDocumentResponse>(response)
}

export const askRagQuestion = async (input: { documentId: string; question: string }) => {
  const response = await fetch('/api/rag/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  return parseJsonResponse<AskRagQuestionResponse>(response)
}

export const clearRagDatabase = async () => {
  const response = await fetch('/api/rag/clear', {
    method: 'POST',
  })

  return parseJsonResponse<ClearRagResponse>(response)
}

export const getLatestRagDocument = async () => {
  const response = await fetch('/api/rag/documents/latest', {
    method: 'GET',
  })

  return parseJsonResponse<LatestRagDocumentResponse>(response)
}
