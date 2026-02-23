import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { RiArrowRightLine, RiFolder3Line, RiStarLine, RiBookmarkLine } from 'react-icons/ri'

const collections = [
  { ico: 'ML', name: 'Machine Learning', count: '34 papers', tag: 'Collection', Icon: RiFolder3Line },
  { ico: 'NLP', name: 'NLP & Transformers', count: '18 papers', tag: 'Collection', Icon: RiFolder3Line },
  { ico: 'CV', name: 'Computer Vision', count: '12 papers', tag: 'Collection', Icon: RiFolder3Line },
  { ico: '★', name: 'Must Read', count: '7 papers', tag: 'Starred', Icon: RiStarLine },
  { ico: 'Q1', name: 'Thesis Research Q1', count: '29 papers', tag: 'Project', Icon: RiBookmarkLine },
]

function ShelfRow({ item, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="flex items-center justify-between px-4 py-3.5 cursor-default transition-all duration-200"
      style={{
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
        background: hovered ? '#141620' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 flex items-center justify-center font-mono text-[0.55rem] text-amber flex-shrink-0"
          style={{ background: 'rgba(212,145,58,0.08)', border: '1px solid rgba(212,145,58,0.15)' }}
        >
          {item.ico}
        </div>
        <div>
          <div className="text-[0.82rem] font-semibold text-text-base">{item.name}</div>
          <div className="font-mono text-[0.6rem] text-text-muted mt-0.5">{item.count}</div>
        </div>
      </div>
      <span
        className="font-mono text-[0.58rem] tracking-wider transition-colors duration-200"
        style={{ color: hovered ? '#d4913a' : 'rgba(255,255,255,0.15)' }}
      >
        {item.tag}
      </span>
    </motion.div>
  )
}

export default function Collections() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="collections" className="border-b border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        <div className="grid md:grid-cols-2 gap-20 items-center">

          {/* Left text */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-amber mb-4">
              Library management
            </div>
            <h2
              className="font-cormorant font-semibold text-off-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem,3.8vw,3.5rem)', letterSpacing: '-0.02em' }}
            >
              Your research,<br />
              <em className="text-amber font-light">beautifully</em><br />
              organised
            </h2>
            <div className="w-10 h-px bg-amber mb-6" />
            <p className="text-[0.95rem] leading-relaxed text-text-muted mb-8 max-w-sm">
              Create collections for every project, course, or curiosity. Papers, summaries, notes, and citations — all linked and searchable in one place.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-amber text-[0.8rem] font-semibold tracking-wide group hover:opacity-80 transition-opacity"
            >
              Explore the library
              <RiArrowRightLine className="transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </motion.div>

          {/* Right – shelf visual */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            {/* Badge */}
            <div
              className="absolute -top-4 -right-4 z-10 bg-amber text-bg font-mono text-[0.62rem] tracking-wider uppercase px-3 py-2"
            >
              Your Library
            </div>

            {/* Shelf */}
            <div
              className="bg-surface flex flex-col gap-0.5 p-7"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {collections.map((item, i) => (
                <ShelfRow key={item.name} item={item} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
