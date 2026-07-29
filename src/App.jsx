import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import Navbar from './components/Navbar'
import ChatWidget from './components/ChatWidget'
import { ThemeProvider } from './context/ThemeContext'
import { isEmbed, reportHeight } from './utils/embed'
import './styles/app.css'

/* In embed mode the navbar and the floating chat button both go.

   The navbar is what makes a frame read as a second website rather than as a
   tool — it carries a logo and its own section links, which compete with the
   host page's nav a few hundred pixels above it. The chat button is a fixed
   overlay, so inside a short frame it lands on top of the dropzone itself. */

function useEmbedHeight() {
  useEffect(() => {
    if (!isEmbed) return

    reportHeight()

    /* Height changes on far more than window resize here — picking an image,
       a result arriving, an error line appearing. Observing the element is
       the only thing that catches all of them. */
    const observer = new ResizeObserver(reportHeight)
    observer.observe(document.documentElement)
    window.addEventListener('load', reportHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('load', reportHeight)
    }
  }, [])
}

function App() {
  useEmbedHeight()

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app" data-embed={isEmbed || undefined}>
          {!isEmbed && <Navbar />}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          {!isEmbed && <ChatWidget />}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
