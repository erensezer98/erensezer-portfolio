'use client'

import { useState, useTransition } from 'react'
import { saveLayoutSettings } from './actions'
import type { SiteSettings } from '@/lib/types'

interface Props {
  initialSettings: SiteSettings
}

// ─── tiny primitives ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-rule bg-white">
      <div className="border-b border-rule px-6 py-4">
        <p className="text-xs tracking-widest uppercase text-muted">{title}</p>
      </div>
      <div className="px-6 py-6 space-y-6">{children}</div>
    </div>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="text-[13px] text-ink">{label}</p>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function RadioGroup<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { label: string; value: T }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs border transition-colors duration-150 ${
            value === o.value
              ? 'border-ink bg-ink text-white'
              : 'border-rule text-muted hover:border-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-ink' : 'bg-rule'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export default function LayoutSettingsClient({ initialSettings }: Props) {
  const [s, setS] = useState<SiteSettings>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }))
    setStatus('idle')
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const raw: Record<string, string> = {}
        for (const [k, v] of Object.entries(s)) raw[k] = String(v)
        await saveLayoutSettings(raw)
        setStatus('saved')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    })
  }

  return (
    <div className="space-y-10">

      {/* ── Header ─── */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted mb-2">admin / layout</p>
          <h1 className="text-4xl font-light text-ink">Page Layouts</h1>
        </div>
        <div className="flex items-center gap-4">
          {status === 'saved' && (
            <p className="text-xs text-muted">Changes saved.</p>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-500">Save failed — check Supabase.</p>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs tracking-widest uppercase border border-ink bg-ink text-white px-6 py-2.5 hover:bg-white hover:text-ink transition-colors duration-200 disabled:opacity-40"
          >
            {isPending ? 'saving…' : 'save all'}
          </button>
        </div>
      </div>

      {/* ── Setup note ─── */}
      <div className="border border-rule bg-warm/60 px-6 py-4 text-xs text-muted leading-relaxed">
        <span className="text-ink font-medium">First time?</span> Create the{' '}
        <code className="bg-rule px-1 py-0.5">site_settings</code> table in Supabase with this SQL:
        <pre className="mt-2 bg-white border border-rule px-4 py-3 text-[11px] overflow-x-auto whitespace-pre">
{`CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read"  ON site_settings FOR SELECT USING (true);
CREATE POLICY "service write" ON site_settings FOR ALL USING (true);`}
        </pre>
      </div>

      {/* ── Homepage ─── */}
      <Section title="Homepage">
        <Row
          label="Hero size"
          hint="Controls top-section spacing above the name"
        >
          <RadioGroup
            value={s.home_hero_size}
            options={[
              { label: 'Large', value: 'large' },
              { label: 'Compact', value: 'compact' },
            ]}
            onChange={(v) => update('home_hero_size', v as SiteSettings['home_hero_size'])}
          />
        </Row>
        <Row
          label="Project grid columns"
          hint="Number of columns in the homepage project grid"
        >
          <RadioGroup
            value={s.home_grid_cols}
            options={[
              { label: '1 col', value: 1 },
              { label: '2 col', value: 2 },
            ]}
            onChange={(v) => update('home_grid_cols', v as SiteSettings['home_grid_cols'])}
          />
        </Row>
      </Section>

      {/* ── Projects listing ─── */}
      <Section title="Projects Page">
        <Row
          label="Grid columns"
          hint="Number of columns in the /projects grid"
        >
          <RadioGroup
            value={s.projects_grid_cols}
            options={[
              { label: '2 col', value: 2 },
              { label: '3 col', value: 3 },
            ]}
            onChange={(v) => update('projects_grid_cols', v as SiteSettings['projects_grid_cols'])}
          />
        </Row>
      </Section>

      {/* ── About ─── */}
      <Section title="About Page">
        <Row
          label="Bio layout"
          hint="1-column: full-width text. 2-column: text alongside photo placeholder"
        >
          <RadioGroup
            value={s.about_bio_cols}
            options={[
              { label: '1 col', value: 1 },
              { label: '2 col', value: 2 },
            ]}
            onChange={(v) => update('about_bio_cols', v as SiteSettings['about_bio_cols'])}
          />
        </Row>
        <Row label="Show photo placeholder" hint="Displays the portrait image area">
          <Toggle
            checked={s.about_show_photo}
            onChange={(v) => update('about_show_photo', v)}
          />
        </Row>
      </Section>

      {/* ── Project detail ─── */}
      <Section title="Project Detail Page">
        <Row label="Show tags" hint="Display tag pills below the project title">
          <Toggle
            checked={s.project_show_tags}
            onChange={(v) => update('project_show_tags', v)}
          />
        </Row>
      </Section>

    </div>
  )
}
