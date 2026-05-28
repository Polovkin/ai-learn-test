import { Router } from 'express'
import { postCalculatorController } from './calculator.controller.js'

const router = Router()

router.post('/api/ai/calculator', postCalculatorController)

export default router
