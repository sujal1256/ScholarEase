import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RiFilePdfLine, RiArrowLeftLine, RiLoader4Line } from 'react-icons/ri'
import { usePdf } from '../context/PdfContext'

export default function MyDocuments() {
  const navigate = useNavigate()
  const { setFile, setDocumentId, setDocumentSections, setPdfUrl } = usePdf()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [openingDoc, setOpeningDoc] = useState(null)

  useEffect(() => {
    fetchDocuments(currentPage)
  }, [currentPage])

  const fetchDocuments = async (page) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/documents?page=${page}&per_page=6`)
      if (!response.ok) throw new Error('Failed to fetch documents')
      const data = await response.json()
      setDocuments(data.documents)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDocument = async (docId) => {
    setOpeningDoc(docId)
    try {
      const response = await fetch(`/api/v1/documents/${docId}`)
      if (!response.ok) throw new Error('Failed to load document')
      const data = await response.json()
      setDocumentId(data.id)
      setDocumentSections(data.sections)
      setPdfUrl(data.pdf_url)
      setFile(null)
      navigate('/view')
    } catch (err) {
      setError(`Failed to open document: ${err.message}`)
      setOpeningDoc(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-4 border-b border-border">
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
            </svg>
          </span>
          ScholarEase
        </Link>

        <Link
          to="/upload"
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark transition-colors font-semibold"
        >
          + Upload
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-8 md:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-heading font-extrabold text-text-heading text-4xl mb-2">
              My Documents
            </h1>
            <p className="text-sm text-text-muted">
              {pagination?.total_documents || 0} document{pagination?.total_documents !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Documents Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RiFilePdfLine size={32} className="text-primary" />
              </div>
              <p className="text-base font-semibold text-text-heading mb-1">No documents yet</p>
              <p className="text-sm text-text-muted mb-6">
                Upload your first PDF to get started
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-colors"
              >
                Upload Document
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {documents.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleOpenDocument(doc.id)}
                    className="relative p-5 border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group bg-white"
                  >
                    {/* PDF Icon */}
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                      <RiFilePdfLine size={20} className="text-primary" />
                    </div>

                    {/* Title & Metadata */}
                    <h3 className="text-sm font-bold text-text-heading truncate mb-1 group-hover:text-primary transition-colors">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-text-dim mb-3">
                      {doc.page_count} page{doc.page_count !== 1 ? 's' : ''}
                    </p>

                    {/* Date */}
                    <p className="text-xs text-text-dim">
                      {formatDate(doc.created_at)}
                    </p>

                    {/* Loading Indicator */}
                    {openingDoc === doc.id && (
                      <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
                        <RiLoader4Line className="animate-spin text-primary" size={20} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-border">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-border text-text-muted disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-white'
                          : 'border border-border text-text-muted hover:border-primary hover:text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                    disabled={currentPage === pagination.total_pages}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-border text-text-muted disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
