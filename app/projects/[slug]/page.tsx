export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import ProjectDetailTemplate from '@/components/projects/ProjectDetailTemplate'
import { getProjectDriveMedia, resolveProjectDisplayMedia } from '@/lib/drive-folder-media'
import {
  getDefaultProjectPageContent,
  getStaticProjectBySlug,
} from '@/lib/project-data'
import { getProjectBySlug, getProjectPageContent } from '@/lib/supabase'

interface Props {
  params: { slug: string }
}

const EXCLUDED_SLUGS = ['awayout']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  noStore()
  const rawProject = (await getProjectBySlug(params.slug)) ?? getStaticProjectBySlug(params.slug)
  const project = rawProject ? await resolveProjectDisplayMedia(rawProject) : null

  if (!project) {
    return { title: 'Project' }
  }

  return {
    title: project.title,
    description: project.short_description,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  noStore()
  const dbProject = await getProjectBySlug(params.slug)
  const staticProject = getStaticProjectBySlug(params.slug)
  const rawProject = dbProject ?? staticProject

  if (!rawProject || EXCLUDED_SLUGS.includes(rawProject.slug)) {
    notFound()
  }

  const [project, driveMedia] = await Promise.all([
    resolveProjectDisplayMedia(rawProject),
    getProjectDriveMedia(params.slug),
  ])

  const savedPageContent = await getProjectPageContent(params.slug)
  const defaultContent = getDefaultProjectPageContent(project)
  const mergedContent = {
    ...defaultContent,
    ...savedPageContent,
    processImages: driveMedia.processImages.length
      ? driveMedia.processImages
      : savedPageContent?.processImages?.length
        ? savedPageContent.processImages
        : defaultContent.processImages,
    schematicImages: driveMedia.schematicImages.length
      ? driveMedia.schematicImages
      : savedPageContent?.schematicImages?.length
        ? savedPageContent.schematicImages
        : defaultContent.schematicImages,
    galleryImages: driveMedia.galleryImages.length
      ? driveMedia.galleryImages
      : savedPageContent?.galleryImages?.length
        ? savedPageContent.galleryImages
        : defaultContent.galleryImages,
    infoFields: savedPageContent?.infoFields?.length ? savedPageContent.infoFields : defaultContent.infoFields,
    awards: savedPageContent?.awards?.length ? savedPageContent.awards : defaultContent.awards,
  }

  return <ProjectDetailTemplate project={project} content={mergedContent} />
}
