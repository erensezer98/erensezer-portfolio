export const dynamic = 'force-dynamic'

import ProjectForm from '../ProjectForm'
import { getDefaultProjectPageContent, getStaticProjectBySlug } from '@/lib/project-data'

interface Props {
  searchParams?: {
    slug?: string
  }
}

export default function NewProjectPage({ searchParams }: Props) {
  const slug = searchParams?.slug
  const project = slug ? getStaticProjectBySlug(slug) ?? undefined : undefined
  const templateContent = getDefaultProjectPageContent(project)

  return (
    <div className="mx-auto max-w-screen-xl py-12">
      <div className="mb-12">
        <p className="section-label mb-2">Backstage</p>
        <h1 className="font-serif text-5xl font-light">Inventory Management</h1>
      </div>
      <ProjectForm project={project} templateContent={templateContent} />
    </div>
  )
}
