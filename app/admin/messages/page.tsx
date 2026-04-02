export const dynamic = 'force-dynamic'

import { getContactMessages } from '@/lib/supabase'
import MessagesInbox from './MessagesInbox'

export default async function AdminMessagesPage() {
  const messages = await getContactMessages()

  return <MessagesInbox initialMessages={messages} />
}
