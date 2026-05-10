import { Router } from 'express'
import { createEmbedding, makeRequest } from '../openAiClient.js'
import { buildAssembledPrompt } from '../promptAssembly.js'

const router = Router()

const promt = 'Що таке штучний інтелект?'

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

router.get('/', async (_req, res) => {
  try {
    const temperatures = [0.5, 1.0, 1.5]

    Promise.all(
      temperatures.map((t) =>
        makeRequest(promt, {
          temperature: t,
        }),
      ),
    )
      .then((responses) => {
        responses.forEach((response, index) => {
          console.log(`Response ${index + 1}:`, response)
        })
      })
      .catch((error) => {
        console.error('Error making requests:', error)
      })

    res.render('index', {
      title: 'Hello Express TS',
      message: 'response',
    })
  } catch (error) {
    res.render('index', {
      title: 'Error',
      message: 'OpenAI request failed',
    })
  }
})

export default router
