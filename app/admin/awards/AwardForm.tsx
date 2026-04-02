'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAward } from '../actions'
import type { Award } from '@/lib/types'

interface AwardFormProps {
  award?: Award
  onCancel?: () => void
}

export default function AwardForm({ award, onCancel }: AwardFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data: Partial<Award> = {
      ...(award && { id: award.id }),
      title: formData.get('title') as string,
      organization: formData.get('organization') as string,
      year: parseInt(formData.get('year') as string),
      description: formData.get('description') as string || null,
    }

    const { error: saveError } = await saveAward(data)
    if (saveError) {
      setError(saveError)
      setLoading(false)
    } else {
      if (onCancel) onCancel()
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream/30 border border-border p-6 mb-8 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1 col-span-2">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Award Title</label>
          <input required name="title" defaultValue={award?.title} className="w-full border border-border bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Organization</label>
          <input required name="organization" defaultValue={award?.organization} className="w-full border border-border bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Year</label>
          <input required type="number" name="year" defaultValue={award?.year || new Date().getFullYear()} className="w-full border border-border bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="block text-[10px] tracking-widest uppercase text-muted">Description (Optional)</label>
        <textarea rows={2} name="description" defaultValue={award?.description || ''} className="w-full border border-border bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors resize-none" />
      </div>

      {error && <p className="text-red-500 text-[10px] tracking-widest uppercase bg-red-50 p-2 border border-red-100">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="text-[10px] tracking-widest uppercase border border-charcoal bg-charcoal text-white px-6 py-2 hover:bg-white hover:text-charcoal transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Award'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[10px] tracking-widest uppercase border border-border px-6 py-2 hover:bg-white transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
