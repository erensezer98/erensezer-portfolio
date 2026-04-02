'use client'

import type { ContactMessage } from '@/lib/types'
import { deleteMessage } from '../actions'
import { useRouter } from 'next/navigation'

export default function MessagesInbox({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-2">Inbox</p>
          <h1 className="font-serif text-5xl font-light">Contact Messages</h1>
        </div>
      </div>

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-cream/30">
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium w-3/12">Sender</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium w-8/12">Message</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium w-1/12 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialMessages.map((msg) => (
              <tr key={msg.id} className="hover:bg-cream/20 transition-colors group">
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-charcoal">{msg.name}</span>
                    <a href={`mailto:${msg.email}`} className="text-xs text-salmon hover:underline mt-0.5">{msg.email}</a>
                    <span className="text-[10px] text-muted tracking-tight mt-2">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 align-top">
                  <span className="text-sm font-medium text-charcoal block mb-2">{msg.subject}</span>
                  <p className="text-sm text-charcoal whitespace-pre-wrap">{msg.message}</p>
                </td>
                <td className="px-6 py-4 text-right align-top">
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="text-[10px] tracking-widest uppercase text-muted hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initialMessages.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-muted text-sm italic">
                  Your inbox is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
