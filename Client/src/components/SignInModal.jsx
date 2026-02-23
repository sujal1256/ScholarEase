import { useEffect } from 'react'
import { RiCloseLine } from 'react-icons/ri'
import { motion, AnimatePresence } from 'framer-motion'

export default function SignInModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const handleEscape = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-title"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/[0.12] bg-[#0d0d11] p-8 shadow-xl"
            style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="signin-title" className="font-cormorant text-xl font-semibold text-off-white">
                Sign In
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-base transition-colors p-1 -m-1"
                aria-label="Close"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                // Placeholder: wire to auth later
              }}
            >
              <label className="block">
                <span className="text-text-muted text-xs font-semibold tracking-wider uppercase block mb-2">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-off-white placeholder:text-text-muted focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber/50 transition-colors"
                />
              </label>
              <label className="block">
                <span className="text-text-muted text-xs font-semibold tracking-wider uppercase block mb-2">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-off-white placeholder:text-text-muted focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber/50 transition-colors"
                />
              </label>
              <a
                href="#"
                className="text-xs text-amber hover:text-amber-lt transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
              <button
                type="submit"
                className="btn-shimmer mt-2 w-full bg-amber text-bg text-xs font-bold tracking-wider uppercase py-3 rounded transition-all hover:bg-amber-lt"
                style={{ boxShadow: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 24px rgba(212,145,58,0.28)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                Sign In
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
