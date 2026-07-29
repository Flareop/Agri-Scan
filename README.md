# AgriScan — AI Crop Health Analysis

Upload a photo of a crop or leaf and get an instant PRASAI diagnosis: what's wrong, how to treat
it, which products to buy in India, and videos showing the technique. Includes a farming-only chat
assistant for follow-up questions.

Built as a static React frontend plus two Netlify serverless functions — no server to manage.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8 |
| Icons / type | lucide-react, Plus Jakarta Sans (self-hosted) |
| Backend | Netlify Functions (v2) |
| AI | PRASAI — runs on Google Gemini (`@google/generative-ai`) |
| Hosting | Netlify (static + functions) |

## Project structure

```
├── index.html                 # Vite entry point
├── netlify.toml               # Build, functions, and redirect config
├── netlify/functions/
│   ├── predict.js             # POST /api/predict — image → diagnosis
│   └── chat.js                # POST /api/chat   — farming Q&A
├── public/favicon.svg
└── src/
    ├── components/            # Navbar, ImageUpload, ResultsDisplay,
    │                          # ChatWidget, RecentScans, ConfidenceGauge, Toast
    ├── context/ThemeContext.jsx
    ├── pages/                 # HomePage, AnalysisPage
    ├── styles/                # One stylesheet per component
    ├── utils/                 # image.js (client resize), history.js (localStorage)
    ├── App.jsx
    ├── main.jsx
    └── index.css              # Design tokens (light + dark), base styles
```

## Local development

Requires Node 20+.

```bash
npm install
```

Create a `.env` file from the template and add your key:

```bash
cp .env.example .env
```

```env
GEMINI_API_KEY=your_google_generative_ai_api_key
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Then start everything (Vite + functions together, via the Netlify CLI):

```bash
npm run dev
```

Open http://localhost:8888.

> Without a `GEMINI_API_KEY` the app still runs end-to-end — the functions return
> demo responses so you can click through the whole flow.

### Other scripts

```bash
npm run build      # production build → dist/
npm run preview    # preview the built frontend (no functions)
npm run dev:vite   # frontend only, no functions
```

## Deploying to Netlify

### 1. Push to GitHub

```bash
git add -A && git commit -m "Modern rebuild" && git push
```

### 2. Create the site

In Netlify: **Add new site → Import an existing project**, pick the repo. `netlify.toml`
already sets the build command (`npm run build`), publish directory (`dist`), and functions
directory, so the defaults will be correct.

### 3. Add the API key

**Site configuration → Environment variables → Add a variable:**

| Key | Value |
| --- | --- |
| `GEMINI_API_KEY` | your key |

This is read only inside the serverless functions. It is deliberately **not** prefixed with
`VITE_`, which would bake it into the public JavaScript bundle.

### 4. Deploy

Trigger a deploy. Subsequent pushes deploy automatically.

To deploy from your machine instead:

```bash
npx netlify deploy --prod
```

## How it works

1. The browser downscales the chosen photo to max 1280px and encodes it as JPEG base64.
   This keeps requests under [Netlify's 6MB function payload limit](https://docs.netlify.com/build/functions/overview/)
   and makes uploads faster on mobile connections.
2. `POST /api/predict` sends the image to PRASAI with an agronomy prompt and returns strict JSON.
3. Results render on `/analysis`; the scan is also saved to `localStorage` as a "Recent scan".
4. `POST /api/chat` powers the assistant widget, which resends the running transcript so the
   conversation keeps context across turns.

## API

### `POST /api/predict`

```json
{ "image": "<base64>", "mimeType": "image/jpeg" }
```

```json
{
  "is_plant": true,
  "disease": "Wheat Leaf Rust",
  "confidence": 0.92,
  "treatment": "Apply a triazole fungicide…",
  "recommended_products": [{ "name": "…", "link": "…" }],
  "video_queries": ["…"]
}
```

Non-plant images return `{ "is_plant": false, "error": "…" }`.

### `POST /api/chat`

```json
{ "message": "How do I treat leaf rust?", "history": [{ "role": "user", "text": "…" }] }
```

```json
{ "reply": "…" }
```

## Privacy

There are no accounts and no database. Photos are sent to PRASAI for analysis and are not
stored by this app. "Recent scans" are kept only in your own browser's `localStorage` and can
be cleared from the home page.

## Notes

- AI guidance can be wrong. Confirm serious outbreaks with a local agricultural officer.
- `npm audit` flags `react-router` for an RSC-mode CSRF issue. This app is a static SPA with
  no RSC or server actions, so it is not affected; older "fixed" versions carry far more
  serious open-redirect/XSS issues that *would* apply here.

## License

MIT
