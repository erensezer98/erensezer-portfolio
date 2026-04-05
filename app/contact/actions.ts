'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'

const db = supabaseAdmin ?? supabase

interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactForm(input: ContactInput) {
  try {
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
