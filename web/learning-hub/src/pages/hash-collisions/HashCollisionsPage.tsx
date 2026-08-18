import { useState } from 'react'
import './hash-collisions.css'

const bucketCount = 5
const hashMultiplier = 31
const initialBuckets = () => Array.from({ length: bucketCount }, () => [] as string[])

function getHashWithSteps(key: string) {
  const steps = [`key = "${key}"`, `bucket count = ${bucketCount}`, 'hash starts from 0']
  let hashValue = 0
  for (const char of key) {
    const previousHash = hashValue
    hashValue = hashValue * hashMultiplier + char.charCodeAt(0)
    steps.push(`hash = ${previousHash} × ${hashMultiplier} + charCode("${char}") ${char.charCodeAt(0)} = ${hashValue}`)
  }
  const bucketIndex = Math.abs(hashValue) % bucketCount
  steps.push(`${Math.abs(hashValue)} % ${bucketCount} = ${bucketIndex}`, `go to bucket[${bucketIndex}]`)
  return { bucketIndex, steps }
}

export default function HashCollisionsPage() {
  const [key, setKey] = useState('')
  const [buckets, setBuckets] = useState(initialBuckets)
  const [steps, setSteps] = useState<string[]>([])
  const [message, setMessage] = useState('Enter a key to see how it is mapped to a bucket.')
  const [activeBucket, setActiveBucket] = useState<number | null>(null)
  const [collisionBucket, setCollisionBucket] = useState<number | null>(null)

  function addKey(rawKey = key) {
    const normalizedKey = rawKey.trim()
    if (!normalizedKey) {
      setMessage('Please enter a key first.')
      setSteps(['No key provided.'])
      return
    }
    const result = getHashWithSteps(normalizedKey)
    const hasCollision = buckets[result.bucketIndex].length > 0
    setBuckets((current) => current.map((bucket, index) => index === result.bucketIndex ? [...bucket, normalizedKey] : bucket))
    setSteps([...result.steps, hasCollision ? 'collision detected' : 'bucket is empty', `add "${normalizedKey}" to bucket[${result.bucketIndex}]`])
    setMessage(hasCollision ? `Collision in bucket[${result.bucketIndex}].` : `No collision. "${normalizedKey}" goes to bucket[${result.bucketIndex}].`)
    setActiveBucket(result.bucketIndex)
    setCollisionBucket(hasCollision ? result.bucketIndex : null)
    setKey(normalizedKey)
  }

  function findKey() {
    const normalizedKey = key.trim()
    if (!normalizedKey) {
      setMessage('Please enter a key first.')
      return
    }
    const result = getHashWithSteps(normalizedKey)
    const found = buckets[result.bucketIndex].includes(normalizedKey)
    setSteps([...result.steps, `scan only bucket[${result.bucketIndex}]`, found ? `found "${normalizedKey}"` : `"${normalizedKey}" not found`])
    setMessage(found ? `Found "${normalizedKey}" in bucket[${result.bucketIndex}].` : `"${normalizedKey}" not found.`)
    setActiveBucket(result.bucketIndex)
    setCollisionBucket(null)
  }

  return (
    <section className="hash-page">
      <h1>Hash map collisions</h1>
      <p className="hash-intro">Five buckets and a simple polynomial hash make collisions visible.</p>
      <div className="hash-controls">
        <input aria-label="Hash key" value={key} onChange={(event) => setKey(event.target.value)} />
        <button type="button" onClick={() => addKey()}>Add key</button>
        <button type="button" onClick={findKey}>Find key</button>
      </div>
      <div className="hash-examples">
        {['cat', 'dog', 'react', 'node'].map((example) => <button type="button" key={example} onClick={() => addKey(example)}>{example}</button>)}
      </div>
      <p className="hash-explain" aria-live="polite">{message}</p>
      <div className="hash-buckets">
        {buckets.map((bucket, index) => (
          <article className={`hash-bucket ${activeBucket === index ? 'active' : ''} ${collisionBucket === index ? 'collision' : ''}`} key={index}>
            <strong>bucket[{index}]</strong>
            <ul>{bucket.length ? bucket.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>) : <li>(empty)</li>}</ul>
          </article>
        ))}
      </div>
      <ol className="hash-steps">{steps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ol>
    </section>
  )
}
