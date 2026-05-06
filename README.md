# AgriScan Unified Application

A unified AgriScan application combining plant disease detection and crop analysis powered by Google's Gemini AI.

## Setup

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and add your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `GEMINI_API_KEY` - Google Generative AI API key
- `PORT` - Server port (default: 8000)
- `VITE_API_BASE_URL` - Backend API URL for frontend (optional)

### Running Locally

```bash
npm start
```

The server will start on `http://localhost:8000`

## API Endpoints

- `GET /health` - Health check
- `POST /predict` - Image prediction endpoint (accepts multipart file upload)

## Project Structure

```
public_html/
├── server.cjs         # Express.js server
├── db.cjs             # Database configuration
├── package.json       # Dependencies and scripts
├── data/              # Application data
├── tmp/               # Temporary files
└── dist/              # Built frontend files
```

## Technologies

- **Backend**: Node.js, Express.js
- **Frontend**: React 19, React Router
- **AI**: Google Generative AI (Gemini)
- **File Upload**: Multer
- **CORS**: enabled for cross-origin requests
