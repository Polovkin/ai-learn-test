import { openAiClient } from '../openAiClient.js'
import { MODELS } from '../settings/ai.settings.js'
import { logRagStep, previewText } from './rag.logger.js'
import { type RetrievedChunk } from './rag.retrieval.js'

const NO_ANSWER = 'Documentation does not contain enough information to answer this question.'

export const answerFromChunks = async (question: string, chunks: RetrievedChunk[]): Promise<string> => {
  const startedAt = Date.now()

  logRagStep('chat.start', 'Preparing answer from retrieved chunks only.', {
    questionPreview: previewText(question),
    chunksCount: chunks.length,
  })

  if (!chunks.length) {
    logRagStep('chat.no_context', 'No chunks were retrieved, returning the fixed no-answer response.')
    return NO_ANSWER
  }

  const context = chunks.map(formatChunk).join('\n\n')

  logRagStep('chat.request', 'Sending constrained RAG prompt to OpenAI chat model.', {
    model: MODELS.GPT_4_1_MINI,
    contextLength: context.length,
    citations: chunks.map((chunk) => ({
      documentName: chunk.documentName,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
    })),
  })

  const response = await openAiClient.responses.create({
    model: MODELS.GPT_4_1_MINI,
    temperature: 0,
    input: [
      {
        role: 'system',
        content:
          'Answer using only the provided documentation chunks. If the chunks do not contain enough information, answer exactly: "Documentation does not contain enough information to answer this question." Include citations in the format [documentName, page X, chunk Y] for every factual claim.',
      },
      {
        role: 'user',
        content: `Documentation chunks:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  })

  const answer = response.output_text.trim() || NO_ANSWER

  logRagStep('chat.response', 'Received final answer from OpenAI chat model.', {
    answerPreview: previewText(answer),
    durationMs: Date.now() - startedAt,
  })

  return answer
}

const formatChunk = (chunk: RetrievedChunk) =>
  `[${chunk.documentName}, page ${chunk.page}, chunk ${chunk.chunkIndex}]\n${chunk.content}`
