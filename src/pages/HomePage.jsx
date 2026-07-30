import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Leaf,
  MonitorSmartphone,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  MonitorPlay,
  Zap,
} from 'lucide-react'
import ImageUpload from '../components/ImageUpload'
import RecentScans from '../components/RecentScans'
import { resizeImage } from '../utils/image'
import { clearScans, loadScans, makeThumbnail, saveScan } from '../utils/history'
import '../styles/home.css'

const STEPS = [
  { icon: Camera, title: 'Snap or upload', body: 'Take a clear photo of the affected leaf, stem, or fruit.' },
  { icon: Sparkles, title: 'AI examines it', body: 'PRASAI compares it against known diseases, pests, and deficiencies.' },
  { icon: Stethoscope, title: 'Act on the plan', body: 'Get a treatment plan, product options, and video guides.' },
]

const FEATURES = [
  { icon: Leaf, title: 'Disease detection', body: 'Identifies blights, rusts, mildews, pests and nutrient deficiencies from a single photo.' },
  { icon: Stethoscope, title: 'Treatment plans', body: 'Specific, actionable steps written for real field conditions — not textbook theory.' },
  { icon: ShoppingBag, title: 'Product matches', body: 'Shortlists fungicides and fertilizers available in India, with shopping links.' },
  { icon: MonitorPlay, title: 'Video guides', body: 'Curated YouTube searches so you can watch the technique before you apply it.' },
  { icon: Send, title: 'Ask the bot', body: 'A farming-only assistant for follow-up questions on soil, sowing, and weather.' },
  { icon: MonitorSmartphone, title: 'Works on any device', body: 'Built mobile-first for use in the field, with a dark mode for low light.' },
]

function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scans, setScans] = useState([])

  useEffect(() => {
    setScans(loadScans())
  }, [])

  const handleAnalyze = async (file, validationError) => {
    if (validationError) {
      setError(validationError)
      return
    }
    if (!file) return

    setError('')
    setLoading(true)

    try {
      const { base64, mimeType, dataUrl } = await resizeImage(file)

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Analysis failed. Please try again.')
        return
      }

      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      sessionStorage.setItem('uploadedImage', dataUrl)

      if (data.is_plant !== false) {
        const thumbnail = await makeThumbnail(dataUrl)
        saveScan({
          id: `${Date.now()}`,
          disease: data.disease || 'Analyzed',
          healthy: /healthy/i.test(data.disease || ''),
          confidence: data.confidence ?? 0,
          thumbnail,
          timestamp: new Date().toISOString(),
          result: data,
        })
      }

      navigate('/analysis')
    } catch (err) {
      setError(err.message || 'Something went wrong analyzing that image.')
    } finally {
      setLoading(false)
    }
  }

  const openScan = (scan) => {
    sessionStorage.setItem('analysisResult', JSON.stringify(scan.result))
    sessionStorage.setItem('uploadedImage', scan.thumbnail || '')
    navigate('/analysis')
  }

  const handleClear = () => setScans(clearScans())

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <Zap size={13} />
              Powered by PRASAI
            </span>
            <h1>
              Diagnose crop disease from a <span className="hl">single photo</span>
            </h1>
            <p>
              AgriScan reads your plant photo, identifies what's wrong, and hands you a treatment plan you can
              act on today — with products and video guides included.
            </p>

            <ul className="hero-points">
              <li>
                <ShieldCheck size={16} />
                No signup required
              </li>
              <li>
                <Zap size={16} />
                Results in seconds
              </li>
              <li>
                <ShoppingBag size={16} />
                India-available products
              </li>
            </ul>
          </div>

          <div className="hero-upload">
            <ImageUpload onAnalyze={handleAnalyze} loading={loading} error={error} />
          </div>
        </div>
      </section>

      <div className="container">
        <RecentScans scans={scans} onOpen={openScan} onClear={handleClear} />
      </div>

      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps from photo to plan</h2>
          </div>

          <ol className="steps">
            {STEPS.map((step, idx) => (
              <li key={step.title} className="step">
                <span className="step-number">{idx + 1}</span>
                <span className="step-icon">
                  <step.icon size={20} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need after the diagnosis</h2>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-icon">
                  <feature.icon size={19} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Spotted something on your crop?</h2>
              <p>Upload a photo and know what you're dealing with in under a minute.</p>
            </div>
            <a className="btn btn-primary" href="#scan">
              <Camera size={17} />
              Scan a photo
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} AgriScan · AI-powered crop health analysis</p>
          <p className="footer-note">
            AI guidance can be wrong — confirm serious outbreaks with your local agricultural officer.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
