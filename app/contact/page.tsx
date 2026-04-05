import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Eren Sezer.',
}

export default async function ContactPage() {
  return (
    <div className="px-6 md:px-10 pt-28 pb-32">
      <p className="text-[13px] font-medium lowercase text-muted mb-16">contact</p>
      <ContactForm />
    </div>
  )
}
