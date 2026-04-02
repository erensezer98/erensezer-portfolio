import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
}

export default function ProjectCard({ project }: Props) {
  return (
    <Link href={`/projects/${project.slug}`} className="project-card group block">
      {/* Image */}
      <div className="card-image aspect-[4/3] mb-4 bg-cream">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.title}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-muted opacity-50">
              {project.title}
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-sans font-medium text-charcoal group-hover:text-salmon transition-colors duration-200 truncate">
            {project.title}
          </h3>
          <p className="text-sm text-muted mt-0.5">
            {project.year} · {project.location}
          </p>
          {project.short_description && (
            <p className="text-sm text-muted/70 mt-2 line-clamp-2 leading-relaxed">
              {project.short_description}
            </p>
          )}
        </div>
        <span className="tag shrink-0 capitalize mt-0.5">{project.category}</span>
      </div>
    </Link>
  )
}
