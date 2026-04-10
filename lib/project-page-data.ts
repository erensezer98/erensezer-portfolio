import { getProjectDriveMedia, resolveProjectDisplayMedia, listPublicFolderImages } from '@/lib/drive-folder-media'
import { protectGoogleDriveImageUrl } from '@/lib/gdrive'
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
    return (a.order_index ?? 0) - (b.order_index ?? 0)
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

  const isPlaceholderUrl = (url: string) => !url || url.includes('PLACEHOLDER_') || url.includes('USERFILE')

  if (detailSections) {
    const fromFolderIdImages = await Promise.all(
      detailSections.map((section) =>
        section.driveFolderId
          ? listPublicFolderImages(section.driveFolderId, 10).catch(() => [])
          : Promise.resolve([])
      )
    )

    detailSections = detailSections.map((section, index) => {
      const sectionDriveImages = fromFolderIdImages[index] || []

      const filledImages = section.images.map((img, imgIndex) => ({
        ...img,
        src: sectionDriveImages[imgIndex] || img.src,
      }))
      const extraImages = sectionDriveImages.slice(section.images.length).map((src) => ({
        src,
        alt: section.title,
        aspectRatio: '4/3' as const,
      }))

      const finalImages = [...filledImages, ...extraImages].filter(img => !isPlaceholderUrl(img.src as string))

      return {
        ...section,
        images: finalImages,
      }
    }).filter(section => section.images.length > 0)
  }

  const filterPlaceholders = (urls: string[]) => urls.filter((url) => !isPlaceholderUrl(url))
  const normalizeUrls = (urls: string[]) =>
    filterPlaceholders(urls).map((url) => protectGoogleDriveImageUrl(url) ?? url)

  const content: ProjectPageContent = {
    ...defaultContent,
    ...savedPageContent,
    detailSections,
    processImages: driveMedia.processImages.length
      ? driveMedia.processImages
      : normalizeUrls(savedPageContent?.processImages?.length
        ? savedPageContent.processImages
        : defaultContent.processImages),
    schematicImages: driveMedia.schematicImages.length
      ? driveMedia.schematicImages
      : normalizeUrls(savedPageContent?.schematicImages?.length
        ? savedPageContent.schematicImages
        : defaultContent.schematicImages),
    galleryImages: driveMedia.galleryImages.length
      ? driveMedia.galleryImages
      : normalizeUrls(savedPageContent?.galleryImages?.length
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
