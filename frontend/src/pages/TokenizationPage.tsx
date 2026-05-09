import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { getEncoding } from 'js-tiktoken'

type TokenResult = {
  id: number
  text: string
}

type EmbeddingResponse = {
  data: Array<{
    embedding: number[]
  }>
  model: string
  usage?: {
    prompt_tokens: number
    total_tokens: number
  }
}

declare const __OPENAI_API_KEY__: string

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 3

function TokenizationPage() {
  const encoder = useMemo(() => getEncoding('cl100k_base'), [])
  const [input, setInput] = useState('')
  const [tokens, setTokens] = useState<TokenResult[]>([])
  const [embedding, setEmbedding] = useState<number[]>([])
  const [usage, setUsage] = useState<EmbeddingResponse['usage']>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const tokenize = () => {
    const tokenIds = encoder.encode(input)
    const nextTokens = tokenIds.map((id) => ({
      id,
      text: encoder.decode([id]),
    }))

    setTokens(nextTokens)
    return nextTokens
  }

  const createEmbedding = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setEmbedding([])
    setUsage(undefined)

    const nextTokens = tokenize()

    if (!input.trim()) {
      setError('Введи текст перед запитом до Embeddings API.')
      return
    }

    setIsLoading(true)

    try {
      if (!__OPENAI_API_KEY__) {
        throw new Error('OPENAI_API_KEY не знайдено в root .env.')
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${__OPENAI_API_KEY__}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input,
          dimensions: EMBEDDING_DIMENSIONS,
          encoding_format: 'float',
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'OpenAI API повернув помилку.')
      }

      const embeddingPayload = payload as EmbeddingResponse
      setTokens(nextTokens)
      setEmbedding(embeddingPayload.data[0]?.embedding ?? [])
      setUsage(embeddingPayload.usage)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Не вдалося отримати embedding.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const visibleVector = embedding.slice(0, 48)
  const maxMagnitude =
    visibleVector.reduce((max, value) => Math.max(max, Math.abs(value)), 0) || 1

  return (
    <main className="tokenizer-page">
      <section className="tokenizer-panel" aria-labelledby="tokenizer-title">
        <div className="intro">
          <p className="eyebrow">js-tiktoken + OpenAI Embeddings API</p>
          <h1 id="tokenizer-title">Текст → токени → embedding</h1>
          <p>
            Введи текст, подивись token ids, а потім отримай embedding-вектор
            для всього input напряму через OpenAI Embeddings API.
          </p>
        </div>

        <form className="tokenizer-form" onSubmit={createEmbedding}>
          <label htmlFor="token-input">Текст для перетворення</label>
          <input
            id="token-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Наприклад: токенізація перетворює текст у числа"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Створюю embedding...' : 'Токенізувати і створити embedding'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="flow" aria-hidden="true">
          <span>Input text</span>
          <span>Token ids</span>
          <span>Embedding vector</span>
        </div>

        <section className="result-section" aria-live="polite">
          <div className="result-header">
            <h2>Token ids</h2>
            <span>{tokens.length} токенів</span>
          </div>

          {tokens.length > 0 ? (
            <div className="tokens-grid">
              {tokens.map((token, index) => (
                <article className="token-card" key={`${token.id}-${index}`}>
                  <strong>{token.text || ' '}</strong>
                  <code>Token ID: <b>{token.id}</b> </code>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-result">Токени зʼявляться тут після запуску.</p>
          )}
        </section>

        <section className="result-section">
          <div className="result-header">
            <h2>Embedding-вектор</h2>
            <span>{embedding.length} dimensions</span>
          </div>

          {embedding.length > 0 ? (
            <>
              <div className="embedding-meta">
                <span>model: {EMBEDDING_MODEL}</span>
                <span>dimensions: {EMBEDDING_DIMENSIONS}</span>
                <span>api tokens: {usage?.total_tokens ?? 'n/a'}</span>
              </div>

              <div className="embedding-bars">
                {visibleVector.map((value, index) => (
                  <div className="embedding-row" key={`${value}-${index}`}>
                    <code>{index}</code>
                    <div className="bar-track">
                      <span
                        className={value >= 0 ? 'bar positive' : 'bar negative'}
                        style={{
                          width: `${(Math.abs(value) / maxMagnitude) * 100}%`,
                        }}
                      />
                    </div>
                    <span>{value.toFixed(6)}</span>
                  </div>
                ))}
              </div>

              <textarea
                className="vector-output"
                readOnly
                value={JSON.stringify(embedding, null, 2)}
                aria-label="Повний embedding vector"
              />
            </>
          ) : (
            <p className="empty-result">
              Тут буде числовий вектор для всього input тексту.
            </p>
          )}
        </section>
      </section>
    </main>
  )
}

export default TokenizationPage
