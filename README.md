# AgriScan - AI Crop Health Analysis

A full-stack web application combining plant disease detection and crop analysis powered by Google's Gemini AI.

## Features

- 📸 **Image Upload** - Drag-and-drop or browse to upload plant/crop images
- 🔍 **AI Disease Detection** - Google Gemini analyzes images for diseases and health issues
- 💊 **Treatment Recommendations** - Get specific, actionable treatment advice
- 🛒 **Product Links** - Direct links to recommended products available in India
- 📺 **Video Resources** - YouTube search queries for learning tutorials
- 🚀 **Full-Stack Ready** - Frontend (React + Vite) + Backend (Express.js)

## Tech Stack

**Frontend:**
- React 19
- React Router 7
- Vite (build tool)
- CSS3 with responsive design

**Backend:**
- Node.js
- Express.js
- Google Generative AI (Gemini)
- Multer (file uploads)
- CORS enabled

## Project Structure

```
public_html/
├── src/                          # React source code
│   ├── components/               # Reusable components
│   │   ├── ImageUpload.jsx      # File upload component
│   │   └── ResultsDisplay.jsx   # Results display component
│   ├── pages/                    # Page components
│   │   ├── HomePage.jsx         # Main upload page
│   │   └── AnalysisPage.jsx     # Results page
│   ├── styles/                   # CSS files
│   │   ├── home.css
│   │   ├── analysis.css
│   │   ├── imageUpload.css
│   │   ├── results.css
│   │   └── app.css
│   ├── App.jsx                   # App router
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
│   └── vite.svg
├── dist/                         # Build output (generated)
├── data/                         # Application data
├── server.cjs                    # Express backend server
├── db.cjs                        # Database configuration
├── vite.config.js                # Vite configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment template
└── README.md                     # This file
```

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Flareop/Agri-Scan.git
cd Agri-Scan/public_html
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
PORT=8000
GEMINI_API_KEY=your_google_generative_ai_api_key
VITE_API_BASE_URL=http://localhost:8000
```

**Getting a Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it into your `.env` file

### 4. Development

**Start both frontend and backend:**

```bash
npm run dev         # Frontend runs on http://localhost:5173
npm run dev:server  # Backend runs on http://localhost:8000
```

Or use concurrently:

```bash
npm run full-dev    # Both services in parallel
```

**Frontend only:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run start
```

### 5. Production Build

Build the React frontend:

```bash
npm run build
```

This generates optimized files in the `dist/` folder that the Express server serves.

Run production:

```bash
npm start
```

Access the app at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Prediction/Analysis
```
POST /predict
Content-Type: multipart/form-data

File: image (JPG, PNG, WebP)
```

Returns analysis results:
```json
{
  "is_plant": true,
  "disease": "Early Blight",
  "confidence": 0.95,
  "treatment": "Apply fungicide...",
  "recommended_products": [
    {
      "name": "Product Name",
      "link": "https://www.google.com/search?tbm=shop&q=Product+Name"
    }
  ],
  "video_queries": [
    "how to treat early blight tomato"
  ]
}
```

## Development Workflow

### Making Frontend Changes

1. Edit files in `src/` directory
2. Vite auto-refreshes on save
3. Check browser at `http://localhost:5173`

### Building for Deployment

```bash
npm run build
npm start
```

The server automatically serves the optimized `dist/` folder.

## Deployment

### Hostinger/Traditional Hosting

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Upload to server:
   - `dist/` folder content to public_html
   - `server.cjs`, `db.cjs`, `package.json`, `data/` folder
   - `.env` (with proper credentials)

3. Install and run:
   ```bash
   npm install
   npm start
   ```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
```

## Troubleshooting

**"GEMINI_API_KEY not found"**
- Make sure `.env` file exists in `public_html/` root
- Verify your API key is correct

**"Port 8000 already in use"**
- Change PORT in `.env`
- Or kill the process: `lsof -ti:8000 | xargs kill`

**Build errors**
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again

## Contributing

Feel free to fork, modify, and submit pull requests!

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, open an issue on [GitHub](https://github.com/Flareop/Agri-Scan/issues)
