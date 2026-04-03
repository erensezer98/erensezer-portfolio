import type { Metadata } from 'next'
import { getPageContent, getTextStyles } from '@/lib/supabase'
import PageRenderer from '@/components/page-renderer/PageRenderer'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Eren Sezer.',
}

export default async function ContactPage() {
  const [pageContent, textStyles] = await Promise.all([
    getPageContent('contact'),
    getTextStyles()
  ])

  if (pageContent?.blocks?.length) {
    return (
      <div className="px-6 md:px-10 pt-28 pb-32 max-w-screen-xl mx-auto flex flex-col items-center">
        <PageRenderer blocks={pageContent.blocks} textStyles={textStyles} />
      </div>
    )
  }

  return (
    <div className="px-6 md:px-10 pt-28 pb-32">
      <p className="text-[13px] text-muted mb-16">contact</p>
      <ContactForm />
    </div>
  )
}
