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
        <div className="flex flex-col gap-2">
          <p className={`text-xs font-medium lowercase ${theme.muted}`}>
            © {new Date().getFullYear()} eren sezer
          </p>
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-200 ${theme.muted} ${theme.hover}`}
          >
            CC BY-NC-SA 4.0
          </a>
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
