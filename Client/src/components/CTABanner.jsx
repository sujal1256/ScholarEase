import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function CTABanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-white relative overflow-hidden">
      {/* Subtle gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(74,155,142,0.06) 0%, transparent 65%)' }}
      />

      <div ref={ref} className="max-w-[900px] mx-auto px-8 md:px-16 py-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-sm font-semibold text-primary tracking-wide uppercase mb-4"
        >
          Ready to begin?
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-heading font-bold text-text-heading leading-tight mb-5"
          style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)' }}
        >
          Stop drowning in PDFs.<br />
          Start <span className="text-primary">understanding</span> faster.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="text-text-muted leading-relaxed mb-10"
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
            className="bg-primary text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5"
          >
            Upload Your First Paper
          </a>
          <a
            href="#"
            className="text-text-heading text-sm font-semibold px-6 py-3.5 border-2 border-border rounded-full transition-all duration-200 hover:border-primary hover:text-primary"
          >
            See a live demo &rarr;
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-xs text-text-dim mt-5"
        >
          No credit card required &middot; Free tier available &middot; Ready in 30 seconds
        </motion.p>
      </div>
    </section>
  )
}
