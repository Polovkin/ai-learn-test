import { Router } from 'express'
import { createEmbedding, makeRequest } from '../openAiClient.js'
import { buildAssembledPrompt } from '../promptAssembly.js'
import ragRouter from '../modules/rag/rag.routes.js'
import calculatorRouter from '../modules/ai-calculator/calculator.routes.js'

const router = Router()

router.use(ragRouter)
router.use(calculatorRouter)

router.get('/api/health', (_req, res) => {
  res.json({ service: 'llm-visualizer-api', status: 'ok' })
})

router.post('/api/prompt-assembly', async (req, res) => {
  try {
    const userInput = req.body?.userInput

    if (typeof userInput !== 'string' || !userInput.trim()) {
      res.status(400).json({ error: 'User input is required.' })
      return
    }

    const assembledPrompt = buildAssembledPrompt(userInput)
    const response = await makeRequest(assembledPrompt, {
      temperature: 0.7,
    })

    res.json({
      userInput,
      assembledPrompt,
      response,
    })
  } catch (error) {
    console.error('Error in prompt assembly route:', error)
    res.status(500).json({ error: 'OpenAI request failed.' })
  }
})

router.post('/api/embeddings', async (req, res) => {
  try {
    const input = req.body?.input

    if (typeof input !== 'string' || !input.trim()) {
      res.status(400).json({ error: 'Input is required.' })
      return
    }

    const embedding = await createEmbedding(input)
    res.json(embedding)
  } catch (error) {
    console.error('Error in embeddings route:', error)
    res.status(500).json({ error: 'OpenAI embedding request failed.' })
  }
})

router.get('/', (_req, res) => {
  res.json({
    service: 'llm-visualizer-api',
    status: 'ok',
    ui: 'Run @web/learning-hub and open #/api-status',
  })
})

export default router
