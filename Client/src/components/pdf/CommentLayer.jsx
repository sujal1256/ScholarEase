import { useState, useEffect, useCallback, useRef } from 'react'
import { RiChat3Line } from 'react-icons/ri'

const ICON_SIZE   = 20
const POPUP_WIDTH = 272
const MIN_GAP     = 24   // px between stacked icons
const RETRY_MS    = 150  // delay between readiness retries
const MAX_RETRIES = 10   // ~1.5 s total wait

// Escapes regex specials, then collapses whitespace tokens to \s+
// so "foo  bar" matches "foo bar" across PDF word-break spans.
function toPattern(str) {
  return str
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+')
}

export default function CommentLayer({
  comments,
  wrapperRef,
  renderTick,
  currentPage,
  documentSections,
}) {
  const [markers, setMarkers]   = useState([])
  const [activeId, setActiveId] = useState(null)
  const popupRef   = useRef(null)
  const computeRef = useRef(null)   // always points to latest compute fn
  const mountedRef = useRef(true)

  useEffect(() => () => { mountedRef.current = false }, [])

  // Close popup on outside click
  useEffect(() => {
    if (!activeId) return
    const close = (e) => { if (!popupRef.current?.contains(e.target)) setActiveId(null) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [activeId])

  // Reset popup when navigating pages
  useEffect(() => { setActiveId(null) }, [currentPage])

  const compute = useCallback((attempt = 0) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    // ── readiness checks ─────────────────────────────────────────────────────
    const textLayer = wrapper.querySelector('.react-pdf__Page__textContent')
    if (!textLayer) {
      retry(attempt); return
    }

    const allSpans = Array.from(textLayer.querySelectorAll('span'))
      .filter((s) => s.textContent.length > 0)
    if (!allSpans.length) {
      retry(attempt); return
    }

    // Text layer exists in DOM but may not be laid out yet.
    // pdfjs.TextLayer.render() is async — onRenderTextLayerSuccess fires after it
    // resolves, so this guard is mostly a safety net for resize/comment-change triggers.
    const probe = allSpans[0].getBoundingClientRect()
    if (probe.height === 0) {
      retry(attempt); return
    }

    // ── build character-offset map across all spans ───────────────────────
    // react-pdf splits text into many small spans (often one word each).
    // We concatenate all span texts so we can match a phrase that spans
    // multiple elements, then map character offsets back to spans.
    const spanMap = []
    let combined  = ''
    allSpans.forEach((span) => {
      spanMap.push({ span, start: combined.length, end: combined.length + span.textContent.length })
      combined += span.textContent
    })

    // ── geometry helpers ─────────────────────────────────────────────────────
    const wRect    = wrapper.getBoundingClientRect()
    const pageEl   = wrapper.querySelector('.react-pdf__Page')
    const gutterX  = pageEl
      ? pageEl.getBoundingClientRect().right - wRect.left + 10
      : wRect.width + 10

    const pageSection = documentSections?.find((s) => s.page_number === currentPage)

    // ── clear previous highlights ────────────────────────────────────────────
    wrapper.querySelectorAll('[data-cl-hl]').forEach((s) => {
      s.style.backgroundColor = ''
      s.style.borderRadius    = ''
      s.style.cursor          = ''
      s.removeAttribute('data-cl-hl')
    })

    // ── filter root comments that belong to this page ────────────────────
    const pageComments = comments.filter(
      (c) =>
        !c.parent_id &&
        (c.selected_text || (c.start_offset != null && c.end_offset != null)) &&
        (!c.section_id || c.section_id === pageSection?.id),
    )

    const raw = []

    // ── helper: highlight spans + push a marker ───────────────────────────
    function addMarker(id, group, matched) {
      if (!matched.length) return

      matched.forEach((s) => {
        s.style.backgroundColor = 'rgba(251,191,36,0.4)'
        s.style.borderRadius    = '2px'
        s.style.cursor          = 'pointer'
        s.setAttribute('data-cl-hl', '1')
      })

      // Anchor icon to the FIRST matched span (= first line of the selection)
      const anchorRect = matched[0].getBoundingClientRect()
      const top    = anchorRect.top    - wRect.top
      const bottom = anchorRect.bottom - wRect.top
      if (top >= bottom) return // not laid out yet

      raw.push({ id, group, midY: (top + bottom) / 2, gutterX })
    }

    // ── PRIMARY: exact offset-based lookup (user comments) ───────────────
    // Group comments that share the same [start_offset, end_offset] so
    // multiple comments on the same range show a badge instead of stacking.
    const offsetGroups = new Map()
    const fallbackComments = []

    pageComments.forEach((c) => {
      if (c.start_offset != null && c.end_offset != null) {
        const key = `${c.start_offset}:${c.end_offset}`
        if (!offsetGroups.has(key)) offsetGroups.set(key, { s: c.start_offset, e: c.end_offset, group: [] })
        offsetGroups.get(key).group.push(c)
      } else {
        fallbackComments.push(c)
      }
    })

    offsetGroups.forEach(({ s, e, group }) => {
      const matched = spanMap
        .filter(({ start, end }) => start < e && end > s)
        .map(({ span }) => span)
      addMarker(group[0].id, group, matched)
    })

    // ── FALLBACK: text-matching for AI comments (no offsets stored) ───────
    const textGroups = new Map()
    fallbackComments.forEach((c) => {
      if (!c.selected_text) return
      const key = c.selected_text.trim()
      if (!textGroups.has(key)) textGroups.set(key, [])
      textGroups.get(key).push(c)
    })

    textGroups.forEach((group, text) => {
      let match = null
      try { match = new RegExp(toPattern(text), 'i').exec(combined) }
      catch { return }
      if (!match) return

      const matched = spanMap
        .filter(({ start, end }) => start < match.index + match[0].length && end > match.index)
        .map(({ span }) => span)
      addMarker(group[0].id, group, matched)
    })

    // ── sort + prevent icon stacking ─────────────────────────────────────
    raw.sort((a, b) => a.midY - b.midY)
    for (let i = 1; i < raw.length; i++) {
      if (raw[i].midY - raw[i - 1].midY < MIN_GAP) {
        raw[i].midY = raw[i - 1].midY + MIN_GAP
      }
    }

    if (mountedRef.current) setMarkers(raw)
  }, [comments, currentPage, documentSections, wrapperRef])

  // Keep ref in sync so setTimeout retries always call the latest closure
  useEffect(() => { computeRef.current = compute }, [compute])

  function retry(attempt) {
    if (!mountedRef.current) return
    if (attempt < MAX_RETRIES) {
      setTimeout(() => computeRef.current?.(attempt + 1), RETRY_MS)
    }
  }

  // Trigger on every page render and whenever comments change
  useEffect(() => {
    const raf = requestAnimationFrame(() => compute(0))
    return () => cancelAnimationFrame(raf)
  // compute ref identity changes when comments/page change — that's our signal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compute, renderTick])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 20 }}>
      {markers.map((m) => (
        <MarkerIcon
          key={m.id}
          marker={m}
          active={activeId === m.id}
          popupRef={activeId === m.id ? popupRef : null}
          onToggle={() => setActiveId((cur) => (cur === m.id ? null : m.id))}
        />
      ))}
    </div>
  )
}

// ─── sub-components ──────────────────────────────────────────────────────────

function MarkerIcon({ marker, active, popupRef, onToggle }) {
  const count = marker.group.length
  return (
    <div
      style={{
        position: 'absolute',
        top:  marker.midY - ICON_SIZE / 2,
        left: marker.gutterX,
        pointerEvents: 'all',
      }}
    >
      <button
        onClick={onToggle}
        title={`${count} comment${count > 1 ? 's' : ''}`}
        style={{
          width: ICON_SIZE, height: ICON_SIZE,
          borderRadius: '50%',
          background:  active ? '#d97706' : '#f59e0b',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 10,
          boxShadow: active
            ? '0 0 0 3px rgba(245,158,11,0.35), 0 2px 8px rgba(0,0,0,0.28)'
            : '0 1px 4px rgba(0,0,0,0.22)',
          transition: 'background 0.12s, box-shadow 0.12s, transform 0.1s',
          transform: active ? 'scale(1.1)' : 'scale(1)',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.transform = 'scale(1.15)' }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.transform = 'scale(1)' }}
      >
        {count > 1 ? count : <RiChat3Line size={11} />}
      </button>

      {active && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            right: ICON_SIZE + 8,   // opens LEFT toward the page
            top: -4,
            width: POPUP_WIDTH,
            background: 'white',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb',
            zIndex: 100,
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {marker.group.map((c, i) => (
            <CommentCard key={c.id} comment={c} divider={i < marker.group.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentCard({ comment: c, divider }) {
  const isAi = c.comment_type === 'ai'
  return (
    <div style={{ padding: '10px 13px', borderBottom: divider ? '1px solid #f3f4f6' : 'none' }}>
      <span style={{
        display: 'inline-block', fontSize: 10, fontWeight: 600,
        padding: '1px 7px', borderRadius: 10, marginBottom: 6,
        background: isAi ? '#dbeafe' : '#fef3c7',
        color:      isAi ? '#1d4ed8' : '#92400e',
      }}>
        {isAi ? '✦ AI' : '✎ You'}
      </span>

      {c.selected_text && (
        <p style={{
          fontSize: 11, color: '#9ca3af', fontStyle: 'italic',
          margin: '0 0 6px', paddingLeft: 7,
          borderLeft: '2px solid #fcd34d', lineHeight: 1.45,
        }}>
          "{c.selected_text.length > 90 ? c.selected_text.slice(0, 90) + '…' : c.selected_text}"
        </p>
      )}

      <p style={{ fontSize: 12, color: '#1f2937', lineHeight: 1.6, margin: 0 }}>
        {c.content}
      </p>

      {c.replies?.length > 0 && (
        <div style={{ marginTop: 8, paddingLeft: 9, borderLeft: '2px solid #e5e7eb' }}>
          {c.replies.map((r) => (
            <p key={r.id} style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, margin: '4px 0 0' }}>
              ↳ {r.content}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
