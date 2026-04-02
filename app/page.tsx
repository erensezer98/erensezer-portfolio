import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedProjects } from '@/lib/supabase'

// Three.js must be loaded client-side only
const ArchitecturalWireframe = dynamic(
  () => import('@/components/three/ArchitecturalWireframe'),
  { ssr: false }
)
const InteractiveRelight = dynamic(
  () => import('@/components/three/InteractiveRelight'),
  { ssr: false }
)

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedProjects>> = []
  try {
    featured = await getFeaturedProjects()
  } catch {
    // Supabase not yet configured — show static fallback
  }

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Three.js canvas — right half on desktop, full background on mobile */}
        <div className="absolute inset-0 md:left-1/2 pointer-events-none">
          <ArchitecturalWireframe />
        </div>

        {/* Text content */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-10 pt-24 pb-16 w-full">
          <div className="max-w-xl">
            <p className="section-label mb-6">Architectural Portfolio</p>

            <h1 className="font-serif text-6xl md:text-8xl font-light tracking-tight text-charcoal leading-none mb-6">
              Eren
              <br />
              <em className="not-italic text-salmon">Sezer</em>
            </h1>

            <p className="text-base text-muted max-w-sm leading-relaxed mb-10">
              Architect &amp; digital designer exploring the intersection of
              spatial design and technology. Master of Building Architecture,
              Politecnico di Milano.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/projects"
                className="inline-flex items-center gap-3 text-sm tracking-widest uppercase border border-charcoal px-6 py-3 hover:bg-charcoal hover:text-white transition-colors duration-300"
              >
                View Projects
              </Link>
              <Link
                href="/about"
                className="text-sm tracking-widest uppercase text-muted hover:text-charcoal transition-colors duration-200 underline underline-offset-4 decoration-border"
              >
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-charcoal animate-pulse" />
        </div>
      </section>

      {/* ─── Featured Projects ────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-2">Selected Work</p>
              <h2 className="font-serif text-3xl font-light text-charcoal">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden md:inline-flex text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors underline underline-offset-4 decoration-border"
            >
              All Projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featured.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="project-card group"
              >
                <div className="card-image aspect-[4/3] mb-4">
                  {project.cover_image ? (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-cream flex items-center justify-center">
                      <span className="text-xs tracking-widest uppercase text-muted">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-sans font-medium text-charcoal group-hover:text-salmon transition-colors duration-200">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      {project.year} · {project.location}
                    </p>
                  </div>
                  <span className="tag capitalize mt-0.5">{project.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Static fallback grid (shown when Supabase not configured) ────── */}
      {featured.length === 0 && (
        <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-label mb-2">Selected Work</p>
              <h2 className="font-serif text-3xl font-light text-charcoal">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden md:inline-flex text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors underline underline-offset-4 decoration-border"
            >
              All Projects →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'The Food Tower', year: 2022, location: 'Milan', category: 'Academic' },
              { title: 'The Log', year: 2021, location: 'Milan', category: 'Academic' },
              { title: 'Haliç Co-op', year: 2020, location: 'Istanbul', category: 'Academic' },
              { title: 'Hungarian Csarda', year: 2022, location: 'South Korea', category: 'Freelance' },
            ].map((p) => (
              <Link key={p.title} href="/projects" className="project-card group">
                <div className="card-image aspect-[4/3] mb-4 bg-cream flex items-center justify-center">
                  <span className="text-xs tracking-widest uppercase text-muted opacity-60">
                    {p.title}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-sans font-medium text-charcoal group-hover:text-salmon transition-colors duration-200">
                      {p.title}
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      {p.year} · {p.location}
                    </p>
                  </div>
                  <span className="tag">{p.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Interactive Relight Demo ─────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] bg-[#111] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <InteractiveRelight />
        </div>
        <div className="relative z-10 pointer-events-none w-full h-full flex flex-col items-center justify-center text-center px-6">
          <h2 className="font-serif text-3xl md:text-5xl font-light text-white/90 mb-4 mix-blend-difference">
            Interactive Relight
          </h2>
          <p className="text-white/60 max-w-md text-sm tracking-wide mix-blend-difference">
            Move your cursor. Powered by Three.js.
          </p>
        </div>
      </section>

      {/* ─── Brief intro strip ────────────────────────────────────────────── */}
      <section className="border-t border-border bg-cream">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-3 gap-10">
          {[
            {
              label: 'Based in',
              value: 'Milan, Italy',
              sub: 'Politecnico di Milano',
            },
            {
              label: 'Focus',
              value: 'Architecture & Technology',
              sub: 'Digital design & spatial research',
            },
            {
              label: 'Available for',
              value: 'Collaborations',
              sub: 'eren@maestro-tech.com',
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="section-label">{item.label}</p>
              <p className="font-serif text-xl text-charcoal font-light mt-1">
                {item.value}
              </p>
              <p className="text-sm text-muted">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
