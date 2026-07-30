import { GoogleGenerativeAI } from '@google/generative-ai'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // stay comfortably under Netlify's 6MB payload cap

/* There is deliberately no simulated result in here.

   This previously returned a hardcoded "Wheat Rust" diagnosis at 0.95
   confidence, with real fungicide names and shopping links, whenever the
   model call threw. The only marker was the word "(Simulated)" inside the
   disease name and a note partway through the treatment text.

   That is the most damaging thing this endpoint could do. Someone photographs
   a sick plant, is told with 95% confidence what is wrong with it, and is sent
   to buy a specific chemical — none of which came from looking at their photo.
   A visible failure costs us a visitor; an invented diagnosis costs them a
   crop. Fail loudly instead: the client already renders `error` from a non-2xx
   response, so an honest error surfaces in the UI on its own. */

const DEMO_RESULT = {
  disease: 'Demo Mode (Add API Key)',
  confidence: 0.0,
  treatment: 'Please add your GEMINI_API_KEY as a Netlify environment variable to get real AI analysis.',
  is_plant: true,
}

function buildPrompt() {
  return `
    Analyze this image strictly as an agricultural expert.
    1. First, determine if the image contains a plant, crop, leaf, or agricultural setting.
    2. If it is NOT a plant (e.g., a person, building, animal, car), return a JSON with { "is_plant": false }.
    3. If it IS a plant, identify any disease, pest, or if it is healthy.
    4. Provide a confidence score (0.0 to 1.0) and treatment advice.
    6. Recommend 2-3 specific commercial fungicides, pesticides, or fertilizers available in India to treat this issue, including a Google Shopping search link for each.
    7. Suggest 2-3 YouTube search queries to find video tutorials on handling this issue.

    Return ONLY valid JSON in this format:
    {
      "is_plant": true,
      "disease": "Name of disease or 'Healthy'",
      "confidence": 0.95,
      "treatment": "Actionable advice...",
      "recommended_products": [
        { "name": "Product Name", "link": "https://www.google.com/search?tbm=shop&q=Product+Name" }
      ],
      "video_queries": [
        "how to treat disease name",
        "organic control for disease name"
      ]
    }
    OR
    {
      "is_plant": false,
      "error": "The image does not appear to be a plant."
    }
  `
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function stripDataUrlPrefix(value) {
  const match = /^data:.*;base64,(.*)$/s.exec(value)
  return match ? match[1] : value
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

  const { image, mimeType } = body || {}
  if (!image || !mimeType) {
    return json({ error: 'No image uploaded' }, 400)
  }

  const base64Data = stripDataUrlPrefix(image)
  const approxBytes = base64Data.length * 0.75
  if (approxBytes > MAX_IMAGE_BYTES) {
    return json({ error: 'Image is too large. Please use a smaller photo (under ~5MB).' }, 413)
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn('Missing GEMINI_API_KEY')
    return json(DEMO_RESULT)
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    /* gemini-3-flash-preview was not a servable id — every call threw and the
       old fallback swallowed it, which is why production quietly returned a
       simulated diagnosis instead of an error. Current stable vision models
       are gemini-3.6-flash / gemini-3.5-flash / gemini-2.5-flash. */
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    }

    const result = await model.generateContent([buildPrompt(), imagePart])
    const response = await result.response
    const text = response.text()

    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const data = JSON.parse(jsonString)

    console.log('PRASAI Analysis:', data)
    return json(data)
  } catch (error) {
    /* Logged in full for us, summarised for the visitor. The model's own error
       text can name internal ids and quota details, so it does not go to the
       client — but "something went wrong" with no signal is why the previous
       failure went unnoticed in production for so long, so the reason is
       coarsely classified here. */
    console.error('PRASAI predict failed:', error?.message, error)

    const message = /JSON|Unexpected token/i.test(error?.message || '')
      ? 'The analysis came back in a form we could not read. Please try that photo again.'
      : 'The analysis service is unavailable right now. Please try again in a moment.'

    return json({ error: message }, 502)
  }
}
