import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, ScanLine, Sun, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import '../styles/navbar.css'

function Logo() {
  return (
    <Link to="/" className="brand" aria-label="AgriScan home">
      <span className="brand-mark">
        <ScanLine size={18} strokeWidth={2.5} />
      </span>
      <span className="brand-name">
        Agri<span>Scan</span>
      </span>
    </Link>
  )
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  const links = [
    { label: 'Scan', to: '/#scan' },
    { label: 'How it works', to: '/#how' },
    { label: 'Features', to: '/#features' },
  ]

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <a key={link.to} href={link.to} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          {location.pathname !== '/' && (
            <Link to="/" onClick={closeMenu}>
              New scan
            </Link>
          )}
        </nav>

        <div className="navbar-actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a className="btn btn-primary navbar-cta" href="/#scan">
            Start scanning
          </a>

          <button
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
