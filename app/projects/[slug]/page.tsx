import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProjectDetailTemplate from '@/components/projects/ProjectDetailTemplate'
import {
  getDefaultProjectPageContent,
  getStaticProjectBySlug,
  KNOWN_PROJECT_SLUGS,
} from '@/lib/project-data'
import { getProjectBySlug, getProjectPageContent, getProjects } from '@/lib/supabase'

interface Props {
  params: { slug: string }
}

const EXCLUDED_SLUGS = ['awayout']

export async function generateStaticParams() {
  try {
    const projects = await getProjects()
    const dbSlugs = projects
      .map((project) => project.slug)
      .filter((slug) => !EXCLUDED_SLUGS.includes(slug))

    const allSlugs = Array.from(new Set([...KNOWN_PROJECT_SLUGS, ...dbSlugs]))
    return allSlugs.map((slug) => ({ slug }))
  } catch {
    return KNOWN_PROJECT_SLUGS.map((slug) => ({ slug }))
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = (await getProjectBySlug(params.slug)) ?? getStaticProjectBySlug(params.slug)

  if (!project) {
    return { title: 'Project' }
  }

  return {
    title: project.title,
    description: project.short_description,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const dbProject = await getProjectBySlug(params.slug)
  const staticProject = getStaticProjectBySlug(params.slug)
  const project = dbProject ?? staticProject

  if (!project || EXCLUDED_SLUGS.includes(project.slug)) {
    notFound()
  }

  const savedPageContent = await getProjectPageContent(params.slug)
  const defaultContent = getDefaultProjectPageContent(project)
  const mergedContent = {
    ...defaultContent,
    ...savedPageContent,
    processImages: savedPageContent?.processImages?.length ? savedPageContent.processImages : defaultContent.processImages,
    schematicImages: savedPageContent?.schematicImages?.length ? savedPageContent.schematicImages : defaultContent.schematicImages,
    galleryImages: savedPageContent?.galleryImages?.length ? savedPageContent.galleryImages : defaultContent.galleryImages,
    infoFields: savedPageContent?.infoFields?.length ? savedPageContent.infoFields : defaultContent.infoFields,
    awards: savedPageContent?.awards?.length ? savedPageContent.awards : defaultContent.awards,
  }

  return <ProjectDetailTemplate project={project} content={mergedContent} />
}
