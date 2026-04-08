'use client'

import { useState } from 'react'
import { resetPiazzaTallies } from './actions'

export default function ResetPiazzaButton() {
  const [status, setStatus] = useState<'idle' | 'confirming' | 'loading' | 'done' | 'error'>('idle')

  async function handleReset() {
    if (status === 'idle') {
      setStatus('confirming')
      return
    }

    setStatus('loading')
    const result = await resetPiazzaTallies()

    if (result.error) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  function handleCancel() {
    setStatus('idle')
  }

  return (
    <div className="flex items-center gap-3">
      {status === 'confirming' && (
        <button
          onClick={handleCancel}
          className="text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
      )}
      <button
        onClick={handleReset}
        disabled={status === 'loading' || status === 'done'}
        className={`inline-flex items-center justify-center border px-5 py-2 text-[10px] uppercase tracking-widest transition-colors duration-200 ${
          status === 'confirming'
            ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
            : status === 'done'
            ? 'border-green-400 bg-green-50 text-green-600'
            : status === 'error'
            ? 'border-red-400 bg-red-50 text-red-600'
            : 'border-rule bg-white text-muted hover:border-ink hover:text-ink'
        }`}
      >
        {status === 'idle' && 'Reset Piazza Tallies'}
        {status === 'confirming' && 'Are you sure? Click again'}
        {status === 'loading' && 'Resetting…'}
        {status === 'done' && 'Tallies Reset ✓'}
        {status === 'error' && 'Error — try again'}
      </button>
    </div>
  )
}
