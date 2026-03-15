import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  {
    quote: 'ScholarEase cut my literature review time in half. The summaries are surprisingly accurate — I\'ve stopped reading abstracts first.',
    name: 'Ananya Krishnamurthy',
    role: 'PhD Candidate, IIT Delhi',
    initials: 'A',
  },
  {
    quote: 'The collections feature is a game-changer for our lab. Everyone can see what\'s been uploaded, summarised, and what the key findings are.',
    name: 'Dr. Ravi Mehta',
    role: 'Associate Professor, NUS',
    initials: 'R',
  },
  {
    quote: 'I manage 200+ papers for my hedge fund research. ScholarEase is the first tool I open every morning. The semantic search alone is worth it.',
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
      className="bg-white p-8 rounded-2xl border border-border"
    >
      <p className="text-text-base leading-relaxed mb-6 text-sm">
        <span className="text-primary text-2xl leading-none mr-1">&ldquo;</span>
        {t.quote}
      </p>
      <div className="flex items-center gap-3 pt-5 border-t border-border">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0 text-sm"
          style={{ background: 'rgba(74,155,142,0.1)' }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-text-heading">{t.name}</div>
          <div className="text-xs text-text-dim mt-0.5">{t.role}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="bg-transparent">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 py-12">
      <div className="bg-surface/70 rounded-3xl border border-border/50 px-8 md:px-14 py-20">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-sm font-semibold text-primary tracking-wide uppercase mb-3"
          >
            From our researchers
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-text-heading leading-tight"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            What people <span className="text-primary">actually say</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
