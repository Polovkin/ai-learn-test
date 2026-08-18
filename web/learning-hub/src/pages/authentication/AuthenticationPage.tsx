import { useEffect, useState } from 'react'
import {
  clearAccessToken,
  getAccessToken,
  getNotifications,
  getOrders,
  getProfile,
  getSettings,
  getWalletBalance,
  login,
  logout,
  resetWalletBalance,
  withdrawWithoutMutex,
} from './api'
import './authentication.css'

export default function AuthenticationPage() {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('password123')
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAccessToken()))
  const [authError, setAuthError] = useState('')
  const [apiResults, setApiResults] = useState<Record<string, unknown>>({})
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({})
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [walletLog, setWalletLog] = useState<string[]>([])
  const [isWalletBusy, setIsWalletBusy] = useState(false)

  useEffect(() => {
    getWalletBalance()
      .then((data) => setWalletBalance(data.balance))
      .catch((error) => setWalletLog([`Initial balance load failed: ${String(error)}`]))
  }, [])

  const token = getAccessToken()
  const tokenPreview = token.length > 20 ? `${token.slice(0, 10)}...${token.slice(-10)}` : token || '(empty)'

  function handleAuthFailure(error: unknown) {
    const message = String(error)
    if (message.includes('Refresh failed')) {
      setIsLoggedIn(false)
      setAuthError('Session expired. Please login again.')
    }
    return message
  }

  async function handleLogin() {
    setAuthError('')
    try {
      await login(email, password)
      setIsLoggedIn(true)
    } catch (error) {
      setAuthError(String(error))
    }
  }

  async function loadProfile() {
    try {
      const profile = await getProfile()
      setApiResults((current) => ({ ...current, profile }))
      setApiErrors((current) => {
        const next = { ...current }
        delete next.profile
        return next
      })
    } catch (error) {
      setApiErrors((current) => ({ ...current, profile: handleAuthFailure(error) }))
    }
  }

  async function loadAll() {
    const tasks = { profile: getProfile(), orders: getOrders(), notifications: getNotifications(), settings: getSettings() }
    const entries = Object.entries(tasks)
    const settled = await Promise.allSettled(entries.map(([, promise]) => promise))
    const nextResults: Record<string, unknown> = {}
    const nextErrors: Record<string, string> = {}
    settled.forEach((result, index) => {
      const key = entries[index][0]
      if (result.status === 'fulfilled') nextResults[key] = result.value
      else nextErrors[key] = handleAuthFailure(result.reason)
    })
    setApiResults(nextResults)
    setApiErrors(nextErrors)
  }

  async function handleLogout() {
    try { await logout() } finally {
      setIsLoggedIn(false)
      clearAccessToken()
    }
  }

  async function handleWalletReset() {
    setIsWalletBusy(true)
    setWalletLog([])
    try {
      const data = await resetWalletBalance()
      setWalletBalance(data.balance)
      setWalletLog([`Wallet reset to ${data.balance}`])
    } catch (error) {
      setWalletLog([`Reset failed: ${String(error)}`])
    } finally {
      setIsWalletBusy(false)
    }
  }

  async function runWithoutMutexDemo() {
    setIsWalletBusy(true)
    setWalletLog([])
    try {
      const reset = await resetWalletBalance()
      const messages = [`Wallet reset to ${reset.balance}`, 'Starting 3 parallel withdrawWithoutMutex(30) requests']
      const settled = await Promise.allSettled([withdrawWithoutMutex(30), withdrawWithoutMutex(30), withdrawWithoutMutex(30)])
      settled.forEach((result, index) => {
        messages.push(result.status === 'fulfilled'
          ? `Request ${index + 1} fulfilled with balance ${result.value.balance}`
          : `Request ${index + 1} rejected: ${String(result.reason)}`)
      })
      const current = await getWalletBalance()
      setWalletBalance(current.balance)
      setWalletLog([...messages, `Final balance: ${current.balance}`, 'Correct sequential result would be 10.'])
    } catch (error) {
      setWalletLog([`Demo failed: ${String(error)}`])
    } finally {
      setIsWalletBusy(false)
    }
  }

  return (
    <section className="auth-page">
      <h1>JWT Concurrent Refresh Learning</h1>
      {!isLoggedIn ? (
        <section className="auth-card">
          <h2>Login</h2>
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" /></label>
          <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></label>
          <button type="button" onClick={handleLogin}>Login</button>
          {authError ? <p className="auth-error">{authError}</p> : null}
        </section>
      ) : (
        <section className="auth-card">
          <h2>Dashboard</h2>
          <p><strong>Login state:</strong> authenticated</p>
          <p><strong>Access token:</strong> {tokenPreview}</p>
          <div className="auth-actions">
            <button type="button" onClick={loadProfile}>Load profile</button>
            <button type="button" onClick={loadAll}>Load all protected data</button>
            <button type="button" onClick={() => clearAccessToken()}>Clear access token</button>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
          <h3>API responses</h3><pre>{JSON.stringify(apiResults, null, 2)}</pre>
          <h3>Errors</h3><pre>{JSON.stringify(apiErrors, null, 2)}</pre>
        </section>
      )}
      <section className="auth-card">
        <h2>Wallet race condition demo</h2>
        <p><strong>Current balance:</strong> {walletBalance ?? '(not loaded)'}</p>
        <div className="auth-actions">
          <button disabled={isWalletBusy} type="button" onClick={handleWalletReset}>Reset wallet</button>
          <button disabled={isWalletBusy} type="button" onClick={runWithoutMutexDemo}>Run without mutex demo</button>
        </div>
        <p>Three simultaneous withdrawals can overwrite each other because they read the same balance.</p>
        <h3>Wallet log</h3>
        <pre>{walletLog.length > 0 ? walletLog.join('\n') : 'No wallet actions yet.'}</pre>
      </section>
    </section>
  )
}
