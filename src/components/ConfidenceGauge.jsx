import '../styles/gauge.css'

const SIZE = 132
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Circular confidence readout. `tone` drives the colour so a low-confidence
 * or diseased result doesn't read as reassuring green.
 */
function ConfidenceGauge({ value = 0, tone = 'brand' }) {
  const pct = Math.max(0, Math.min(1, value))
  const offset = CIRCUMFERENCE * (1 - pct)

  return (
    <div className={`gauge gauge-${tone}`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img"
        aria-label={`${Math.round(pct * 100)} percent confidence`}>
        <circle
          className="gauge-track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          className="gauge-fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <div className="gauge-label">
        <span className="gauge-value">{Math.round(pct * 100)}%</span>
        <span className="gauge-caption">confidence</span>
      </div>
    </div>
  )
}

export default ConfidenceGauge
