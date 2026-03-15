import { createContext, useContext, useState, useCallback } from 'react'

const PdfContext = createContext(null)

export function PdfProvider({ children }) {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfName, setPdfName] = useState('')

  const setFile = useCallback((file) => {
    setPdfFile(file)
    setPdfName(file?.name || '')
  }, [])

  const clearFile = useCallback(() => {
    setPdfFile(null)
    setPdfName('')
  }, [])

  return (
    <PdfContext.Provider value={{ pdfFile, pdfName, setFile, clearFile }}>
      {children}
    </PdfContext.Provider>
  )
}

export function usePdf() {
  const ctx = useContext(PdfContext)
  if (!ctx) throw new Error('usePdf must be used within PdfProvider')
  return ctx
}
