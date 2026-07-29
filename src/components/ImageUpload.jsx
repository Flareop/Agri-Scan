import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader2, RefreshCw, ScanLine, X } from 'lucide-react'
import '../styles/imageUpload.css'

const WAIT_MESSAGES = [
  'Reading leaf structure…',
  'Comparing against disease patterns…',
  'Checking for pest damage…',
  'Preparing treatment advice…',
]

function ImageUpload({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [waitIndex, setWaitIndex] = useState(0)
  const inputRef = useRef(null)

  // Rotate the wait copy so a slow model call doesn't feel frozen.
  useEffect(() => {
    if (!loading) {
      setWaitIndex(0)
      return
    }
    const timer = setInterval(() => {
      setWaitIndex((i) => (i + 1) % WAIT_MESSAGES.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [loading])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const acceptFile = (nextFile) => {
    if (!nextFile) return
    if (!nextFile.type.startsWith('image/')) {
      onAnalyze(null, 'Please choose an image file (JPG, PNG, or WebP).')
      return
    }
    if (preview) URL.revokeObjectURL(preview)
    setFile(nextFile)
    setPreview(URL.createObjectURL(nextFile))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (loading) return
    acceptFile(e.dataTransfer.files?.[0])
  }

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="uploader card" id="scan">
      {preview ? (
        <div className="uploader-preview">
          <div className="preview-frame">
            <img src={preview} alt="Selected crop" />
            {loading && (
              <div className="preview-scanning">
                <div className="scan-line" />
              </div>
            )}
            {!loading && (
              <button className="preview-remove" onClick={reset} aria-label="Remove image">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="uploader-actions">
            {loading ? (
              <p className="wait-copy">
                <Loader2 size={16} className="spin" />
                {WAIT_MESSAGES[waitIndex]}
              </p>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => onAnalyze(file)}>
                  <ScanLine size={17} />
                  Analyze crop
                </button>
                <button className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
                  <RefreshCw size={16} />
                  Replace
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <span className="dropzone-icon">
            <ImagePlus size={26} />
          </span>
          <p className="dropzone-title">Drop a crop photo here</p>
          <p className="dropzone-hint">or click to browse — JPG, PNG or WebP</p>
          <span className="dropzone-badge">Never stored on our servers</span>
        </div>
      )}

      {error && <p className="uploader-error">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={(e) => acceptFile(e.target.files?.[0])}
        disabled={loading}
      />
    </div>
  )
}

export default ImageUpload
