import { useEffect, useState } from 'react'
import './App.css'
import CoordinateGridPage from './pages/CoordinateGridPage'
import TokenizationPage from './pages/TokenizationPage'

const routes = {
  tokenization: '#/tokenization',
  coordinateGrid: '#/coordinate-grid',
} as const

const getCurrentRoute = () =>
  window.location.hash === routes.coordinateGrid ? routes.coordinateGrid : routes.tokenization

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
      </nav>

      {currentRoute === routes.coordinateGrid ? <CoordinateGridPage /> : <TokenizationPage />}
    </>
  )
}

export default App
