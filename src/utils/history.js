const STORAGE_KEY = 'agriscan-recent-scans'
const MAX_ENTRIES = 8
const THUMB_EDGE = 160

/**
 * Recent scans live entirely in the browser — there are no accounts and nothing
 * is sent anywhere. Thumbnails are downscaled hard before storing because
 * localStorage caps out around 5MB per origin.
 */

export function loadScans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveScan(entry) {
  try {
    const scans = loadScans()
    const next = [entry, ...scans].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    // Quota exceeded or storage blocked — history is a nicety, not critical.
    return loadScans()
  }
}

export function clearScans() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
  return []
}

/** Shrink a preview data URL down to a thumbnail so history stays small. */
export function makeThumbnail(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, THUMB_EDGE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}
