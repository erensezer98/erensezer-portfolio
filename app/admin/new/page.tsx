export const dynamic = 'force-dynamic'

import ProjectForm from '../ProjectForm'

export default function NewProjectPage() {
  return (
    <div className="max-w-screen-xl mx-auto py-12">
      <div className="mb-12">
        <p className="section-label mb-2">Backstage</p>
        <h1 className="font-serif text-5xl font-light">Inventory Management</h1>
      </div>
      <ProjectForm />
    </div>
  )
}
