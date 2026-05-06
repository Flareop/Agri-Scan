import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ResultsDisplay from '../components/ResultsDisplay'
import '../styles/analysis.css'

function AnalysisPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [result, setResult] = useState(null)
  const [image, setImage] = useState(null)

  useEffect(() => {
    // Get data from sessionStorage or location state
    const storedResult = sessionStorage.getItem('analysisResult')
    const storedImage = sessionStorage.getItem('uploadedImage')

    if (storedResult) {
      setResult(JSON.parse(storedResult))
    }
    if (storedImage) {
      setImage(storedImage)
    }

    // Also check location state
    if (location.state?.result) {
      setResult(location.state.result)
    }
    if (location.state?.image) {
      setImage(window.URL.createObjectURL(location.state.image))
    }
  }, [location])

  if (!result) {
    return (
      <div className="analysis-container">
        <div className="empty-state">
          <p>No analysis data. Please upload an image first.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Back to Upload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="analysis-container">
      <header className="analysis-header">
        <h1>Analysis Results</h1>
        <button onClick={() => navigate('/')} className="btn-secondary">
          ← New Analysis
        </button>
      </header>

      <main className="analysis-main">
        <div className="analysis-content">
          {image && (
            <div className="image-preview">
              <img src={image} alt="Uploaded plant" />
            </div>
          )}
          <ResultsDisplay result={result} />
        </div>
      </main>
    </div>
  )
}

export default AnalysisPage
