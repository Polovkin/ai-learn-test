type LogDetails = Record<string, unknown>

export const logRagStep = (step: string, message: string, details?: LogDetails) => {
  console.info(`[RAG] ${step}: ${message}`, details ?? '')
}

export const logRagError = (step: string, message: string, error: unknown) => {
  console.error(`[RAG] ${step}: ${message}`, error)
}

export const previewText = (value: string, maxLength = 120) => {
  const normalized = value.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength)}...`
}
