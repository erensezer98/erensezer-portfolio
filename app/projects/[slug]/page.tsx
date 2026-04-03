import { getProjectBySlug, getProjects, getSiteSettings } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const InteractiveRelight = dynamic(
  () => import('@/components/three/InteractiveRelight'),
  { ssr: false }
)

const TheLogScene = dynamic(
  () => import('@/components/three/TheLogScene'),
  { ssr: false }
)

const ExplodedAxonometry = dynamic(
  () => import('@/components/three/ExplodedAxonometry'),
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
    short_description: 'Pavilion design for the World Scout Jamboree in Saemangeum, South Korea.',
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

// ─── Exports ──────────────────────────────────────────────────────────────────

// Always pre-render these slugs — DB slugs are merged in at build time
const KNOWN_SLUGS = [
  'the-log',
  'halic-co-op',
  'istanbul-a-way-out',
]

export async function generateStaticParams() {
  try {
    const projects = await getProjects()
    const dbSlugs = projects.map((p) => p.slug).filter(s => !['awayout', 'food-tower', 'hungarian-csarda'].includes(s))
    const allSlugs = Array.from(new Set([...KNOWN_SLUGS, ...dbSlugs]))
    return allSlugs.map((slug) => ({ slug }))
  } catch {
    return KNOWN_SLUGS.map((slug) => ({ slug }))
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
  let dbProject = null
  try { dbProject = await getProjectBySlug(params.slug) } catch { /* no db */ }

  const staticEnrichment = STATIC_PROJECTS.find((p) => p.slug === params.slug)
  const settings = await getSiteSettings()

  // Determine what to display by merging DB data with Static metadata
  // We prioritize DB title/category if it exists, but fallback to rich static overview/info
  const title    = dbProject?.title || staticEnrichment?.title || params.slug.replace(/-/g, ' ')
  const category = dbProject?.category || staticEnrichment?.category || '—'
  const year     = dbProject?.year || staticEnrichment?.year || '—'
  const location = dbProject?.location || staticEnrichment?.location || '—'
  
  const overview = staticEnrichment?.overview || dbProject?.description || dbProject?.short_description || 'Project details coming soon.'
  const context  = staticEnrichment?.context || ''
  
  const tags     = dbProject?.tags?.length ? dbProject.tags : (staticEnrichment?.tags || [])
  
  // Extra Info (Signature Projects only)
  const program  = staticEnrichment?.program || '—'
  const area     = staticEnrichment?.area || '—'
  const status   = staticEnrichment?.status || '—'
  const client   = staticEnrichment?.client || '—'

  const isIstanbul = params.slug === 'istanbul-a-way-out'
  const isFoodTower = params.slug === 'food-tower'
  const isTheLog = params.slug === 'the-log'

  // Theme definition
  const theme = isIstanbul ? {
    bg: 'bg-black',
    text: 'text-white',
    muted: 'text-zinc-500',
    border: 'border-zinc-800',
    ink: 'text-zinc-100',
    hover: 'hover:text-white'
  } : {
    bg: 'bg-white',
    text: 'text-ink',
    muted: 'text-muted',
    border: 'border-rule',
    ink: 'text-ink',
    hover: 'hover:text-ink'
  }

  // Images priority: DB images > Static placeholders
  const coverImage = dbProject?.cover_image || null
  const galleryImages = dbProject?.images || []

  return (
    <article className={`px-6 md:px-10 pt-28 pb-32 transition-colors duration-700 ${theme.bg} min-h-screen`}>
      {/* Back */}
      <Link href="/projects" className={`text-xs ${theme.muted} ${theme.hover} transition-colors inline-block mb-14`}>
        ← projects
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <p className={`text-xs ${theme.muted} capitalize mb-3`}>{category}</p>
          <h1 className={`text-3xl md:text-5xl font-light ${theme.text} leading-tight mb-4`}>
            {title}
          </h1>
          <p className={`text-xs ${theme.muted} mb-6`}>
            {year} — {location}
          </p>
          {settings.project_show_tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className={`text-[11px] ${theme.muted} border ${theme.border} px-3 py-1`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className={`text-sm ${theme.ink} leading-relaxed`}>
            {overview}
          </p>
        </div>
      </div>

      {/* Interactive scene — Food Tower (Exploded Axo) */}
      {isFoodTower && (
        <div className={`w-full aspect-[16/7] overflow-hidden bg-white mb-8 border ${theme.border}/30`}>
          <ExplodedAxonometry />
        </div>
      )}

      {/* Interactive scene — The Log */}
      {isTheLog && (
        <div className={`w-full aspect-[16/7] mb-8 overflow-hidden bg-[#faf5f0] border ${theme.border}/30`}>
          <TheLogScene />
        </div>
      )}

      {/* Interactive scene — Istanbul */}
      {isIstanbul && (
        <div className="w-full aspect-[16/7] mb-4 overflow-hidden bg-black outline outline-1 outline-zinc-900">
          <InteractiveRelight />
        </div>
      )}

      {/* Cover image */}
      {coverImage ? (
        <div className={`aspect-[16/9] overflow-hidden ${isIstanbul ? 'bg-zinc-900' : 'bg-warm'} mb-3`}>
          <Image
            src={coverImage}
            alt={title}
            width={1600}
            height={900}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      ) : (
        <PlaceholderImage 
          aspect="aspect-[16/9]" 
          label="cover image" 
          className={`mb-3 ${isIstanbul ? 'bg-zinc-900 text-zinc-700' : ''}`} 
        />
      )}

      {/* Overview + Project info */}
      <div className="grid md:grid-cols-[1fr_280px] gap-x-16 gap-y-12 mt-16 mb-16">
        <div>
          <p className={`text-[11px] ${theme.muted} tracking-widest uppercase mb-6`}>Overview</p>
          <p className={`text-sm ${theme.text} leading-relaxed mb-5`}>
            {overview}
          </p>
          {context && (
            <p className={`text-sm ${theme.text} leading-relaxed`}>
              {context}
            </p>
          )}
        </div>

        {/* Project details table */}
        <div>
          <p className={`text-[11px] ${theme.muted} tracking-widest uppercase mb-6`}>Project Info</p>
          <div className={`border-t ${theme.border}`}>
            {[
              { label: 'Program', value: program },
              { label: 'Year', value: String(year) },
              { label: 'Location', value: location },
              { label: 'Area', value: area },
              { label: 'Status', value: status },
              { label: 'Client', value: client },
            ].map(({ label, value }) => (
              <div key={label} className={`flex justify-between items-baseline border-b ${theme.border} py-3`}>
                <span className={`text-[11px] ${theme.muted}`}>{label}</span>
                <span className={`text-[11px] ${theme.text} text-right max-w-[60%]`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image gallery */}
      {galleryImages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {galleryImages.map((src, i) => (
            <div key={i} className={`aspect-[4/3] overflow-hidden ${isIstanbul ? 'bg-zinc-900' : 'bg-warm'}`}>
              <Image
                src={src}
                alt={`${title} — ${i + 1}`}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PlaceholderImage 
            aspect="aspect-[4/3]" 
            label="image 01" 
            className={isIstanbul ? 'bg-zinc-900 text-zinc-700' : ''} 
          />
          <PlaceholderImage 
            aspect="aspect-[4/3]" 
            label="image 02" 
            className={isIstanbul ? 'bg-zinc-900 text-zinc-700' : ''} 
          />
        </div>
      )}

      {/* Footer nav */}
      <div className={`border-t ${theme.border} mt-20 pt-10 flex justify-between items-center`}>
        <Link href="/projects" className={`text-xs ${theme.muted} ${theme.hover} transition-colors`}>
          ← all projects
        </Link>
        <Link href="/contact" className={`text-xs ${theme.muted} ${theme.hover} transition-colors`}>
          get in touch →
        </Link>
      </div>
    </article>
  )
}
