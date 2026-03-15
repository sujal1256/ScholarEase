import {
  RiZoomInLine,
  RiZoomOutLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFullscreenLine,
  RiDownloadLine,
} from 'react-icons/ri'

export default function PdfToolbar({
  currentPage,
  totalPages,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onDownload,
  fileName,
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-border">
      {/* Left — file name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-text-heading truncate max-w-[200px]">
          {fileName || 'Document'}
        </span>
      </div>

      {/* Center — page nav */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <RiArrowLeftSLine size={18} />
        </button>
        <span className="text-sm text-text-muted font-mono min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <RiArrowRightSLine size={18} />
        </button>
      </div>

      {/* Right — zoom & actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          title="Zoom out"
        >
          <RiZoomOutLine size={18} />
        </button>
        <span className="text-xs text-text-dim font-mono min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          title="Zoom in"
        >
          <RiZoomInLine size={18} />
        </button>
        <div className="w-px h-5 bg-border mx-1.5" />
        <button
          onClick={onFitWidth}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          title="Fit width"
        >
          <RiFullscreenLine size={18} />
        </button>
        <button
          onClick={onDownload}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          title="Download"
        >
          <RiDownloadLine size={18} />
        </button>
      </div>
    </div>
  )
}
