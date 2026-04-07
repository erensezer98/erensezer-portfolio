'use client'

import { useMemo, useState, useTransition } from 'react'
import { saveLayoutSettings } from '@/app/admin/layout-settings/actions'
import { PROJECT_DRIVE_FIELDS, SITE_DRIVE_FIELDS } from '@/lib/drive-folder-settings'
import type { SiteSettings } from '@/lib/types'

interface Props {
  initialSettings: SiteSettings
}

type SaveStatus = 'idle' | 'saved' | 'error'

function InputRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)] md:items-start md:gap-6">
      <div>
        <p className="text-[13px] text-ink">{label}</p>
        <p className="mt-1 text-xs text-muted">{hint}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="paste a drive folder id or folder url"
        className="w-full border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
      />
    </label>
  )
}

export default function DriveFoldersPanel({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const next: Record<string, string> = {}

    for (const value of Object.values(SITE_DRIVE_FIELDS)) {
      for (const key of Object.values(value.fields)) {
        next[key] = String(initialSettings[key] ?? '')
      }
    }

    for (const project of PROJECT_DRIVE_FIELDS) {
      for (const key of Object.values(project.fields)) {
        next[key] = String(initialSettings[key] ?? '')
      }
    }

    return next
  })
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [isPending, startTransition] = useTransition()

  const changedCount = useMemo(() => {
    return Object.entries(settings).filter(([key, value]) => String(initialSettings[key] ?? '') !== value).length
  }, [initialSettings, settings])

  function update(key: string, value: string) {
    setSettings((current) => ({ ...current, [key]: value }))
    setStatus('idle')
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveLayoutSettings(settings)
        setStatus('saved')
      } catch (error) {
        console.error(error)
        setStatus('error')
      }
    })
  }

  return (
    <section className="overflow-hidden border border-rule bg-white">
      <div className="border-b border-rule bg-warm/40 px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted">drive folders</p>
            <h2 className="text-2xl font-light text-ink">media sources</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Paste either the folder ID or the full Google Drive folder link. We will save only the ID.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {changedCount > 0 && (
              <p className="text-xs text-muted">{changedCount} unsaved change{changedCount === 1 ? '' : 's'}</p>
            )}
            {status === 'saved' && <p className="text-xs text-muted">saved</p>}
            {status === 'error' && <p className="text-xs text-red-500">save failed</p>}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="border border-ink bg-ink px-5 py-2 text-xs uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-ink disabled:opacity-40"
            >
              {isPending ? 'saving...' : 'save folders'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-6 py-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted">about</p>
            <InputRow
              label="portrait"
              hint="single portrait image folder"
              value={settings[SITE_DRIVE_FIELDS.about.fields.portrait]}
              onChange={(value) => update(SITE_DRIVE_FIELDS.about.fields.portrait, value)}
            />
            <InputRow
              label="gallery"
              hint="optional about gallery folder"
              value={settings[SITE_DRIVE_FIELDS.about.fields.gallery]}
              onChange={(value) => update(SITE_DRIVE_FIELDS.about.fields.gallery, value)}
            />
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted">awards</p>
            <InputRow
              label="cover"
              hint="image folder used on the awards page"
              value={settings[SITE_DRIVE_FIELDS.awards.fields.cover]}
              onChange={(value) => update(SITE_DRIVE_FIELDS.awards.fields.cover, value)}
            />
          </div>
        </div>

        <div className="border-t border-rule pt-8">
          <p className="mb-5 text-xs uppercase tracking-widest text-muted">projects</p>
          <div className="space-y-8">
            {PROJECT_DRIVE_FIELDS.map((project) => (
              <div key={project.slug} className="border border-rule bg-warm/20 px-4 py-4">
                <p className="mb-4 text-[13px] text-ink">{project.label}</p>
                <div className="grid gap-4">
                  <InputRow
                    label="main folder"
                    hint="root folder for your own reference in admin"
                    value={settings[project.fields.folder]}
                    onChange={(value) => update(project.fields.folder, value)}
                  />
                  <InputRow
                    label="cover"
                    hint="folder with the main cover image"
                    value={settings[project.fields.cover]}
                    onChange={(value) => update(project.fields.cover, value)}
                  />
                  <InputRow
                    label="gallery"
                    hint="folder with the gallery images"
                    value={settings[project.fields.gallery]}
                    onChange={(value) => update(project.fields.gallery, value)}
                  />
                  <InputRow
                    label="process"
                    hint="folder with process images"
                    value={settings[project.fields.process]}
                    onChange={(value) => update(project.fields.process, value)}
                  />
                  <InputRow
                    label="schematics"
                    hint="folder with wide or schematic images"
                    value={settings[project.fields.wide]}
                    onChange={(value) => update(project.fields.wide, value)}
                  />
                  {'chapterReferences' in project.fields && (
                    <InputRow
                      label="chapter references"
                      hint="folder containing chapter subfolders"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      value={settings[(project.fields as any).chapterReferences]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(value) => update((project.fields as any).chapterReferences, value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
