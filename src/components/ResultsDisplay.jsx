import '../styles/results.css'

function ResultsDisplay({ result }) {
  if (result.error || !result.is_plant) {
    return (
      <div className="results-container error-state">
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <h2>Not a Plant</h2>
          <p>{result.error || 'This image does not appear to be a plant.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <div className={`status-card ${result.disease === 'Healthy' ? 'healthy' : 'diseased'}`}>
        <div className="status-header">
          <h2>{result.disease}</h2>
          <span className="confidence">
            {Math.round(result.confidence * 100)}% Confidence
          </span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${result.confidence * 100}%` }}></div>
        </div>
      </div>

      <div className="treatment-section">
        <h3>Treatment Plan</h3>
        <div className="treatment-text">{result.treatment}</div>
      </div>

      {result.recommended_products && result.recommended_products.length > 0 && (
        <div className="products-section">
          <h3>Recommended Products</h3>
          <div className="products-grid">
            {result.recommended_products.map((product, idx) => (
              <a
                key={idx}
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card"
              >
                <span className="product-icon">🛍️</span>
                <p className="product-name">{product.name}</p>
                <span className="external-link">Shop Now →</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {result.video_queries && result.video_queries.length > 0 && (
        <div className="videos-section">
          <h3>Learning Resources</h3>
          <div className="videos-grid">
            {result.video_queries.map((query, idx) => (
              <a
                key={idx}
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="video-card"
              >
                <span className="video-icon">📺</span>
                <p className="video-title">{query}</p>
                <span className="external-link">Watch on YouTube →</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsDisplay
