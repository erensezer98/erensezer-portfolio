'use client'

import { useState } from 'react'
import { submitContactMessage } from '@/lib/supabase'
import type { Metadata } from 'next'

// Note: metadata export doesn't work in client components —
// see /app/contact/layout.tsx for metadata if needed.

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await submitContactMessage(form)
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
      <div className="max-w-xl">
        {/* Header */}
        <p className="section-label mb-3">Get in touch</p>
        <h1 className="page-heading mb-6">Contact</h1>
        <p className="text-muted text-sm leading-relaxed mb-12">
          Interested in collaborating, have a project in mind, or just want to
          say hello? Send a message or email directly at{' '}
          <a
            href="mailto:eren@maestro-tech.com"
            className="text-charcoal hover:text-salmon transition-colors underline underline-offset-4 decoration-border"
          >
            eren@maestro-tech.com
          </a>
        </p>

        {status === 'sent' ? (
          <div className="bg-salmon-pale border border-salmon/20 px-6 py-5">
            <p className="font-medium text-charcoal">Message sent.</p>
            <p className="text-sm text-muted mt-1">
              Thank you — I will get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                  Name
                </label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal placeholder-muted/50 focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                  Email
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal placeholder-muted/50 focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Subject
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal placeholder-muted/50 focus:outline-none focus:border-charcoal transition-colors"
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase text-muted mb-2">
                Message
              </label>
              <textarea
                required
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal placeholder-muted/50 focus:outline-none focus:border-charcoal transition-colors resize-none"
                placeholder="Your message…"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500">
                Something went wrong. Please try emailing directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-3 text-sm tracking-widest uppercase border border-charcoal px-8 py-3 hover:bg-charcoal hover:text-white transition-colors duration-300 disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
