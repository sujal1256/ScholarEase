import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { RiArrowRightLine, RiFolder3Line, RiStarLine, RiBookmarkLine } from 'react-icons/ri'

const collections = [
  { ico: 'ML', name: 'Machine Learning', count: '34 papers', tag: 'Collection', Icon: RiFolder3Line },
  { ico: 'NLP', name: 'NLP & Transformers', count: '18 papers', tag: 'Collection', Icon: RiFolder3Line },
  { ico: 'CV', name: 'Computer Vision', count: '12 papers', tag: 'Collection', Icon: RiFolder3Line },
  { ico: '\u2605', name: 'Must Read', count: '7 papers', tag: 'Starred', Icon: RiStarLine },
  { ico: 'Q1', name: 'Thesis Research Q1', count: '29 papers', tag: 'Project', Icon: RiBookmarkLine },
]

function ShelfRow({ item, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="flex items-center justify-between px-4 py-3.5 rounded-lg cursor-default transition-all duration-200"
      style={{
        background: hovered ? '#eef5f3' : 'transparent',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 flex items-center justify-center font-mono text-[0.55rem] text-primary font-bold flex-shrink-0 rounded-lg"
          style={{ background: 'rgba(74,155,142,0.1)' }}
        >
          {item.ico}
        </div>
        <div>
          <div className="text-sm font-semibold text-text-heading">{item.name}</div>
          <div className="font-mono text-xs text-text-dim mt-0.5">{item.count}</div>
        </div>
      </div>
      <span
        className="font-mono text-xs tracking-wider transition-colors duration-200"
        style={{ color: hovered ? '#4a9b8e' : '#d1d5db' }}
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
    <section id="collections" className="bg-transparent">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 py-12">
      <div className="bg-surface/70 rounded-3xl border border-border/50 px-8 md:px-14 py-20">
        <div className="grid md:grid-cols-2 gap-20 items-center">

          {/* Left text */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">
              Library management
            </div>
            <h2
              className="font-heading font-extrabold text-text-heading leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
            >
              Your research,<br />
              <span className="text-primary">beautifully</span> organised
            </h2>
            <p className="text-text-muted mb-8 max-w-sm leading-relaxed">
              Create collections for every project, course, or curiosity. Papers, summaries, notes, and citations — all linked and searchable in one place.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-primary text-sm font-semibold group hover:opacity-80 transition-opacity"
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
            <div className="absolute -top-3 -right-3 z-10 bg-primary text-white font-mono text-xs tracking-wider uppercase px-3 py-1.5 rounded-full">
              Your Library
            </div>

            {/* Shelf */}
            <div className="bg-white rounded-2xl flex flex-col gap-0.5 p-6 border border-border shadow-sm">
              {collections.map((item, i) => (
                <ShelfRow key={item.name} item={item} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </section>
  )
}
