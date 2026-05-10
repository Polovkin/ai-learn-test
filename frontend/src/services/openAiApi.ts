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

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text()
  let payload: { error?: string } = {}

  try {
    payload = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Backend API не повернув JSON. Перевір, що Express server запущений.')
  }

  if (!response.ok) {
    throw new Error(payload?.error || 'Backend API повернув помилку.')
  }

  return payload as T
}

export const createEmbedding = async (input: string) => {
  const response = await fetch('/api/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  })

  return parseJsonResponse<EmbeddingApiResponse>(response)
}

export const sendPromptAssembly = async (userInput: string) => {
  const response = await fetch('/api/prompt-assembly', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userInput }),
  })

  return parseJsonResponse<PromptAssemblyApiResponse>(response)
}
