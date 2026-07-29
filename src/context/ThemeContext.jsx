import { createContext, useContext, useEffect, useState } from 'react'
import { embedTheme, isEmbed } from '../utils/embed'

const ThemeContext = createContext(null)

function getInitialTheme() {
  /* A host page's ?theme= wins over anything stored here. Inside a frame the
     only wrong answer is disagreeing with the page around it — a light panel
     punched into a dark page reads as a broken embed, not as a preference. */
  if (embedTheme) return embedTheme

  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-theme')
    if (attr === 'light' || attr === 'dark') return attr
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  /* The host can toggle its theme long after the frame loaded, so ?theme= is
     only the opening position. Payload is a theme name and nothing else, so
     there is no origin check here — the worst a hostile framer achieves is
     switching the colours of a page it already controls the size of. */
  useEffect(() => {
    if (!isEmbed) return

    const onMessage = (event) => {
      const next = event.data?.type === 'agriscan:theme' ? event.data.theme : null
      if (next === 'dark' || next === 'light') setTheme(next)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    /* Never persist in embed mode. The theme here belongs to whatever page is
       framing us; writing it would let a host silently overwrite the
       preference a visitor set on agriscan.netlify.app itself. */
    if (isEmbed) return

    try {
      localStorage.setItem('agriscan-theme', theme)
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist
    }
  }, [theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
