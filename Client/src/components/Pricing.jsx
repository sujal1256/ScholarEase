import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { RiCheckLine } from 'react-icons/ri'

const plans = [
  {
    badge: 'For individuals',
    name: 'Free',
    price: '\u20b90',
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
    price: '\u20b9799',
    period: 'Billed monthly \u00b7 Save 30% annually',
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
    price: '\u20b92,499',
    period: 'Up to 10 seats \u00b7 billed monthly',
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
      className={`relative p-10 flex flex-col rounded-2xl border transition-shadow duration-300 ${
        plan.featured
          ? 'bg-white border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
          : 'bg-white border-border hover:shadow-md'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
          Most popular
        </div>
      )}

      <div className="text-xs font-semibold text-primary tracking-wide uppercase mb-3">
        {plan.badge}
      </div>
      <div className="font-heading font-bold text-text-heading text-2xl mb-2">
        {plan.name}
      </div>
      <div className="font-heading font-extrabold text-text-heading leading-none mb-1" style={{ fontSize: '2.8rem' }}>
        {plan.price}
        <span className="font-sans font-normal text-text-dim text-lg">/mo</span>
      </div>
      <div className="text-xs text-text-dim mb-7">{plan.period}</div>

      <hr className="border-border mb-6" />

      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.active ? 'text-text-base' : 'text-text-dim'}`}>
            <RiCheckLine
              size={16}
              className={f.active ? 'text-primary flex-shrink-0' : 'text-gray-300 flex-shrink-0'}
            />
            {f.text}
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 text-sm font-semibold rounded-full transition-all duration-200 ${
          plan.featured
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'text-text-heading border-2 border-border hover:border-primary hover:text-primary'
        }`}
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
    <section id="pricing" className="bg-transparent">
      <div className="max-w-[1320px] mx-auto px-4 md:px-10 py-12">
      <div className="bg-surface/70 rounded-3xl border border-border/50 px-8 md:px-14 py-20">
        {/* Head */}
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-sm font-semibold text-primary tracking-wide uppercase mb-3"
          >
            Simple pricing
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-heading font-extrabold text-text-heading mb-3 leading-tight"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            Plans for every <span className="text-primary">kind of researcher</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-text-muted"
          >
            No hidden fees. Cancel anytime. All plans include core AI summarisation.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <PriceCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
