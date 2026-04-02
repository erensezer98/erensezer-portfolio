'use client'

import { useState } from 'react'
import PublicationForm from './PublicationForm'
import type { Publication } from '@/lib/types'
import { deletePublication } from '../actions'
import { useRouter } from 'next/navigation'

export default function PublicationsManager({ initialPublications }: { initialPublications: Publication[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      await deletePublication(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-2">Backstage</p>
          <h1 className="font-serif text-5xl font-light">Publications & Events</h1>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs tracking-widest uppercase border border-charcoal bg-charcoal text-white px-8 py-3 hover:bg-white hover:text-charcoal transition-colors duration-300"
          >
            Add Item
          </button>
        )}
      </div>

      {isAdding && (
        <PublicationForm onCancel={() => setIsAdding(false)} />
      )}

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-cream/30">
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Title / Detail</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Type</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Year</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialPublications.map((item) => (
              <tr key={item.id} className="hover:bg-cream/20 transition-colors group">
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <PublicationForm publication={item} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-charcoal">{item.title}</span>
                      <span className="text-[10px] text-muted tracking-tight mt-0.5">{item.organization}</span>
                      {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-salmon hover:underline mt-1">Link ↗</a>}
                    </div>
                  )}
                </td>
                {editingId !== item.id && (
                  <>
                    <td className="px-6 py-4">
                      <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-border text-muted bg-cream">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted align-top">{item.year}</td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => setEditingId(item.id)}
                          className="text-[10px] tracking-widest uppercase text-charcoal hover:text-salmon transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-[10px] tracking-widest uppercase text-muted hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {initialPublications.length === 0 && !isAdding && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted text-sm italic">
                  No publications found. Add your first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
