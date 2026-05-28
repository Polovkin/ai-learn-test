import { useEffect, useState } from 'react'
import './App.css'
import ChunkingPage from './pages/ChunkingPage'
import CalculatorToolCallingPage from './pages/CalculatorToolCallingPage'
import CoordinateGridPage from './pages/CoordinateGridPage'
import PromptAssemblyPage from './pages/PromptAssemblyPage'
import TokenizationPage from './pages/TokenizationPage'

const routes = {
  tokenization: '#/tokenization',
  coordinateGrid: '#/coordinate-grid',
  promptAssembly: '#/prompt-assembly',
  chunking: '#/chunking',
  calculator: '#/calculator',
} as const

const getCurrentRoute = () =>
  Object.values(routes).includes(window.location.hash as (typeof routes)[keyof typeof routes])
    ? window.location.hash
    : routes.tokenization

function App() {
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute)

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = routes.tokenization
    }

    const handleHashChange = () => {
      setCurrentRoute(getCurrentRoute())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      <nav className="app-nav" aria-label="Основна навігація">
        <a
          className={currentRoute === routes.tokenization ? 'active' : undefined}
          href={routes.tokenization}
        >
          Токенізація
        </a>
        <a
          className={currentRoute === routes.coordinateGrid ? 'active' : undefined}
          href={routes.coordinateGrid}
        >
          Координатна сітка
        </a>
        <a
          className={currentRoute === routes.promptAssembly ? 'active' : undefined}
          href={routes.promptAssembly}
        >
          Prompt Assembly
        </a>
        <a
          className={currentRoute === routes.chunking ? 'active' : undefined}
          href={routes.chunking}
        >
          Chunking / RAG
        </a>
        <a
          className={currentRoute === routes.calculator ? 'active' : undefined}
          href={routes.calculator}
        >
          Tool Calling: Calculator
        </a>
      </nav>

      {currentRoute === routes.coordinateGrid && <CoordinateGridPage />}
      {currentRoute === routes.promptAssembly && <PromptAssemblyPage />}
      {currentRoute === routes.chunking && <ChunkingPage />}
      {currentRoute === routes.calculator && <CalculatorToolCallingPage />}
      {currentRoute === routes.tokenization && <TokenizationPage />}
    </>
  )
}

export default App
