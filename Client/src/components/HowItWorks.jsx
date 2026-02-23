import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    n: '01',
    title: 'Upload Your Paper',
    desc: 'Drag-and-drop any PDF, DOI link, or arXiv URL. ScholarEase accepts any format and extracts full text automatically.',
  },
  {
    n: '02',
    title: 'AI Analyses & Summarises',
    desc: 'Our model produces a structured summary: abstract, methodology, findings, limitations, and key takeaways — in seconds.',
  },
  {
    n: '03',
    title: 'Organise & Annotate',
    desc: 'Add the paper to a collection, highlight passages, leave notes, and tag it for instant retrieval later.',
  },
  {
    n: '04',
    title: 'Share & Collaborate',
    desc: 'Invite teammates, share summaries, and export findings in one click. Built for solo researchers and large labs alike.',
  },
]

function Step({ step, index, total }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const isLast = index === total - 1

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="how-step relative p-10 overflow-hidden"
      style={{ borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="font-cormorant font-bold leading-none mb-5"
        style={{ fontSize: '3.2rem', color: 'rgba(255,255,255,0.1)' }}
      >
        {step.n}
      </div>
      <h3 className="text-[0.95rem] font-bold text-off-white mb-2.5">{step.title}</h3>
      <p className="text-[0.83rem] leading-relaxed text-text-muted">{step.desc}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

  return (
    <section id="how" className="border-b border-white/[0.06] bg-surface">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        <div ref={titleRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-amber mb-4"
          >
            The process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-cormorant font-semibold text-off-white leading-tight"
            style={{ fontSize: 'clamp(2.2rem,3.8vw,3.5rem)', letterSpacing: '-0.02em' }}
          >
            From PDF to{' '}
            <em className="text-amber font-light">insight</em>{' '}
            in four steps
          </motion.h2>
        </div>

        {/* Steps grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-16"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {steps.map((step, i) => (
            <Step key={step.n} step={step} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  )
}
