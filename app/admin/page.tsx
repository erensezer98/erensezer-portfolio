import { getProjects } from '@/lib/supabase'
import Link from 'next/link'
import { deleteProject } from './actions'
import { revalidatePath } from 'next/cache'

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
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-2">Backstage</p>
          <h1 className="font-serif text-5xl font-light">Content Manager</h1>
        </div>
        <Link 
          href="/admin/new" 
          className="text-xs tracking-widest uppercase border border-charcoal bg-charcoal text-white px-8 py-3 hover:bg-white hover:text-charcoal transition-colors duration-300"
        >
          Add Project
        </Link>
      </div>

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg- cream/30">
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Project</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Category</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium">Year</th>
              <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-cream/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-charcoal">{project.title}</span>
                    <span className="text-[10px] text-muted tracking-tight">/{project.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 border border-border text-muted">
                    {project.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted">{project.year}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4">
                    <Link 
                      href={`/admin/edit/${project.slug}`}
                      className="text-[10px] tracking-widest uppercase text-charcoal hover:text-salmon transition-colors"
                    >
                      Edit
                    </Link>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={project.id} />
                      <button 
                        type="submit" 
                        className="text-[10px] tracking-widest uppercase text-muted hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          if (!confirm('Are you sure you want to delete this project?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted text-sm italic">
                  No projects found. Add your first one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
