'use client'

import { useState, useTransition } from 'react'
import { saveTextStyle, deleteTextStyle } from './actions'
import type { TextStyle } from '@/lib/types'

interface Props {
  initialStyles: TextStyle[]
}

const EMPTY_STYLE: Omit<TextStyle, 'id' | 'created_at'> = {
  name: '',
  font_size: '1rem',
  font_weight: '400',
  color: '#282420',
  letter_spacing: '0em',
  line_height: '1.6',
  text_transform: 'none',
  font_style: 'normal',
  margin_bottom: '0',
}

export default function TextStylesManager({ initialStyles }: Props) {
  const [styles, setStyles] = useState<TextStyle[]>(initialStyles)
  const [editing, setEditing] = useState<Partial<TextStyle> | null>(null)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  function openNew() {
    setEditing({ ...EMPTY_STYLE })
    setStatus('idle')
  }

  function openEdit(style: TextStyle) {
    setEditing({ ...style })
    setStatus('idle')
  }

  function handleChange<K extends keyof TextStyle>(key: K, value: TextStyle[K]) {
    if (!editing) return
    setEditing((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    if (!editing || !editing.name) return
    startTransition(async () => {
      const result = await saveTextStyle(editing)
      if (result.error) {
        setStatus('error')
      } else if (result.data) {
        setStyles((prev) => {
          const idx = prev.findIndex((s) => s.id === result.data.id)
          if (idx >= 0) {
            const copy = [...prev]
            copy[idx] = result.data
            return copy
          }
          return [...prev, result.data]
        })
        setEditing(null)
        setStatus('saved')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this text style?')) return
    startTransition(async () => {
      const result = await deleteTextStyle(id)
      if (result.success) {
        setStyles((prev) => prev.filter((s) => s.id !== id))
        if (editing && 'id' in editing && editing.id === id) setEditing(null)
      }
    })
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted mb-2">admin / text styles</p>
          <h1 className="text-4xl font-light text-ink">Typography Styles</h1>
        </div>
        <button
          onClick={openNew}
          className="text-xs tracking-widest uppercase border border-ink bg-ink text-white px-6 py-2.5 hover:bg-white hover:text-ink transition-colors duration-200"
        >
          + new style
        </button>
      </div>

      {/* Info */}
      <div className="border border-rule bg-warm/60 px-6 py-4 text-xs text-muted leading-relaxed">
        <span className="text-ink font-medium">How it works:</span>{' '}
        Define reusable text styles here. When you edit a style, every text block on every page
        that uses that style updates automatically. Use these styles in the Page Editor.
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Style list ─── */}
        <div className="space-y-3">
          <p className="text-xs tracking-widest uppercase text-muted mb-4">Defined Styles</p>
          {styles.length === 0 && (
            <p className="text-xs text-muted py-8 text-center border border-dashed border-rule">
              No styles defined yet. Create one to get started.
            </p>
          )}
          {styles.map((style) => (
            <div
              key={style.id}
              className={`border transition-colors duration-150 cursor-pointer group ${
                editing?.id === style.id
                  ? 'border-ink bg-white'
                  : 'border-rule bg-white hover:border-muted'
              }`}
            >
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1" onClick={() => openEdit(style)}>
                  <p className="text-[13px] text-ink font-medium">{style.name}</p>
                  <p
                    className="mt-2 truncate"
                    style={{
                      fontSize: style.font_size.startsWith('clamp') ? '1.5rem' : style.font_size,
                      fontWeight: style.font_weight,
                      color: style.color,
                      letterSpacing: style.letter_spacing,
                      lineHeight: style.line_height,
                      textTransform: style.text_transform as React.CSSProperties['textTransform'],
                      fontStyle: style.font_style,
                    }}
                  >
                    The quick brown fox
                  </p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] bg-warm px-2 py-0.5 text-muted">{style.font_size}</span>
                    <span className="text-[10px] bg-warm px-2 py-0.5 text-muted">wt {style.font_weight}</span>
                    <span className="text-[10px] bg-warm px-2 py-0.5 text-muted">{style.color}</span>
                    {style.text_transform !== 'none' && (
                      <span className="text-[10px] bg-warm px-2 py-0.5 text-muted">{style.text_transform}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(style.id)}
                  className="text-xs text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0 pt-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Edit form ─── */}
        {editing && (
          <div className="border border-ink bg-white sticky top-20">
            <div className="border-b border-rule px-6 py-4 flex items-center justify-between">
              <p className="text-xs tracking-widest uppercase text-muted">
                {editing.id ? 'Edit Style' : 'New Style'}
              </p>
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-muted hover:text-ink transition-colors"
              >
                ✕ close
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Name</label>
                <input
                  type="text"
                  value={editing.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full border border-rule px-3 py-2 text-sm text-ink bg-white focus:border-ink outline-none transition-colors"
                  placeholder="e.g. Hero Title"
                />
              </div>

              {/* Font Size */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Font Size</label>
                <input
                  type="text"
                  value={editing.font_size || ''}
                  onChange={(e) => handleChange('font_size', e.target.value)}
                  className="w-full border border-rule px-3 py-2 text-sm text-ink bg-white focus:border-ink outline-none transition-colors"
                  placeholder="e.g. 1.5rem, clamp(2rem, 5vw, 4rem)"
                />
              </div>

              {/* Font Weight */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Font Weight</label>
                <div className="flex gap-1 flex-wrap">
                  {['300', '400', '500', '600', '700'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleChange('font_weight', w)}
                      className={`px-3 py-1.5 text-xs border transition-colors duration-150 ${
                        editing.font_weight === w
                          ? 'border-ink bg-ink text-white'
                          : 'border-rule text-muted hover:border-muted hover:text-ink'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editing.color || '#282420'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-8 h-8 border border-rule cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editing.color || ''}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="flex-1 border border-rule px-3 py-2 text-sm text-ink bg-white focus:border-ink outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Letter Spacing */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Letter Spacing</label>
                <input
                  type="text"
                  value={editing.letter_spacing || ''}
                  onChange={(e) => handleChange('letter_spacing', e.target.value)}
                  className="w-full border border-rule px-3 py-2 text-sm text-ink bg-white focus:border-ink outline-none transition-colors"
                  placeholder="e.g. -0.02em, 0.05em"
                />
              </div>

              {/* Line Height */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Line Height</label>
                <input
                  type="text"
                  value={editing.line_height || ''}
                  onChange={(e) => handleChange('line_height', e.target.value)}
                  className="w-full border border-rule px-3 py-2 text-sm text-ink bg-white focus:border-ink outline-none transition-colors"
                  placeholder="e.g. 1.6, 1.08"
                />
              </div>

              {/* Text Transform */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Text Transform</label>
                <div className="flex gap-1">
                  {['none', 'uppercase', 'lowercase', 'capitalize'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChange('text_transform', t)}
                      className={`px-3 py-1.5 text-xs border transition-colors duration-150 ${
                        editing.text_transform === t
                          ? 'border-ink bg-ink text-white'
                          : 'border-rule text-muted hover:border-muted hover:text-ink'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Font Style</label>
                <div className="flex gap-1">
                  {['normal', 'italic'].map((fs) => (
                    <button
                      key={fs}
                      type="button"
                      onClick={() => handleChange('font_style', fs)}
                      className={`px-3 py-1.5 text-xs border transition-colors duration-150 ${
                        editing.font_style === fs
                          ? 'border-ink bg-ink text-white'
                          : 'border-rule text-muted hover:border-muted hover:text-ink'
                      }`}
                    >
                      {fs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margin Bottom */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Margin Bottom</label>
                <input
                  type="text"
                  value={editing.margin_bottom || ''}
                  onChange={(e) => handleChange('margin_bottom', e.target.value)}
                  className="w-full border border-rule px-3 py-2 text-sm text-ink bg-white focus:border-ink outline-none transition-colors"
                  placeholder="e.g. 1rem, 24px"
                />
              </div>

              {/* Preview */}
              <div className="border border-rule bg-warm/40 p-6 mt-4">
                <p className="text-[10px] uppercase tracking-widest text-muted mb-3">Preview</p>
                <p
                  style={{
                    fontSize: editing.font_size?.startsWith('clamp') ? '2rem' : editing.font_size,
                    fontWeight: editing.font_weight,
                    color: editing.color,
                    letterSpacing: editing.letter_spacing,
                    lineHeight: editing.line_height,
                    textTransform: editing.text_transform as React.CSSProperties['textTransform'],
                    fontStyle: editing.font_style,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>

              {/* Save */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isPending || !editing.name}
                  className="text-xs tracking-widest uppercase border border-ink bg-ink text-white px-6 py-2.5 hover:bg-white hover:text-ink transition-colors duration-200 disabled:opacity-40"
                >
                  {isPending ? 'saving…' : editing.id ? 'update style' : 'create style'}
                </button>
                {status === 'saved' && <p className="text-xs text-muted">Saved ✓</p>}
                {status === 'error' && <p className="text-xs text-red-500">Failed to save</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
