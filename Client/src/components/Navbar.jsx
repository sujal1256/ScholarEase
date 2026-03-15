import { useState, useEffect } from 'react'
import { Link } from 'react-scroll'
import { Link as RouterLink } from 'react-router-dom'
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
      <a href="#" className="font-heading text-xl font-bold text-text-heading no-underline flex items-center gap-2.5">
        <span
          className="relative flex items-center justify-center rounded-xl"
          style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, #4a9b8e 0%, #3a7d72 100%)',
            boxShadow: '0 2px 10px rgba(74,155,142,0.35)',
          }}
        >
          {/* Open book with magnifier — research vibes */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Open book */}
            <path d="M2 4C2 4 4 3 7 3C10 3 12 4.5 12 4.5C12 4.5 14 3 17 3C20 3 22 4 22 4V18C22 18 20 17 17 17C14 17 12 18.5 12 18.5C12 18.5 10 17 7 17C4 17 2 18 2 18V4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
            <path d="M12 4.5V18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            {/* Small sparkle / AI dot */}
            <circle cx="17.5" cy="8" r="1.2" fill="white" opacity="0.9" />
            <path d="M17.5 6.2V9.8M15.7 8H19.3" stroke="white" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
          </svg>
        </span>
        <span className="flex items-baseline gap-0.5">
          ScholarEase<sup className="text-primary font-mono font-semibold" style={{ fontSize: '0.55em', verticalAlign: 'super', letterSpacing: '0.08em' }}>AI</sup>
        </span>
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
        <RouterLink
          to="/upload"
          className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5 no-underline"
        >
          Get Started
        </RouterLink>
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
            <RouterLink to="/upload" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center no-underline" onClick={() => setMenuOpen(false)}>
              Get Started
            </RouterLink>
          </motion.div>
        )}
      </AnimatePresence>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </nav>
  )
}
