import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Local learning app only: this exposes OPENAI_API_KEY to the browser bundle.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')

  return {
    plugins: [react()],
    define: {
      __OPENAI_API_KEY__: JSON.stringify(env.OPENAI_API_KEY ?? ''),
    },
  }
})
