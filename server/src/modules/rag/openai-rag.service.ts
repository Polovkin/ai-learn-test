import { openAiClient } from '../../openAiClient.js'
import { MODELS } from '../../settings/ai.settings.js'
import { type RetrievedChunk } from './rag.types.js'

const NO_ANSWER = 'The document does not contain enough information to answer this question.'

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
          'You answer only using the provided document chunks. If chunks do not contain enough information, answer exactly: "The document does not contain enough information to answer this question." Do not invent facts.',
      },
      {
        role: 'user',
        content: `User question:\n${question}\n\nRelevant chunks:\n${chunksText}`,
      },
    ],
  })

  return response.output_text.trim() || NO_ANSWER
}
