import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  askRagQuestion,
  clearRagDatabase,
  uploadRagDocument,
  type AskRagQuestionResponse,
} from '../services/backendApi'

type StepStatus = 'idle' | 'loading' | 'success' | 'error'

type PipelineState = {
  upload: StepStatus
  ask: StepStatus
}

const defaultPipelineState: PipelineState = {
  upload: 'idle',
  ask: 'idle',
}

const stepLabels: Record<StepStatus, string> = {
  idle: 'Очікує',
  loading: 'В процесі',
  success: 'Готово',
  error: 'Помилка',
}

function ChunkingPage() {
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const [pipeline, setPipeline] = useState<PipelineState>(defaultPipelineState)

  const [error, setError] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [fileName, setFileName] = useState('')
  const [chunksCount, setChunksCount] = useState<number | null>(null)
  const [clearResult, setClearResult] = useState<{ deletedChunks: number; deletedDocuments: number } | null>(null)
  const [answer, setAnswer] = useState('')
  const [chunks, setChunks] = useState<AskRagQuestionResponse['chunks']>([])

  const safeErrorMessage = (caughtError: unknown, fallback: string) =>
    caughtError instanceof Error ? caughtError.message : fallback

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null
    setFile(selectedFile)
  }

  const resetAskState = () => {
    setQuestion('')
    setAnswer('')
    setChunks([])
    setPipeline((prev) => ({ ...prev, ask: 'idle' }))
  }

  const resetDocumentState = () => {
    setFile(null)
    setDocumentId('')
    setFileName('')
    setChunksCount(null)
    setPipeline(defaultPipelineState)
    resetAskState()
  }

  const handleClear = async () => {
    setError('')
    setIsClearing(true)

    try {
      const payload = await clearRagDatabase()
      setClearResult(payload)
      resetDocumentState()
    } catch (caughtError) {
      setError(safeErrorMessage(caughtError, 'Не вдалося очистити RAG базу.'))
    } finally {
      setIsClearing(false)
    }
  }

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!file) {
      setError('Обери PDF файл перед завантаженням.')
      return
    }

    setIsUploading(true)
    resetAskState()
    setPipeline((prev) => ({ ...prev, upload: 'loading' }))

    try {
      const payload = await uploadRagDocument(file)
      setDocumentId(payload.documentId)
      setFileName(payload.fileName)
      setChunksCount(payload.chunksCount)
      setPipeline((prev) => ({ ...prev, upload: 'success' }))
    } catch (caughtError) {
      setPipeline((prev) => ({ ...prev, upload: 'error' }))
      setError(safeErrorMessage(caughtError, 'Не вдалося завантажити PDF.'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleAsk = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setAnswer('')
    setChunks([])

    if (!documentId) {
      setError('Спочатку завантаж PDF документ.')
      return
    }

    if (!question.trim()) {
      setError('Введи питання для RAG-пошуку.')
      return
    }

    setIsAsking(true)
    setPipeline((prev) => ({ ...prev, ask: 'loading' }))

    try {
      const payload = await askRagQuestion({
        documentId,
        question: question.trim(),
      })
      setAnswer(payload.answer)
      setChunks(payload.chunks)
      setPipeline((prev) => ({ ...prev, ask: 'success' }))
    } catch (caughtError) {
      setPipeline((prev) => ({ ...prev, ask: 'error' }))
      setError(safeErrorMessage(caughtError, 'Не вдалося отримати відповідь через RAG.'))
    } finally {
      setIsAsking(false)
    }
  }

  const isAskReady = pipeline.upload === 'success' && Boolean(documentId)

  return (
    <main className="tokenizer-page">
      <section className="tokenizer-panel chunking-panel" aria-labelledby="chunking-title">
        <div className="intro">
          <p className="eyebrow">RAG chunking + retrieval</p>
          <h1 id="chunking-title">PDF upload → top-3 chunks → answer</h1>
          <p>Наочний RAG: завантаж документ, постав питання, подивись відповідь і chunks, які використані як контекст.</p>
        </div>

        <div className="chunking-toolbar">
          <button type="button" onClick={handleClear} disabled={isClearing || isUploading || isAsking}>
            {isClearing ? 'Очищаю...' : 'Очистити RAG базу'}
          </button>
          {clearResult && (
            <span>
              chunks: {clearResult.deletedChunks}, documents: {clearResult.deletedDocuments}
            </span>
          )}
        </div>

        <form className="tokenizer-form" onSubmit={handleUpload}>
          <label htmlFor="rag-file">PDF файл</label>
          <input id="rag-file" type="file" accept="application/pdf" onChange={handleFileChange} />

          <button type="submit" disabled={isUploading || isAsking || isClearing}>
            {isUploading ? 'Завантажую...' : 'Upload PDF'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <section className="rag-steps" aria-label="Pipeline status" aria-live="polite">
          <article className={`rag-step rag-step-${pipeline.upload}`}>
            <h2>Крок 1: Upload</h2>
            <strong>{stepLabels[pipeline.upload]}</strong>
            <p>Extract text → chunking → embeddings → збереження у pgvector.</p>
          </article>

          <article className={`rag-step rag-step-${pipeline.ask}`}>
            <h2>Крок 2: Ask</h2>
            <strong>{stepLabels[pipeline.ask]}</strong>
            <p>Embedding питання → top-3 retrieval → OpenAI answer.</p>
          </article>
        </section>

        <section className="result-section">
          <div className="result-header">
            <h2>Upload Result</h2>
          </div>
          {pipeline.upload === 'success' ? (
            <div className="rag-summary">
              <span>fileName: {fileName}</span>
              <span>documentId: {documentId}</span>
              <span>chunksCount: {chunksCount ?? 0}</span>
            </div>
          ) : (
            <p className="empty-result">Після upload тут зʼявляться метадані документа.</p>
          )}
        </section>

        <form className="tokenizer-form" onSubmit={handleAsk}>
          <label htmlFor="rag-question">Question</label>
          <textarea
            id="rag-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Наприклад: Що документ каже про battery safety?"
            rows={5}
          />

          <button type="submit" disabled={!isAskReady || isAsking || isUploading || isClearing}>
            {isAsking ? 'Asking...' : 'Ask OpenAI via RAG'}
          </button>
        </form>

        <section className="result-section" aria-live="polite">
          <div className="result-header">
            <h2>Answer</h2>
          </div>
          {answer ? <pre className="rag-answer">{answer}</pre> : <p className="empty-result">Відповідь зʼявиться тут після запиту.</p>}
        </section>

        <section className="result-section" aria-live="polite">
          <div className="result-header">
            <h2>Selected Chunks</h2>
            <span>{chunks.length} шт.</span>
          </div>

          {chunks.length > 0 ? (
            <div className="rag-sources-grid">
              {chunks.map((chunk) => (
                <article className="rag-source-card" key={chunk.id}>
                  <h3>Chunk #{chunk.chunkIndex}</h3>
                  <p>Similarity: {chunk.similarity.toFixed(4)}</p>
                  <pre className="rag-chunk-content">{chunk.content}</pre>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-result">Тут будуть top-3 chunks, які пішли в prompt.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default ChunkingPage
