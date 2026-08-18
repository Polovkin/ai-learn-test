import { useState } from 'react'
import type { FormEvent } from 'react'
import { requestCalculatorAnswer, type CalculatorApiResponse } from '../services/backendApi'

function CalculatorToolCallingPage() {
  const [message, setMessage] = useState('Я важу 80 кг і пройшов 6 км. Скільки калорій?')
  const [response, setResponse] = useState<CalculatorApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const sendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setResponse(null)

    if (!message.trim()) {
      setError('Введи запит для calculator API.')
      return
    }

    setIsLoading(true)
    try {
      const payload = await requestCalculatorAnswer(message)
      setResponse(payload)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Не вдалося отримати відповідь.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="tokenizer-page">
      <section className="tokenizer-panel prompt-panel" aria-labelledby="calculator-title">
        <div className="intro">
          <p className="eyebrow">Tool calling + Express backend</p>
          <h1 id="calculator-title">Calculator API demo</h1>
          <p>
            Відправляємо natural language запит, модель обирає tool, backend виконує локальну
            TypeScript-функцію і повертає фінальну відповідь.
          </p>
        </div>

        <form className="tokenizer-form" onSubmit={sendRequest}>
          <label htmlFor="calculator-message">Message</label>
          <textarea
            id="calculator-message"
            className="prompt-input"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Наприклад: Скільки часу займе 120 км при швидкості 60 км/год?"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Відправляю...' : 'POST /api/ai/calculator'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="prompt-flow" aria-hidden="true">
          <span>Client</span>
          <span>Tool selection + execution</span>
          <span>Final answer</span>
        </div>

        <section className="prompt-grid" aria-live="polite">
          <article className="prompt-card">
            <div className="result-header">
              <h2>Request</h2>
            </div>
            <pre>{message}</pre>
          </article>

          <article className="prompt-card prompt-card-wide">
            <div className="result-header">
              <h2>Answer</h2>
            </div>
            <pre>{response?.answer || 'Відповідь моделі зʼявиться після запиту.'}</pre>
          </article>

          <article className="prompt-card prompt-card-wide">
            <div className="result-header">
              <h2>Tool call debug</h2>
            </div>
            <pre>
              {response
                ? JSON.stringify(response.toolCall, null, 2)
                : 'Інформація про tool call зʼявиться після запиту.'}
            </pre>
          </article>
        </section>
      </section>
    </main>
  )
}

export default CalculatorToolCallingPage
