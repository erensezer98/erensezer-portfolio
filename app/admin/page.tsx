export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteButton from './DeleteButton'
import ResetPiazzaButton from './ResetPiazzaButton'
import DriveFoldersPanel from './DriveFoldersPanel'
import { deleteProject } from './actions'
import { isPlaceholderDriveValue, PROJECT_DRIVE_FIELDS } from '@/lib/drive-folder-settings'
import { getProjects, getSiteSettings } from '@/lib/supabase'
import { DRIVE_FOLDERS } from '@/lib/project-images'
import { STATIC_PROJECTS } from '@/lib/project-data'

const EXCLUDED_SLUGS = ['awayout']

const driveLinkFor = (slug: string, folderId?: string | null) => {
  if (folderId && !isPlaceholderDriveValue(folderId)) {
    return `https://drive.google.com/drive/folders/${folderId}`
  }

  const entry = DRIVE_FOLDERS[slug as keyof typeof DRIVE_FOLDERS]
  if (!entry || typeof entry === 'string') return null
  return `https://drive.google.com/drive/folders/${entry.folder}`
}

export default async function AdminDashboard() {
  const settings = await getSiteSettings()
  const projects = (await getProjects()).filter((project) => !EXCLUDED_SLUGS.includes(project.slug))

  async function handleDelete(formData: FormData) {
    'use server'

    const id = formData.get('id') as string
    if (!id) return

    await deleteProject(id)
    revalidatePath('/admin')
    revalidatePath('/projects')
  }

  const staticRows = STATIC_PROJECTS.filter(
    (staticProject) => !projects.some((project) => project.slug === staticProject.slug)
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">admin / projects</p>
          <h1 className="text-4xl font-light text-ink">Content Manager</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Every project page now uses one fixed template. Add and edit content here without affecting the overall layout.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/portfolio"
            className="inline-flex items-center justify-center border border-rule bg-white px-6 py-2.5 text-xs uppercase tracking-widest text-ink transition-colors duration-200 hover:border-ink"
          >
            Generate Portfolio
          </Link>
          <Link
            href="/admin/new"
            className="inline-flex items-center justify-center border border-ink bg-ink px-6 py-2.5 text-xs uppercase tracking-widest text-white transition-colors duration-200 hover:bg-white hover:text-ink"
          >
            Add Project
          </Link>
        </div>
      </div>

      <div className="overflow-hidden border border-rule bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-rule bg-warm/40">
                <th className="px-6 py-4 text-xs font-normal uppercase tracking-widest text-muted">Project</th>
                <th className="px-6 py-4 text-xs font-normal uppercase tracking-widest text-muted">Category</th>
                <th className="px-6 py-4 text-xs font-normal uppercase tracking-widest text-muted">Year</th>
                <th className="px-6 py-4 text-xs font-normal uppercase tracking-widest text-muted">Drive</th>
                <th className="px-6 py-4 text-right text-xs font-normal uppercase tracking-widest text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {projects.map((project) => {
                const fieldConfig = PROJECT_DRIVE_FIELDS.find((entry) => entry.slug === project.slug)
                const driveLink = driveLinkFor(project.slug, fieldConfig ? String(settings[fieldConfig.fields.folder] ?? '') : null)

                return (
                  <tr key={project.id} className="transition-colors hover:bg-warm/30">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-ink">{project.title}</span>
                        <span className="text-[10px] tracking-tight text-muted">/{project.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block border border-rule px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted">{project.year}</td>
                    <td className="px-6 py-4 text-xs">
                      {driveLink ? (
                        <a
                          href={driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] uppercase tracking-widest text-ink hover:underline"
                        >
                          Open Drive
                        </a>
                      ) : (
                        <span className="text-[10px] uppercase tracking-widest text-muted">Drive link pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-4">
                        <Link
                          href={`/admin/edit/${project.slug}`}
                          className="text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-ink"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={project.id} action={handleDelete} />
                      </div>
                    </td>
                  </tr>
                )
              })}

              {staticRows.map((project) => {
                const fieldConfig = PROJECT_DRIVE_FIELDS.find((entry) => entry.slug === project.slug)
                const driveLink = driveLinkFor(project.slug, fieldConfig ? String(settings[fieldConfig.fields.folder] ?? '') : null)

                return (
                  <tr key={project.slug} className="bg-warm/20">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-ink">{project.title}</span>
                        <span className="text-[10px] tracking-tight text-muted">/{project.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block border border-rule px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted">{project.year}</td>
                    <td className="px-6 py-4 text-xs">
                      {driveLink ? (
                        <a
                          href={driveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] uppercase tracking-widest text-ink hover:underline"
                        >
                          Open Drive
                        </a>
                      ) : (
                        <span className="text-[10px] uppercase tracking-widest text-muted">Drive link pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/new?slug=${project.slug}`}
                        className="text-[10px] uppercase tracking-widest text-ink hover:underline"
                      >
                        Create entry
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {!projects.length && !staticRows.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">
                    No projects found. Add your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DriveFoldersPanel initialSettings={settings} />

      {/* Digital Piazza */}
      <div className="border border-rule bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">digital piazza</p>
            <p className="mt-1 text-sm text-muted">Reset all accumulated cursor tallies from visitor interactions.</p>
          </div>
          <ResetPiazzaButton />
        </div>
      </div>
    </div>
  )
}
