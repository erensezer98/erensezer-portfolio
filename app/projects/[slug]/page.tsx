import { getProjectBySlug, getProjects } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const InteractiveRelight = dynamic(
  () => import('@/components/three/InteractiveRelight'),
  { ssr: false }
)

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
    return { title: project.title, description: project.short_description }
  } catch {
    return { title: 'Project' }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  let project = null
  try { project = await getProjectBySlug(params.slug) } catch { /* no db */ }

  const isIstanbul = params.slug === 'istanbul-a-way-out'

  if (!project) {
    return (
      <div className="px-6 md:px-10 pt-28 pb-32">
        <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors inline-block mb-12">
          ← projects
        </Link>
        <h1 className="text-2xl md:text-4xl font-light text-ink mb-4 capitalize">
          {params.slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-sm text-muted mb-16">
          Project content coming soon.
        </p>
        {isIstanbul && (
          <div className="w-full aspect-[16/7] overflow-hidden bg-black">
            <InteractiveRelight />
          </div>
        )}
      </div>
    )
  }

  return (
    <article className="px-6 md:px-10 pt-28 pb-32">

      {/* Back */}
      <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors inline-block mb-14">
        ← projects
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <p className="text-xs text-muted capitalize mb-3">{project.category}</p>
          <h1 className="text-3xl md:text-5xl font-light text-ink leading-tight mb-4">
            {project.title}
          </h1>
          <p className="text-xs text-muted">
            {project.year} — {project.location}
          </p>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-muted border border-rule px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-ink leading-relaxed">
            {project.description || project.short_description}
          </p>
        </div>
      </div>

      {/* Interactive scene for Istanbul project */}
      {isIstanbul && (
        <div className="w-full aspect-[16/7] mb-4 overflow-hidden bg-black">
          <InteractiveRelight />
        </div>
      )}

      {/* Cover image */}
      {project.cover_image && (
        <div className="aspect-[16/9] overflow-hidden bg-warm mb-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {project.images.map((src, i) => (
            <div key={i} className="aspect-[4/3] overflow-hidden bg-warm">
              <Image
                src={src}
                alt={`${project.title} — ${i + 1}`}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer nav */}
      <div className="border-t border-rule mt-20 pt-10 flex justify-between items-center">
        <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors">
          ← all projects
        </Link>
        <Link href="/contact" className="text-xs text-muted hover:text-ink transition-colors">
          get in touch →
        </Link>
      </div>

    </article>
  )
}
