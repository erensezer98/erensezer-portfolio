import Link from 'next/link'
import Image from 'next/image'
import { getProjects, getSiteSettings } from '@/lib/supabase'
import type { Project } from '@/lib/types'

const FALLBACK: Project[] = [
  { id: '1', slug: 'food-tower',          title: 'The Food Tower',       year: 2022, location: 'Milan, Italy',    category: 'academic',  short_description: 'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Challenge.',      description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 1, created_at: '' },
  { id: '2', slug: 'the-log',           title: 'The Log',              year: 2021, location: 'Milan, Italy',    category: 'academic',  short_description: 'Auditorium exploring organic timber form.',                                     description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 2, created_at: '' },
  { id: '3', slug: 'halic-co-op',       title: 'Haliç Co-op',          year: 2020, location: 'Istanbul, Turkey',category: 'academic',  short_description: 'Creative Industries Center in Goldenhorn. Published in Mimdap Magazine.',        description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 3, created_at: '' },
  { id: '5', slug: 'istanbul-a-way-out',title: 'Istanbul: A Way Out',  year: 2023, location: 'Istanbul, Turkey',category: 'academic',  short_description: 'An urban escape strategy — light, shadow, and threshold.',                      description: '', tags: [], cover_image: null, images: [], featured: true,  order_index: 5, created_at: '' },
  { id: '6', slug: 'unfolding-landscapes', title: 'Unfolding Landscapes', year: 2024, location: 'Reuse of the Thermae, Italy', category: 'competition', short_description: 'Reactivating the Thermae of Curiga through layered topography and cultural programming.', description: 'Unfolding Landscapes reimagines the Thermae of Curiga as an open, flowing topography that folds over the archaeological remnants, animating old terraces with new public routes and cultural pavilions.', tags: ['adaptive reuse','landscape','heritage','public'], cover_image: 'https://lh3.googleusercontent.com/d/USERFILE', images: [], featured: true, order_index: 6, created_at: '' },
]

export default async function HomePage() {
  let projects: Project[] = []
  try { 
    const dbProjects = await getProjects()
    // Remove the unwanted projects
    const EXCLUDED_SLUGS = ['awayout']
    projects = dbProjects.filter(p => !EXCLUDED_SLUGS.includes(p.slug))
  } catch {
    console.warn('Failed to fetch home projects, using fallbacks')
  }

  // Ensure our high-quality static projects are always present and not duplicated
  const mergedProjects = [...projects]
  FALLBACK.forEach(staticProj => {
    const exists = mergedProjects.some(p => p.slug === staticProj.slug)
    if (!exists) {
      mergedProjects.push(staticProj)
    }
  })
  
  // Final list: Sorted by Year DESC, then Order Index DESC (Newest first)
  projects = mergedProjects.sort((a, b) => {
    if ((b.year ?? 0) !== (a.year ?? 0)) {
      return (b.year ?? 0) - (a.year ?? 0)
    }
    return (b.order_index ?? 0) - (a.order_index ?? 0)
  })

  const settings = await getSiteSettings()

  const heroPadding  = settings.home_hero_size === 'large' ? 'pt-36 pb-28' : 'pt-24 pb-16'
  const gridCols     = settings.home_grid_cols === 1
    ? 'grid-cols-1'
    : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className="px-6 md:px-10">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={`${heroPadding}`}>
        <h1 className="text-[clamp(2.6rem,6.5vw,5.5rem)] font-light text-ink leading-[1.08] tracking-tight mb-5">
          eren sezer
        </h1>
        <p className="text-muted text-sm max-w-xs leading-relaxed">
          Architect and designer.<br />
          Based in Torino, Italy
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
