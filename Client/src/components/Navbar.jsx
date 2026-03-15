import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { RiMenuLine, RiCloseLine } from 'react-icons/ri'
import { motion, AnimatePresence } from 'framer-motion'
import SignInModal from './SignInModal'

const navLinks = [
  { label: 'Features', to: 'features' },
  { label: 'How it Works', to: 'how' },
  { label: 'Collections', to: 'collections' },
  { label: 'Pricing', to: 'pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-8 md:px-16 py-4 transition-all duration-300 ${
        scrolled ? 'shadow-sm' : ''
      }`}
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {/* Logo */}
      <a href="#" className="font-heading text-xl font-bold text-text-heading no-underline flex items-center gap-1">
        ScholarEase<sup className="text-primary font-mono font-normal" style={{ fontSize: '0.5em', verticalAlign: 'super', letterSpacing: '0.1em' }}>AI</sup>
      </a>

      {/* Desktop Nav Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        {navLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              smooth duration={500}
              className="text-text-muted text-sm font-medium cursor-pointer transition-colors duration-200 hover:text-text-heading"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop CTA */}
      <div className="hidden md:flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSignInOpen(true)}
          className="text-text-muted text-sm font-medium px-4 py-2 transition-all duration-200 hover:text-text-heading"
        >
          Sign Up / In
        </button>
        <a
          href="#"
          className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5"
        >
          Get Started
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-text-muted hover:text-text-heading transition-colors"
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
            className="absolute top-full left-0 right-0 bg-white border-b border-border py-6 px-8 flex flex-col gap-4 md:hidden shadow-lg"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                smooth
                duration={500}
                className="text-text-muted text-sm font-medium cursor-pointer hover:text-text-heading transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border my-2" />
            <button
              type="button"
              onClick={() => { setMenuOpen(false); setSignInOpen(true); }}
              className="text-text-muted text-sm font-medium hover:text-text-heading transition-colors text-left"
            >
              Sign Up / In
            </button>
            <a href="#" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center">
              Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </nav>
  )
}
