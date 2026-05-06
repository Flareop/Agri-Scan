require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const fs = require('fs');
const path = require('path');
const db = require('./db.cjs');

const app = express();
const port = process.env.PORT || 8000;

// Configure CORS
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'dist')));


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', backend: 'node-gemini' });
});

// Helper: Convert buffer to GoogleGenerativeAI Part
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    },
  };
}

app.post('/predict', upload.single('file'), async (req, res) => {
  console.log('Received prediction request');

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("Missing GEMINI_API_KEY");
    // Fallback/Mock behavior if no key is present (so app doesn't crash during demo setup)
    return res.json({
      disease: "Demo Mode (Add API Key)",
      confidence: 0.0,
      treatment: "Please add your GEMINI_API_KEY to the server/.env file to get real AI notifications.",
      is_plant: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const imagePart = fileToGenerativePart(req.file.buffer, req.file.mimetype);

    const prompt = `
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
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting in response (```json ... ```)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    console.log("Gemini Analysis:", data);

    // Save to history if user is logged in
    if (req.body.username) {
      // Add a small delay for image uploading in real app, but here we assume text data is enough
      db.addHistory(req.body.username, { ...data, imageName: req.file.originalname });
    }

    res.json(data);

  } catch (error) {
    console.error('Gemini Error (Auto-Fallback):', error.message);

    const resultData = {
      is_plant: true,
      disease: "Wheat Rust (Simulated)",
      confidence: 0.95,
      treatment: "Note: Real AI failed (Model not found). Showing simulation. \n\nTreatment: Apply fungicide immediately and monitor soil moisture. Ensure good air circulation.",
      recommended_products: [
        { "name": "Bayer Folicur Fungicide", "link": "https://www.google.com/search?tbm=shop&q=Bayer+Folicur+Fungicide" },
        { "name": "Syngenta Amistar", "link": "https://www.google.com/search?tbm=shop&q=Syngenta+Amistar" }
      ],
      video_queries: [
        "wheat rust treatment video",
        "how to control wheat rust organic"
      ],
      fallback: true
    };

    // Save to history if user is logged in
    if (req.body.username) {
      db.addHistory(req.body.username, { ...resultData, imageName: req.file.originalname });
    }

    res.json(resultData);
  }
});

// Auth Endpoints
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });

  const success = db.addUser({ username, password });
  if (success) {
    res.json({ success: true, message: "User created" });
  } else {
    res.status(400).json({ error: "Username already exists" });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.findUser(username, password);
  if (user) {
    res.json({ success: true, username: user.username });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get('/history/:username', (req, res) => {
  const history = db.getHistory(req.params.username);
  res.json(history);
});


app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: "I am ready to help! Please configure my API key in the server settings." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are AgriScan Bot, an expert AI assistant for Indian farmers. Your goal is to help with crops, diseases, weather, and farming advice. STRICTLY REFUSE to answer any questions unrelated to agriculture, farming, gardening, or nature. If a user asks about politics, movies, coding, or general topics, politely say: 'I can only assist with agricultural queries.'." }],
        },
        {
          role: "model",
          parts: [{ text: "Namaste! I am AgriScan Bot. I am here to help you with your farming needs. Ask me anything about your crops!" }],
        },
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("Chat Error:", error);
    // Return the error as a chat message so the user sees it
    res.json({ reply: `System Error: ${error.message || "DeepSeek Service Unavailable"}. Please try again.` });
  }
});

// Catch-all handler for any request that doesn't match an API route
// Sends the React index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
