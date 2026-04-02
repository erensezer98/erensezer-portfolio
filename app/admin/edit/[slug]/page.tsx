import { getProjectBySlug } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ProjectForm from '../../ProjectForm'

interface Props {
  params: { slug: string }
}

export default async function EditProjectPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug)
  
  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-screen-xl mx-auto py-12">
      <div className="mb-12">
        <p className="section-label mb-2">Backstage</p>
        <h1 className="font-serif text-5xl font-light">Inventory Management</h1>
      </div>
      <ProjectForm project={project} />
    </div>
  )
}
