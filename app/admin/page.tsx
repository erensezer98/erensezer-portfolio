export const dynamic = 'force-dynamic'

import { getProjects } from '@/lib/supabase'
import Link from 'next/link'
import { deleteProject } from './actions'
import { revalidatePath } from 'next/cache'
import DeleteButton from './DeleteButton'
import { DRIVE_FOLDERS } from '@/lib/project-images'
import type { Project } from '@/lib/types'

const STATIC_ADMIN_PROJECTS: Project[] = [
  {
    id: 'static-unfolding-landscapes',
    slug: 'unfolding-landscapes',
    title: 'Unfolding Landscapes',
    year: 2024,
    location: 'Reuse of the Thermae, Italy',
    category: 'competition',
    short_description: 'Reactivating the Thermae of Curiga through layered topography and cultural programming.',
    description: '',
    tags: ['adaptive reuse', 'landscape', 'heritage', 'public'],
    cover_image: 'https://lh3.googleusercontent.com/d/USERFILE',
    images: [],
    featured: true,
    order_index: 6,
    created_at: '',
  },
]

const driveLinkFor = (slug: string) => {
  const entry = DRIVE_FOLDERS[slug as keyof typeof DRIVE_FOLDERS]
  if (!entry || typeof entry === 'string') return null
  return `https://drive.google.com/drive/folders/${entry.folder}`
}

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

  const staticRows = STATIC_ADMIN_PROJECTS.filter(staticProject => {
    return !projects.some((existing) => existing.slug === staticProject.slug)
  })

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
                <th className="px-6 py-4 text-xs tracking-widest uppercase text-muted font-normal">Drive</th>
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
                <td className="px-6 py-4 text-xs">
                  {(() => {
                    const driveLink = driveLinkFor(project.slug)
                    return driveLink ? (
                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] tracking-widest uppercase text-ink hover:underline"
                      >
                        Open Drive
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted uppercase tracking-widest">
                        Drive link pending
                      </span>
                    )
                  })()}
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
            {staticRows.map((project) => (
              <tr key={project.id} className="bg-warm/30">
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
                <td className="px-6 py-4 text-xs">
                  {driveLinkFor(project.slug) ? (
                    <a
                      href={driveLinkFor(project.slug)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] tracking-widest uppercase text-ink hover:underline"
                    >
                      Open Drive
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted uppercase tracking-widest">
                      Drive link pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/new?slug=${project.slug}`}
                    className="text-[10px] tracking-widest uppercase text-ink hover:underline"
                  >
                    Create entry
                  </Link>
                </td>
              </tr>
            ))}
            {staticRows.map((project) => (
              <tr key={project.id} className="bg-warm/40">
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
                  <span className="text-[10px] tracking-widest uppercase text-muted">
                    Static preview — add via admin to edit
                  </span>
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
