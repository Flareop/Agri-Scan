import { useState } from 'react'
import '../styles/imageUpload.css'

function ImageUpload({ onImageSelected, loading }) {
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setPreview(window.URL.createObjectURL(file))
      onImageSelected(file)
    } else {
      alert('Please select a valid image file')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileChange(files[0])
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  return (
    <div className="image-upload">
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <p className="preview-text">Image selected</p>
            {loading && <div className="spinner"></div>}
          </div>
        ) : (
          <div className="upload-prompt">
            <span className="upload-icon">📸</span>
            <p>Drag and drop your image here or click to browse</p>
            <p className="upload-hint">Supported: JPG, PNG, WebP</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="file-input"
          disabled={loading}
        />
      </div>
    </div>
  )
}

export default ImageUpload
