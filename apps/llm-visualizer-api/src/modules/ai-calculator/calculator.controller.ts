import type { Request, Response } from 'express'
import { getCalculatorAnswer } from './calculator.service.js'

export const postCalculatorController = async (req: Request, res: Response) => {
  try {
    const message = req.body?.message

    if (typeof message !== 'string' || !message.trim()) {
      console.warn('[calculator] request.invalid_body')
      res.status(400).json({ error: 'Message must be a non-empty string.' })
      return
    }

    console.log('[calculator] request.received')
    const result = await getCalculatorAnswer(message)
    res.json(result)
  } catch (error) {
    console.error('Calculator API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error.'
    res.status(500).json({ error: errorMessage })
  }
}
