const footerCols = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  },
  {
    heading: 'Resources',
    links: ['Documentation', 'API Reference', 'Blog', 'Status'],
  },
  {
    heading: 'Company',
    links: ['About', 'Privacy', 'Terms', 'Contact'],
  },
]

export default function Footer() {
  return (
    <footer className="px-8 md:px-16 pt-14 pb-10 border-t border-white/[0.06]">
      {/* Top */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-12 pb-10 border-b border-white/[0.06] mb-8">
        {/* Brand */}
        <div>
          <a href="#" className="font-cormorant text-2xl font-bold text-off-white no-underline">
            ScholarEase
            <sup
              className="font-mono font-normal text-amber"
              style={{ fontSize: '0.5em', verticalAlign: 'super', letterSpacing: '0.1em' }}
            >
              AI
            </sup>
          </a>
          <p className="text-[0.8rem] leading-relaxed text-text-muted mt-3 max-w-[220px]">
            AI-powered research intelligence for the modern academic.
          </p>
        </div>

        {/* Columns */}
        <div className="flex flex-wrap gap-12 md:gap-16">
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="font-bold text-[0.68rem] tracking-widest uppercase text-text-dim mb-4">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5 list-none">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[0.82rem] text-text-muted no-underline transition-colors duration-200 hover:text-text-base"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-mono text-[0.62rem] tracking-wide text-text-dim">
          © 2025 ScholarEase Technologies. All rights reserved.
        </span>
        <span className="font-mono text-[0.62rem] text-text-dim">
          Built with <span className="text-amber">♥</span> for researchers everywhere
        </span>
      </div>
    </footer>
  )
}
