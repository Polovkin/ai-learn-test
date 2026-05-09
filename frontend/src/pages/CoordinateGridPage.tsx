import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Point = {
  id: string
  x: number
  y: number
}

type VectorPair = {
  key: string
  a: Point
  b: Point
  pairLabel: string
  vectorsLabel: string
  distance: number
  dotProduct: number
  cosine: number | null
}

type ChartPoint = Point & {
  label: string
  color: string
  length: number
}

type TooltipPayload = {
  payload?: ChartPoint
}

type VectorTooltipProps = {
  active?: boolean
  payload?: TooltipPayload[]
}

type SortKey = 'pair' | 'vectors' | 'distance' | 'dotProduct' | 'cosine'
type SortDirection = 'asc' | 'desc'

type SortState = {
  key: SortKey
  direction: SortDirection
}

const pointColors = ['#2563eb', '#dc2626', '#0f766e', '#9333ea', '#ea580c', '#0891b2']
const COORDINATE_LIMIT = 100

const defaultPoints: Point[] = [
  { id: 'A', x: 20, y: 30 },
  { id: 'B', x: 60, y: 10 },
  { id: 'C', x: -30, y: 40 },
]

const formatCoordinate = (value: number) => value.toString()

const getVectorLength = (point: Point) => Math.sqrt(point.x * point.x + point.y * point.y)

const getDistance = (a: Point, b: Point) =>
  Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y))

const getDotProduct = (a: Point, b: Point) => a.x * b.x + a.y * b.y

const getCosineSimilarity = (a: Point, b: Point) => {
  const aLength = getVectorLength(a)
  const bLength = getVectorLength(b)

  if (aLength === 0 || bLength === 0) {
    return null
  }

  return getDotProduct(a, b) / (aLength * bLength)
}

const compareText = (a: string, b: string) => a.localeCompare(b, 'uk')

const compareNullableNumbers = (a: number | null, b: number | null) => {
  if (a === null && b === null) {
    return 0
  }

  if (a === null) {
    return 1
  }

  if (b === null) {
    return -1
  }

  return a - b
}

const hasCoordinateCollision = (
  points: Point[],
  x: number,
  y: number,
  ignoredIndex?: number,
) =>
  points.some((point, index) => index !== ignoredIndex && point.x === x && point.y === y)

const parseCoordinate = (value: string) => {
  if (!value.trim()) {
    return null
  }

  const coordinate = Number(value)
  return Number.isInteger(coordinate) ? coordinate : null
}

function VectorTooltip({ active, payload }: VectorTooltipProps) {
  const point = payload?.[0]?.payload

  if (!active || !point) {
    return null
  }

  return (
    <div className="vector-tooltip">
      <strong>{point.label}</strong>
      <span>x: {formatCoordinate(point.x)}</span>
      <span>y: {formatCoordinate(point.y)}</span>
      <span>довжина: {point.length.toFixed(3)}</span>
    </div>
  )
}

function CoordinateGridPage() {
  const [points, setPoints] = useState<Point[]>(defaultPoints)
  const [name, setName] = useState('')
  const [xValue, setXValue] = useState('')
  const [yValue, setYValue] = useState('')
  const [formError, setFormError] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editXValue, setEditXValue] = useState('')
  const [editYValue, setEditYValue] = useState('')
  const [sort, setSort] = useState<SortState>({
    key: 'pair',
    direction: 'asc',
  })

  const chartPoints = useMemo<ChartPoint[]>(
    () =>
      points.map((point, index) => ({
        ...point,
        color: pointColors[index % pointColors.length],
        label: `${point.id} (${formatCoordinate(point.x)}, ${formatCoordinate(point.y)})`,
        length: getVectorLength(point),
      })),
    [points],
  )

  const vectorPairs = useMemo<VectorPair[]>(() => {
    const pairs: VectorPair[] = []

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i]
        const b = points[j]

        pairs.push({
          key: `${i}-${j}`,
          a,
          b,
          pairLabel: `${a.id} ↔ ${b.id}`,
          vectorsLabel: `[${formatCoordinate(a.x)}, ${formatCoordinate(a.y)}] ↔ [${formatCoordinate(
            b.x,
          )}, ${formatCoordinate(b.y)}]`,
          distance: getDistance(a, b),
          dotProduct: getDotProduct(a, b),
          cosine: getCosineSimilarity(a, b),
        })
      }
    }

    return pairs
  }, [points])

  const sortedVectorPairs = useMemo(() => {
    const sortedPairs = [...vectorPairs].sort((a, b) => {
      let result = 0

      if (sort.key === 'pair') {
        result = compareText(a.pairLabel, b.pairLabel)
      }

      if (sort.key === 'vectors') {
        result = compareText(a.vectorsLabel, b.vectorsLabel)
      }

      if (sort.key === 'distance') {
        result = a.distance - b.distance
      }

      if (sort.key === 'dotProduct') {
        result = a.dotProduct - b.dotProduct
      }

      if (sort.key === 'cosine') {
        result = compareNullableNumbers(a.cosine, b.cosine)
      }

      return sort.direction === 'asc' ? result : -result
    })

    return sortedPairs
  }, [sort.direction, sort.key, vectorPairs])

  const changeSort = (key: SortKey) => {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const getSortLabel = (key: SortKey) => {
    if (sort.key !== key) {
      return '↕'
    }

    return sort.direction === 'asc' ? '↑' : '↓'
  }

  const addPoint = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextName = name.trim()
    const nextX = parseCoordinate(xValue)
    const nextY = parseCoordinate(yValue)

    if (!nextName) {
      setFormError('Вкажи назву точки.')
      return
    }

    if (nextX === null || nextY === null) {
      setFormError('Координати мають бути цілими числами.')
      return
    }

    if (
      nextX < -COORDINATE_LIMIT ||
      nextX > COORDINATE_LIMIT ||
      nextY < -COORDINATE_LIMIT ||
      nextY > COORDINATE_LIMIT
    ) {
      setFormError('Координати мають бути в діапазоні від -100 до 100.')
      return
    }

    if (hasCoordinateCollision(points, nextX, nextY)) {
      setFormError('Точка з такими координатами вже існує.')
      return
    }

    setPoints((currentPoints) => [
      ...currentPoints,
      {
        id: nextName,
        x: nextX,
        y: nextY,
      },
    ])
    setName('')
    setXValue('')
    setYValue('')
    setFormError('')
  }

  const startEditing = (point: Point, index: number) => {
    setEditingIndex(index)
    setEditName(point.id)
    setEditXValue(point.x.toString())
    setEditYValue(point.y.toString())
    setFormError('')
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditName('')
    setEditXValue('')
    setEditYValue('')
    setFormError('')
  }

  const savePoint = (event: FormEvent<HTMLFormElement>, index: number) => {
    event.preventDefault()

    const nextName = editName.trim()
    const nextX = parseCoordinate(editXValue)
    const nextY = parseCoordinate(editYValue)

    if (!nextName) {
      setFormError('Вкажи назву точки.')
      return
    }

    if (nextX === null || nextY === null) {
      setFormError('Координати мають бути цілими числами.')
      return
    }

    if (
      nextX < -COORDINATE_LIMIT ||
      nextX > COORDINATE_LIMIT ||
      nextY < -COORDINATE_LIMIT ||
      nextY > COORDINATE_LIMIT
    ) {
      setFormError('Координати мають бути в діапазоні від -100 до 100.')
      return
    }

    if (hasCoordinateCollision(points, nextX, nextY, index)) {
      setFormError('Інша точка вже має такі координати.')
      return
    }

    setPoints((currentPoints) =>
      currentPoints.map((point, currentIndex) =>
        currentIndex === index
          ? {
              ...point,
              id: nextName,
              x: nextX,
              y: nextY,
            }
          : point,
      ),
    )
    setEditingIndex(null)
    setEditName('')
    setEditXValue('')
    setEditYValue('')
    setFormError('')
  }

  return (
    <main className="tokenizer-page">
      <section className="tokenizer-panel coordinate-panel" aria-labelledby="grid-title">
        <div className="intro">
          <p className="eyebrow">Embeddings як простір векторів</p>
          <h1 id="grid-title">Координатна сітка</h1>
          <p>
            Кожна точка на площині є вектором від центру: координати точки
            дорівнюють vector = [x, y].
          </p>
        </div>

        <div className="coordinate-layout">
          <section className="chart-card" aria-label="Координатна площина з векторами">
            <ResponsiveContainer width="100%" height={520}>
              <ScatterChart margin={{ top: 28, right: 32, bottom: 28, left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  domain={[-COORDINATE_LIMIT, COORDINATE_LIMIT]}
                  name="x"
                  tickCount={11}
                  type="number"
                />
                <YAxis
                  dataKey="y"
                  domain={[-COORDINATE_LIMIT, COORDINATE_LIMIT]}
                  name="y"
                  tickCount={11}
                  type="number"
                />
                <ReferenceLine x={0} stroke="#111827" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#111827" strokeWidth={2} />
                {chartPoints.map((point, index) => (
                  <ReferenceLine
                    key={`vector-${point.id}-${index}`}
                    ifOverflow="visible"
                    segment={[
                      { x: 0, y: 0 },
                      { x: point.x, y: point.y },
                    ]}
                    stroke={point.color}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip content={<VectorTooltip />} cursor={{ strokeDasharray: '4 4' }} />
                <Scatter data={chartPoints} name="Вектори">
                  {chartPoints.map((point, index) => (
                    <Cell key={`point-${point.id}-${index}`} fill={point.color} />
                  ))}
                  <LabelList dataKey="label" position="top" />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </section>

          <aside className="learning-card" aria-label="Пояснення">
            <h2>Як це читати</h2>
            <p>
              В embedding-просторі близькі за змістом обʼєкти часто мають схожі
              напрямки або знаходяться поруч. Тут це спрощено до 2D.
            </p>
            <ul>
              <li>vector = координати точки відносно центру.</li>
              <li>length показує, наскільки далеко точка від (0,0).</li>
              <li>distance показує фізичну відстань між двома точками.</li>
              <li>cosine similarity порівнює напрямки векторів.</li>
            </ul>
          </aside>
        </div>

        <form className="point-form" onSubmit={addPoint}>
          <label>
            Назва
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="D"
            />
          </label>
          <label>
            X
            <input
              max={COORDINATE_LIMIT}
              min={-COORDINATE_LIMIT}
              step="1"
              type="number"
              value={xValue}
              onChange={(event) => setXValue(event.target.value)}
              placeholder="4"
            />
          </label>
          <label>
            Y
            <input
              max={COORDINATE_LIMIT}
              min={-COORDINATE_LIMIT}
              step="1"
              type="number"
              value={yValue}
              onChange={(event) => setYValue(event.target.value)}
              placeholder="-2"
            />
          </label>
          <button type="submit">Додати точку</button>
        </form>

        {formError && <p className="error-message">{formError}</p>}

        <section className="result-section">
          <div className="result-header">
            <h2>Список точок</h2>
            <span>{points.length} точок</span>
          </div>
          <div className="point-list">
            {chartPoints.length > 0 ? (
              chartPoints.map((point, index) =>
                editingIndex === index ? (
                  <form
                    className="point-item point-item-editing"
                    key={`edit-${point.id}-${index}`}
                    onSubmit={(event) => savePoint(event, index)}
                  >
                    <span className="point-color" style={{ background: point.color }} />
                    <label>
                      Назва
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                      />
                    </label>
                    <label>
                      X
                      <input
                        max={COORDINATE_LIMIT}
                        min={-COORDINATE_LIMIT}
                        step="1"
                        type="number"
                        value={editXValue}
                        onChange={(event) => setEditXValue(event.target.value)}
                      />
                    </label>
                    <label>
                      Y
                      <input
                        max={COORDINATE_LIMIT}
                        min={-COORDINATE_LIMIT}
                        step="1"
                        type="number"
                        value={editYValue}
                        onChange={(event) => setEditYValue(event.target.value)}
                      />
                    </label>
                    <div className="point-actions">
                      <button type="submit">Зберегти</button>
                      <button type="button" onClick={cancelEditing}>
                        Скасувати
                      </button>
                    </div>
                  </form>
                ) : (
                  <article className="point-item" key={`list-${point.id}-${index}`}>
                    <span className="point-color" style={{ background: point.color }} />
                    <strong>{point.id}</strong>
                    <code>[{formatCoordinate(point.x)}, {formatCoordinate(point.y)}]</code>
                    <span className="point-length">length: {point.length.toFixed(3)}</span>
                    <button type="button" onClick={() => startEditing(point, index)}>
                      Редагувати
                    </button>
                  </article>
                ),
              )
            ) : (
              <p className="empty-result">Додай першу точку, щоб побачити вектор.</p>
            )}
          </div>
        </section>

        <section className="result-section">
          <div className="result-header">
            <h2>Порівняння векторів</h2>
            <span>{vectorPairs.length} пар</span>
          </div>
          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" onClick={() => changeSort('pair')}>
                      Пара <span>{getSortLabel('pair')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => changeSort('vectors')}>
                      vectors <span>{getSortLabel('vectors')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => changeSort('distance')}>
                      distance <span>{getSortLabel('distance')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => changeSort('dotProduct')}>
                      dot product <span>{getSortLabel('dotProduct')}</span>
                    </button>
                  </th>
                  <th>
                    <button type="button" onClick={() => changeSort('cosine')}>
                      cosine similarity <span>{getSortLabel('cosine')}</span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVectorPairs.length > 0 ? (
                  sortedVectorPairs.map((pair) => (
                    <tr key={pair.key}>
                      <td>{pair.pairLabel}</td>
                      <td>{pair.vectorsLabel}</td>
                      <td>{pair.distance.toFixed(3)}</td>
                      <td>{pair.dotProduct.toFixed(3)}</td>
                      <td>{pair.cosine === null ? 'n/a' : pair.cosine.toFixed(3)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>Потрібно щонайменше дві точки для порівняння.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  )
}

export default CoordinateGridPage
