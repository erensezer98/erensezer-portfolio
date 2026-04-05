import Image from 'next/image'
import Link from 'next/link'
import ProjectScene from '@/components/projects/ProjectScene'
import type { Project } from '@/lib/types'
import type { ProjectPageContent } from '@/lib/project-data'

function ImagePanel({
  src,
  alt,
  priority = false,
  aspect = 'aspect-[4/3]',
}: {
  src: string
  alt: string
  priority?: boolean
  aspect?: string
}) {
  return (
    <div className={`${aspect} overflow-hidden bg-warm`}>
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1200}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  )
}

function PlaceholderImage({
  label,
  aspect = 'aspect-[4/3]',
}: {
  label: string
  aspect?: string
}) {
  return (
    <div className={`${aspect} flex items-center justify-center bg-warm`}>
      <p className="text-[11px] uppercase tracking-widest text-subtle">{label}</p>
    </div>
  )
}

export default function ProjectDetailTemplate({
  project,
  content,
}: {
  project: Project
  content: ProjectPageContent
}) {
  const isIstanbul = project.slug === 'istanbul-a-way-out'
  const coverImage = project.cover_image
  const galleryImages = content.galleryImages.length ? content.galleryImages : project.images
  const hasAwards = content.awards.some((award) => award.trim())
  const theme = isIstanbul
    ? {
        bg: 'bg-black',
        text: 'text-white',
        muted: 'text-zinc-500',
        border: 'border-zinc-800',
        surface: 'bg-zinc-900',
        subtle: 'text-zinc-700',
        warm: 'bg-zinc-900',
      }
    : {
        bg: 'bg-white',
        text: 'text-ink',
        muted: 'text-muted',
        border: 'border-rule',
        surface: 'bg-[#faf5f0]',
        subtle: 'text-subtle',
        warm: 'bg-warm',
      }

  return (
    <article className={`min-h-screen px-6 pt-28 pb-32 md:px-10 ${theme.bg}`}>
      <Link
        href="/projects"
        className={`inline-block mb-14 text-xs transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
      >
        ← projects
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <p className={`text-xs capitalize mb-3 ${theme.muted}`}>{project.category}</p>
          <h1 className={`text-3xl md:text-5xl font-light leading-tight mb-4 ${theme.text}`}>{project.title}</h1>
          <p className={`text-xs mb-6 ${theme.muted}`}>
            {project.year} — {project.location}
          </p>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className={`text-[11px] px-3 py-1 border ${theme.muted} ${theme.border}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className={`text-sm leading-relaxed ${theme.text}`}>
            {content.introText || project.description || project.short_description}
          </p>
        </div>
      </div>

      {content.sceneComponent !== 'none' && (
        <div className={`w-full aspect-[16/7] mb-8 overflow-hidden border ${theme.surface} ${theme.border}`}>
          <ProjectScene component={content.sceneComponent} />
        </div>
      )}

      {coverImage ? (
        <div className={`aspect-[16/9] overflow-hidden mb-3 ${theme.warm}`}>
          <Image
            src={coverImage}
            alt={project.title}
            width={1600}
            height={900}
            priority
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`aspect-[16/9] flex items-center justify-center ${theme.warm}`}>
          <p className={`text-[11px] uppercase tracking-widest ${theme.subtle}`}>cover image</p>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_280px] gap-x-16 gap-y-12 mt-16 mb-16">
        <div>
          <div className="mb-8">
            <p className={`text-[11px] uppercase tracking-widest mb-3 ${theme.muted}`}>Overview</p>
            <h2 className={`text-2xl md:text-3xl font-light ${theme.text}`}>Project narrative</h2>
          </div>
          <p className={`text-sm leading-relaxed mb-5 ${theme.text}`}>
            {content.introText || project.description || project.short_description}
          </p>
          {project.description && content.introText !== project.description && (
            <p className={`text-sm leading-relaxed ${theme.text}`}>{project.description}</p>
          )}
        </div>

        <div>
          <div className="mb-8">
            <p className={`text-[11px] uppercase tracking-widest mb-3 ${theme.muted}`}>Project Info</p>
            <h2 className={`text-2xl md:text-3xl font-light ${theme.text}`}>Details</h2>
          </div>
          <div className={`border-t ${theme.border}`}>
            {content.infoFields.map((field) => (
              <div key={field.label} className={`flex justify-between items-baseline py-3 border-b ${theme.border}`}>
                <span className={`text-[11px] ${theme.muted}`}>{field.label}</span>
                <span className={`text-[11px] text-right max-w-[60%] ${theme.text}`}>{field.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16 mb-16">
        <div className="mb-8">
          <p className={`text-[11px] uppercase tracking-widest mb-3 ${theme.muted}`}>Process</p>
          <h2 className={`text-2xl md:text-3xl font-light ${theme.text}`}>Development</h2>
        </div>
        {content.processText && (
          <p className={`text-sm leading-relaxed max-w-3xl mb-8 ${theme.text}`}>{content.processText}</p>
        )}

        {content.processImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.processImages.map((src, index) => (
              <ImagePanel
                key={`${src}-${index}`}
                src={src}
                alt={`${project.title} process ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PlaceholderImage label="process image 01" />
            <PlaceholderImage label="process image 02" />
          </div>
        )}
      </section>

      <section className="mt-16 mb-16">
        <div className="mb-8">
          <p className={`text-[11px] uppercase tracking-widest mb-3 ${theme.muted}`}>Schematics</p>
          <h2 className={`text-2xl md:text-3xl font-light ${theme.text}`}>Systems and diagrams</h2>
        </div>
        {content.schematicText && (
          <p className={`text-sm leading-relaxed max-w-3xl mb-8 ${theme.text}`}>{content.schematicText}</p>
        )}

        {content.schematicImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.schematicImages.map((src, index) => (
              <ImagePanel
                key={`${src}-${index}`}
                src={src}
                alt={`${project.title} schematic ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PlaceholderImage label="schematic 01" />
            <PlaceholderImage label="schematic 02" />
          </div>
        )}
      </section>

      <section className="mt-16">
        <div className="mb-8">
          <p className={`text-[11px] uppercase tracking-widest mb-3 ${theme.muted}`}>Gallery</p>
          <h2 className={`text-2xl md:text-3xl font-light ${theme.text}`}>Project images</h2>
        </div>
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {galleryImages.map((src, index) => (
              <div key={`${src}-${index}`} className={`aspect-[4/3] overflow-hidden ${theme.warm}`}>
                <Image
                  src={src}
                  alt={`${project.title} — ${index + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PlaceholderImage label="image 01" />
            <PlaceholderImage label="image 02" />
          </div>
        )}
      </section>

      {hasAwards && (
        <section className="mt-16">
          <div className="mb-8">
            <p className={`text-[11px] uppercase tracking-widest mb-3 ${theme.muted}`}>Awards</p>
            <h2 className={`text-2xl md:text-3xl font-light ${theme.text}`}>Recognition</h2>
          </div>
          <div className={`border-t ${theme.border}`}>
            {content.awards
              .filter((award) => award.trim())
              .map((award) => (
                <div key={award} className={`border-b py-6 ${theme.border}`}>
                  <p className={`text-[13px] leading-relaxed ${theme.text}`}>{award}</p>
                </div>
              ))}
          </div>
        </section>
      )}

      <div className={`border-t mt-20 pt-10 flex justify-between items-center ${theme.border}`}>
        <Link
          href="/projects"
          className={`text-xs transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
        >
          ← all projects
        </Link>
        <Link
          href="/contact"
          className={`text-xs transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
        >
          get in touch →
        </Link>
      </div>
    </article>
  )
}
