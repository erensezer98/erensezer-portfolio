import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/types'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="aspect-[4/3] bg-warm overflow-hidden mb-4">
        {project.cover_image ? (
          <Image
            src={project.cover_image}
            alt={project.title}
            width={800}
            height={600}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        ) : (
          <div className="w-full h-full bg-warm" />
        )}
      </div>
      <p className="text-[13px] text-ink">{project.title}</p>
      <p className="text-xs text-muted mt-0.5">{project.year} — {project.location}</p>
    </Link>
  )
}
