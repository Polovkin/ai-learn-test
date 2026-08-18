import { useState } from 'react'
import './api-status.css'

type ApiState = { tone: 'idle' | 'success' | 'error'; message: string }

export default function ApiStatusPage() {
  const [status, setStatus] = useState<ApiState>({ tone: 'idle', message: 'Not checked yet.' })

  async function checkApi() {
    try {
      const response = await fetch('/api/health')
      const data = await response.json() as { service: string; status: string }
      if (!response.ok) throw new Error(data.status)
      setStatus({ tone: 'success', message: `${data.service}: ${data.status}` })
    } catch (error) {
      setStatus({ tone: 'error', message: `API is unavailable: ${String(error)}` })
    }
  }

  return (
    <section className="api-status-page">
      <p className="eyebrow">Node + Express</p>
      <h1>LLM API status</h1>
      <p>The former Pug landing page is now part of the shared React application.</p>
      <button type="button" onClick={checkApi}>Check API</button>
      <output className={status.tone}>{status.message}</output>
    </section>
  )
}
