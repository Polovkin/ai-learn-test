import { Router } from 'express'
import { openAiClient } from '../openAiClient.js'
import { MODELS } from '../settings/ai.settings.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const response = await openAiClient.responses.create({
      model: MODELS.GPT_4_1_MINI,
      input: 'Say hello in one short sentence',
    })

    const aiText = response.output_text

    res.render('index', {
      title: 'Hello Express TS',
      message: aiText,
    })
  } catch (error) {
    console.error(error)

    res.render('index', {
      title: 'Error',
      message: 'OpenAI request failed',
    })
  }
})

export default router
