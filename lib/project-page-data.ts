import { getProjectDriveMedia, resolveProjectDisplayMedia } from '@/lib/drive-folder-media'
import {
  getDefaultProjectPageContent,
  getStaticProjectBySlug,
  mergeProjectWithStatic,
} from '@/lib/project-data'
import { getProjectBySlug, getProjectPageContent, getProjects } from '@/lib/supabase'
import type { Project } from '@/lib/types'
import type { ProjectPageContent } from '@/lib/project-data'

const EXCLUDED_SLUGS = ['awayout']

export interface ResolvedProjectPageData {
  project: Project
  content: ProjectPageContent
}

export async function getAllProjectsForDisplay(): Promise<Project[]> {
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

  return Promise.all(mergedProjects.map(resolveProjectDisplayMedia))
}

export async function getResolvedProjectPageDataBySlug(slug: string): Promise<ResolvedProjectPageData | null> {
  const dbProject = await getProjectBySlug(slug)
  const staticProject = getStaticProjectBySlug(slug)
  const rawProject = dbProject ?? staticProject

  if (!rawProject || EXCLUDED_SLUGS.includes(rawProject.slug)) {
    return null
  }

  const [project, driveMedia, savedPageContent] = await Promise.all([
    resolveProjectDisplayMedia(rawProject),
    getProjectDriveMedia(slug),
    getProjectPageContent(slug),
  ])

  const defaultContent = getDefaultProjectPageContent(project)
  let detailSections = savedPageContent?.detailSections?.length
    ? savedPageContent.detailSections
    : defaultContent.detailSections

  if (detailSections && driveMedia.chapterImages && driveMedia.chapterImages.length > 0) {
    detailSections = detailSections.map((section, index) => {
      const sectionDriveImages = driveMedia.chapterImages![index] || []
      
      if (sectionDriveImages.length > 0) {
        return {
          ...section,
          images: section.images.map((img, imgIndex) => ({
            ...img,
            src: sectionDriveImages[imgIndex] || img.src,
          })),
        }
      }
      return section
    })
  }

  const isPlaceholderUrl = (url: string) => url.includes('PLACEHOLDER_')

  const filterPlaceholders = (urls: string[]) => urls.filter((url) => !isPlaceholderUrl(url))

  const content: ProjectPageContent = {
    ...defaultContent,
    ...savedPageContent,
    detailSections,
    processImages: driveMedia.processImages.length
      ? driveMedia.processImages
      : filterPlaceholders(savedPageContent?.processImages?.length
        ? savedPageContent.processImages
        : defaultContent.processImages),
    schematicImages: driveMedia.schematicImages.length
      ? driveMedia.schematicImages
      : filterPlaceholders(savedPageContent?.schematicImages?.length
        ? savedPageContent.schematicImages
        : defaultContent.schematicImages),
    galleryImages: driveMedia.galleryImages.length
      ? driveMedia.galleryImages
      : filterPlaceholders(savedPageContent?.galleryImages?.length
        ? savedPageContent.galleryImages
        : defaultContent.galleryImages),
    infoFields: savedPageContent?.infoFields?.length ? savedPageContent.infoFields : defaultContent.infoFields,
    awards: savedPageContent?.awards?.length ? savedPageContent.awards : defaultContent.awards,
  }

  return { project, content }
}

export async function getAllResolvedProjectPageData(): Promise<ResolvedProjectPageData[]> {
  const projects = await getAllProjectsForDisplay()
  const resolved = await Promise.all(projects.map((project) => getResolvedProjectPageDataBySlug(project.slug)))
  return resolved.filter((item): item is ResolvedProjectPageData => Boolean(item))
}
