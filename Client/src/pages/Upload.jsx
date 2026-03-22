import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiArrowRightLine, RiArrowLeftLine } from 'react-icons/ri'
import { useState } from 'react'
import PdfUploader from '../components/pdf/PdfUploader'
import { usePdf } from '../context/PdfContext'

export default function Upload() {
  const { pdfFile, setFile, uploadDocument, uploadLoading, uploadError, documentId } = usePdf()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleView = async () => {
    if (!pdfFile || isProcessing) return

    setIsProcessing(true)
    try {
      const result = await uploadDocument(pdfFile)
      if (result) {
        navigate('/view')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-4 border-b border-border bg-white/90 backdrop-blur-md">
        <Link to="/" className="font-heading text-xl font-bold text-text-heading no-underline flex items-center gap-2.5">
          <span
            className="relative flex items-center justify-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #4a9b8e 0%, #3a7d72 100%)',
              boxShadow: '0 2px 10px rgba(74,155,142,0.35)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 4C2 4 4 3 7 3C10 3 12 4.5 12 4.5C12 4.5 14 3 17 3C20 3 22 4 22 4V18C22 18 20 17 17 17C14 17 12 18.5 12 18.5C12 18.5 10 17 7 17C4 17 2 18 2 18V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
              <path d="M12 4.5V18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="17.5" cy="8" r="1.2" fill="white" opacity="0.9" />
              <path d="M17.5 6.2V9.8M15.7 8H19.3" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
            </svg>
          </span>
          <span className="flex items-baseline gap-0.5">
            ScholarEase<sup className="text-primary font-mono font-semibold" style={{ fontSize: '0.55em', verticalAlign: 'super', letterSpacing: '0.08em' }}>AI</sup>
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-heading transition-colors"
        >
          <RiArrowLeftLine size={16} />
          Back to Home
        </Link>
      </nav>

      {/* Upload area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-text-heading text-3xl mb-2">
              Upload a Paper
            </h1>
            <p className="text-sm text-text-muted">
              Upload your research paper and let AI help you understand it.
            </p>
          </div>

          <PdfUploader onFileSelect={setFile} />

          {pdfFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col items-center gap-3"
            >
              <button
                onClick={handleView}
                disabled={isProcessing}
                className={`flex items-center gap-2 px-8 py-3.5 text-white text-sm font-semibold rounded-full transition-all duration-200 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-text-heading hover:bg-gray-800'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Open in Viewer
                    <RiArrowRightLine />
                  </>
                )}
              </button>
              {uploadError && (
                <p className="text-xs text-red-500">{uploadError}</p>
              )}
            </motion.div>
          )}

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'AI Simplify', desc: 'Plain-language explanations' },
              { label: 'Translate', desc: 'Multi-language support' },
              { label: 'Podcast', desc: 'Listen as a conversation' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-surface/70 border border-border/50">
                <p className="text-xs font-semibold text-text-heading">{item.label}</p>
                <p className="text-[0.65rem] text-text-dim mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
