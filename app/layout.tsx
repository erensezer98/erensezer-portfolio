import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/nav/Navbar'
import ContentProtection from '@/components/ui/ContentProtection'
import Footer from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: {
    default: 'Eren Sezer — Architect',
    template: '%s | Eren Sezer',
  },
  description:
    'Eren Sezer - Architect, Designer and Researcher.',
  openGraph: {
    title: 'Eren Sezer — Architect',
    description:
      'Eren Sezer - Architect, Designer and Researcher.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <ContentProtection />
        <Navbar />
        <main className="flex-1" data-protect-content="true">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
