import { useEffect, useState } from 'react'
import './App.css'
import CoordinateGridPage from './pages/CoordinateGridPage'
import PromptAssemblyPage from './pages/PromptAssemblyPage'
import TokenizationPage from './pages/TokenizationPage'

const routes = {
  tokenization: '#/tokenization',
  coordinateGrid: '#/coordinate-grid',
  promptAssembly: '#/prompt-assembly',
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
      </nav>

      {currentRoute === routes.coordinateGrid && <CoordinateGridPage />}
      {currentRoute === routes.promptAssembly && <PromptAssemblyPage />}
      {currentRoute === routes.tokenization && <TokenizationPage />}
    </>
  )
}

export default App
