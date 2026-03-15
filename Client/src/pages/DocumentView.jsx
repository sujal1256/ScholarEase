import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { RiArrowLeftLine } from 'react-icons/ri'
import PdfViewer from '../components/pdf/PdfViewer'
import { usePdf } from '../context/PdfContext'

export default function DocumentView() {
  const navigate = useNavigate()
  const { pdfFile, pdfName } = usePdf()
  const [fileUrl, setFileUrl] = useState(null)

  useEffect(() => {
    if (!pdfFile) {
      navigate('/upload')
      return
    }

    const url = URL.createObjectURL(pdfFile)
    setFileUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [pdfFile, navigate])

  if (!fileUrl) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-border">
        <Link
          to="/upload"
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-heading transition-colors"
        >
          <RiArrowLeftLine size={16} />
          Back
        </Link>
        <div className="w-px h-5 bg-border" />
        <Link to="/" className="font-heading text-sm font-bold text-text-heading no-underline flex items-center gap-1.5">
          <span
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 26,
              height: 26,
              background: 'linear-gradient(135deg, #4a9b8e 0%, #3a7d72 100%)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M2 4C2 4 4 3 7 3C10 3 12 4.5 12 4.5C12 4.5 14 3 17 3C20 3 22 4 22 4V18C22 18 20 17 17 17C14 17 12 18.5 12 18.5C12 18.5 10 17 7 17C4 17 2 18 2 18V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              <path d="M12 4.5V18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          ScholarEase
        </Link>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 min-h-0">
        <PdfViewer
          file={fileUrl}
          fileName={pdfName}
          showSidebar={true}
        />
      </div>
    </div>
  )
}
