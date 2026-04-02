'use client'

import { useState } from 'react'
import AwardForm from './AwardForm'
import type { Award } from '@/lib/types'
import { deleteAward } from '../actions'
import { useRouter } from 'next/navigation'

export default function AwardsManager({ initialAwards }: { initialAwards: Award[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this award?')) {
      await deleteAward(id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-2">Backstage</p>
          <h1 className="font-serif text-5xl font-light">Awards</h1>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs tracking-widest uppercase border border-charcoal bg-charcoal text-white px-8 py-3 hover:bg-white hover:text-charcoal transition-colors duration-300"
          >
            Add Award
          </button>
        )}
      </div>

      {isAdding && (
        <AwardForm onCancel={() => setIsAdding(false)} />
      )}

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-cream/30">
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Award / Organization</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Year</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialAwards.map((award) => (
              <tr key={award.id} className="hover:bg-cream/20 transition-colors group">
                <td className="px-6 py-4">
                  {editingId === award.id ? (
                    <AwardForm award={award} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-charcoal">{award.title}</span>
                      <span className="text-[10px] text-muted tracking-tight mt-0.5">{award.organization}</span>
                      {award.description && <span className="text-xs text-muted/70 mt-2">{award.description}</span>}
                    </div>
                  )}
                </td>
                {editingId !== award.id && (
                  <>
                    <td className="px-6 py-4 text-sm text-muted align-top">{award.year}</td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => setEditingId(award.id)}
                          className="text-[10px] tracking-widest uppercase text-charcoal hover:text-salmon transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(award.id)}
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
            {initialAwards.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-muted text-sm italic">
                  No awards found. Add your first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
