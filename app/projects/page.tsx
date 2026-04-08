import type { Metadata } from 'next'
import ProjectCard from '@/components/projects/ProjectCard'
import { getProjectCategoryLabel } from '@/lib/project-data'
import { getSiteSettings } from '@/lib/supabase'
import { getAllProjectsForDisplay } from '@/lib/project-page-data'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Architectural and design projects by Eren Sezer.',
  alternates: {
    canonical: '/projects',
  },
}

export default async function ProjectsPage() {
  const displayProjects = await getAllProjectsForDisplay()
  const personalProjects = displayProjects.filter((project) => project.category !== 'involvement')
  const involvementProjects = displayProjects.filter((project) => project.category === 'involvement')

  const settings = await getSiteSettings()
  const gridCols =
    settings.projects_grid_cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="px-6 pb-32 pt-28 md:px-10">
      <header className="mb-16">
        <h1 className="text-[13px] text-muted">projects</h1>
      </header>

      <section>
        <div className="mb-8">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted">Personal Projects</h2>
          <p className="mt-3 text-2xl font-medium text-ink">Independent and authored work</p>
        </div>
        <div className={`grid ${gridCols} gap-x-8 gap-y-14`}>
          {personalProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {involvementProjects.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-muted">{getProjectCategoryLabel('involvement')}s</h2>
            <p className="mt-3 text-2xl font-medium text-ink">Selected projects delivered as part of wider teams and offices</p>
          </div>
          <div className={`grid ${gridCols} gap-x-8 gap-y-14`}>
            {involvementProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
