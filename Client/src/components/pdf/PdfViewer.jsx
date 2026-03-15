import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import PdfToolbar from './PdfToolbar'
import PdfSidebar from './PdfSidebar'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PdfViewer({ file, fileName, showSidebar = true }) {
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setTotalPages(numPages)
    setCurrentPage(1)
    setLoading(false)
  }, [])

  const onDocumentLoadError = useCallback((error) => {
    console.error('PDF load error:', error)
    setLoading(false)
  }, [])

  const handlePageChange = useCallback((page) => {
    const clamped = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(clamped)
  }, [totalPages])

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + 0.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s - 0.2, 0.5))
  }, [])

  const handleFitWidth = useCallback(() => {
    setScale(1.2)
  }, [])

  const handleDownload = useCallback(() => {
    if (!file) return
    const url = typeof file === 'string' ? file : URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'document.pdf'
    a.click()
    if (typeof file !== 'string') URL.revokeObjectURL(url)
  }, [file, fileName])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        handlePageChange(currentPage + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        handlePageChange(currentPage - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, handlePageChange])

  const fileSource = typeof file === 'string' ? file : file

  return (
    <div className="flex flex-col h-full bg-surface/30">
      <PdfToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        onPageChange={handlePageChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitWidth={handleFitWidth}
        onDownload={handleDownload}
        fileName={fileName}
      />

      <div className="flex flex-1 min-h-0">
        {/* PDF render area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex justify-center py-6 px-4"
          style={{ background: '#e8eaed' }}
        >
          <Document
            file={fileSource}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              className="shadow-lg rounded-sm"
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <div className="w-[600px] h-[800px] bg-white rounded-sm shadow-lg animate-pulse" />
              }
            />
          </Document>
        </div>

        {/* Sidebar */}
        {showSidebar && <PdfSidebar />}
      </div>
    </div>
  )
}
