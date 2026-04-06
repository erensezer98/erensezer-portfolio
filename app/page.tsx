import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { resolveProjectDisplayMedia } from '@/lib/drive-folder-media'
import { mergeProjectWithStatic } from '@/lib/project-data'
import { getProjectListingImage } from '@/lib/project-listing-media'
import { getProjects } from '@/lib/supabase'
import type { Project } from '@/lib/types'

const ArchitecturalWireframe = dynamic(
  () => import('@/components/three/ArchitecturalWireframe'),
  { ssr: false }
)

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
    if ((b.year ?? 0) !== (a.year ?? 0)) {
      return (b.year ?? 0) - (a.year ?? 0)
    }

    return (b.order_index ?? 0) - (a.order_index ?? 0)
  })
  const displayProjects = await Promise.all(mergedProjects.map(resolveProjectDisplayMedia))

  return (
    <div className="px-6 md:px-10">
      <section className="pt-28 pb-14">
        <h1 className="mb-4 text-[clamp(2.2rem,5.2vw,4.4rem)] font-medium leading-[1.04] tracking-[-0.04em] text-ink lowercase">
          eren sezer
        </h1>
        <p className="max-w-xs text-[15px] font-medium leading-relaxed text-muted lowercase">
          architect and designer.<br />
          based in torino, italy
        </p>
      </section>

      <section className="pb-20">
        <div className="aspect-[16/8] min-h-[280px] overflow-hidden bg-warm md:min-h-[420px]">
          <ArchitecturalWireframe />
        </div>
      </section>

      <section className="pb-32">
        <div className="mb-10 flex items-end justify-between gap-6">
          <p className="text-[13px] font-medium lowercase text-muted">selected work</p>
          <Link href="/projects" className="text-[13px] font-medium lowercase text-muted transition-colors hover:text-ink">
            all projects
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {displayProjects.map((project) => {
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
