'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  const isDark = pathname === '/projects/istanbul-a-way-out'

  const theme = isDark
    ? {
        bg: 'bg-black',
        muted: 'text-zinc-500',
        border: 'border-zinc-800',
        hover: 'hover:text-white',
      }
    : {
        bg: 'bg-white',
        muted: 'text-muted',
        border: 'border-rule',
        hover: 'hover:text-ink',
      }

  return (
    <footer className={`mt-24 border-t px-6 py-12 transition-colors duration-700 md:px-10 ${theme.border} ${theme.bg}`}>
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className={`text-[11px] font-medium leading-relaxed lowercase ${theme.muted}`}>
          <div className="flex flex-wrap items-center gap-x-1">
            <Link href="/" className={`${theme.hover} transition-colors`}>Portfolio</Link>
            <span>© {new Date().getFullYear()} by</span>
            <Link href="/" className={`${theme.hover} transition-colors`}>Eren Sezer</Link>
            <span>is licensed under</span>
            <a
              href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${theme.hover} transition-colors`}
            >
              CC BY-NC-ND 4.0
            </a>
            <div className="ml-1 flex items-center gap-1 opacity-75 grayscale invert-[0.3]" style={{ filter: isDark ? 'invert(1) grayscale(1)' : 'grayscale(1)' }}>
              <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" className="h-4 w-4" />
              <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" className="h-4 w-4" />
              <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" className="h-4 w-4" />
              <img src="https://mirrors.creativecommons.org/presskit/icons/nd.svg" alt="" className="h-4 w-4" />
            </div>
          </div>
        </div>
        <nav className="flex gap-7">
          {[
            ['projects', '/projects'],
            ['experiments', '/experiments'],
            ['about', '/about'],
            ['awards', '/awards'],
            ['publications', '/publications'],
            ['contact', '/contact'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`text-xs font-medium lowercase transition-colors duration-200 ${theme.muted} ${theme.hover}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
