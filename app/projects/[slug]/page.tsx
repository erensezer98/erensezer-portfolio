export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import ProjectDetailTemplate from '@/components/projects/ProjectDetailTemplate'
import { getResolvedProjectPageDataBySlug } from '@/lib/project-page-data'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  noStore()
  const resolved = await getResolvedProjectPageDataBySlug(params.slug)
  const project = resolved?.project ?? null

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
  const resolved = await getResolvedProjectPageDataBySlug(params.slug)

  if (!resolved) {
    notFound()
  }

  return <ProjectDetailTemplate project={resolved.project} content={resolved.content} />
}
