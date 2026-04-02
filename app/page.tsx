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
      <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #E9E9E9 1px, transparent 1px),
              linear-gradient(to bottom, #E9E9E9 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            opacity: 0.5,
          }}
        />

        {/* Three.js canvas — right half on desktop */}
        <div className="absolute inset-0 md:left-1/2 pointer-events-none">
          <ArchitecturalWireframe />
        </div>

        {/* Text content */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-10 pt-24 pb-16 w-full">
          <div className="max-w-xl">
            {/* Eyebrow label */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-accent" />
              <p className="section-label">Architectural Portfolio</p>
            </div>

            <h1 className="font-sans text-7xl md:text-9xl font-bold tracking-tighter text-carbon leading-[0.9] mb-6">
              Eren<br />
              <span className="text-accent">Sezer</span>
            </h1>

            <p className="text-base text-slate max-w-sm leading-relaxed mb-3 font-light">
              Architect & digital designer exploring the intersection of
              spatial design and technology.
            </p>
            <p className="text-xs font-mono text-slate/70 tracking-wide mb-10">
              M.Sc. Building Architecture · Politecnico di Milano
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-3 text-xs tracking-widest uppercase bg-carbon text-white px-7 py-3.5 hover:bg-accent transition-colors duration-300 font-semibold"
              >
                View Projects
                <span className="text-lg leading-none">→</span>
              </Link>
              <Link
                href="/about"
                className="text-xs tracking-widest uppercase text-slate hover:text-carbon transition-colors duration-200 font-medium border-b border-light-gray hover:border-accent pb-0.5"
              >
                About
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] tracking-widest uppercase font-mono">Scroll</span>
          <div className="w-px h-10 bg-carbon animate-pulse" />
        </div>
      </section>

      {/* ─── Featured Projects ────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-28">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-accent" />
                <p className="section-label">Selected Work</p>
              </div>
              <h2 className="font-sans text-4xl font-bold text-carbon tracking-tight">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-slate hover:text-accent transition-colors font-medium"
            >
              All Projects
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featured.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="project-card group"
              >
                <div className="card-image aspect-[4/3] mb-4 rounded-lg">
                  {project.cover_image ? (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-off-white flex items-center justify-center">
                      <span className="text-xs tracking-widest uppercase text-slate/50 font-mono">
                        {project.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-carbon group-hover:text-accent transition-colors duration-200 tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate mt-1 font-mono">
                      {project.year} · {project.location}
                    </p>
                  </div>
                  <span className="tag capitalize">{project.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Static fallback grid ────────────────────────────────────────── */}
      {featured.length === 0 && (
        <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-28">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-accent" />
                <p className="section-label">Selected Work</p>
              </div>
              <h2 className="font-sans text-4xl font-bold text-carbon tracking-tight">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden md:inline-flex items-center gap-2 text-xs tracking-widest uppercase text-slate hover:text-accent transition-colors font-medium"
            >
              All Projects <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'The Food Tower', year: 2022, location: 'Milan', category: 'Academic' },
              { title: 'The Log', year: 2021, location: 'Milan', category: 'Academic' },
              { title: 'Haliç Co-op', year: 2020, location: 'Istanbul', category: 'Academic' },
              { title: 'Hungarian Csarda', year: 2022, location: 'South Korea', category: 'Freelance' },
            ].map((p) => (
              <Link key={p.title} href="/projects" className="project-card group">
                <div className="card-image aspect-[4/3] mb-4 bg-off-white flex items-center justify-center rounded-lg">
                  <span className="text-xs tracking-widest uppercase text-slate/40 font-mono opacity-60">
                    {p.title}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-carbon group-hover:text-accent transition-colors duration-200 tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate mt-1 font-mono">
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
      <section className="relative w-full h-[65vh] bg-carbon overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute inset-0 z-0">
          <InteractiveRelight />
        </div>
        <div className="relative z-10 pointer-events-none w-full h-full flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center gap-3 mb-5 justify-center">
            <div className="w-8 h-px bg-accent" />
            <p className="section-label text-accent">Interactive</p>
            <div className="w-8 h-px bg-accent" />
          </div>
          <h2 className="font-sans text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Architecture of Light
          </h2>
          <p className="text-white/40 max-w-md text-xs tracking-widest font-mono uppercase">
            Move your cursor · Real-time Three.js lighting
          </p>
        </div>
      </section>

      {/* ─── Info strip ───────────────────────────────────────────────────── */}
      <section className="border-t border-light-gray bg-off-white">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-3 gap-10">
          {[
            {
              label: 'Based in',
              value: 'Milan, Italy',
              sub: 'Politecnico di Milano',
            },
            {
              label: 'Focus',
              value: 'Architecture × Technology',
              sub: 'Digital design & spatial research',
            },
            {
              label: 'Available for',
              value: 'Collaborations',
              sub: 'eren@maestro-tech.com',
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <p className="section-label mb-1">{item.label}</p>
              <p className="font-bold text-carbon text-lg tracking-tight mt-1">
                {item.value}
              </p>
              <p className="text-xs text-slate font-mono">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
