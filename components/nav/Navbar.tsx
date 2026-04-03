'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/projects',     label: 'projects' },
  { href: '/about',        label: 'about' },
  { href: '/awards',       label: 'awards' },
  { href: '/publications', label: 'publications' },
  { href: '/contact',      label: 'contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const isDark = pathname === '/projects/istanbul-a-way-out'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled 
          ? (isDark ? 'bg-black/80 backdrop-blur-md border-b border-zinc-800' : 'bg-white border-b border-rule') 
          : 'bg-transparent'
      }`}
    >
      <div className="px-6 md:px-10 h-12 flex items-center justify-between">
        <Link
          href="/"
          className={`text-[13px] transition-colors duration-200 ${
            isDark ? 'text-zinc-100 hover:text-zinc-500' : 'text-ink hover:text-muted'
          }`}
        >
          eren sezer
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] transition-colors duration-200 ${
                pathname.startsWith(href)
                  ? (isDark ? 'text-white' : 'text-ink')
                  : (isDark ? 'text-zinc-500 hover:text-white' : 'text-muted hover:text-ink')
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[13px] text-muted hover:text-ink transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? 'close' : 'menu'}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-rule px-6 py-5 flex flex-col gap-5">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] transition-colors duration-200 ${
                pathname.startsWith(href) ? 'text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
