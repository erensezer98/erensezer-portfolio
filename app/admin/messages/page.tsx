export const dynamic = 'force-dynamic'

import MessagesInbox from './MessagesInbox'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'
import type { ContactMessage } from '@/lib/types'

export default async function AdminMessagesPage() {
  const db = supabaseAdmin ?? supabase

  let messages: ContactMessage[] = []

  try {
    const { data, error } = await db
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      messages = data
    }
  } catch {
    messages = []
  }

  return <MessagesInbox initialMessages={messages} />
}
