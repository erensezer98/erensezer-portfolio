import type { Project } from '@/lib/types'

export function getProjectListingImage(project: Project): string | null {
  if (project.slug === 'istanbul-a-way-out') {
    return project.images[0] ?? project.cover_image
  }

  return project.cover_image
}
