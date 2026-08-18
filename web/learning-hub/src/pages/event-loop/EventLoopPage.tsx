import { useState } from 'react'
import './event-loop.css'

const source = `console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')`

export default function EventLoopPage() {
  const [output, setOutput] = useState<string[]>([])

  function runDemo() {
    const next = ['A', 'D']
    setOutput([...next])
    Promise.resolve().then(() => {
      next.push('C')
      setOutput([...next])
    })
    window.setTimeout(() => {
      next.push('B')
      setOutput([...next])
    }, 0)
  }

  return (
    <section className="event-loop-page">
      <p className="eyebrow">JavaScript runtime</p>
      <h1>Event loop order</h1>
      <p>Synchronous code runs first, then microtasks, then timer tasks.</p>
      <pre><code>{source}</code></pre>
      <button type="button" onClick={runDemo}>Run example</button>
      <div className="event-output" aria-live="polite">
        {output.length ? output.map((entry, index) => <span key={`${entry}-${index}`}>{entry}</span>) : <span>Press Run</span>}
      </div>
    </section>
  )
}
