import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ImageUpload from '../components/ImageUpload'
import '../styles/home.css'

function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleImageSelected = async (file) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/predict', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      // Store result and navigate to analysis page
      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      sessionStorage.setItem('uploadedImage', window.URL.createObjectURL(file))
      
      navigate('/analysis', { state: { result: data, image: file } })
    } catch (error) {
      console.error('Error:', error)
      alert('Error analyzing image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1>🌾 AgriScan</h1>
          <p>AI-Powered Crop Health Analysis</p>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h2>Detect Plant Diseases & Optimize Crop Health</h2>
            <p>
              Upload an image of your crop or plant leaf to get instant AI-powered analysis,
              disease identification, and treatment recommendations.
            </p>
          </div>
        </section>

        <section className="upload-section">
          <ImageUpload onImageSelected={handleImageSelected} loading={loading} />
        </section>

        <section className="features">
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Disease Detection</h3>
            <p>Advanced AI analyzes plant health and identifies diseases</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💊</span>
            <h3>Treatment Plans</h3>
            <p>Get specific, actionable treatment recommendations</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛒</span>
            <h3>Product Links</h3>
            <p>Direct links to recommended products and solutions</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📺</span>
            <h3>Video Tutorials</h3>
            <p>Find YouTube guides for handling identified issues</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 AgriScan. Powered by Google Gemini AI</p>
      </footer>
    </div>
  )
}

export default HomePage
