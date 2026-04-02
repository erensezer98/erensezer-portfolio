import ProjectCard from './ProjectCard'
import type { Project, ProjectCategory } from '@/lib/types'

interface Props {
  projects: Project[]
  activeCategory?: ProjectCategory | 'all'
}

export default function ProjectGrid({ projects, activeCategory = 'all' }: Props) {
  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted py-16 text-center">
        No projects found in this category.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
      {filtered.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
