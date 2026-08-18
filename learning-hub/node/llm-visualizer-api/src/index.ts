import express from 'express'
import { ensureRagSchema } from './modules/rag/vector.repository.js'
import indexRouter from './routes/index.js'
import nodePlayground from './node-playground.js'

const app = express()
const port = 3000

app.use(express.json())
app.use('/', indexRouter)

const bootstrap = async () => {
  try {
    await ensureRagSchema()
  } catch (error) {
    console.error('RAG initialization failed. Server will continue without RAG database features.', error)
  }

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)

    nodePlayground()
  })
}

bootstrap().catch((error) => {
  console.error('Failed to initialize server:', error)
  process.exit(1)
})
