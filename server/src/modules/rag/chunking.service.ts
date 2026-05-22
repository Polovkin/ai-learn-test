import { type TextChunk } from './rag.types.js'

const DEFAULT_CHUNK_SIZE = 1200
const DEFAULT_CHUNK_OVERLAP = 200

export const chunkText = (
  text: string,
  options: {
    chunkSize?: number
    overlap?: number
  } = {},
): TextChunk[] => {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE
  const overlap = options.overlap ?? DEFAULT_CHUNK_OVERLAP
  const normalizedText = text.replace(/\s+/g, ' ').trim()

  if (!normalizedText) {
    return []
  }

  const chunks: TextChunk[] = []
  let start = 0
  let chunkIndex = 0

  while (start < normalizedText.length) {
    const end = Math.min(start + chunkSize, normalizedText.length)
    const content = normalizedText.slice(start, end).trim()

    if (content) {
      chunks.push({ chunkIndex, content })
      chunkIndex += 1
    }

    if (end >= normalizedText.length) {
      break
    }

    start = Math.max(end - overlap, start + 1)
  }

  return chunks
}
