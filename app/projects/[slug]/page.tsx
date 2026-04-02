import { getProjectBySlug, getProjects } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const projects = await getProjects()
    return projects.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const project = await getProjectBySlug(params.slug)
    if (!project) return { title: 'Project' }
    return {
      title: project.title,
      description: project.short_description,
    }
  } catch {
    return { title: 'Project' }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  let project = null
  try {
    project = await getProjectBySlug(params.slug)
  } catch {
    // Supabase not configured
  }

  if (!project) {
    // Show a placeholder when not connected to Supabase yet
    return (
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors mb-12"
        >
          ← Back to Projects
        </Link>
        <div className="max-w-2xl">
          <p className="section-label mb-4">Project</p>
          <h1 className="page-heading mb-6 capitalize">{params.slug.replace(/-/g, ' ')}</h1>
          <p className="text-muted text-sm">
            Connect Supabase and add your project content to see the full detail view.
          </p>
        </div>
      </div>
    )
  }

  return (
    <article className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
      {/* Back */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors mb-12"
      >
        ← All Projects
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-16 mb-16">
        <div>
          <p className="section-label mb-4 capitalize">{project.category}</p>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-charcoal leading-tight mb-6">
            {project.title}
          </h1>
          <p className="text-muted text-sm mb-8">
            {project.year} · {project.location}
          </p>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-charcoal/80 leading-relaxed text-base">
            {project.description || project.short_description}
          </p>
        </div>
      </div>

      {/* Cover image */}
      {project.cover_image && (
        <div className="aspect-[16/9] overflow-hidden bg-cream mb-4">
          <Image
            src={project.cover_image}
            alt={project.title}
            width={1600}
            height={900}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}

      {/* Image gallery */}
      {project.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {project.images.map((src, i) => (
            <div key={i} className="aspect-[4/3] overflow-hidden bg-cream">
              <Image
                src={src}
                alt={`${project.title} — image ${i + 1}`}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Navigation to adjacent projects */}
      <div className="divider mt-20 mb-10" />
      <div className="flex justify-between items-center">
        <Link
          href="/projects"
          className="text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors"
        >
          ← All Projects
        </Link>
        <Link
          href="/contact"
          className="text-xs tracking-widest uppercase text-muted hover:text-salmon transition-colors"
        >
          Get in touch →
        </Link>
      </div>
    </article>
  )
}
