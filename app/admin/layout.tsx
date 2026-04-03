import '../globals.css'
import { logoutAdmin } from './actions'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-warm flex flex-col font-sans text-ink">
      {/* Admin Nav */}
      <header className="bg-white border-b border-rule sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-[13px] text-ink hidden md:block">
              Admin
            </Link>
            <nav className="flex gap-4 sm:gap-6">
              <Link href="/admin"                   className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Projects</Link>
              <Link href="/admin/awards"             className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Awards</Link>
              <Link href="/admin/publications"       className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Publications</Link>
              <Link href="/admin/messages"           className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Messages</Link>
              <Link href="/admin/page-editor"        className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Editor</Link>
              <Link href="/admin/text-styles"        className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Styles</Link>
              <Link href="/admin/layout-settings"    className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">Layouts</Link>
              <Link href="/" className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors ml-4 border-l border-rule pl-4">
                View Site ↗
              </Link>
            </nav>
          </div>
          <form action={logoutAdmin}>
            <button type="submit" className="text-xs tracking-widest uppercase text-muted hover:text-ink transition-colors">
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
