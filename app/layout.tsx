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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Eren Sezer',
              url: 'https://www.erensezer.com',
              jobTitle: 'Architect, Designer and Researcher',
              alumniOf: [
                {
                  '@type': 'CollegeOrUniversity',
                  name: 'Politecnico di Milano'
                }
              ],
              sameAs: [
                'https://www.linkedin.com/in/erensezer/',
                'https://www.instagram.com/eren.sezer/'
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <ContentProtection />
        <Navbar />
        <main className="flex-1" data-protect-content="true">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
