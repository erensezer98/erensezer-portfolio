import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-sans text-sm tracking-widest uppercase font-medium text-charcoal">
            Eren Sezer
          </p>
          <p className="text-xs text-muted mt-1">
            Architect &amp; Digital Designer · Milan
          </p>
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
              className="text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Eren Sezer
        </p>
      </div>
    </footer>
  )
}
