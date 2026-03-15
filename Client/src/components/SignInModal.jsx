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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
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
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="signin-title" className="font-heading text-xl font-bold text-text-heading">
                Sign In
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-text-dim hover:text-text-heading transition-colors p-1 -m-1"
                aria-label="Close"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
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
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-heading placeholder:text-text-dim focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
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
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-heading placeholder:text-text-dim focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                />
              </label>
              <a
                href="#"
                className="text-xs text-primary hover:text-primary-dark transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
              <button
                type="submit"
                className="mt-2 w-full bg-primary text-white text-sm font-semibold py-3 rounded-full transition-all hover:bg-primary-dark"
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
