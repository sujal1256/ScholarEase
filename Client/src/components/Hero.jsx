import { motion } from 'framer-motion'
import { RiArrowRightLine } from 'react-icons/ri'
import { Link } from 'react-scroll'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: 'easeOut' },
})

function DocCard({ className, animClass, children }) {
  return (
    <div
      className={`absolute bg-surface2 border border-white/[0.12] p-5 w-60 ${animClass} ${className}`}
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)' }}
    >
      {children}
    </div>
  )
}

function DocLines({ lines }) {
  return (
    <div className="flex flex-col gap-1 mt-3">
      {lines.map((l, i) => (
        <div
          key={i}
          className="h-1 rounded-sm"
          style={{
            width: l.w,
            background: l.amber ? 'rgba(212,145,58,0.3)' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  )
}

function AiPill({ label }) {
  return (
    <div className="inline-flex items-center gap-1.5 mt-2.5 px-2 py-1 font-mono text-[0.56rem] tracking-wider"
      style={{ background: 'rgba(61,128,112,0.12)', border: '1px solid rgba(61,128,112,0.25)', color: '#5daa94' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#5daa94] animate-led" />
      {label}
    </div>
  )
}

function DocHead({ label, title, meta }) {
  return (
    <div className="flex items-start gap-2.5 mb-3">
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center font-mono text-[0.55rem] text-amber"
        style={{ background: 'rgba(212,145,58,0.08)', border: '1px solid rgba(212,145,58,0.2)' }}>
        {label}
      </div>
      <div>
        <div className="text-[0.65rem] font-semibold text-text-base leading-tight">{title}</div>
        <div className="font-mono text-[0.56rem] text-text-muted mt-0.5">{meta}</div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative grid md:grid-cols-[1.1fr_1fr] min-h-[91vh] border-b border-white/[0.06] overflow-hidden">
      {/* Ambient orbs */}
      <div className="animate-orb1 absolute w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(212,145,58,.08),transparent 65%)', top: '-120px', left: '-100px' }} />
      <div className="animate-orb2 absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(61,128,112,.06),transparent 65%)', bottom: '-60px', right: '280px' }} />

      {/* LEFT */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-20 border-b md:border-b-0 md:border-r border-white/[0.06] relative z-10">

        {/* Badge */}
        <motion.div {...fadeUp(0.05)}
          className="inline-flex items-center gap-2 w-fit mb-8 px-3 py-1.5 font-mono text-[0.64rem] tracking-widest uppercase text-amber"
          style={{ border: '1px solid rgba(212,145,58,.25)', background: 'rgba(212,145,58,0.08)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse2" />
          Now with GPT-4o Summarisation
        </motion.div>

        {/* H1 */}
        <motion.h1 {...fadeUp(0.15)}
          className="font-cormorant font-bold text-off-white leading-none tracking-tight mb-2"
          style={{ fontSize: 'clamp(3.2rem, 5.2vw, 5.8rem)', letterSpacing: '-0.02em' }}>
          Read less.<br />
          <em className="text-amber font-light">Understand</em>
          <span className="block" style={{ paddingLeft: '52px' }}>everything.</span>
        </motion.h1>

        {/* Rule */}
        <motion.div {...fadeUp(0.25)} className="w-10 h-px bg-amber my-7" />

        {/* Desc */}
        <motion.p {...fadeUp(0.25)}
          className="text-base leading-relaxed max-w-md mb-11"
          style={{ color: '#7a7670' }}>
          Upload any research paper. ScholarEase extracts insights, generates structured summaries, and organises your library — so you focus on ideas, not pages.
        </motion.p>

        {/* Buttons */}
        <motion.div {...fadeUp(0.35)} className="flex items-center flex-wrap gap-4 mb-14">
          <a href="#"
            className="btn-shimmer bg-amber text-bg text-sm font-bold tracking-wider uppercase px-8 py-3.5 transition-all duration-200 hover:bg-amber-lt hover:-translate-y-0.5"
            style={{ fontSize: '0.82rem' }}>
            Upload a Paper Free
          </a>
          <Link to="how" smooth duration={500}
            className="flex items-center gap-2 text-text-muted text-sm font-semibold tracking-wide cursor-pointer group hover:text-text-base transition-colors">
            How it works
            <RiArrowRightLine className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.45)}
          className="flex gap-9 pt-8 border-t border-white/[0.06]">
          {[
            { n: '14k+', l: 'Papers summarised' },
            { n: '98%', l: 'Accuracy score' },
            { n: '4 min', l: 'Avg. time saved' },
          ].map(({ n, l }) => (
            <div key={l}>
              <div className="font-cormorant font-bold text-off-white leading-none" style={{ fontSize: '2.4rem' }}>{n}</div>
              <div className="font-semibold text-[0.68rem] tracking-widest uppercase text-text-muted mt-1">{l}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT – Visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="hidden md:flex items-center justify-center relative overflow-hidden bg-surface"
      >
        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg" />

        {/* Vertical label */}
        <div className="absolute top-6 right-7 bg-amber text-bg font-mono text-[0.58rem] tracking-widest uppercase px-2 py-1"
          style={{ writingMode: 'vertical-lr' }}>
          Live preview
        </div>

        {/* Floating doc cards */}
        <div className="relative w-[280px] h-[380px]">
          {/* Card 1 */}
          <DocCard animClass="animate-float1" className="top-0 left-0">
            <DocHead label="PDF" title="Attention Is All You Need" meta="Vaswani et al. · 2017" />
            <DocLines lines={[{ w: '100%' }, { w: '90%' }, { w: '80%', amber: true }, { w: '65%' }, { w: '100%' }]} />
            <AiPill label="Summary ready" />
          </DocCard>

          {/* Card 2 */}
          <DocCard animClass="animate-float2" className="top-[70px] left-11" style={{ background: '#111420' }}>
            <DocHead label="PDF" title="Deep Learning for NLP Survey" meta="Young et al. · 2018" />
            <DocLines lines={[{ w: '100%' }, { w: '70%' }, { w: '80%' }]} />
          </DocCard>

          {/* Card 3 */}
          <DocCard animClass="animate-float3" className="top-[155px] left-[18px] !w-56">
            <DocHead label="PDF" title="BERT: Pre-training Transformers" meta="Devlin et al. · 2019" />
            <DocLines lines={[{ w: '100%' }, { w: '50%', amber: true }, { w: '90%' }]} />
            <AiPill label="Processing…" />
          </DocCard>
        </div>
      </motion.div>
    </section>
  )
}
