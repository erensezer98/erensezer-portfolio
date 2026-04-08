import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Eren Sezer.',
  alternates: {
    canonical: '/contact',
  },
}

export default async function ContactPage() {
  return (
    <div className="px-6 md:px-10 pt-28 pb-32">
      <header className="mb-16">
        <h1 className="text-[13px] font-medium lowercase text-muted">contact</h1>
      </header>
      <ContactForm />
    </div>
  )
}
