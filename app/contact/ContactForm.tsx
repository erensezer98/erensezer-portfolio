'use client'

import { useState } from 'react'
import { submitContactForm } from './actions'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const result = await submitContactForm(form)
      if (result.error) {
        setStatus('error')
        return
      }
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full border-b border-rule bg-transparent py-3 text-[13px] text-ink placeholder-muted/50 focus:outline-none focus:border-ink transition-colors duration-200'
  const labelClass = 'block text-xs text-muted mb-2'

  return (
    <div className="max-w-lg">
      <p className="text-sm text-ink leading-relaxed mb-12 flex flex-col items-start gap-1">
        <span>Interested in collaborating or have a project in mind?</span>
        <span>
          <a href="mailto:eren.sezer@hotmail.com" className="underline underline-offset-4 decoration-rule hover:text-muted transition-colors mr-3">
            eren.sezer@hotmail.com
          </a>
          <span className="text-muted mr-3">—</span>
          <a href="https://www.linkedin.com/in/erensezer/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 decoration-rule hover:text-muted transition-colors">
            LinkedIn
          </a>
        </span>
      </p>

      {status === 'sent' ? (
        <p className="text-sm text-muted">Message sent — I&apos;ll be in touch shortly.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>name</label>
              <input required name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>email</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>subject</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="What is this about?" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>message</label>
            <textarea required name="message" value={form.message} onChange={handleChange} rows={6} placeholder="Your message…" className={`${inputClass} resize-none`} />
          </div>

          {status === 'error' && (
            <p className="text-xs text-muted">Something went wrong — please email directly.</p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="text-[13px] text-ink border-b border-ink pb-0.5 hover:text-muted hover:border-muted transition-colors duration-200 disabled:opacity-50"
          >
            {status === 'sending' ? 'sending…' : 'send message'}
          </button>
        </form>
      )}
    </div>
  )
}
