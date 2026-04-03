import { getProjectBySlug, getProjects, getSiteSettings } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const InteractiveRelight = dynamic(
  () => import('@/components/three/InteractiveRelight'),
  { ssr: false }
)

const ArchitecturalWireframe = dynamic(
  () => import('@/components/three/ArchitecturalWireframe'),
  { ssr: false }
)

interface Props {
  params: { slug: string }
}

// ─── Static project metadata for placeholder layout ───────────────────────────

const STATIC_PROJECTS = [
  {
    slug: 'food-tower',
    title: 'The Food Tower',
    year: 2022,
    location: 'Milan, Italy',
    category: 'academic',
    short_description: 'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Skyscraper Challenge 2022.',
    tags: ['vertical farm', 'skyscraper', 'timber structure'],
    program: 'Mixed-Use / Vertical Agriculture',
    area: '42,000 m²',
    status: 'Academic Project',
    client: 'Politecnico di Milano',
    overview: 'The Food Tower proposes a self-sustaining vertical farm integrated into Milan\'s MIND innovation district. The tower combines agricultural production, food processing, and public market space within a single mass-timber structure, creating a new typology that bridges the urban and the ecological.',
    context: 'Situated at the edge of the MIND campus, the project responds to the growing demand for urban food sovereignty. By stacking productive landscapes vertically, the tower reclaims the footprint of conventional horizontal farmland while embedding food production into the heart of the city.',
  },
  {
    slug: 'the-log',
    title: 'The Log',
    year: 2021,
    location: 'Milan, Italy',
    category: 'academic',
    short_description: 'Auditorium project exploring organic timber form in Milan.',
    tags: ['auditorium', 'timber', 'acoustics'],
    program: 'Cultural / Performance',
    area: '8,500 m²',
    status: 'Academic Project',
    client: 'Politecnico di Milano',
    overview: 'The Log is an auditorium conceived as a single continuous timber form — a monolithic object carved from the landscape. Its sectional geometry is derived from acoustic performance requirements, while the exterior silhouette references the raw materiality of a fallen log, partially reclaimed by the earth.',
    context: 'Sited within a park in Milan\'s periphery, the project explores the tension between permanence and decay, between engineered precision and organic form. The mass-timber structure is left exposed throughout, allowing the material to age and weather as a living component of the architecture.',
  },
  {
    slug: 'halic-co-op',
    title: 'Haliç Co-op',
    year: 2020,
    location: 'Istanbul, Turkey',
    category: 'academic',
    short_description: 'Creative Industries Center in Goldenhorn, Istanbul. Selected by Mimdap Architecture Magazine.',
    tags: ['cultural', 'creative hub', 'istanbul'],
    program: 'Cultural / Co-Working',
    area: '14,200 m²',
    status: 'Academic Project',
    client: 'Istanbul Technical University',
    overview: 'Haliç Co-op is a creative industries center situated along the Golden Horn waterfront. The project reimagines the historic shipyard typology as a porous, community-driven workspace — a place where making, exhibiting, and exchanging ideas happen simultaneously within an open, flexible framework.',
    context: 'The Golden Horn has long been Istanbul\'s industrial spine. As the area transitions toward cultural and creative uses, Haliç Co-op proposes a building that retains the industrial scale and character of its context while introducing new programs: studios, workshops, galleries, and shared amenities open to the public.',
  },
  {
    slug: 'hungarian-csarda',
    title: 'Hungarian Csarda',
    year: 2022,
    location: 'Saemangeum, South Korea',
    category: 'freelance',
    short_description: 'Pavilion design for a festival in Saemangeum, South Korea.',
    tags: ['pavilion', 'festival', 'temporary'],
    program: 'Temporary Pavilion / Exhibition',
    area: '320 m²',
    status: 'Completed',
    client: 'Hungarian Cultural Institute',
    overview: 'The Hungarian Csarda is a temporary pavilion designed for the Saemangeum World Scout Jamboree. Drawing on the vernacular tradition of the Hungarian countryside inn, the structure reinterprets the csárda typology through lightweight timber construction — an ephemeral gathering place in an unfamiliar landscape.',
    context: 'The pavilion serves as a cultural ambassador, introducing Hungarian folk traditions — music, cuisine, and craft — to an international audience. The design balances cultural legibility with structural efficiency, using a modular timber system that could be assembled and disassembled without specialist labor.',
  },
  {
    slug: 'istanbul-a-way-out',
    title: 'Istanbul: A Way Out',
    year: 2023,
    location: 'Istanbul, Turkey',
    category: 'academic',
    short_description: 'An urban escape strategy for Istanbul — light, shadow, and threshold.',
    tags: ['urban', 'istanbul', 'light', 'installation'],
    program: 'Urban Installation / Research',
    area: 'Urban Scale',
    status: 'Academic Project',
    client: 'Politecnico di Milano',
    overview: 'Istanbul: A Way Out is an urban research project that maps the thresholds between the city\'s formal and informal fabrics — the passages, courtyards, and light-filled voids that constitute an alternative urban geography. The project proposes a series of spatial interventions that amplify these in-between conditions.',
    context: 'Istanbul\'s urban tissue is characterised by a continuous negotiation between public and private, ancient and contemporary. By tracing the city\'s light patterns across the day and season, the project reveals a hidden network of spaces that resist conventional categorisation — neither street nor building, neither public nor private.',
  },
]

// ─── Placeholder image component ─────────────────────────────────────────────

function PlaceholderImage({
  aspect = 'aspect-[4/3]',
  label,
  className = '',
}: {
  aspect?: string
  label?: string
  className?: string
}) {
  return (
    <div className={`${aspect} bg-warm flex items-center justify-center overflow-hidden ${className}`}>
      {label && (
        <p className="text-[11px] text-subtle tracking-widest uppercase select-none">{label}</p>
      )}
    </div>
  )
}

// ─── Placeholder project detail page ─────────────────────────────────────────

function PlaceholderProjectPage({
  slug,
  isFoodTower,
  isIstanbul,
}: {
  slug: string
  isFoodTower: boolean
  isIstanbul: boolean
}) {
  const project = STATIC_PROJECTS.find((p) => p.slug === slug)

  const title = project?.title ?? slug.replace(/-/g, ' ')
  const year = project?.year ?? '—'
  const location = project?.location ?? '—'
  const category = project?.category ?? '—'
  const tags = project?.tags ?? []
  const overview = project?.overview ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  const context = project?.context ?? 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  const program = project?.program ?? 'Program Type'
  const area = project?.area ?? '—'
  const status = project?.status ?? '—'
  const client = project?.client ?? '—'

  return (
    <article className="px-6 md:px-10 pt-28 pb-32">

      {/* Back */}
      <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors inline-block mb-14">
        ← projects
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <p className="text-xs text-muted capitalize mb-3">{category}</p>
          <h1 className="text-3xl md:text-5xl font-light text-ink leading-tight mb-4">
            {title}
          </h1>
          <p className="text-xs text-muted mb-6">
            {year} — {location}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="text-[11px] text-muted border border-rule px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-ink leading-relaxed">
            {overview}
          </p>
        </div>
      </div>

      {/* Three.js scene — Food Tower */}
      {isFoodTower && (
        <div className="w-full aspect-[16/7] overflow-hidden bg-white mb-4">
          <ArchitecturalWireframe />
        </div>
      )}

      {/* Three.js scene — Istanbul */}
      {isIstanbul && (
        <div className="w-full aspect-[16/7] mb-4 overflow-hidden bg-black">
          <InteractiveRelight />
        </div>
      )}

      {/* Cover image placeholder */}
      <PlaceholderImage aspect="aspect-[16/9]" label="cover image" className="mb-3" />

      {/* Overview + Project info */}
      <div className="grid md:grid-cols-[1fr_280px] gap-x-16 gap-y-12 mt-16 mb-16">
        <div>
          <p className="text-[11px] text-muted tracking-widest uppercase mb-6">Overview</p>
          <p className="text-sm text-ink leading-relaxed mb-5">
            {overview}
          </p>
          <p className="text-sm text-ink leading-relaxed">
            {context}
          </p>
        </div>

        {/* Project details table */}
        <div>
          <p className="text-[11px] text-muted tracking-widest uppercase mb-6">Project Info</p>
          <div className="border-t border-rule">
            {[
              { label: 'Program', value: program },
              { label: 'Year', value: String(year) },
              { label: 'Location', value: location },
              { label: 'Area', value: area },
              { label: 'Status', value: status },
              { label: 'Client', value: client },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-baseline border-b border-rule py-3">
                <span className="text-[11px] text-muted">{label}</span>
                <span className="text-[11px] text-ink text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image gallery — 2-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PlaceholderImage aspect="aspect-[4/3]" label="image 01" />
        <PlaceholderImage aspect="aspect-[4/3]" label="image 02" />
        <PlaceholderImage aspect="aspect-[4/3]" label="image 03" />
        <PlaceholderImage aspect="aspect-[4/3]" label="image 04" />
      </div>

      {/* Wide image */}
      <PlaceholderImage aspect="aspect-[21/9]" label="wide image" className="mt-3" />

      {/* Process / drawings section */}
      <div className="mt-20 mb-16">
        <p className="text-[11px] text-muted tracking-widest uppercase mb-10">Process & Drawings</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PlaceholderImage aspect="aspect-square" label="drawing 01" />
          <PlaceholderImage aspect="aspect-square" label="drawing 02" />
          <PlaceholderImage aspect="aspect-square" label="drawing 03" />
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-rule mt-20 pt-10 flex justify-between items-center">
        <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors">
          ← all projects
        </Link>
        <Link href="/contact" className="text-xs text-muted hover:text-ink transition-colors">
          get in touch →
        </Link>
      </div>

    </article>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const projects = await getProjects()
    return projects.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const project = await getProjectBySlug(params.slug)
    if (!project) {
      const staticProject = STATIC_PROJECTS.find((p) => p.slug === params.slug)
      return {
        title: staticProject?.title ?? 'Project',
        description: staticProject?.short_description,
      }
    }
    return { title: project.title, description: project.short_description }
  } catch {
    const staticProject = STATIC_PROJECTS.find((p) => p.slug === params.slug)
    return {
      title: staticProject?.title ?? 'Project',
      description: staticProject?.short_description,
    }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  let project = null
  try { project = await getProjectBySlug(params.slug) } catch { /* no db */ }

  const isIstanbul = params.slug === 'istanbul-a-way-out'
  const isFoodTower = params.slug === 'food-tower'
  const settings = await getSiteSettings()

  if (!project) {
    return (
      <PlaceholderProjectPage
        slug={params.slug}
        isFoodTower={isFoodTower}
        isIstanbul={isIstanbul}
      />
    )
  }

  return (
    <article className="px-6 md:px-10 pt-28 pb-32">

      {/* Back */}
      <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors inline-block mb-14">
        ← projects
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <p className="text-xs text-muted capitalize mb-3">{project.category}</p>
          <h1 className="text-3xl md:text-5xl font-light text-ink leading-tight mb-4">
            {project.title}
          </h1>
          <p className="text-xs text-muted">
            {project.year} — {project.location}
          </p>
          {settings.project_show_tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[11px] text-muted border border-rule px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-ink leading-relaxed">
            {project.description || project.short_description}
          </p>
        </div>
      </div>

      {/* Interactive scene for Istanbul project */}
      {isIstanbul && (
        <div className="w-full aspect-[16/7] mb-4 overflow-hidden bg-black">
          <InteractiveRelight />
        </div>
      )}

      {/* Cover image */}
      {project.cover_image && (
        <div className="aspect-[16/9] overflow-hidden bg-warm mb-3">
          <Image
            src={project.cover_image}
            alt={project.title}
            width={1600}
            height={900}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}

      {/* Image gallery */}
      {project.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {project.images.map((src, i) => (
            <div key={i} className="aspect-[4/3] overflow-hidden bg-warm">
              <Image
                src={src}
                alt={`${project.title} — ${i + 1}`}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer nav */}
      <div className="border-t border-rule mt-20 pt-10 flex justify-between items-center">
        <Link href="/projects" className="text-xs text-muted hover:text-ink transition-colors">
          ← all projects
        </Link>
        <Link href="/contact" className="text-xs text-muted hover:text-ink transition-colors">
          get in touch →
        </Link>
      </div>

    </article>
  )
}
