import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RiArrowLeftLine, RiFilePdfLine, RiArrowRightLine, RiLoader4Line } from 'react-icons/ri'
import { usePdf } from '../context/PdfContext'

export default function MyDocuments() {
  const navigate = useNavigate()
  const { setFile, setDocumentId, setDocumentSections } = usePdf()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [openingDoc, setOpeningDoc] = useState(null)

  // Fetch documents
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
      // Store in context
      setDocumentId(data.id)
      setDocumentSections(data.sections)
      setFile(null) // Clear local file
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

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      processing: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    }
    return styles[status] || styles.pending
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
          Upload New Document
          <RiArrowRightLine size={16} />
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-8 md:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading font-extrabold text-text-heading text-3xl mb-2">
              My Documents
            </h1>
            <p className="text-sm text-text-muted">
              {pagination?.total_documents || 0} document{pagination?.total_documents !== 1 ? 's' : ''} uploaded
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Documents Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <RiFilePdfLine size={32} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-text-heading mb-2">No documents yet</p>
              <p className="text-xs text-text-dim mb-6">
                Upload your first PDF to get started with AI simplification
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-border rounded-lg hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => handleOpenDocument(doc.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <RiFilePdfLine size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-heading truncate group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-text-dim mt-1">
                          {doc.page_count} page{doc.page_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      <p className="text-xs text-text-dim">
                        {formatDate(doc.created_at)}
                      </p>
                    </div>

                    {/* Loading indicator */}
                    {openingDoc === doc.id && (
                      <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                        <RiLoader4Line className="animate-spin text-primary" size={20} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-border text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
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
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-border text-text-muted disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-colors"
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
