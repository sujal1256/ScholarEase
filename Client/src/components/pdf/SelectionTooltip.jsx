import { useState, useEffect, useRef, useCallback } from 'react'
import { apiUrl } from '../../utils/api'
import { createPortal } from 'react-dom'
import { RiSparkling2Line, RiCloseLine, RiChat3Line, RiCheckLine } from 'react-icons/ri'

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 30

export default function SelectionTooltip({
  selectedText,
  selectionRect,
  documentId,
  sectionId,
  startOffset,
  endOffset,
  onClose,
  onCommentAdded,
}) {
  // 'actions' | 'explaining' | 'explained' | 'commenting' | 'commented' | 'error'
  const [phase, setPhase] = useState('actions')
  const [explanation, setExplanation] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const pollRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => () => clearInterval(pollRef.current), [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (phase === 'commenting') textareaRef.current?.focus()
  }, [phase])

  // ── Explain ──────────────────────────────────────────────────────────────
  const handleExplain = useCallback(async () => {
    setPhase('explaining')
    setErrorMsg('')

    try {
      const res = await fetch(apiUrl('/api/v1/selection_explains'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected_text: selectedText, document_id: documentId, section_id: sectionId }),
      })

      if (!res.ok) { setPhase('error'); setErrorMsg('Request failed. Try again.'); return }

      const data = await res.json()
      if (data.status === 'completed') { setExplanation(data.explanation); setPhase('explained'); return }

      let attempts = 0
      pollRef.current = setInterval(async () => {
        attempts++
        try {
          const poll = await fetch(apiUrl(`/api/v1/selection_explains/${data.id}`))
          const result = await poll.json()
          if (result.status === 'completed') {
            clearInterval(pollRef.current)
            setExplanation(result.explanation)
            setPhase('explained')
          } else if (result.status === 'failed' || attempts >= MAX_POLL_ATTEMPTS) {
            clearInterval(pollRef.current)
            setPhase('error')
            setErrorMsg(result.error || 'Timed out. Try again.')
          }
        } catch { /* keep polling on network hiccup */ }
      }, POLL_INTERVAL_MS)
    } catch {
      setPhase('error')
      setErrorMsg('Something went wrong.')
    }
  }, [selectedText, documentId, sectionId])

  // ── Add Comment ──────────────────────────────────────────────────────────
  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch(apiUrl('/api/v1/comments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id:   documentId,
          section_id:    sectionId,
          content:       commentText.trim(),
          selected_text: selectedText,
          comment_type:  'user',
          start_offset:  startOffset,
          end_offset:    endOffset,
        }),
      })

      if (res.ok) {
        const newComment = await res.json()
        setPhase('commented')
        onCommentAdded?.(newComment)
      } else {
        setPhase('error')
        setErrorMsg('Failed to save comment.')
      }
    } catch {
      setPhase('error')
      setErrorMsg('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }, [commentText, documentId, sectionId, selectedText, startOffset, endOffset, onCommentAdded])

  // ── Positioning ───────────────────────────────────────────────────────────
  const tooltipStyle = (() => {
    const W = 320, GAP = 12
    let left = selectionRect.left + selectionRect.width / 2 - W / 2
    left = Math.max(8, Math.min(left, window.innerWidth - W - 8))
    return { position: 'fixed', top: selectionRect.top - GAP, left, width: W, zIndex: 9999 }
  })()

  const truncated = selectedText.length > 60 ? selectedText.slice(0, 60) + '…' : selectedText

  const tooltip = (
    <div style={tooltipStyle} className="bg-white rounded-xl shadow-2xl border border-border">
      {/* Down-arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-2 overflow-hidden pointer-events-none">
        <div className="w-3 h-3 bg-white border-b border-r border-border rotate-45 mx-auto -mt-1.5" />
      </div>

      <div className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-text-dim truncate flex-1">"{truncated}"</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-text-dim hover:text-text-heading hover:bg-surface transition-colors"
          >
            <RiCloseLine size={14} />
          </button>
        </div>

        {/* ── Actions ── */}
        {phase === 'actions' && (
          <div className="flex gap-2">
            <button
              onClick={handleExplain}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              <RiSparkling2Line size={13} /> Explain
            </button>
            <button
              onClick={() => setPhase('commenting')}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-amber-400 text-white text-xs font-semibold rounded-lg hover:bg-amber-500 transition-colors"
            >
              <RiChat3Line size={13} /> Comment
            </button>
          </div>
        )}

        {/* ── Explaining ── */}
        {phase === 'explaining' && (
          <div className="flex items-center gap-2 py-1">
            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-xs text-text-dim">Generating explanation…</p>
          </div>
        )}

        {/* ── Explained ── */}
        {phase === 'explained' && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 mb-1">
              <RiSparkling2Line size={12} className="text-primary" />
              <p className="text-xs font-semibold text-primary">AI Explanation</p>
            </div>
            <p className="text-xs text-text-heading leading-relaxed">{explanation}</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setPhase('commenting')} className="text-xs text-amber-500 hover:underline flex items-center gap-1">
                <RiChat3Line size={11} /> Add comment
              </button>
              <button onClick={() => setPhase('actions')} className="text-xs text-text-dim hover:underline">Back</button>
            </div>
          </div>
        )}

        {/* ── Comment Form ── */}
        {phase === 'commenting' && (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a note about this selection…"
              rows={3}
              className="w-full text-xs border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment()
              }}
            />
            <div className="flex justify-between items-center">
              <button onClick={() => setPhase('actions')} className="text-xs text-text-dim hover:underline">Cancel</button>
              <button
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-400 text-white text-xs font-semibold rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting
                  ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <RiCheckLine size={13} />}
                Save
              </button>
            </div>
          </div>
        )}

        {/* ── Commented ── */}
        {phase === 'commented' && (
          <div className="flex items-center gap-2 py-1 text-green-600">
            <RiCheckLine size={14} />
            <p className="text-xs font-semibold">Comment saved!</p>
          </div>
        )}

        {/* ── Error ── */}
        {phase === 'error' && (
          <div className="space-y-2">
            <p className="text-xs text-red-500">{errorMsg}</p>
            <button onClick={() => setPhase('actions')} className="text-xs text-primary hover:underline">Retry</button>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(tooltip, document.body)
}
