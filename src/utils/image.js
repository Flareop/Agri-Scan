const MAX_EDGE = 1280
const QUALITY = 0.82

/**
 * Downscale an image file in the browser and return it as base64.
 *
 * Netlify Functions cap synchronous payloads at 6MB, and base64 inflates bytes
 * by ~33%, so a raw phone photo can easily blow the limit. Resizing here also
 * makes uploads noticeably faster on rural/mobile connections.
 *
 * @returns {Promise<{ base64: string, mimeType: string, dataUrl: string }>}
 */
export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const { width, height } = img
      const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
      const targetWidth = Math.round(width * scale)
      const targetHeight = Math.round(height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process this image.'))
        return
      }

      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      // Flatten to JPEG: predictable size, and strips any alpha channel that
      // would otherwise render as black once re-encoded.
      const dataUrl = canvas.toDataURL('image/jpeg', QUALITY)
      const base64 = dataUrl.split(',')[1]

      if (!base64) {
        reject(new Error('Could not process this image.'))
        return
      }

      resolve({ base64, mimeType: 'image/jpeg', dataUrl })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('That file could not be read as an image.'))
    }

    img.src = objectUrl
  })
}
