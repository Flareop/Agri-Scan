import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import Navbar from './components/Navbar'
import ChatWidget from './components/ChatWidget'
import { ThemeProvider } from './context/ThemeContext'
import './styles/app.css'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <ChatWidget />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
