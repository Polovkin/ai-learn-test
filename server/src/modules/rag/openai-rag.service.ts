import { openAiClient } from '../../openAiClient.js'
import { MODELS } from '../../settings/ai.settings.js'
import { type RetrievedChunk } from './rag.types.js'

const NO_ANSWER = 'The document does not contain enough information to answer this question.'

const extractResponseText = (response: {
  output_text?: string
  output?: Array<{
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
}): string => {
  const directText = response.output_text?.trim()

  if (directText) {
    return directText
  }

  const aggregatedText = (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text' || item.type === 'text')
    .map((item) => item.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n')
    .trim()

  return aggregatedText
}

export const generateRagAnswer = async (question: string, chunks: RetrievedChunk[]): Promise<string> => {
  if (!chunks.length) {
    return NO_ANSWER
  }

  const chunksText = chunks
    .map((chunk, index) => `Chunk ${index + 1} (#${chunk.chunkIndex}):\n${chunk.content}`)
    .join('\n\n')

  const response = await openAiClient.responses.create({
    model: MODELS.GPT_4_1_MINI,
    temperature: 0,
    input: [
      {
        role: 'system',
        content:
          'Answer using only the provided document chunks. If the answer is not present in the chunks, answer exactly: "The document does not contain enough information to answer this question." Do not invent facts.',
      },
      {
        role: 'user',
        content: `User question:\n${question}\n\nRelevant chunks:\n${chunksText}`,
      },
    ],
  })

  return extractResponseText(response) || NO_ANSWER
}
