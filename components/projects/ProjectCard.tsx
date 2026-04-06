import Link from 'next/link'
import Image from 'next/image'
import { getProjectListingImage } from '@/lib/project-listing-media'
import { getProjectCategoryLabel } from '@/lib/project-data'
import type { Project } from '@/lib/types'

export default function ProjectCard({ project }: { project: Project }) {
  const listingImage = getProjectListingImage(project)

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="aspect-[4/3] bg-warm overflow-hidden mb-4">
        {listingImage ? (
          <Image
            src={listingImage}
            alt={project.title}
            width={800}
            height={600}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        ) : (
          <div className="w-full h-full bg-warm" />
        )}
      </div>
      <p className="text-[14px] font-medium text-ink">{project.title}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">{getProjectCategoryLabel(project.category)}</p>
      <p className="text-xs text-muted mt-0.5">{project.year} — {project.location}</p>
    </Link>
  )
}
