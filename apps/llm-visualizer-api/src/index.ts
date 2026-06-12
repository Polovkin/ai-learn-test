import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { ensureRagSchema } from './modules/rag/vector.repository.js'
import indexRouter from './routes/index.js'
import { nodePlayground } from './node-playground.js'

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.json())
app.use('/', indexRouter)

const bootstrap = async () => {
  try {
    await ensureRagSchema()
    console.log('RAG schema is ready.')
  } catch (error) {
    console.warn('RAG initialization failed. Server will continue without RAG database features.')
    console.warn(error)
  }

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)

    nodePlayground()
  })
}

bootstrap().catch((error) => {
  console.error('Failed to initialize server:', error)
  process.exit(1)
})
