import { useState, useRef, useCallback } from 'react'
import { RiUploadCloud2Line, RiFileTextLine, RiCloseLine } from 'react-icons/ri'

export default function PdfUploader({ onFileSelect }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

  const validateFile = useCallback((file) => {
    if (!file) return 'No file selected.'
    if (file.type !== 'application/pdf') return 'Only PDF files are supported.'
    if (file.size > MAX_SIZE) return 'File size must be under 50 MB.'
    return null
  }, [])

  const handleFile = useCallback((file) => {
    const err = validateFile(file)
    if (err) {
      setError(err)
      setSelectedFile(null)
      return
    }
    setError('')
    setSelectedFile(file)
    onFileSelect?.(file)
  }, [validateFile, onFileSelect])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }, [handleFile])

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }, [handleFile])

  const removeFile = useCallback(() => {
    setSelectedFile(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onFileSelect?.(null)
  }, [onFileSelect])

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-primary bg-primary/5'
            : selectedFile
            ? 'border-primary/40 bg-primary/[0.02]'
            : 'border-border hover:border-primary/40 hover:bg-surface/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <RiFileTextLine size={24} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-heading truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-text-dim mt-0.5">
                {formatSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeFile() }}
              className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-text-dim hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <RiCloseLine size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <RiUploadCloud2Line size={28} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-heading mb-1">
              {dragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
            </p>
            <p className="text-xs text-text-dim">
              or <span className="text-primary font-medium">browse files</span> &middot; PDF only &middot; Max 50 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
      )}
    </div>
  )
}
