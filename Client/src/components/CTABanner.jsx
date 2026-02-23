import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTABanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="border-b border-white/[0.06] bg-surface relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(212,145,58,0.06) 0%, transparent 65%)' }}
      />

      <div ref={ref} className="max-w-[900px] mx-auto px-8 md:px-16 py-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-amber mb-5"
        >
          Ready to begin?
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-cormorant font-semibold text-off-white leading-tight mb-5"
          style={{ fontSize: 'clamp(2.8rem,4.5vw,4.2rem)', letterSpacing: '-0.02em' }}
        >
          Stop drowning in PDFs.<br />
          Start{' '}
          <em className="text-amber font-light">understanding</em>{' '}
          faster.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-[0.96rem] leading-relaxed text-text-muted mb-10"
        >
          Join 3,200+ researchers, students, and analysts who use ScholarEase to navigate the world's knowledge.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center flex-wrap gap-4"
        >
          <a
            href="#"
            className="btn-shimmer bg-amber text-bg font-bold tracking-wider uppercase px-8 py-3.5 transition-all duration-200 hover:bg-amber-lt hover:-translate-y-0.5"
            style={{ fontSize: '0.82rem' }}
          >
            Upload Your First Paper
          </a>
          <a
            href="#"
            className="text-text-muted text-[0.82rem] font-semibold tracking-wider uppercase px-5 py-3.5 border border-white/[0.12] transition-all duration-200 hover:text-text-base hover:border-white/25"
          >
            See a live demo →
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="font-mono text-[0.62rem] tracking-wider text-text-dim mt-5"
        >
          No credit card required · Free tier available · Ready in 30 seconds
        </motion.p>
      </div>
    </section>
  )
}
