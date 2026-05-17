import { useState, useCallback, useRef, useEffect } from 'react'
import { apiUrl } from '../../utils/api'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import PdfToolbar from './PdfToolbar'
import PdfSidebar from './PdfSidebar'
import SelectionTooltip from './SelectionTooltip'
import CommentLayer from './CommentLayer'
import { usePdf } from '../../context/PdfContext'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PdfViewer({ file, fileName, showSidebar = true }) {
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [activeSelection, setActiveSelection] = useState(null) // { text, rect, sectionId }
  const [comments, setComments] = useState([])
  const [renderTick, setRenderTick] = useState(0)
  const containerRef = useRef(null)
  const pageWrapperRef = useRef(null)
  const { documentId, documentSections } = usePdf()

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

  const handleZoomIn = useCallback(() => setScale((s) => Math.min(s + 0.2, 3)), [])
  const handleZoomOut = useCallback(() => setScale((s) => Math.max(s - 0.2, 0.5)), [])
  const handleFitWidth = useCallback(() => setScale(1.2), [])

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

  // Fetch all comments for this document
  useEffect(() => {
    if (!documentId) return
    fetch(apiUrl(`/api/v1/documents/${documentId}/comments`))
      .then((r) => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {})
  }, [documentId])

  // Comment callbacks
  const handleCommentAdded = useCallback((newComment) => {
    setComments((prev) => [...prev, newComment])
  }, [])

  const handleReplyAdded = useCallback((parentId, reply) => {
    setComments((prev) =>
      prev.map((c) => c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c)
    )
  }, [])

  const handlePageRenderSuccess = useCallback(() => {
    setRenderTick((t) => t + 1)
  }, [])

  // Text selection handler
  const handleMouseUp = useCallback(() => {
    // Small delay so the selection is finalised before we read it
    setTimeout(() => {
      const sel = window.getSelection()
      const text = sel?.toString().trim()

      if (!text || text.length < 3 || !documentId) return

      const range = sel.getRangeAt(0)
      const rect  = range.getBoundingClientRect()
      if (!rect.width && !rect.height) return

      // Compute exact character offsets within this page's text layer.
      // These are stored in start_offset / end_offset on the comment so
      // CommentLayer can find the exact spans without fragile text matching.
      let startOffset = null
      let endOffset   = null
      const textLayer = pageWrapperRef.current?.querySelector('.react-pdf__Page__textContent')
      if (textLayer) {
        const spans = Array.from(textLayer.querySelectorAll('span'))
        let pos = 0
        for (const span of spans) {
          const tn  = span.firstChild // text node inside span
          const len = span.textContent.length

          if (startOffset === null) {
            if (tn && range.startContainer === tn) {
              startOffset = pos + range.startOffset
            } else if (span.contains(range.startContainer)) {
              startOffset = pos
            }
          }
          if (endOffset === null) {
            if (tn && range.endContainer === tn) {
              endOffset = pos + range.endOffset
            } else if (span.contains(range.endContainer)) {
              endOffset = pos + len
            }
          }

          pos += len
          if (startOffset !== null && endOffset !== null) break
        }
      }

      const section = documentSections?.find((s) => s.page_number === currentPage)
      setActiveSelection({
        text,
        rect,
        sectionId:   section?.id ?? null,
        startOffset,
        endOffset,
      })
    }, 10)
  }, [documentId, documentSections, currentPage, pageWrapperRef])

  // Close tooltip when clicking outside
  const handleMouseDown = useCallback((e) => {
    // Let the click land first; the tooltip portal listens for Escape separately
    if (!activeSelection) return
    const tooltip = document.getElementById('selection-tooltip-root')
    if (tooltip && tooltip.contains(e.target)) return
    setActiveSelection(null)
  }, [activeSelection])

  const clearSelection = useCallback(() => {
    setActiveSelection(null)
    window.getSelection()?.removeAllRanges()
  }, [])

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
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
        >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <div ref={pageWrapperRef} style={{ position: 'relative' }}>
              <Page
                pageNumber={currentPage}
                scale={scale}
                className="shadow-lg rounded-sm"
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onRenderTextLayerSuccess={handlePageRenderSuccess}
                loading={
                  <div className="w-[600px] h-[800px] bg-white rounded-sm shadow-lg animate-pulse" />
                }
              />
              <CommentLayer
                comments={comments}
                wrapperRef={pageWrapperRef}
                renderTick={renderTick}
                currentPage={currentPage}
                documentSections={documentSections}
              />
            </div>
          </Document>
        </div>

        {showSidebar && (
          <PdfSidebar
            currentPage={currentPage}
            comments={comments}
            onReplyAdded={handleReplyAdded}
            onCommentTextClick={() => setRenderTick((t) => t + 1)}
          />
        )}
      </div>

      {/* Selection tooltip — rendered via portal at document.body */}
      {activeSelection && documentId && (
        <SelectionTooltip
          selectedText={activeSelection.text}
          selectionRect={activeSelection.rect}
          documentId={documentId}
          sectionId={activeSelection.sectionId}
          startOffset={activeSelection.startOffset}
          endOffset={activeSelection.endOffset}
          onClose={clearSelection}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  )
}
