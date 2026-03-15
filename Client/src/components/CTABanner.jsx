import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function CTABanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-transparent relative overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 py-12">
      <div className="bg-surface/70 rounded-3xl border border-border/50 px-8 md:px-14 py-20 relative overflow-hidden">
      {/* Subtle gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(74,155,142,0.06) 0%, transparent 65%)' }}
      />

      <div ref={ref} className="max-w-[900px] mx-auto text-center relative z-10">
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
          className="font-heading font-extrabold text-text-heading leading-tight mb-5"
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
          <Link
            to="/upload"
            className="bg-primary text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5 no-underline"
          >
            Upload Your First Paper
          </Link>
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
      </div>
      </div>
    </section>
  )
}
