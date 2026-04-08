
import Image from 'next/image'
import Link from 'next/link'
import { resolveProjectDisplayMedia } from '@/lib/drive-folder-media'
import { mergeProjectWithStatic } from '@/lib/project-data'
import { getProjectListingImage } from '@/lib/project-listing-media'
import { getProjects } from '@/lib/supabase'
import type { Project } from '@/lib/types'

import DigitalPiazzaHero from '@/components/hero/DigitalPiazzaHero'

const EXCLUDED_SLUGS = ['awayout']

export default async function HomePage() {
  let projects: Project[] = []

  try {
    const dbProjects = await getProjects()
    projects = dbProjects.filter((project) => !EXCLUDED_SLUGS.includes(project.slug))
  } catch {
    projects = []
  }

  const mergedProjects = mergeProjectWithStatic(projects).sort((a, b) => {
    return (a.order_index ?? 0) - (b.order_index ?? 0)
  })
  const displayProjects = await Promise.all(mergedProjects.map(resolveProjectDisplayMedia))

  return (
    <div>
      <DigitalPiazzaHero />

      <section className="bg-white px-6 md:px-10 pb-32 pt-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <p className="text-[13px] font-medium lowercase text-muted">selected work</p>
          <Link href="/projects" className="text-[13px] font-medium lowercase text-muted transition-colors hover:text-ink">
            all projects
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {displayProjects.filter((p) => p.featured).map((project) => {
            const listingImage = getProjectListingImage(project)

            return (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="group block">
              <div className="aspect-square overflow-hidden border border-rule bg-warm">
                {listingImage ? (
                  <Image
                    src={listingImage}
                    alt={project.title}
                    width={900}
                    height={900}
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-[11px] tracking-widest text-subtle lowercase">{project.title}</span>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <p className="text-[14px] font-medium text-ink">{project.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {project.year} — {project.location}
                </p>
              </div>
            </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
