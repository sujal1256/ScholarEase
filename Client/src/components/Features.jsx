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
    icon: RiFilePaper2Line,
    title: 'AI Summarisation',
    desc: 'Upload any PDF and get a structured, section-by-section summary in under 30 seconds.',
  },
  {
    icon: RiStackLine,
    title: 'Smart Collections',
    desc: 'Group papers by topic, project, or course. ScholarEase surfaces related research automatically.',
  },
  {
    icon: RiFileCopyLine,
    title: 'Citation Export',
    desc: 'Automatically parses references and builds bibliographies. Export to BibTeX, APA, MLA, or Chicago.',
  },
  {
    icon: RiSearchLine,
    title: 'Semantic Search',
    desc: 'Search your entire library using natural language. Find exactly the paper you need.',
  },
  {
    icon: RiChat3Line,
    title: 'Ask the Paper',
    desc: 'Chat directly with any uploaded paper. Answers grounded strictly in the document.',
  },
  {
    icon: RiTeamLine,
    title: 'Team Workspaces',
    desc: 'Share collections, annotations, and summaries with your research group.',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="p-8 rounded-2xl bg-white border border-border group hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-5 bg-primary/10">
        <Icon size={22} className="text-primary" />
      </div>
      <h3 className="text-base font-bold text-text-heading mb-2">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-text-muted">
        {feature.desc}
      </p>
    </motion.div>
  )
}

export default function Features() {
  const headRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section id="features" className="bg-transparent">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 py-12">
      <div className="bg-surface/70 rounded-3xl border border-border/50 px-8 md:px-14 py-20">
        {/* Header */}
        <div ref={headRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-sm font-semibold text-primary tracking-wide uppercase mb-3"
          >
            What ScholarEase does
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-extrabold text-text-heading leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            Everything your research workflow needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-muted max-w-lg mx-auto"
          >
            From raw PDF upload to structured insight — ScholarEase handles every step so you can move faster.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
