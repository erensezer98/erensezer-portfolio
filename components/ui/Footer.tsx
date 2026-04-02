import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-light-gray mt-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 border-2 border-carbon flex items-center justify-center">
                <span className="text-[9px] font-bold tracking-wider text-carbon">ES</span>
              </div>
              <p className="font-semibold tracking-wide text-carbon text-sm">EREN SEZER</p>
            </div>
            <p className="text-xs text-slate font-mono">Architect · Digital Designer · Milan</p>
          </div>

          <nav className="flex flex-wrap gap-6">
            {[
              { href: '/projects', label: 'Projects' },
              { href: '/about', label: 'About' },
              { href: '/awards', label: 'Awards' },
              { href: '/publications', label: 'Publications' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] tracking-wide uppercase text-slate hover:text-accent transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-light-gray pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs text-soft-gray font-mono">
            © {new Date().getFullYear()} Eren Sezer. All rights reserved.
          </p>
          <p className="text-xs text-soft-gray font-mono">
            Architecture × Technology
          </p>
        </div>
      </div>
    </footer>
  )
}
