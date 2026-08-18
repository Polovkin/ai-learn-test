import './svg-chart.css'

const data = [12, 28, 20, 45, 38, 60, 52, 111, 90, 75, 100, 80, 95, 110, 120]
const width = 590
const height = 300
const left = 70
const bottom = 330
const max = Math.max(...data)
const coordinates = data.map((value, index) => ({
  x: left + (index * width) / (data.length - 1),
  y: bottom - (value / max) * height,
  value,
}))

export default function SvgChartPage() {
  return (
    <section className="svg-chart-page">
      <h1>Native SVG chart</h1>
      <p>A responsive line chart rendered directly with React and SVG.</p>
      <svg viewBox="0 0 720 390" role="img" aria-label="Line chart of fifteen values">
        <defs><linearGradient id="line-gradient"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
        {[0, 30, 60, 90, 120].map((value) => {
          const y = bottom - (value / max) * height
          return <g key={value}><line className="svg-grid-line" x1={left} x2={left + width} y1={y} y2={y} /><text className="svg-axis-label" x="44" y={y + 5}>{value}</text></g>
        })}
        <polyline className="svg-chart-line" points={coordinates.map(({ x, y }) => `${x},${y}`).join(' ')} />
        {coordinates.map(({ x, y, value }, index) => (
          <g className="svg-data-point" tabIndex={0} key={`${value}-${index}`}>
            <title>Значення: {value}</title>
            <circle className="svg-point-halo" cx={x} cy={y} r="16" />
            <circle className="svg-point" cx={x} cy={y} r="7" />
            <text className="svg-value-label" x={x} y={y - 18} textAnchor="middle">{value}</text>
            <text className="svg-axis-label" x={x} y="358" textAnchor="middle">{index + 1}</text>
          </g>
        ))}
      </svg>
    </section>
  )
}
