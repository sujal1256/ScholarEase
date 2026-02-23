import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  RiFilePaper2Line,
  RiStackLine,
  RiFileCopyLine,
  RiSearchLine,
  RiChat3Line,
  RiTeamLine,
} from 'react-icons/ri'

const features = [
  {
    num: '01',
    icon: RiFilePaper2Line,
    title: 'AI Summarisation',
    desc: 'Upload any PDF and get a structured, section-by-section summary in under 30 seconds. Key findings, methods, and conclusions — extracted instantly.',
  },
  {
    num: '02',
    icon: RiStackLine,
    title: 'Smart Collections',
    desc: 'Group papers by topic, project, or course. ScholarEase learns from your collections to surface related research and suggest relevant papers automatically.',
  },
  {
    num: '03',
    icon: RiFileCopyLine,
    title: 'Citation Export',
    desc: 'Automatically parses references and builds a structured bibliography. Export to BibTeX, APA, MLA, or Chicago with a single click.',
  },
  {
    num: '04',
    icon: RiSearchLine,
    title: 'Semantic Search',
    desc: 'Search across your entire library using natural language. Ask questions like "papers about transformer attention in vision" and find exactly what you need.',
  },
  {
    num: '05',
    icon: RiChat3Line,
    title: 'Ask the Paper',
    desc: 'Chat directly with any uploaded paper. Ask clarifying questions, explore specific sections — all answers grounded strictly in the document.',
  },
  {
    num: '06',
    icon: RiTeamLine,
    title: 'Team Workspaces',
    desc: 'Share collections, annotations, and summaries with your research group. Collaborative notes and real-time comments built right in.',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = feature.icon

  const col = index % 3
  const row = Math.floor(index / 3)
  const isLastCol = col === 2
  const isLastRow = row === Math.floor((features.length - 1) / 3)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative p-10 group overflow-hidden transition-colors duration-300 hover:bg-surface"
      style={{
        borderRight: isLastCol ? 'none' : '1px solid rgba(255,255,255,0.06)',
        borderBottom: isLastRow ? 'none' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(212,145,58,0.12), transparent)' }} />

      <div className="font-mono text-[0.6rem] tracking-wider text-text-dim mb-5 relative z-10">{feature.num}</div>
      <div
        className="w-11 h-11 flex items-center justify-center mb-5 relative z-10 transition-all duration-300"
        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <Icon size={20} className="text-amber" />
      </div>
      <h3 className="text-[1.05rem] font-bold text-off-white mb-3 relative z-10" style={{ letterSpacing: '-0.01em' }}>
        {feature.title}
      </h3>
      <p className="text-[0.85rem] leading-relaxed text-text-muted relative z-10">
        {feature.desc}
      </p>
    </motion.div>
  )
}

export default function Features() {
  const headRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="features" className="border-b border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        {/* Header */}
        <div ref={headRef} className="grid md:grid-cols-2 gap-12 items-end mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}>
            <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-amber mb-4">
              What ScholarEase does
            </div>
            <h2 className="font-cormorant font-semibold text-off-white leading-tight" style={{ fontSize: 'clamp(2.2rem,3.8vw,3.5rem)', letterSpacing: '-0.02em' }}>
              Everything your<br /><em className="text-amber font-light">research workflow</em><br />needs
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[0.95rem] leading-relaxed text-text-muted max-w-sm self-end">
            From raw PDF upload to structured insight — ScholarEase handles every step so researchers, students, and analysts can move faster.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {features.map((f, i) => (
            <FeatureCard key={f.num} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
