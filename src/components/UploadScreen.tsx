import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import './UploadScreen.css'

interface Props {
  onFileAccepted: (file: File) => void
  loading: boolean
  error: string | null
}

export default function UploadScreen({ onFileAccepted, loading, error }: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0])
      }
    },
    [onFileAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: loading,
  })

  return (
    <div className="upload-screen">
      <div className="upload-header">
        <div className="upload-logo">
          <span className="logo-speed">Speed</span>
          <span className="logo-reader">Reader</span>
        </div>
        <p className="upload-subtitle">Read faster. Comprehend more.</p>
      </div>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'drag-active' : ''} ${loading ? 'loading' : ''}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="upload-loading">
            <div className="spinner" />
            <p>Parsing PDF...</p>
          </div>
        ) : (
          <>
            <div className="dropzone-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7H7z" />
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
              </svg>
            </div>
            <p className="dropzone-title">
              {isDragActive ? 'Drop your PDF here' : 'Drop a PDF here'}
            </p>
            <p className="dropzone-sub">or click to browse files</p>
          </>
        )}
      </div>

      {error && <p className="upload-error">{error}</p>}

      <div className="upload-features">
        <div className="feature">
          <span className="feature-icon">⚡</span>
          <span>Up to 1000+ WPM</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🎯</span>
          <span>Focus point tracking</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📖</span>
          <span>Chapter navigation</span>
        </div>
      </div>
    </div>
  )
}
