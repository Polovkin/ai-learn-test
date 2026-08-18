import './loadEnv.js'
import { createApp } from './app.js'
import { ensureRagSchema } from './modules/rag/vector.repository.js'
import { prisma } from './shared/prisma.js'

const port = Number(process.env.PORT ?? 3001)

const bootstrap = async () => {
  try {
    if (process.env.RAG_DATABASE_URL) {
      await ensureRagSchema()
    } else {
      console.warn('RAG_DATABASE_URL is not set. RAG database initialization was skipped.')
    }
  } catch (error) {
    console.error('RAG initialization failed. Server will continue without RAG database features.', error)
  }

  await prisma.$connect()

  const app = createApp()
  app.listen(port, () => {
    console.log(`Express project is running at http://localhost:${port}`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to initialize server:', error)
  process.exit(1)
})
