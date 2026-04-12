'use client'

import { useState, useTransition } from 'react'
import { saveAboutBio } from './actions'

interface Props {
  initialParagraphs: string[]
}

export default function AboutBioEditor({ initialParagraphs }: Props) {
  const [paragraphs, setParagraphs] = useState<string[]>(initialParagraphs)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)

  const updateParagraph = (index: number, value: string) => {
    setParagraphs((prev) => prev.map((p, i) => (i === index ? value : p)))
  }

  const addParagraph = () => {
    setParagraphs((prev) => [...prev, ''])
  }

  const removeParagraph = (index: number) => {
    setParagraphs((prev) => prev.filter((_, i) => i !== index))
  }

  const moveParagraph = (index: number, direction: -1 | 1) => {
    setParagraphs((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSave = () => {
    setStatus(null)
    startTransition(async () => {
      const result = await saveAboutBio(paragraphs)
      if (result.error) {
        setStatus(`Error: ${result.error}`)
      } else {
        setStatus('Saved.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="border border-rule bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-muted">
                Paragraph {index + 1}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveParagraph(index, -1)}
                  disabled={index === 0}
                  className="text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-ink disabled:opacity-30"
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => moveParagraph(index, 1)}
                  disabled={index === paragraphs.length - 1}
                  className="text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-ink disabled:opacity-30"
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  onClick={() => removeParagraph(index)}
                  className="text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
            <textarea
              value={paragraph}
              onChange={(e) => updateParagraph(index, e.target.value)}
              rows={Math.max(4, Math.ceil(paragraph.length / 80))}
              className="w-full resize-y border border-rule bg-warm/20 p-3 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={addParagraph}
          className="border border-rule bg-white px-5 py-2 text-xs uppercase tracking-widest text-ink transition-colors hover:border-ink"
        >
          + Add Paragraph
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="border border-ink bg-ink px-6 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-ink disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        {status && (
          <span className="text-xs text-muted">{status}</span>
        )}
      </div>
    </div>
  )
}
