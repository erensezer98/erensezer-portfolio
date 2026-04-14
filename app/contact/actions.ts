'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'

const db = supabaseAdmin ?? supabase

interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
  website?: string // Honeypot field
  recaptchaToken?: string
}

async function verifyRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.error('RECAPTCHA_SECRET_KEY not found in environment.')
    return { success: false, score: 0 }
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  })

  const data = await response.json()
  return data
}

export async function submitContactForm(input: ContactInput) {
  try {
    // 1. Honeypot check: if website is filled, it's likely a bot
    if (input.website) {
      console.warn('Honeypot triggered')
      return { success: true } // Silently ignore bot submission
    }

    // 2. Google reCAPTCHA v3 check
    if (!input.recaptchaToken) {
      return { error: 'Security verification failed. Please try again.' }
    }

    const verification = await verifyRecaptcha(input.recaptchaToken)
    if (!verification.success || verification.score < 0.5) {
      console.warn('reCAPTCHA failed:', verification)
      return { error: 'Security systems identified this message as potential spam.' }
    }

    const payload = {
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      return { error: 'Please fill in the required fields.' }
    }

    const { error } = await db.from('contact_messages').insert(payload)
    if (error) {
      console.error('submitContactForm error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('submitContactForm unexpected error:', err)
    return { error: 'Unable to send message right now.' }
  }
}
