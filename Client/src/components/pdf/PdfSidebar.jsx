import { useState, useEffect, useRef } from 'react'
import {
  RiSparkling2Line,
  RiChat3Line,
  RiTranslate2,
  RiFileList3Line,
  RiVolumeUpLine,
  RiPauseLine,
  RiPlayLine,
  RiReplyLine,
  RiCheckLine,
} from 'react-icons/ri'
import { usePdf } from '../../context/PdfContext'

const tabs = [
  { id: 'ai',       label: 'AI Simplify', icon: RiSparkling2Line },
  { id: 'comments', label: 'Comments',    icon: RiChat3Line      },
  { id: 'translate',label: 'Translate',   icon: RiTranslate2     },
  { id: 'outline',  label: 'Outline',     icon: RiFileList3Line  },
]

// ─── AudioPlayer ─────────────────────────────────────────────────────────────
function AudioPlayer({ src }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  if (error) return <p className="text-xs text-red-500">Audio unavailable.</p>
  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <div>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0) }}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onError={() => setError(true)}
      />
      <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/20">
        <button
          onClick={() => playing ? audioRef.current.pause() : audioRef.current.play()}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          {playing ? <RiPauseLine size={14} /> : <RiPlayLine size={14} />}
        </button>
        <div className="flex-1 min-w-0">
          <div
            className="relative h-1.5 bg-primary/20 rounded-full cursor-pointer"
            onClick={(e) => {
              if (!duration) return
              audioRef.current.currentTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration
            }}
          >
            <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="text-xs text-text-dim flex-shrink-0 tabular-nums">{fmt(progress)} / {fmt(duration)}</span>
      </div>
    </div>
  )
}

// ─── CommentCard ─────────────────────────────────────────────────────────────
function CommentCard({ comment, onReplyAdded, onTextClick }) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isAi = comment.comment_type === 'ai'

  const submitReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/comments/${comment.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim(), comment_type: 'user' }),
      })
      if (res.ok) {
        const reply = await res.json()
        onReplyAdded?.(comment.id, reply)
        setReplyText('')
        setReplyOpen(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`rounded-lg border p-3 space-y-1.5 ${isAi ? 'border-blue-200 bg-blue-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
      {/* Selected text anchor */}
      {comment.selected_text && (
        <button
          onClick={() => onTextClick?.(comment)}
          className={`w-full text-left text-xs font-medium px-2 py-1 rounded cursor-pointer truncate ${isAi ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}
          title={comment.selected_text}
        >
          "{comment.selected_text.length > 50 ? comment.selected_text.slice(0, 50) + '…' : comment.selected_text}"
        </button>
      )}

      {/* Type badge + content */}
      <div className="flex items-start gap-1.5">
        {isAi && (
          <span className="flex-shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">AI</span>
        )}
        <p className="text-xs text-text-heading leading-relaxed">{comment.content}</p>
      </div>

      {/* Timestamp + reply button */}
      <div className="flex items-center justify-between pt-0.5">
        <span className="text-[10px] text-text-dim">
          {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <button
          onClick={() => setReplyOpen(!replyOpen)}
          className="flex items-center gap-1 text-[10px] text-text-dim hover:text-primary transition-colors"
        >
          <RiReplyLine size={11} /> Reply
        </button>
      </div>

      {/* Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-3 pl-2 border-l-2 border-border space-y-2 pt-1">
          {comment.replies.map((r) => (
            <div key={r.id} className="space-y-0.5">
              <p className="text-xs text-text-heading leading-relaxed">{r.content}</p>
              <span className="text-[10px] text-text-dim">
                {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      {replyOpen && (
        <div className="space-y-1.5 pt-1">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
            className="w-full text-xs border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitReply() }}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setReplyOpen(false)} className="text-xs text-text-dim hover:underline">Cancel</button>
            <button
              onClick={submitReply}
              disabled={submitting || !replyText.trim()}
              className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {submitting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RiCheckLine size={11} />}
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CommentsTab ─────────────────────────────────────────────────────────────
function CommentsTab({ documentId, currentSection, comments, onReplyAdded, onTextClick }) {
  const pageComments = currentSection
    ? comments.filter((c) => c.section_id === currentSection.id)
    : comments

  if (!documentId) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <RiChat3Line size={24} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-text-heading mb-1">Comments</p>
        <p className="text-xs text-text-dim">Upload a document to see comments.</p>
      </div>
    )
  }

  if (pageComments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <RiChat3Line size={24} className="text-amber-500" />
        </div>
        <p className="text-sm font-semibold text-text-heading mb-1">No comments yet</p>
        <p className="text-xs text-text-dim leading-relaxed">
          Select text on the page and click <strong>Comment</strong> to annotate it.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-text-dim">
        {pageComments.length} comment{pageComments.length !== 1 ? 's' : ''} on page {currentSection?.page_number}
      </p>
      {pageComments.map((c) => (
        <CommentCard
          key={c.id}
          comment={c}
          onReplyAdded={onReplyAdded}
          onTextClick={onTextClick}
        />
      ))}
    </div>
  )
}

// ─── PdfSidebar ──────────────────────────────────────────────────────────────
export default function PdfSidebar({ currentPage, comments = [], onReplyAdded, onCommentTextClick }) {
  const [activeTab, setActiveTab] = useState('ai')
  const { documentId, documentSections } = usePdf()
  const [currentSection, setCurrentSection] = useState(null)
  const [simplifying, setSimplifying] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [pollInterval, setPollInterval] = useState(null)

  useEffect(() => {
    if (documentSections && currentPage) {
      const section = documentSections.find((s) => s.page_number === currentPage)
      setCurrentSection(section)
      setAiResponse(null)
      setSimplifying(false)
    }
  }, [currentPage, documentSections])

  const fetchAiResponse = async (sectionId) => {
    try {
      const response = await fetch(`/api/v1/sections/${sectionId}/ai_response`)
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'completed') {
          setAiResponse(data)
          setSimplifying(false)
          if (pollInterval) clearInterval(pollInterval)
        }
        return data
      }
    } catch (err) { console.error('Error fetching AI response:', err) }
    return null
  }

  const handleSimplify = async () => {
    if (!currentSection) return
    setSimplifying(true)
    try {
      const response = await fetch(`/api/v1/sections/${currentSection.id}/explain`, { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'completed') {
          setAiResponse(data)
          setSimplifying(false)
        } else if (data.status === 'processing') {
          let pollCount = 0
          const interval = setInterval(async () => {
            pollCount++
            const result = await fetchAiResponse(currentSection.id)
            if (result?.status === 'completed' || pollCount > 60) { clearInterval(interval); setPollInterval(null) }
          }, 2000)
          setPollInterval(interval)
        }
      }
    } catch (err) { console.error('Error triggering simplification:', err); setSimplifying(false) }
  }

  // Badge count for comments tab
  const pageCommentCount = currentSection
    ? comments.filter((c) => c.section_id === currentSection.id).length
    : 0

  return (
    <div className="w-[340px] flex-shrink-0 border-l border-border bg-white flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative ${
                isActive ? 'text-primary border-b-2 border-primary' : 'text-text-dim hover:text-text-muted'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              {tab.id === 'comments' && pageCommentCount > 0 && (
                <span className="absolute top-1.5 right-2 w-4 h-4 bg-amber-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pageCommentCount > 9 ? '9+' : pageCommentCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* ── AI Simplify ── */}
        {activeTab === 'ai' && (
          <div>
            {currentSection ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-text-dim mb-2">Page {currentSection.page_number}</p>
                  <div className="p-3 bg-surface/50 rounded-lg border border-border/50">
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-4">{currentSection.content}</p>
                  </div>
                </div>

                {aiResponse?.output ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                        <RiSparkling2Line size={14} /> Simplified Explanation
                      </p>
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs text-text-heading leading-relaxed">{aiResponse.output}</p>
                      </div>
                    </div>
                    {aiResponse.audio_url ? (
                      <div>
                        <p className="text-xs font-semibold text-text-dim mb-2 flex items-center gap-1">
                          <RiVolumeUpLine size={14} /> Listen
                        </p>
                        <AudioPlayer src={aiResponse.audio_url} />
                      </div>
                    ) : (
                      <p className="text-xs text-text-dim italic">Audio not available for this section.</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleSimplify}
                    disabled={simplifying}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-all ${
                      simplifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    {simplifying ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Simplifying...</>
                    ) : (
                      <><RiSparkling2Line size={16} />Simplify This Page</>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <RiSparkling2Line size={24} className="text-primary" />
                </div>
                <p className="text-sm font-semibold text-text-heading mb-1">AI Simplification</p>
                <p className="text-xs text-text-dim leading-relaxed">Upload a document to get AI-powered plain-language explanations.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Comments ── */}
        {activeTab === 'comments' && (
          <CommentsTab
            documentId={documentId}
            currentSection={currentSection}
            comments={comments}
            onReplyAdded={onReplyAdded}
            onTextClick={onCommentTextClick}
          />
        )}

        {activeTab === 'translate' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><RiTranslate2 size={24} className="text-primary" /></div>
            <p className="text-sm font-semibold text-text-heading mb-1">Translation</p>
            <p className="text-xs text-text-dim leading-relaxed">Translate the document or selected sections into your preferred language.</p>
          </div>
        )}

        {activeTab === 'outline' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><RiFileList3Line size={24} className="text-primary" /></div>
            <p className="text-sm font-semibold text-text-heading mb-1">Document Outline</p>
            <p className="text-xs text-text-dim leading-relaxed">View and navigate the document structure — sections, headings, and figures.</p>
          </div>
        )}
      </div>
    </div>
  )
}
