import { useState, useEffect } from 'react'
import {
  RiSparkling2Line,
  RiChat3Line,
  RiTranslate2,
  RiFileList3Line,
} from 'react-icons/ri'
import { usePdf } from '../../context/PdfContext'

const tabs = [
  { id: 'ai', label: 'AI Simplify', icon: RiSparkling2Line },
  { id: 'comments', label: 'Comments', icon: RiChat3Line },
  { id: 'translate', label: 'Translate', icon: RiTranslate2 },
  { id: 'outline', label: 'Outline', icon: RiFileList3Line },
]

export default function PdfSidebar({ currentPage }) {
  const [activeTab, setActiveTab] = useState('ai')
  const { documentSections } = usePdf()
  const [currentSection, setCurrentSection] = useState(null)
  const [simplifying, setSimplifying] = useState(false)
  const [aiResponse, setAiResponse] = useState(null)
  const [pollInterval, setPollInterval] = useState(null)

  // Find the section for the current page
  useEffect(() => {
    if (documentSections && currentPage) {
      const section = documentSections.find((s) => s.page_number === currentPage)
      setCurrentSection(section)
      // Reset AI response when page changes
      setAiResponse(null)
      setSimplifying(false)
    }
  }, [currentPage, documentSections])

  // Fetch AI response status
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
    } catch (err) {
      console.error('Error fetching AI response:', err)
    }
    return null
  }

  // Trigger AI simplification
  const handleSimplify = async () => {
    if (!currentSection) return

    setSimplifying(true)

    try {
      const response = await fetch(`/api/v1/sections/${currentSection.id}/explain`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()

        if (data.status === 'completed') {
          setAiResponse(data)
          setSimplifying(false)
        } else if (data.status === 'processing') {
          // Start polling for the result
          let pollCount = 0
          const interval = setInterval(async () => {
            pollCount++
            const result = await fetchAiResponse(currentSection.id)
            if (result?.status === 'completed' || pollCount > 60) {
              // Stop polling after 60 attempts (2 minutes)
              clearInterval(interval)
              setPollInterval(null)
            }
          }, 2000) // Poll every 2 seconds

          setPollInterval(interval)
        }
      }
    } catch (err) {
      console.error('Error triggering simplification:', err)
      setSimplifying(false)
    }
  }

  return (
    <div className="w-[340px] flex-shrink-0 border-l border-border bg-white flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-dim hover:text-text-muted'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'ai' && (
          <div>
            {currentSection ? (
              <div className="space-y-4">
                {/* Original content */}
                <div>
                  <p className="text-xs font-semibold text-text-dim mb-2">Page {currentSection.page_number}</p>
                  <div className="p-3 bg-surface/50 rounded-lg border border-border/50">
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-4">
                      {currentSection.content}
                    </p>
                  </div>
                </div>

                {/* Simplified content or simplify button */}
                {aiResponse?.output ? (
                  <div>
                    <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                      <RiSparkling2Line size={14} />
                      Simplified Explanation
                    </p>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-text-heading leading-relaxed">
                        {aiResponse.output}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSimplify}
                    disabled={simplifying}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-all ${
                      simplifying
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    {simplifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Simplifying...
                      </>
                    ) : (
                      <>
                        <RiSparkling2Line size={16} />
                        Simplify This Page
                      </>
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
                <p className="text-xs text-text-dim leading-relaxed">
                  Upload a document to get AI-powered plain-language explanations.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <RiChat3Line size={24} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-heading mb-1">Comments</p>
            <p className="text-xs text-text-dim leading-relaxed">
              Highlight text and add comments. Collaborate with your team on specific passages.
            </p>
          </div>
        )}

        {activeTab === 'translate' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <RiTranslate2 size={24} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-heading mb-1">Translation</p>
            <p className="text-xs text-text-dim leading-relaxed">
              Translate the document or selected sections into your preferred language.
            </p>
          </div>
        )}

        {activeTab === 'outline' && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <RiFileList3Line size={24} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-heading mb-1">Document Outline</p>
            <p className="text-xs text-text-dim leading-relaxed">
              View and navigate the document structure — sections, headings, and figures.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
