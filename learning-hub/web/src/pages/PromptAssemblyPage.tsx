import { useState } from 'react'
import type { FormEvent } from 'react'
import { requestPromptAssembly } from '../services/backendApi'

function PromptAssemblyPage() {
  const [userInput, setUserInput] = useState('')
  const [assembledPrompt, setAssembledPrompt] = useState('')
  const [modelResponse, setModelResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const sendToBackend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setAssembledPrompt('')
    setModelResponse('')

    if (!userInput.trim()) {
      setError('Введи user input перед відправкою на backend.')
      return
    }

    setIsLoading(true)

    try {
      const promptPayload = await requestPromptAssembly(userInput)
      setAssembledPrompt(promptPayload.assembledPrompt)
      setModelResponse(promptPayload.response)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Не вдалося отримати відповідь моделі.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="tokenizer-page">
      <section className="tokenizer-panel prompt-panel" aria-labelledby="prompt-title">
        <div className="intro">
          <p className="eyebrow">Prompt assembly + Express backend</p>
          <h1 id="prompt-title">User input → final prompt → model response</h1>
          <p>
            Цей екран показує, що модель отримує не сирий input користувача, а
            prompt, який спочатку збирає Express backend із system instruction,
            context і question.
          </p>
        </div>

        <form className="tokenizer-form" onSubmit={sendToBackend}>
          <label htmlFor="prompt-input">User input</label>
          <textarea
            id="prompt-input"
            className="prompt-input"
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
            placeholder="Наприклад: поясни, чому prompt engineering важливий"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Відправляю...' : 'Send via Express'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="prompt-flow" aria-hidden="true">
          <span>User input</span>
          <span>Prompt assembly</span>
          <span>Model response</span>
        </div>

        <section className="prompt-grid" aria-live="polite">
          <article className="prompt-card">
            <div className="result-header">
              <h2>User input</h2>
            </div>
            <pre>{userInput || 'User input зʼявиться тут під час набору.'}</pre>
          </article>

          <article className="prompt-card prompt-card-wide">
            <div className="result-header">
              <h2>Final assembled prompt</h2>
            </div>
            <pre>{assembledPrompt || 'Backend збере prompt і поверне його після кліку.'}</pre>
          </article>

          <article className="prompt-card prompt-card-wide">
            <div className="result-header">
              <h2>Model response</h2>
            </div>
            <pre>{modelResponse || 'Відповідь моделі зʼявиться після кліку.'}</pre>
          </article>
        </section>
      </section>
    </main>
  )
}

export default PromptAssemblyPage
