import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  {
    quote: 'ScholarEase cut my literature review time in half. The summaries are surprisingly accurate — I\'ve stopped reading abstracts first and just go straight to the ScholarEase breakdown.',
    name: 'Ananya Krishnamurthy',
    role: 'PhD Candidate, IIT Delhi',
    initials: 'A',
  },
  {
    quote: 'The collections feature is a game-changer for our lab. Everyone can see what\'s been uploaded, summarised, and what the key findings are — instantly, no back-and-forth.',
    name: 'Dr. Ravi Mehta',
    role: 'Associate Professor, NUS',
    initials: 'R',
  },
  {
    quote: 'I manage 200+ papers for my hedge fund research. ScholarEase is the first tool I open every morning. The semantic search alone is worth the entire subscription.',
    name: 'Siddharth Nair',
    role: 'Quantitative Analyst',
    initials: 'S',
  },
]

function TestCard({ t, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-surface p-10"
    >
      <p
        className="font-cormorant italic font-light text-text-base leading-relaxed mb-7"
        style={{ fontSize: '1.2rem' }}
      >
        <span className="text-amber" style={{ fontSize: '2rem', lineHeight: 0, verticalAlign: '-0.4em', marginRight: '2px' }}>&ldquo;</span>
        {t.quote}
      </p>
      <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-cormorant font-bold text-amber flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(212,145,58,0.08), #141620)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '0.85rem',
          }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-[0.82rem] font-bold text-text-base">{t.name}</div>
          <div className="font-mono text-[0.62rem] text-text-muted mt-0.5">{t.role}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="border-b border-white/[0.06] bg-surface">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-amber mb-4"
          >
            From our researchers
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cormorant font-semibold text-off-white leading-tight mb-16"
            style={{ fontSize: 'clamp(2.2rem,3.8vw,3.5rem)', letterSpacing: '-0.02em' }}
          >
            What people{' '}
            <em className="text-amber font-light">actually say</em>
          </motion.h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {testimonials.map((t, i) => (
            <TestCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
