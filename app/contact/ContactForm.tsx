'use client'

import { useState, useEffect } from 'react'
import { submitContactForm } from './actions'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export default function ContactForm() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    subject: '', 
    message: '',
    website: '', // Honeypot
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Load reCAPTCHA script
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey) return

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script & badge
      const badges = document.querySelectorAll('.grecaptcha-badge')
      badges.forEach(b => b.remove())
      const scripts = document.querySelectorAll(`script[src*="${siteKey}"]`)
      scripts.forEach(s => s.remove())
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      if (!siteKey) {
        setStatus('error')
        setErrorMessage('reCAPTCHA site key is missing.')
        return
      }

      // 1. Wait for grecaptcha to be ready and get token
      let token = ''
      try {
        await new Promise((resolve, reject) => {
          if (!window.grecaptcha) {
            reject(new Error('reCAPTCHA not loaded'))
            return
          }
          window.grecaptcha.ready(async () => {
            token = await window.grecaptcha.execute(siteKey, { action: 'submit' })
            resolve(token)
          })
        })
      } catch (err) {
        console.error('reCAPTCHA execution error:', err)
        setStatus('error')
        setErrorMessage('Security verification failed to load.')
        return
      }

      // 2. Submit form with token
      const result = await submitContactForm({
        ...form,
        recaptchaToken: token
      })

      if (result.error) {
        setStatus('error')
        setErrorMessage(result.error)
        return
      }

      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '', website: '' })
    } catch {
      setStatus('error')
      setErrorMessage('Unable to send message right now.')
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
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted"
        >
          Message sent — I&apos;ll be in touch shortly.
        </motion.p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="sr-only opacity-0 absolute pointer-events-none" aria-hidden="true">
            <input 
              tabIndex={-1} 
              autoComplete="off" 
              name="website" 
              value={form.website} 
              onChange={handleChange} 
            />
          </div>

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

          <div className="flex items-center gap-6 pt-2">
            <div className="flex-grow">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="text-[13px] text-ink border-b border-ink pb-1 hover:text-muted hover:border-muted transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group relative"
              >
                <span className="flex items-center gap-2">
                  {status === 'sending' ? 'sending…' : 'send message'}
                  <motion.span 
                    animate={status === 'sending' ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className={status === 'sending' ? 'inline-block' : 'hidden'}
                  >
                    ◌
                  </motion.span>
                </span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {status === 'error' && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-ink/70"
              >
                {errorMessage || 'Something went wrong — please email directly.'}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-muted/50 leading-tight">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
          </p>
        </form>
      )}
    </div>
  )
}
