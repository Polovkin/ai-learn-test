import { Router } from 'express'
import { postCalculatorController } from './calculator.controller.js'

const router = Router()

router.post('/', postCalculatorController)

export default router
