import '../globals.css'
import { logoutAdmin } from './actions'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans text-charcoal">
      {/* Admin Nav */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-serif text-xl tracking-tight">Admin Dashboard</Link>
            <nav className="flex gap-4">
              <Link href="/" className="text-xs tracking-widest uppercase text-muted hover:text-salmon transition-colors">
                View Site ↗
              </Link>
            </nav>
          </div>
          <form action={logoutAdmin}>
            <button type="submit" className="text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors">
              Log out
            </button>
          </form>
        </div>
      </header>
      
      {/* Admin Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-12">
        {children}
      </main>
    </div>
  )
}
