export const dynamic = 'force-dynamic'

import { getProjectBySlug } from '@/lib/supabase'
import { getProjectPageContent } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProjectForm from '../../ProjectForm'
import { getDefaultProjectPageContent } from '@/lib/project-data'

interface Props {
  params: { slug: string }
}

export default async function EditProjectPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug)
  
  if (!project) {
    notFound()
  }

  const defaultContent = getDefaultProjectPageContent(project)
  const savedContent = await getProjectPageContent(params.slug)

  const templateContent = {
    ...defaultContent,
    ...savedContent,
    detailSections: savedContent?.detailSections?.length
      ? savedContent.detailSections
      : defaultContent.detailSections,
  }

  return (
    <div className="max-w-screen-xl mx-auto py-12">
      <div className="mb-12">
        <p className="section-label mb-2">Backstage</p>
        <h1 className="font-serif text-5xl font-light">Inventory Management</h1>
      </div>
      <ProjectForm key={project.id} project={project} templateContent={templateContent} />
    </div>
  )
}
