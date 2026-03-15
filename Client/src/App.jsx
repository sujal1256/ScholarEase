import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PdfProvider } from './context/PdfContext'
import Landing from './pages/Landing'
import Upload from './pages/Upload'
import DocumentView from './pages/DocumentView'

export default function App() {
  return (
    <BrowserRouter>
      <PdfProvider>
        <div
          className="min-h-screen font-sans"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle, #c5c5c5 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/view" element={<DocumentView />} />
          </Routes>
        </div>
      </PdfProvider>
    </BrowserRouter>
  )
}
