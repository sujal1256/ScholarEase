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
    desc: 'Our model produces a structured summary: abstract, methodology, findings, limitations, and key takeaways.',
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

function Step({ step, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="how-step relative p-8 rounded-2xl bg-white border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300"
    >
      <div
        className="font-heading font-extrabold leading-none mb-4 text-primary/20"
        style={{ fontSize: '3rem' }}
      >
        {step.n}
      </div>
      <h3 className="text-base font-bold text-text-heading mb-2">{step.title}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{step.desc}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  const titleRef = useRef(null)
  const titleInView = useInView(titleRef, { once: true })

  return (
    <section id="how" className="bg-white">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        <div ref={titleRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-primary tracking-wide uppercase mb-3"
          >
            The process
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading font-bold text-text-heading leading-tight"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            From PDF to <span className="text-primary">insight</span> in four steps
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <Step key={step.n} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
