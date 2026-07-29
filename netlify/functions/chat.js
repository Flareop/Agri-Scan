import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PRIMING = [
  {
    role: 'user',
    parts: [
      {
        text: "You are AgriScan Bot, an expert AI assistant for Indian farmers. Your goal is to help with crops, diseases, weather, and farming advice. STRICTLY REFUSE to answer any questions unrelated to agriculture, farming, gardening, or nature. If a user asks about politics, movies, coding, or general topics, politely say: 'I can only assist with agricultural queries.'.",
      },
    ],
  },
  {
    role: 'model',
    parts: [{ text: 'Namaste! I am AgriScan Bot. I am here to help you with your farming needs. Ask me anything about your crops!' }],
  },
]

const MAX_HISTORY_TURNS = 20

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return []
  return history
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'model') && typeof turn.text === 'string')
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }))
}

export default async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { message, history } = body || {}
  if (!message || typeof message !== 'string') {
    return json({ error: 'Message required' }, 400)
  }

  if (!process.env.GEMINI_API_KEY) {
    return json({ reply: 'I am ready to help! Please configure my API key in the site settings.' })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const chat = model.startChat({
      history: [...SYSTEM_PRIMING, ...sanitizeHistory(history)],
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return json({ reply: text })
  } catch (error) {
    console.error('Chat Error:', error)
    return json({ reply: `System Error: ${error.message || 'Service unavailable'}. Please try again.` })
  }
}
