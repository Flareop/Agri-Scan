import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Full-stack local dev goes through `netlify dev` (see package.json "dev" script),
// which proxies this Vite server together with the netlify/functions/* endpoints.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
