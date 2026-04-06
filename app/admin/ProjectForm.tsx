'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProject, saveProjectPageContent } from './actions'
import { DRIVE_FOLDERS } from '@/lib/project-images'
import type { Project, ProjectCategory } from '@/lib/types'
import type { ProjectPageContent, ProjectSceneComponent } from '@/lib/project-data'

interface ProjectFormProps {
  project?: Partial<Project>
  templateContent: ProjectPageContent
}

const SCENE_OPTIONS: { value: ProjectSceneComponent; label: string }[] = [
  { value: 'none', label: 'No 3D element' },
  { value: 'architectural-wireframe', label: 'Architectural Wireframe' },
  { value: 'exploded-axonometry', label: 'Exploded Axonometry' },
  { value: 'food-tower-explosion', label: 'Food Tower Explosion' },
  { value: 'interactive-relight', label: 'Interactive Relight' },
  { value: 'the-log-scene', label: 'The Log Scene' },
  { value: 'toor-toor-scene', label: 'Toor-Toor Scene' },
]

const DEFAULT_INFO_FIELDS = [
  { label: 'Program', value: '' },
  { label: 'Area', value: '' },
  { label: 'Status', value: '' },
  { label: 'Client', value: '' },
]

function parseCommaSeparated(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseLineSeparated(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function textAreaValue(items: string[]) {
  return items.join(', ')
}

export default function ProjectForm({ project, templateContent }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [slugPreview, setSlugPreview] = useState(project?.slug ?? '')

  const infoFields = useMemo(() => {
    if (templateContent.infoFields.length) return templateContent.infoFields
    return DEFAULT_INFO_FIELDS
  }, [templateContent.infoFields])

  const driveEntry =
    slugPreview && slugPreview in DRIVE_FOLDERS
      ? DRIVE_FOLDERS[slugPreview as keyof typeof DRIVE_FOLDERS]
      : null

  const driveFolderLink =
    driveEntry && typeof driveEntry !== 'string'
      ? `https://drive.google.com/drive/folders/${driveEntry.folder}`
      : null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const slug = (formData.get('slug') as string).trim()

    const data: Partial<Project> = {
      ...(project?.created_at ? { id: project.id } : {}),
      title: (formData.get('title') as string).trim(),
      slug,
      category: formData.get('category') as ProjectCategory,
      year: parseInt(formData.get('year') as string, 10),
      location: (formData.get('location') as string).trim(),
      short_description: (formData.get('short_description') as string).trim(),
      description: (formData.get('description') as string).trim(),
      featured: formData.get('featured') === 'on',
      tags: parseCommaSeparated(formData.get('tags') as string),
      cover_image: ((formData.get('cover_image') as string).trim() || null),
      images: parseCommaSeparated(formData.get('images') as string),
      order_index: parseInt(formData.get('order_index') as string, 10) || 0,
    }

    const pageContent: ProjectPageContent = {
      sceneComponent: formData.get('sceneComponent') as ProjectSceneComponent,
      introText: (formData.get('introText') as string).trim(),
      processText: (formData.get('processText') as string).trim(),
      schematicText: (formData.get('schematicText') as string).trim(),
      processImages: parseCommaSeparated(formData.get('processImages') as string),
      schematicImages: parseCommaSeparated(formData.get('schematicImages') as string),
      galleryImages: parseCommaSeparated(formData.get('galleryImages') as string),
      infoFields: infoFields.map((field) => ({
        label: field.label,
        value: ((formData.get(`info_${field.label.toLowerCase()}`) as string) || '').trim(),
      })),
      awards: parseLineSeparated(formData.get('awards') as string),
    }

    const { error: saveProjectError } = await saveProject(data)
    if (saveProjectError) {
      setError(saveProjectError)
      setLoading(false)
      return
    }

    const { error: saveTemplateError } = await saveProjectPageContent(slug, pageContent)
    if (saveTemplateError) {
      setError(saveTemplateError)
      setLoading(false)
      return
    }

    setSuccess('Project and page template saved successfully.')
    setTimeout(() => {
      router.push('/admin')
      router.refresh()
    }, 1000)
  }

  return (
    <div className="max-w-5xl border border-border bg-white p-6 shadow-sm md:p-8">
      <div className="mb-8 border-b border-border pb-6">
        <h2 className="text-3xl font-light text-charcoal">{project?.created_at ? 'Edit Project' : 'New Project'}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          The project page layout is locked to one responsive template. You can safely update text, choose a Three.js scene,
          and paste image URLs into the slots below without changing the overall layout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Title</label>
              <input
                required
                name="title"
                defaultValue={project?.title}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Slug (URL)</label>
              <input
                required
                name="slug"
                defaultValue={project?.slug}
                onChange={(e) => setSlugPreview(e.target.value.trim())}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Category</label>
              <select
                name="category"
                defaultValue={project?.category}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              >
                <option value="academic">Academic</option>
                <option value="freelance">Freelance</option>
                <option value="competition">Competition</option>
                <option value="research">Research</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Year</label>
              <input
                required
                type="number"
                name="year"
                defaultValue={project?.year || new Date().getFullYear()}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Location</label>
              <input
                required
                name="location"
                defaultValue={project?.location}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-muted">Short Description</label>
            <input
              required
              name="short_description"
              defaultValue={project?.short_description}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-muted">Main Description</label>
            <textarea
              required
              rows={5}
              name="description"
              defaultValue={project?.description}
              className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Tags (comma separated)</label>
              <input
                name="tags"
                defaultValue={project?.tags?.join(', ')}
                placeholder="adaptive reuse, heritage, public"
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted">
                <input type="checkbox" name="featured" defaultChecked={project?.featured} className="h-4 w-4 accent-salmon" />
                Feature on homepage
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-muted">Order</span>
                <input
                  type="number"
                  name="order_index"
                  defaultValue={project?.order_index || 0}
                  className="w-20 border border-border bg-transparent px-3 py-2 text-sm text-charcoal focus:border-charcoal focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-light text-charcoal">Template Slots</h3>
              <p className="mt-2 text-sm text-muted">Paste URLs into the dedicated fields below. This will not change the page structure.</p>
            </div>
            {driveFolderLink && (
              <a
                href={driveFolderLink}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] uppercase tracking-widest text-ink underline-offset-4 hover:underline"
              >
                Open Drive folder
              </a>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Three.js Element</label>
              <select
                name="sceneComponent"
                defaultValue={templateContent.sceneComponent}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              >
                {SCENE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Cover Image URL</label>
              <input
                name="cover_image"
                defaultValue={project?.cover_image || ''}
                placeholder="https://lh3.googleusercontent.com/d/FILE_ID"
                className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
              <p className="text-[11px] text-muted">
                Optional. If the matching Drive cover folder has public images and a Google Drive API key is configured, the first image can load automatically.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-muted">Intro Text</label>
            <textarea
              rows={4}
              name="introText"
              defaultValue={templateContent.introText}
              className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Process Text</label>
              <textarea
                rows={5}
                name="processText"
                defaultValue={templateContent.processText}
                className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Schematic Text</label>
              <textarea
                rows={5}
                name="schematicText"
                defaultValue={templateContent.schematicText}
                className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Process Image URLs</label>
              <textarea
                rows={4}
                name="processImages"
                defaultValue={textAreaValue(templateContent.processImages)}
                placeholder="url-1, url-2"
                className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
              <p className="text-[11px] text-muted">Leave blank to use the Drive process folder when available.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Schematic Image URLs</label>
              <textarea
                rows={4}
                name="schematicImages"
                defaultValue={textAreaValue(templateContent.schematicImages)}
                placeholder="url-1, url-2"
                className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
              <p className="text-[11px] text-muted">Leave blank to use the Drive wide folder when available.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-muted">Gallery Image URLs</label>
              <textarea
                rows={4}
                name="galleryImages"
                defaultValue={textAreaValue(templateContent.galleryImages)}
                placeholder="url-1, url-2, url-3"
                className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
              />
              <p className="text-[11px] text-muted">Leave blank to use the Drive gallery folder when available.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-muted">Project Gallery Images for Cards / Fallback</label>
            <textarea
              rows={3}
              name="images"
              defaultValue={project?.images?.join(', ')}
              placeholder="url-1, url-2"
              className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {infoFields.map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="block text-[10px] uppercase tracking-widest text-muted">{field.label}</label>
                <input
                  name={`info_${field.label.toLowerCase()}`}
                  defaultValue={field.value}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-muted">Project Awards (one per line, optional)</label>
            <textarea
              rows={4}
              name="awards"
              defaultValue={templateContent.awards.join('\n')}
              placeholder="Shortlisted for..."
              className="w-full resize-none border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:border-charcoal focus:outline-none"
            />
          </div>
        </section>

        {error && <p className="border border-red-100 bg-red-50 p-3 text-[10px] uppercase tracking-widest text-red-500">{error}</p>}
        {success && <p className="border border-salmon/10 bg-salmon-pale/30 p-3 text-[10px] uppercase tracking-widest text-salmon">{success}</p>}

        <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="border border-charcoal bg-charcoal px-10 py-4 text-[10px] uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-charcoal disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Project'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="border border-border px-10 py-4 text-[10px] uppercase tracking-widest transition-all duration-300 hover:bg-cream/50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
