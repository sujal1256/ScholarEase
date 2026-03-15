import { motion } from 'framer-motion'
import { RiArrowRightLine } from 'react-icons/ri'
import { Link } from 'react-scroll'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: 'easeOut' },
})

/* Floating logo bubbles - white circles with visible shadow */
const floatingLogos = [
  { label: 'MIT',    color: '#A31F34', pos: 'top-[16%] left-[9%]',     anim: 'animate-float1', size: 60, fs: '0.75rem' },
  { label: 'arXiv',  color: '#B31B1B', pos: 'top-[40%] left-[3%]',     anim: 'animate-float3', size: 52, fs: '0.58rem' },
  { label: 'IEEE',   color: '#00629B', pos: 'top-[60%] left-[7%]',     anim: 'animate-float2', size: 56, fs: '0.62rem' },
  { label: 'Sc',     color: '#4a9b8e', pos: 'bottom-[20%] left-[14%]', anim: 'animate-float4', size: 50, fs: '0.85rem' },
  { label: 'NLP',    color: '#7C3AED', pos: 'top-[14%] right-[11%]',   anim: 'animate-float5', size: 52, fs: '0.62rem' },
  { label: 'ACM',    color: '#2563EB', pos: 'top-[38%] right-[3%]',    anim: 'animate-float6', size: 58, fs: '0.65rem' },
  { label: 'PubMed', color: '#059669', pos: 'top-[57%] right-[8%]',    anim: 'animate-float1', size: 54, fs: '0.42rem' },
  { label: 'DOI',    color: '#D97706', pos: 'bottom-[22%] right-[13%]',anim: 'animate-float3', size: 50, fs: '0.7rem'  },
]

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #eef5f3 0%, #ffffff 50%)' }}>

      {/* Floating logo bubbles — white circles with shadow */}
      <div className="absolute inset-0 hidden md:block">
        {floatingLogos.map((logo) => (
          <div
            key={logo.label}
            className={`absolute ${logo.pos} ${logo.anim}`}
            style={{
              width: logo.size,
              height: logo.size,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <span
              style={{
                color: logo.color,
                fontSize: logo.fs,
                fontWeight: 800,
                letterSpacing: '0.01em',
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                lineHeight: 1,
              }}
            >
              {logo.label}
            </span>
          </div>
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* H1 */}
        <motion.h1 {...fadeUp(0.1)}
          className="font-heading font-extrabold text-text-heading leading-[1.1] tracking-tight mb-4"
          style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)' }}>
          How top researchers<br />
          <span className="text-primary">navigate their papers</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p {...fadeUp(0.2)}
          className="text-lg text-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Practical research tools loved by 10,000+ students,<br className="hidden sm:block" />
          academics, and analysts.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.3)} className="flex items-center justify-center flex-wrap gap-4 mb-8">
          <a href="#"
            className="px-7 py-3.5 border-2 border-text-heading text-text-heading text-sm font-semibold rounded-full transition-all duration-200 hover:bg-text-heading hover:text-white">
            Upload a Paper
          </a>
          <Link to="how" smooth duration={500}
            className="flex items-center gap-2 px-7 py-3.5 bg-text-heading text-white text-sm font-semibold rounded-full cursor-pointer transition-all duration-200 hover:bg-gray-800">
            Start Exploring
            <RiArrowRightLine />
          </Link>
        </motion.div>

        {/* Tagline */}
        <motion.p {...fadeUp(0.4)}
          className="text-sm text-text-dim">
          Start free. Go deep when you're ready.
        </motion.p>
      </div>
    </section>
  )
}
