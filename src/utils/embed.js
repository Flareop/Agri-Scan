/* Embed mode — AgriScan rendered as a tool inside someone else's page.

   Read once, at module load, and never again. That is deliberate: react-router
   navigate('/analysis') drops the query string, so a flag re-read from the URL
   would survive exactly one route change and then silently turn the marketing
   site back on mid-session. Reading it at load makes embed a property of the
   session rather than of the current URL.

   Entry point: https://agriiscan.netlify.app/?embed=1&theme=dark */

const params =
  typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams()

/** True when AgriScan should render as a bare tool: no navbar, no hero, no
    marketing sections, no footer, no floating chat button. */
export const isEmbed = params.get('embed') === '1'

/* Marked on <html> at module load rather than in a component, because the
   rules it drives (see app.css) have to beat a bare `html { min-height }`
   and there is no element above <html> for React to hang an attribute on.
   Doing it here also means it lands before first paint. */
if (isEmbed && typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-embed', '')
}

/** Theme handed down by the host page, so the frame does not sit as a bright
    rectangle in a dark page. Null when not specified — normal theme rules
    then apply. Re-sent by the host on toggle; see ThemeContext. */
const requested = params.get('theme')
export const embedTheme =
  requested === 'dark' || requested === 'light' ? requested : null

/* --------------------------------------------------------------- messaging
   The host cannot measure a cross-origin frame, so the frame reports its own
   height and the host sizes the iframe to match. Without this the host has to
   hard-code a height, which is wrong for every result of a different length.

   targetOrigin is '*' because the frame does not know who embedded it and the
   payload is a single integer. The check that matters is on the host side:
   it must verify event.origin before trusting anything here. */

export const EMBED_MESSAGE = 'agriscan:height'

export function reportHeight() {
  if (!isEmbed || typeof window === 'undefined' || window.parent === window) return

  /* Measure the app element, not documentElement.

     scrollHeight on <html> is floored at the viewport, so an app 359px tall
     in a 720px frame measures 720 — the frame would then refuse to ever
     shrink below whatever height the host first gave it, which is precisely
     the bug auto-height exists to fix. The app element has no such floor. */
  const app = document.querySelector('.app')
  const height = Math.ceil(
    app ? app.getBoundingClientRect().height : document.body.scrollHeight,
  )

  if (!height) return

  window.parent.postMessage({ type: EMBED_MESSAGE, height }, '*')
}
