'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProject } from '../actions'
import type { Project, ProjectCategory } from '@/lib/types'

interface ProjectFormProps {
  project?: Project
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const data: Partial<Project> = {
      ...(project && { id: project.id }),
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      category: formData.get('category') as ProjectCategory,
      year: parseInt(formData.get('year') as string),
      location: formData.get('location') as string,
      short_description: formData.get('short_description') as string,
      description: formData.get('description') as string,
      featured: formData.get('featured') === 'on',
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      cover_image: formData.get('cover_image') as string || null,
      images: (formData.get('images') as string).split(',').map(t => t.trim()).filter(Boolean),
      order_index: parseInt(formData.get('order_index') as string) || 0,
    }

    const { error: saveError } = await saveProject(data)
    if (saveError) {
      setError(saveError)
      setLoading(false)
    } else {
      setSuccess('Project saved successfully.')
      setTimeout(() => {
        router.push('/admin')
        router.refresh()
      }, 1000)
    }
  }

  return (
    <div className="bg-white border border-border p-8 shadow-sm max-w-3xl">
      <h2 className="font-serif text-3xl mb-8">{project ? 'Edit' : 'New'} Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title & Slug */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] tracking-widest uppercase text-muted">Title</label>
            <input required name="title" defaultValue={project?.title} className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] tracking-widest uppercase text-muted">Slug (url)</label>
            <input required name="slug" defaultValue={project?.slug} className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
          </div>
        </div>

        {/* Category & Year & Location */}
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] tracking-widest uppercase text-muted">Category</label>
            <select name="category" defaultValue={project?.category} className="w-full border border-border bg-transparent px-4 py-3 appearance-none text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors">
              <option value="academic">Academic</option>
              <option value="freelance">Freelance</option>
              <option value="competition">Competition</option>
              <option value="research">Research</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] tracking-widest uppercase text-muted">Year</label>
            <input required type="number" name="year" defaultValue={project?.year || new Date().getFullYear()} className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] tracking-widest uppercase text-muted">Location</label>
            <input required name="location" defaultValue={project?.location} className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
          </div>
        </div>

        {/* Short & Full Description */}
        <div className="space-y-2">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Short Description (for cards)</label>
          <input required name="short_description" defaultValue={project?.short_description} className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Full Description</label>
          <textarea required rows={6} name="description" defaultValue={project?.description} className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors resize-none" />
        </div>

        {/* Images & Tags */}
        <div className="space-y-2">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Cover Image URL</label>
          <input name="cover_image" defaultValue={project?.cover_image || ''} placeholder="https://..." className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Project Gallery Images (comma separated URLs)</label>
          <textarea rows={2} name="images" defaultValue={project?.images.join(', ')} placeholder="https://..., https://..." className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors resize-none" />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] tracking-widest uppercase text-muted">Tags (comma separated)</label>
          <input name="tags" defaultValue={project?.tags.join(', ')} placeholder="Tag 1, Tag 2" className="w-full border border-border bg-transparent px-4 py-3 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
        </div>

        <div className="flex items-center gap-12 pt-4">
          <div className="flex items-center gap-4">
            <input type="checkbox" name="featured" id="featured" defaultChecked={project?.featured} className="w-4 h-4 rounded-none border-border accent-salmon" />
            <label htmlFor="featured" className="text-[10px] tracking-widest uppercase text-muted select-none cursor-pointer">Feature on homepage</label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] tracking-widest uppercase text-muted">Order</label>
            <input type="number" name="order_index" defaultValue={project?.order_index || 0} className="w-16 border border-border bg-transparent px-2 py-1 text-sm text-charcoal focus:outline-none focus:border-charcoal transition-colors" />
          </div>
        </div>

        {error && <p className="text-red-500 text-[10px] tracking-widest uppercase bg-red-50 p-3 border border-red-100">{error}</p>}
        {success && <p className="text-salmon text-[10px] tracking-widest uppercase bg-salmon-pale/30 p-3 border border-salmon/10">{success}</p>}

        <div className="flex gap-4 pt-12 border-t border-border">
          <button 
            type="submit" 
            disabled={loading}
            className="text-[10px] tracking-widest uppercase border border-charcoal bg-charcoal text-white px-12 py-4 hover:bg-white hover:text-charcoal transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Project'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()}
            disabled={loading}
            className="text-[10px] tracking-widest uppercase border border-border px-12 py-4 hover:bg-cream/50 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
