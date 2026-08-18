import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react'
import './App.css'

const CalculatorToolCallingPage = lazy(() => import('./pages/CalculatorToolCallingPage'))
const ChunkingPage = lazy(() => import('./pages/ChunkingPage'))
const CompoundProductCardPage = lazy(() => import('./pages/CompoundProductCardPage'))
const CoordinateGridPage = lazy(() => import('./pages/CoordinateGridPage'))
const PromptAssemblyPage = lazy(() => import('./pages/PromptAssemblyPage'))
const TokenizationPage = lazy(() => import('./pages/TokenizationPage'))
const ApiStatusPage = lazy(() => import('./pages/api-status/ApiStatusPage'))
const AuthenticationPage = lazy(() => import('./pages/authentication/AuthenticationPage'))
const CssPopoverPage = lazy(() => import('./pages/css-popover/CssPopoverPage'))
const DiffieHellmanPage = lazy(() => import('./pages/diffie-hellman/DiffieHellmanPage'))
const EventLoopPage = lazy(() => import('./pages/event-loop/EventLoopPage'))
const HashCollisionsPage = lazy(() => import('./pages/hash-collisions/HashCollisionsPage'))
const ReactHelloWorldPage = lazy(() => import('./pages/react-hello-world/ReactHelloWorldPage'))
const SvgChartPage = lazy(() => import('./pages/svg-chart/SvgChartPage'))

type Route = {
  path: string
  label: string
  group: 'LLM' | 'Web' | 'Node'
  component: ComponentType
}

const routes: Route[] = [
  { path: '/llm/tokenization', label: 'Токенізація', group: 'LLM', component: TokenizationPage },
  { path: '/llm/coordinate-grid', label: 'Координати', group: 'LLM', component: CoordinateGridPage },
  { path: '/llm/prompt-assembly', label: 'Prompt Assembly', group: 'LLM', component: PromptAssemblyPage },
  { path: '/llm/chunking', label: 'Chunking / RAG', group: 'LLM', component: ChunkingPage },
  { path: '/llm/calculator', label: 'AI Calculator', group: 'LLM', component: CalculatorToolCallingPage },
  { path: '/llm/product-card', label: 'ProductCard', group: 'LLM', component: CompoundProductCardPage },
  { path: '/authentication', label: 'JWT Auth', group: 'Web', component: AuthenticationPage },
  { path: '/diffie-hellman', label: 'Diffie–Hellman', group: 'Web', component: DiffieHellmanPage },
  { path: '/hash-collisions', label: 'Hash collisions', group: 'Web', component: HashCollisionsPage },
  { path: '/react-hello-world', label: 'React state', group: 'Web', component: ReactHelloWorldPage },
  { path: '/css-popover', label: 'CSS popover', group: 'Web', component: CssPopoverPage },
  { path: '/event-loop', label: 'Event loop', group: 'Web', component: EventLoopPage },
  { path: '/svg-chart', label: 'SVG chart', group: 'Web', component: SvgChartPage },
  { path: '/api-status', label: 'API status', group: 'Node', component: ApiStatusPage },
]

const defaultPath = routes[0].path

function getCurrentPath() {
  const path = window.location.hash.slice(1)
  return routes.some((route) => route.path === path) ? path : defaultPath
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath)

  useEffect(() => {
    if (!window.location.hash) window.location.hash = defaultPath
    const handleHashChange = () => setCurrentPath(getCurrentPath())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const activeRoute = routes.find((route) => route.path === currentPath) ?? routes[0]
  const ActivePage = activeRoute.component

  return (
    <div className="learning-hub">
      <header className="hub-header">
        <a className="hub-brand" href={`#${defaultPath}`}>Learning Hub</a>
        <nav className="app-nav" aria-label="Навчальні проєкти">
          {(['LLM', 'Web', 'Node'] as const).map((group) => (
            <div className="nav-group" key={group}>
              <span>{group}</span>
              <div>
                {routes.filter((route) => route.group === group).map((route) => (
                  <a
                    className={currentPath === route.path ? 'active' : undefined}
                    href={`#${route.path}`}
                    key={route.path}
                  >
                    {route.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>
      <main className="hub-content" key={activeRoute.path}>
        <Suspense fallback={<p className="page-loading">Завантаження сторінки…</p>}><ActivePage /></Suspense>
      </main>
    </div>
  )
}
