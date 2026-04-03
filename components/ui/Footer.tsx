'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const isDark = pathname === '/projects/istanbul-a-way-out'

  const theme = isDark ? {
    bg: 'bg-black',
    muted: 'text-zinc-500',
    ink: 'text-zinc-100',
    border: 'border-zinc-800',
    hover: 'hover:text-white'
  } : {
    bg: 'bg-white',
    muted: 'text-muted',
    ink: 'text-ink',
    border: 'border-rule',
    hover: 'hover:text-ink'
  }

  return (
    <footer className={`px-6 md:px-10 py-12 border-t ${theme.border} mt-24 transition-colors duration-700 ${theme.bg}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className={`text-xs ${theme.muted}`}>
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
              className={`text-xs ${theme.muted} ${theme.hover} transition-colors duration-200`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
