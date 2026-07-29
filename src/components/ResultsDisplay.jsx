import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  Info,
  PlayCircle,
  ShoppingBag,
  Sprout,
} from 'lucide-react'
import ConfidenceGauge from './ConfidenceGauge'
import '../styles/results.css'

function ResultsDisplay({ result }) {
  if (result.error || result.is_plant === false) {
    return (
      <div className="results">
        <div className="not-plant card">
          <span className="not-plant-icon">
            <AlertTriangle size={26} />
          </span>
          <h2>That doesn't look like a plant</h2>
          <p>{result.error || 'Try a close-up photo of a leaf, stem, or fruit in good light.'}</p>
        </div>
      </div>
    )
  }

  const healthy = /healthy/i.test(result.disease || '')
  const confidence = typeof result.confidence === 'number' ? result.confidence : 0
  const tone = healthy ? 'brand' : confidence >= 0.75 ? 'warning' : 'danger'
  const StatusIcon = healthy ? CheckCircle2 : AlertTriangle

  return (
    <div className="results">
      <section className={`verdict card verdict-${tone}`}>
        <div className="verdict-body">
          <span className={`status-pill status-${tone}`}>
            <StatusIcon size={14} />
            {healthy ? 'Looks healthy' : 'Needs attention'}
          </span>
          <h2>{result.disease || 'Unknown'}</h2>
          <p>
            {healthy
              ? 'No disease detected in this photo. Keep monitoring as conditions change.'
              : 'Identified from your photo. Review the treatment plan below before acting.'}
          </p>
        </div>
        <ConfidenceGauge value={confidence} tone={tone} />
      </section>

      {result.fallback && (
        <p className="notice">
          <Info size={15} />
          Live AI was unavailable, so this is simulated sample data.
        </p>
      )}

      {result.treatment && (
        <section className="card panel">
          <h3>
            <FlaskConical size={17} />
            Treatment plan
          </h3>
          <p className="treatment">{result.treatment}</p>
        </section>
      )}

      {result.recommended_products?.length > 0 && (
        <section className="card panel">
          <h3>
            <ShoppingBag size={17} />
            Recommended products
          </h3>
          <div className="link-grid">
            {result.recommended_products.map((product, idx) => (
              <a
                key={idx}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-card"
              >
                <span className="link-icon">
                  <Sprout size={17} />
                </span>
                <span className="link-text">{product.name}</span>
                <ExternalLink size={15} className="link-arrow" />
              </a>
            ))}
          </div>
          <p className="panel-note">
            Links open a shopping search — always follow the label's dosage instructions.
          </p>
        </section>
      )}

      {result.video_queries?.length > 0 && (
        <section className="card panel">
          <h3>
            <PlayCircle size={17} />
            Watch how it's done
          </h3>
          <div className="link-grid">
            {result.video_queries.map((query, idx) => (
              <a
                key={idx}
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-card"
              >
                <span className="link-icon video">
                  <PlayCircle size={17} />
                </span>
                <span className="link-text">{query}</span>
                <ExternalLink size={15} className="link-arrow" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ResultsDisplay
