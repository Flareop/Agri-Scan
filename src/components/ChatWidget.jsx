import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Sprout, X } from 'lucide-react'
import '../styles/chat.css'

const GREETING = {
  role: 'model',
  text: 'Namaste! I am AgriScan Bot. Ask me anything about your crops, soil, pests, or the weather.',
}

const SUGGESTIONS = [
  'How do I treat leaf rust on wheat?',
  'Best time to sow mustard?',
  'Organic pest control for tomatoes',
]

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, sending, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    // The greeting is client-side flavour, not real model output — exclude it
    // so the function's own priming stays the first turn.
    const history = messages.filter((m) => m !== GREETING).map((m) => ({ role: m.role, text: m.text }))

    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      })
      const data = await res.json()
      setMessages((current) => [
        ...current,
        { role: 'model', text: data.reply || 'Sorry, I could not answer that. Please try again.' },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'model', text: 'I could not reach the server. Please check your connection and try again.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(input)
  }

  return (
    <>
      <button
        className={`chat-fab ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open AgriScan assistant"
      >
        <MessageCircle size={22} />
        <span>Ask AgriScan</span>
      </button>

      <div className={`chat-panel ${open ? 'open' : ''}`} role="dialog" aria-label="AgriScan assistant">
        <header className="chat-header">
          <span className="chat-avatar">
            <Sprout size={17} />
          </span>
          <div className="chat-title">
            <strong>AgriScan Bot</strong>
            <small>Farming questions only</small>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close assistant">
            <X size={18} />
          </button>
        </header>

        <div className="chat-log" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg chat-msg-${msg.role}`}>
              {msg.text}
            </div>
          ))}

          {sending && (
            <div className="chat-msg chat-msg-model chat-typing" aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </div>
          )}

          {messages.length === 1 && !sending && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your crop…"
            aria-label="Message"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()} aria-label="Send message">
            <Send size={17} />
          </button>
        </form>
      </div>
    </>
  )
}

export default ChatWidget
