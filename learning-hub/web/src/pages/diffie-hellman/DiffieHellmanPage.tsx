import { useState } from 'react'
import { attackerSearchLimit, defaultSecretSteps, dialConfig, initialPosition, modulus, multiplier, parties } from './ts/constants'
import { getDialPoint, getNextPosition } from './ts/math'
import type { AttackerState, DhState, PartyId, PartyState, Phase } from './ts/types'
import './diffie-hellman.css'

const partyIds: PartyId[] = ['alice', 'bob']

function createPartyState(): PartyState {
  return {
    publicPosition: initialPosition,
    publicSteps: 0,
    publicHistory: [initialPosition],
    publicFormula: 'Стартова позиція: 1',
    sharedPosition: null,
    sharedSteps: 0,
    sharedHistory: [],
    sharedFormula: 'Очікуємо публічне число іншої сторони',
  }
}

function emptyAttacker(): AttackerState {
  return { calculatedAt: null, elapsedMs: null, results: null }
}

function createInitialState(secretSteps: Record<PartyId, number> = { ...defaultSecretSteps }): DhState {
  return {
    parties: { alice: createPartyState(), bob: createPartyState() },
    secretSteps,
    attacker: emptyAttacker(),
  }
}

function equivalentSteps(target: number) {
  const matches: number[] = []
  let position = initialPosition
  for (let steps = 0; steps <= attackerSearchLimit; steps += 1) {
    if (position === target) matches.push(steps)
    position = getNextPosition(position, multiplier)
  }
  return matches
}

function canStepPublic(state: DhState, partyId: PartyId) {
  return state.parties[partyId].publicSteps < state.secretSteps[partyId]
}

function canStepShared(state: DhState, partyId: PartyId) {
  const otherPartyId = parties[partyId].sharedFromParty
  return state.parties[otherPartyId].publicSteps === state.secretSteps[otherPartyId]
    && state.parties[partyId].sharedSteps < state.secretSteps[partyId]
}

type PartyCardProps = {
  partyId: PartyId
  state: DhState
  onSecretChange: (partyId: PartyId, value: number) => void
  onStep: (partyId: PartyId, phase: Phase) => void
}

function PartyCard({ partyId, state, onSecretChange, onStep }: PartyCardProps) {
  const party = state.parties[partyId]
  const otherPartyId = parties[partyId].sharedFromParty
  const otherParty = state.parties[otherPartyId]
  const secretSteps = state.secretSteps[partyId]
  const publicDone = party.publicSteps === secretSteps
  const sharedDone = party.sharedSteps === secretSteps
  const history = [
    ...party.publicHistory.map((position, index) => ({ id: `public-${index}`, label: `public ${index}: ${position}` })),
    ...party.sharedHistory.map((position, index) => ({ id: `shared-${index}`, label: `shared ${index}: ${position}` })),
  ]

  return (
    <article className={`dh-party dh-party-${partyId}`}>
      <header>
        <label>
          <span>{parties[partyId].name}: секретні кроки</span>
          <input
            type="number"
            min="0"
            max="99"
            value={secretSteps}
            onChange={(event) => onSecretChange(partyId, Number(event.target.value))}
          />
        </label>
        <strong className="dh-key">{party.sharedPosition ?? '?'}</strong>
      </header>
      <section>
        <h3>1. Публічне число</h3>
        <p>Кроки: <strong>{party.publicSteps} / {secretSteps}</strong></p>
        <p>Позиція: <strong>{party.publicPosition}</strong></p>
        <code>{party.publicFormula}</code>
        <button disabled={!canStepPublic(state, partyId)} type="button" onClick={() => onStep(partyId, 'public')}>
          {publicDone ? 'Публічне число готове' : 'Зробити крок'}
        </button>
      </section>
      <section>
        <h3>2. Спільний ключ</h3>
        <p>Публічне число від {parties[otherPartyId].name}: <strong>{otherParty.publicPosition}</strong></p>
        <p>Кроки: <strong>{party.sharedSteps} / {secretSteps}</strong></p>
        <code>{party.sharedFormula}</code>
        <button disabled={!canStepShared(state, partyId)} type="button" onClick={() => onStep(partyId, 'shared')}>
          {sharedDone ? 'Спільний ключ готовий' : 'Зробити крок'}
        </button>
      </section>
      <ol className="dh-history" aria-label={`Історія розрахунків: ${parties[partyId].name}`}>
        {history.map((item) => <li key={item.id}>{item.label}</li>)}
      </ol>
    </article>
  )
}

function DialPanel({ state }: { state: DhState }) {
  const traces = partyIds.flatMap((partyId) => {
    const party = state.parties[partyId]
    return [
      { id: `${partyId}-public`, partyId, phase: 'public', history: party.publicHistory },
      { id: `${partyId}-shared`, partyId, phase: 'shared', history: party.sharedHistory },
    ] as const
  })
  const lines = traces.flatMap((trace) => trace.history.slice(1).map((value, index) => ({
    id: `${trace.id}-${index}`,
    from: getDialPoint(trace.history[index]),
    to: getDialPoint(value),
    partyId: trace.partyId,
    phase: trace.phase,
  })))
  const visited = new Set(traces.flatMap((trace) => trace.history))
  const sharedKey = state.parties.alice.sharedPosition === state.parties.bob.sharedPosition ? state.parties.alice.sharedPosition : null

  return (
    <aside className="dh-dial-panel">
      <h2>Позиції на циферблаті</h2>
      <p>Суцільні лінії ведуть до публічного числа, пунктирні — до спільного ключа.</p>
      <svg viewBox="0 0 520 520" role="img" aria-label="Позиції Diffie-Hellman на циферблаті">
        {lines.map((line) => <line className={`dh-line ${line.partyId} ${line.phase}`} key={line.id} x1={line.from.x} y1={line.from.y} x2={line.to.x} y2={line.to.y} />)}
        {Array.from({ length: modulus }, (_, value) => {
          const point = getDialPoint(value)
          const isAlice = state.parties.alice.publicPosition === value
          const isBob = state.parties.bob.publicPosition === value
          return (
            <g key={value}>
              <circle className={`dh-point ${visited.has(value) ? 'visited' : ''} ${isAlice ? 'alice' : ''} ${isBob ? 'bob' : ''} ${sharedKey === value ? 'key' : ''}`} cx={point.x} cy={point.y} r={dialConfig.pointRadius} />
              <text className="dh-label" x={point.x} y={point.y}>{value}</text>
            </g>
          )
        })}
      </svg>
    </aside>
  )
}

function AttackerPanel({ state, onCalculate }: { state: DhState; onCalculate: () => void }) {
  const ready = partyIds.every((partyId) => state.parties[partyId].publicSteps === state.secretSteps[partyId])
  return (
    <section className="dh-attacker">
      <p className="eyebrow">Спостерігач</p>
      <h2>Маша пробує відновити секретні кроки</h2>
      <div className="dh-observed">
        {partyIds.map((partyId) => <div key={partyId}><span>{parties[partyId].name}</span><strong>{state.parties[partyId].publicPosition}</strong></div>)}
      </div>
      <button disabled={!ready} type="button" onClick={onCalculate}>Розрахувати</button>
      {!ready ? <p>Спочатку завершіть публічні числа обох сторін.</p> : null}
      {state.attacker.results ? (
        <div className="dh-attacker-results">
          <strong>Час: {state.attacker.elapsedMs?.toFixed(4)} мс</strong>
          {partyIds.map((partyId) => {
            const result = state.attacker.results?.[partyId]
            return result ? <p key={partyId}>{parties[partyId].name}: найменше значення {result.foundSteps ?? 'не знайдено'}; усі збіги: {result.equivalentSteps.join(', ') || 'немає'}</p> : null
          })}
        </div>
      ) : null}
    </section>
  )
}

export default function DiffieHellmanPage() {
  const [state, setState] = useState(createInitialState)

  function changeSecret(partyId: PartyId, value: number) {
    const normalized = Number.isFinite(value) ? Math.max(0, Math.min(99, Math.trunc(value))) : 0
    setState((current) => createInitialState({ ...current.secretSteps, [partyId]: normalized }))
  }

  function stepParty(partyId: PartyId, phase: Phase) {
    setState((current) => {
      if (phase === 'public' && !canStepPublic(current, partyId)) return current
      if (phase === 'shared' && !canStepShared(current, partyId)) return current
      const existing = current.parties[partyId]
      const factor = phase === 'public' ? multiplier : current.parties[parties[partyId].sharedFromParty].publicPosition
      const previous = phase === 'public' ? existing.publicPosition : existing.sharedPosition ?? initialPosition
      const next = getNextPosition(previous, factor)
      const formula = `(${previous} × ${factor}) % ${modulus} = ${next}`
      const updated: PartyState = phase === 'public'
        ? { ...existing, publicPosition: next, publicSteps: existing.publicSteps + 1, publicHistory: [...existing.publicHistory, next], publicFormula: formula }
        : { ...existing, sharedPosition: next, sharedSteps: existing.sharedSteps + 1, sharedHistory: existing.sharedHistory.length ? [...existing.sharedHistory, next] : [initialPosition, next], sharedFormula: formula }
      return { ...current, parties: { ...current.parties, [partyId]: updated }, attacker: emptyAttacker() }
    })
  }

  function calculateAttacker() {
    const startedAt = performance.now()
    const results = Object.fromEntries(partyIds.map((partyId) => {
      const matches = equivalentSteps(state.parties[partyId].publicPosition)
      return [partyId, { party: partyId, publicPosition: state.parties[partyId].publicPosition, foundSteps: matches[0] ?? null, equivalentSteps: matches, attempts: attackerSearchLimit + 1 }]
    })) as NonNullable<AttackerState['results']>
    setState({ ...state, attacker: { calculatedAt: new Date().toLocaleTimeString('uk-UA'), elapsedMs: performance.now() - startedAt, results } })
  }

  const bothPublicReady = partyIds.every((id) => state.parties[id].publicSteps === state.secretSteps[id])
  const bothSharedReady = partyIds.every((id) => state.parties[id].sharedSteps === state.secretSteps[id])
  const sharedMatch = bothSharedReady && state.parties.alice.sharedPosition === state.parties.bob.sharedPosition
  const status = !bothPublicReady
    ? 'Спочатку розрахуйте публічні числа.'
    : !bothSharedReady
      ? 'Публічні числа готові. Тепер розрахуйте спільний ключ.'
      : sharedMatch
        ? `Готово: обидві сторони отримали ключ ${state.parties.alice.sharedPosition}.`
        : 'Ключі не збіглися.'

  return (
    <section className="dh-page">
      <p className="eyebrow">Іграшковий Diffie-Hellman</p>
      <h1>Циферблат на 23 поділки</h1>
      <p className="dh-lead">Малий модуль робить видимими публічні числа, спільний ключ і перебір атакувальника.</p>
      <div className="dh-rules"><span>p = 23<small>модуль</small></span><span>g = 5<small>множник</small></span><span>1<small>початок</small></span></div>
      <div className="dh-grid">
        <DialPanel state={state} />
        <div className="dh-parties">{partyIds.map((id) => <PartyCard key={id} partyId={id} state={state} onSecretChange={changeSecret} onStep={stepParty} />)}</div>
      </div>
      <AttackerPanel state={state} onCalculate={calculateAttacker} />
      <section className={`dh-result ${sharedMatch ? 'success' : ''}`} aria-live="polite"><p>{status}</p><button type="button" onClick={() => setState(createInitialState(state.secretSteps))}>Скинути</button></section>
    </section>
  )
}
