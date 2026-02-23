import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { RiCheckLine } from 'react-icons/ri'

const plans = [
  {
    badge: 'For individuals',
    name: 'Free',
    price: '₹0',
    period: 'Forever free',
    featured: false,
    cta: 'Get started free',
    features: [
      { text: '10 paper uploads / month', active: true },
      { text: 'AI summaries & key points', active: true },
      { text: '3 collections', active: true },
      { text: 'Citation export (BibTeX)', active: true },
      { text: 'Ask the Paper (Q&A)', active: false },
      { text: 'Team workspaces', active: false },
      { text: 'Semantic search', active: false },
    ],
  },
  {
    badge: 'Most popular',
    name: 'Scholar',
    price: '₹799',
    period: 'Billed monthly · Save 30% annually',
    featured: true,
    cta: 'Start 14-day trial',
    features: [
      { text: 'Unlimited uploads', active: true },
      { text: 'Advanced AI summaries', active: true },
      { text: 'Unlimited collections', active: true },
      { text: 'All citation formats', active: true },
      { text: 'Ask the Paper (Q&A)', active: true },
      { text: 'Semantic search', active: true },
      { text: 'Team workspaces', active: false },
    ],
  },
  {
    badge: 'For labs & teams',
    name: 'Lab',
    price: '₹2,499',
    period: 'Up to 10 seats · billed monthly',
    featured: false,
    cta: 'Contact us',
    features: [
      { text: 'Everything in Scholar', active: true },
      { text: 'Team workspaces', active: true },
      { text: 'Shared collections', active: true },
      { text: 'Admin dashboard', active: true },
      { text: 'Priority support', active: true },
      { text: 'SSO & advanced security', active: true },
      { text: 'API access', active: true },
    ],
  },
]

function PriceCard({ plan, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative p-12 flex flex-col"
      style={{
        borderRight: index < plans.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        background: plan.featured ? '#0f1016' : 'transparent',
        borderTop: plan.featured ? '2px solid #d4913a' : '2px solid transparent',
      }}
    >
      <div className="font-mono text-[0.62rem] tracking-widest uppercase text-amber mb-4">
        {plan.badge}
      </div>
      <div className="font-cormorant font-bold text-off-white mb-2" style={{ fontSize: '2rem' }}>
        {plan.name}
      </div>
      <div className="font-cormorant font-bold text-off-white leading-none mb-1" style={{ fontSize: '3.2rem' }}>
        {plan.price}
        <span className="font-syne font-normal text-text-muted" style={{ fontSize: '1.2rem' }}>/mo</span>
      </div>
      <div className="font-mono text-[0.62rem] text-text-muted mb-8">{plan.period}</div>

      <hr className="border-white/[0.06] mb-7" />

      <ul className="flex flex-col gap-3 mb-9 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className={`flex items-center gap-2.5 text-[0.84rem] ${f.active ? 'text-text-muted' : 'text-text-dim'}`}>
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: f.active ? '#d4913a' : '#38362f' }}
            />
            {f.text}
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 text-[0.78rem] font-bold tracking-wider uppercase transition-all duration-200 ${
          plan.featured
            ? 'bg-amber text-bg hover:bg-amber-lt'
            : 'text-text-muted hover:text-text-base hover:border-white/25'
        }`}
        style={{
          border: plan.featured ? '1px solid #d4913a' : '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'none',
        }}
        onMouseEnter={e => plan.featured && (e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,145,58,0.25)')}
        onMouseLeave={e => plan.featured && (e.currentTarget.style.boxShadow = 'none')}
      >
        {plan.cta}
      </button>
    </motion.div>
  )
}

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="pricing" className="border-b border-white/[0.06]">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        {/* Head */}
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-amber mb-4"
          >
            Simple pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-cormorant font-semibold text-off-white mb-3 leading-tight"
            style={{ fontSize: 'clamp(2.2rem,3.8vw,3.5rem)', letterSpacing: '-0.02em' }}
          >
            Plans for every{' '}
            <em className="text-amber font-light">kind of researcher</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-[0.95rem] text-text-muted"
          >
            No hidden fees. Cancel anytime. All plans include core AI summarisation.
          </motion.p>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {plans.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
