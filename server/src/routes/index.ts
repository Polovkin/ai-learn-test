import { Router } from 'express'
import { makeRequest, openAiClient } from '../openAiClient.js'
import { MODELS } from '../settings/ai.settings.js'

const router = Router()

const promt = 'Що таке штучний інтелект?'

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
