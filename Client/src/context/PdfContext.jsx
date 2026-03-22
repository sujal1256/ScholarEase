import { createContext, useContext, useState, useCallback } from 'react'

const PdfContext = createContext(null)

export function PdfProvider({ children }) {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfName, setPdfName] = useState('')
  const [documentId, setDocumentId] = useState(null)
  const [documentSections, setDocumentSections] = useState([])
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const setFile = useCallback((file) => {
    setPdfFile(file)
    setPdfName(file?.name || '')
  }, [])

  const clearFile = useCallback(() => {
    setPdfFile(null)
    setPdfName('')
    setDocumentId(null)
    setDocumentSections([])
  }, [])

  const setDocId = useCallback((id) => {
    setDocumentId(id)
  }, [])

  const setDocSections = useCallback((sections) => {
    setDocumentSections(sections)
  }, [])

  const uploadDocument = useCallback(async (file) => {
    if (!file) {
      setUploadError('No file provided')
      return null
    }

    setUploadLoading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name)

      const response = await fetch('/api/v1/documents', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const data = await response.json()
      setDocumentId(data.id)
      setDocumentSections(data.sections || [])
      return data
    } catch (err) {
      setUploadError(err.message)
      return null
    } finally {
      setUploadLoading(false)
    }
  }, [])

  return (
    <PdfContext.Provider
      value={{
        pdfFile,
        pdfName,
        setFile,
        clearFile,
        documentId,
        documentSections,
        uploadDocument,
        uploadLoading,
        uploadError,
        setDocumentId: setDocId,
        setDocumentSections: setDocSections,
      }}
    >
      {children}
    </PdfContext.Provider>
  )
}

export function usePdf() {
  const ctx = useContext(PdfContext)
  if (!ctx) throw new Error('usePdf must be used within PdfProvider')
  return ctx
}
