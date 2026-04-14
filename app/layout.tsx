import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import Navbar from '@/components/nav/Navbar'
import ContentProtection from '@/components/ui/ContentProtection'
import Footer from '@/components/ui/Footer'
import { getAboutDriveMedia } from '@/lib/site-drive-media'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export async function generateMetadata(): Promise<Metadata> {
  const aboutMedia = await getAboutDriveMedia()
  const portraitUrl = aboutMedia.portraitImage || 'https://www.erensezer.com/og-image.jpg'

  return {
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
      images: portraitUrl ? [{ url: portraitUrl, width: 1200, height: 630, alt: 'Eren Sezer' }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@erensezer',
      creator: '@erensezer',
      images: portraitUrl ? [portraitUrl] : undefined,
    },
    icons: {
      icon: [
        { url: '/icon', sizes: '192x192', type: 'image/png' },
        { url: '/icon', sizes: '48x48', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    },
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const aboutMedia = await getAboutDriveMedia()
  const portraitUrl = aboutMedia.portraitImage || '/og-image.jpg'

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
                image: portraitUrl,
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
                name: 'Eren Sezer',
                image: portraitUrl,
                publisher: {
                  '@id': 'https://www.erensezer.com/#person'
                }
              }
            ])
          }}
        />
        {/* Secure Privacy */}
        <Script src="https://app.secureprivacy.ai/script/69de1a4e01329e2e2fffa17f.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RHZWJSG8M3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RHZWJSG8M3');
            window.dataLayer.push({event: "gtm.init_consent", "gtm.uniqueEventId": 1});
            window.dataLayer.push({event: "gtm.init", "gtm.uniqueEventId": 2});
          `}
        </Script>
        <Analytics />
        <ContentProtection />
        <Navbar />
        <main className="flex-1" data-protect-content="true">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
