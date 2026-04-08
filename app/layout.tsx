import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/nav/Navbar'
import ContentProtection from '@/components/ui/ContentProtection'
import Footer from '@/components/ui/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.erensezer.com'),
  title: {
    default: 'Eren Sezer — Architect',
    template: '%s | Eren Sezer',
  },
  description: 'Eren Sezer - Architect, Designer and Researcher based in Turin, Italy.',
  keywords: ['Eren Sezer', 'Architect', 'Design', 'Research', 'Turin', 'Milan', 'Istanbul'],
  authors: [{ name: 'Eren Sezer' }],
  creator: 'Eren Sezer',
  openGraph: {
    title: 'Eren Sezer — Architect',
    description: 'Eren Sezer - Architect, Designer and Researcher.',
    url: 'https://www.erensezer.com',
    siteName: 'Eren Sezer',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@erensezer',
    creator: '@erensezer',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Person',
                '@id': 'https://www.erensezer.com/#person',
                name: 'Eren Sezer',
                url: 'https://www.erensezer.com',
                image: 'https://www.erensezer.com/og-image.jpg',
                description: 'Architect, Designer and Researcher based in Turin, Italy.',
                jobTitle: 'Architect',
                worksFor: {
                  '@type': 'Organization',
                  name: 'Maestro Technologies'
                },
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
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                '@id': 'https://www.erensezer.com/#website',
                url: 'https://www.erensezer.com',
                name: 'Eren Sezer — Architect',
                publisher: {
                  '@id': 'https://www.erensezer.com/#person'
                }
              }
            ])
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        <ContentProtection />
        <Navbar />
        <main className="flex-1" data-protect-content="true">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
