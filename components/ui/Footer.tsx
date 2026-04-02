import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="px-6 md:px-10 py-12 border-t border-rule mt-24">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Eren Sezer
        </p>
        <nav className="flex gap-7">
          {[
            ['projects',     '/projects'],
            ['about',        '/about'],
            ['awards',       '/awards'],
            ['publications', '/publications'],
            ['contact',      '/contact'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-muted hover:text-ink transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
