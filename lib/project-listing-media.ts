import { protectGoogleDriveImageUrl } from '@/lib/gdrive'
import type { Project } from '@/lib/types'

export function getProjectListingImage(project: Project): string | null {
  if (project.slug === 'istanbul-a-way-out') {
    return protectGoogleDriveImageUrl('https://lh3.googleusercontent.com/d/1gogKnlYRRooQJXJk4gXVxZaCQRisx2Pa')
  }

  return project.cover_image
}
