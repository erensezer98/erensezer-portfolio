import Link from 'next/link'
import Image from 'next/image'
import { getProjects, getSiteSettings, getPageContent, getTextStyles } from '@/lib/supabase'
import type { Project } from '@/lib/types'
import PageRenderer from '@/components/page-renderer/PageRenderer'

const FALLBACK: Project[] = [
  { id: '1', slug: 'food-tower',        title: 'The Food Tower',       year: 2022, location: 'Milan, Italy',    category: 'academic',  short_description: 'Vertical farm and factory in the MIND district. Shortlisted for Skyhive 2022.', description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 1, created_at: '' },
  { id: '2', slug: 'the-log',           title: 'The Log',              year: 2021, location: 'Milan, Italy',    category: 'academic',  short_description: 'Auditorium exploring organic timber form.',                                     description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 2, created_at: '' },
  { id: '3', slug: 'halic-co-op',       title: 'Haliç Co-op',          year: 2020, location: 'Istanbul, Turkey',category: 'academic',  short_description: 'Creative Industries Center in Goldenhorn. Published in Mimdap Magazine.',        description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 3, created_at: '' },
  { id: '4', slug: 'hungarian-csarda',  title: 'Hungarian Csarda',     year: 2022, location: 'South Korea',     category: 'freelance', short_description: 'Pavilion design for a festival in Saemangeum.',                                  description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 4, created_at: '' },
  { id: '5', slug: 'istanbul-a-way-out',title: 'Istanbul: A Way Out',  year: 2023, location: 'Istanbul, Turkey',category: 'academic',  short_description: 'An urban escape strategy — light, shadow, and threshold.',                      description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 5, created_at: '' },
]

export default async function HomePage() {
  const [settings, pageContent, textStyles] = await Promise.all([
    getSiteSettings(),
    getPageContent('home'),
    getTextStyles(),
  ])

  // If there's custom block content from the page editor, render that exclusively
  if (pageContent?.blocks?.length) {
    return (
      <div className="pt-24 pb-32 flex flex-col items-center">
        <PageRenderer blocks={pageContent.blocks} textStyles={textStyles} />
      </div>
    )
  }

  let projects: Project[] = []
  try { projects = await getProjects() } catch { /* use fallback */ }
  if (!projects.length) projects = FALLBACK

  const heroPadding  = settings.home_hero_size === 'large' ? 'pt-36 pb-28' : 'pt-24 pb-16'
  const gridCols     = settings.home_grid_cols === 1
    ? 'grid-cols-1'
    : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className="px-6 md:px-10">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={`${heroPadding}`}>
        <h1 className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-light text-ink leading-[1.08] tracking-tight mb-5">
          Eren Sezer
        </h1>
        <p className="text-muted text-sm max-w-xs leading-relaxed">
          Architect and digital designer.<br />
          Master of Building Architecture,<br />
          Politecnico di Milano.
        </p>
      </section>

      {/* ── Projects grid ────────────────────────────────────────── */}
      <section className="pb-32">
        <div className={`grid ${gridCols} gap-x-8 gap-y-14`}>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              className="group block"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-warm overflow-hidden mb-4">
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={p.title}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                ) : (
                  <div className="w-full h-full bg-warm" />
                )}
              </div>

              {/* Meta */}
              <p className="text-[13px] text-ink">{p.title}</p>
              <p className="text-xs text-muted mt-0.5">{p.year} — {p.location}</p>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
