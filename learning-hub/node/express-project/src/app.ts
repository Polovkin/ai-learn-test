import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import apiRouter from './routes/index.js'
import { errorHandler, notFoundHandler } from './shared/http-errors.js'

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  )
  app.use(cookieParser())
  app.use(express.json())
  app.use(apiRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
