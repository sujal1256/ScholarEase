import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { RiMenuLine, RiCloseLine } from 'react-icons/ri'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Features', to: 'features' },
  { label: 'How it Works', to: 'how' },
  { label: 'Collections', to: 'collections' },
  { label: 'Pricing', to: 'pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-8 md:px-16 py-5 border-b border-white/[0.06] transition-all duration-300"
      style={{ background: scrolled ? 'rgba(9,9,13,0.95)' : 'rgba(9,9,13,0.88)', backdropFilter: 'blur(20px)' }}
    >
      {/* Logo */}
      <a href="#" className="font-cormorant text-2xl font-bold text-off-white no-underline">
        ScholarEase<sup className="text-amber font-mono font-normal" style={{ fontSize: '0.5em', verticalAlign: 'super', letterSpacing: '0.1em' }}>AI</sup>
      </a>

      {/* Desktop Nav Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              smooth duration={500}
              className="text-text-muted text-xs font-semibold tracking-widest uppercase cursor-pointer transition-colors duration-200 hover:text-text-base"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3">
        <a
          href="#"
          className="text-text-muted text-xs font-semibold tracking-wider uppercase px-4 py-2 border border-white/[0.12] transition-all duration-200 hover:text-text-base hover:border-white/25"
        >
          Sign In
        </a>
        <a
          href="#"
          className="btn-shimmer bg-amber text-bg text-xs font-bold tracking-wider uppercase px-5 py-2.5 transition-all duration-200 hover:bg-amber-lt hover:-translate-y-0.5"
          style={{ boxShadow: 'none' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,145,58,0.28)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          Start Free
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-text-muted hover:text-text-base transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-surface border-b border-white/[0.06] py-6 px-8 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                smooth
                duration={500}
                className="text-text-muted text-sm font-semibold tracking-wider uppercase cursor-pointer hover:text-text-base transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-white/[0.06] my-2" />
            <a href="#" className="text-text-muted text-sm font-semibold hover:text-text-base transition-colors">Sign In</a>
            <a href="#" className="btn-shimmer bg-amber text-bg text-xs font-bold tracking-wider uppercase px-5 py-2.5 text-center">
              Start Free
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
