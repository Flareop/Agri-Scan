import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImageOff, ScanLine } from 'lucide-react'
import ResultsDisplay from '../components/ResultsDisplay'
import '../styles/analysis.css'

function AnalysisPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [image, setImage] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult')
    const storedImage = sessionStorage.getItem('uploadedImage')

    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult))
      } catch {
        setResult(null)
      }
    }
    if (storedImage) setImage(storedImage)
    setReady(true)
  }, [])

  if (!ready) return null

  if (!result) {
    return (
      <div className="analysis">
        <div className="container">
          <div className="empty-state card">
            <span className="empty-icon">
              <ImageOff size={26} />
            </span>
            <h1>Nothing to show yet</h1>
            <p>Upload a crop photo and we'll walk you through what's wrong and how to treat it.</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              <ScanLine size={17} />
              Start a scan
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="analysis">
      <div className="container">
        <div className="analysis-top">
          <button onClick={() => navigate('/')} className="btn btn-secondary back-btn">
            <ArrowLeft size={16} />
            New scan
          </button>
          <h1>Analysis results</h1>
        </div>

        <div className="analysis-layout">
          <aside className="analysis-aside">
            {image ? (
              <figure className="analysis-image">
                <img src={image} alt="Analyzed crop" />
                <figcaption>Your uploaded photo</figcaption>
              </figure>
            ) : (
              <div className="analysis-image placeholder">
                <ImageOff size={22} />
                <p>Preview unavailable</p>
              </div>
            )}
          </aside>

          <ResultsDisplay result={result} />
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage
