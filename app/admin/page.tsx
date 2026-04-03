export const dynamic = 'force-dynamic'

import { getProjects } from '@/lib/supabase'
import Link from 'next/link'
import { deleteProject } from './actions'
import { revalidatePath } from 'next/cache'
import DeleteButton from './DeleteButton'

export default async function AdminDashboard() {
  const projects = await getProjects()

  async function handleDelete(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    if (id) {
      await deleteProject(id)
      revalidatePath('/admin')
      revalidatePath('/projects')
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted mb-2">admin / projects</p>
          <h1 className="text-4xl font-light text-ink">Content Manager</h1>
        </div>
        <Link
          href="/admin/new"
          className="text-xs tracking-widest uppercase border border-ink bg-ink text-white px-6 py-2.5 hover:bg-white hover:text-ink transition-colors duration-200"
        >
          Add Project
        </Link>
      </div>

      <div className="bg-white border border-rule overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-rule bg-warm/40">
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Project</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Category</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Year</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-warm/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[13px] text-ink">{project.title}</span>
                    <span className="text-[10px] text-muted tracking-tight">/{project.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-rule text-muted">
                    {project.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted">{project.year}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/edit/${project.slug}`}
                      className="text-[10px] tracking-widest uppercase text-muted hover:text-ink transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={project.id} action={handleDelete} />
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted text-sm">
                  No projects yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
