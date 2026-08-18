export const logRagError = (step: string, message: string, error: unknown) => {
  console.error(`[RAG] ${step}: ${message}`, error)
}
