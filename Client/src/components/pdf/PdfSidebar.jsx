import { useState } from 'react'
import {
  RiSparkling2Line,
  RiChat3Line,
  RiTranslate2,
  RiFileList3Line,
} from 'react-icons/ri'

const tabs = [
  { id: 'ai', label: 'AI Simplify', icon: RiSparkling2Line },
  { id: 'comments', label: 'Comments', icon: RiChat3Line },
  { id: 'translate', label: 'Translate', icon: RiTranslate2 },
  { id: 'outline', label: 'Outline', icon: RiFileList3Line },
]

export default function PdfSidebar() {
  const [activeTab, setActiveTab] = useState('ai')

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
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <RiSparkling2Line size={24} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text-heading mb-1">AI Simplification</p>
            <p className="text-xs text-text-dim leading-relaxed">
              Select text in the document or click simplify to get an AI-powered plain-language explanation.
            </p>
            <button className="mt-6 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-colors">
              Simplify Document
            </button>
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
