import { motion } from 'framer-motion'
import { RiArrowRightLine } from 'react-icons/ri'
import { Link } from 'react-scroll'
import { Link as RouterLink } from 'react-router-dom'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: 'easeOut' },
})

/* Floating logo bubbles - white circles with visible shadow */
const floatingLogos = [
  { label: 'PDF',       color: '#E53E3E', pos: 'top-[12%] left-[16%]',    anim: 'animate-float1', size: 74, fs: '0.85rem' },
  { label: 'Simplify',  color: '#4a9b8e', pos: 'top-[38%] left-[8%]',     anim: 'animate-float3', size: 78, fs: '0.6rem'  },
  { label: 'Translate', color: '#2563EB', pos: 'top-[62%] left-[18%]',    anim: 'animate-float2', size: 80, fs: '0.58rem' },
  { label: 'Summary',   color: '#7C3AED', pos: 'bottom-[12%] left-[7%]',  anim: 'animate-float4', size: 78, fs: '0.58rem' },
  { label: 'Podcast',   color: '#D97706', pos: 'top-[10%] right-[18%]',   anim: 'animate-float5', size: 78, fs: '0.62rem' },
  { label: 'Explain',   color: '#059669', pos: 'top-[40%] right-[10%]',   anim: 'animate-float6', size: 74, fs: '0.65rem' },
  { label: 'Insight',   color: '#0891B2', pos: 'top-[60%] right-[20%]',   anim: 'animate-float1', size: 72, fs: '0.62rem' },
  { label: 'Audio',     color: '#DC2626', pos: 'bottom-[10%] right-[9%]', anim: 'animate-float3', size: 72, fs: '0.68rem' },
]

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #e0f0ec 0%, #eef5f3 30%, #ffffff 60%)' }}>

      {/* Dotted background pattern (over gradient) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #c5c5c5 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

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
              border: `2px solid ${logo.color}20`,
              boxShadow: `0 6px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 4px ${logo.color}08`,
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
          <span className="text-primary relative">
            <span
              className="absolute inset-0 -inset-x-6 -inset-y-2 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(74,155,142,0.13) 0%, transparent 70%)',
                filter: 'blur(10px)',
              }}
            />
            <span className="relative">navigate their papers</span>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p {...fadeUp(0.2)}
          className="text-lg text-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Practical research tools loved by 10,000+ students,<br className="hidden sm:block" />
          academics, and analysts.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div {...fadeUp(0.3)} className="flex items-center justify-center flex-wrap gap-4 mb-8">
          <RouterLink to="/upload"
            className="px-7 py-3.5 border-2 border-text-heading text-text-heading text-sm font-semibold rounded-full transition-all duration-200 hover:bg-text-heading hover:text-white no-underline">
            Upload a Paper
          </RouterLink>
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
