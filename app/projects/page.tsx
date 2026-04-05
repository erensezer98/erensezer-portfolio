import type { Metadata } from 'next'
import ProjectCard from '@/components/projects/ProjectCard'
import { mergeProjectWithStatic } from '@/lib/project-data'
import { getProjects, getSiteSettings } from '@/lib/supabase'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Architectural and design projects by Eren Sezer.',
}

const EXCLUDED_SLUGS = ['awayout']

export default async function ProjectsPage() {
  let projects: Project[] = []

  try {
    const dbProjects = await getProjects()
    projects = dbProjects.filter((project) => !EXCLUDED_SLUGS.includes(project.slug))
  } catch {
    projects = []
  }

  const mergedProjects = mergeProjectWithStatic(projects).sort((a, b) => {
    if ((b.year ?? 0) !== (a.year ?? 0)) {
      return (b.year ?? 0) - (a.year ?? 0)
    }

    return (b.order_index ?? 0) - (a.order_index ?? 0)
  })

  const settings = await getSiteSettings()
  const gridCols =
    settings.projects_grid_cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="px-6 pb-32 pt-28 md:px-10">
      <p className="mb-16 text-[13px] text-muted">projects</p>

      <div className={`grid ${gridCols} gap-x-8 gap-y-14`}>
        {mergedProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  )
}
