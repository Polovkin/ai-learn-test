import OpenAI from 'openai'
import 'dotenv/config'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not defined')
}

export const openAiClient = new OpenAI({
  apiKey,
})
