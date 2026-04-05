import Image from 'next/image'
import Link from 'next/link'
import ProjectScene from '@/components/projects/ProjectScene'
import type { Project } from '@/lib/types'
import type { ProjectPageContent } from '@/lib/project-data'

function DetailImage({
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
    <div className={`relative overflow-hidden rounded-[28px] bg-warm ${aspect}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  )
}

function PlaceholderPanel({
  label,
  aspect = 'aspect-[4/3]',
}: {
  label: string
  aspect?: string
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-[28px] border border-dashed border-rule bg-warm/60 ${aspect}`}
    >
      <p className="px-6 text-center text-[10px] uppercase tracking-[0.35em] text-muted">
        {label}
      </p>
    </div>
  )
}

function TextSection({
  label,
  title,
  body,
}: {
  label: string
  title: string
  body: string
}) {
  if (!body.trim()) return null

  return (
    <section className="grid gap-5 border-t border-rule py-10 md:grid-cols-[140px_1fr] md:gap-8">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted">{label}</p>
      <div className="max-w-3xl">
        <h2 className="text-2xl font-light text-ink md:text-3xl">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-muted md:text-[15px]">{body}</p>
      </div>
    </section>
  )
}

export default function ProjectDetailTemplate({
  project,
  content,
}: {
  project: Project
  content: ProjectPageContent
}) {
  const coverImage = project.cover_image
  const galleryImages = content.galleryImages.length ? content.galleryImages : project.images
  const hasAwards = content.awards.some((award) => award.trim())

  return (
    <article className="bg-white">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-24 sm:px-6 md:px-10 md:pb-28 md:pt-28">
        <Link href="/projects" className="inline-block text-[11px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-ink">
          Back to projects
        </Link>

        <section className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">{project.category}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-light leading-tight text-ink sm:text-5xl md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
              {project.short_description}
            </p>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-rule bg-[#faf8f5] p-5 sm:grid-cols-2 sm:gap-5 md:p-7">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Year</p>
              <p className="mt-2 text-sm text-ink">{project.year}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Location</p>
              <p className="mt-2 text-sm text-ink">{project.location}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.length ? (
                  project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-rule px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted">No tags added yet.</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          {coverImage ? (
            <DetailImage src={coverImage} alt={project.title} priority aspect="aspect-[16/10] md:aspect-[16/8]" />
          ) : (
            <PlaceholderPanel label="Add cover image in admin" aspect="aspect-[16/10] md:aspect-[16/8]" />
          )}
        </section>

        {content.sceneComponent !== 'none' && (
          <section className="mt-10 overflow-hidden rounded-[28px] border border-rule bg-[#faf8f5]">
            <div className="flex items-center justify-between border-b border-rule px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Three.js</p>
                <h2 className="mt-2 text-lg font-light text-ink">Interactive model</h2>
              </div>
            </div>
            <div className="h-[320px] w-full sm:h-[420px] lg:h-[520px]">
              <ProjectScene component={content.sceneComponent} />
            </div>
          </section>
        )}

        <TextSection label="Text" title="Project narrative" body={content.introText || project.description} />

        <section className="grid gap-6 border-t border-rule py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="grid gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Process</p>
              <h2 className="mt-3 text-2xl font-light text-ink md:text-3xl">Development and thinking</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-[15px]">
                {content.processText || 'Add process notes in admin to describe the project development.'}
              </p>
            </div>

            {content.processImages.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {content.processImages.map((src, index) => (
                  <DetailImage
                    key={`${src}-${index}`}
                    src={src}
                    alt={`${project.title} process ${index + 1}`}
                  />
                ))}
              </div>
            ) : (
              <PlaceholderPanel label="Add process image URLs in admin" />
            )}
          </div>

          <div className="rounded-[28px] border border-rule bg-[#faf8f5] p-5 md:p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Project info</p>
            <div className="mt-5 divide-y divide-rule">
              {content.infoFields.map((field) => (
                <div key={field.label} className="flex items-start justify-between gap-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-muted">{field.label}</span>
                  <span className="max-w-[60%] text-right text-sm text-ink">{field.value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-t border-rule py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Schematic</p>
            <h2 className="mt-3 text-2xl font-light text-ink md:text-3xl">Systems and diagrams</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted md:text-[15px]">
              {content.schematicText || 'Add diagram notes in admin to explain the main spatial and technical ideas.'}
            </p>
          </div>

          {content.schematicImages.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {content.schematicImages.map((src, index) => (
                <DetailImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${project.title} diagram ${index + 1}`}
                />
              ))}
            </div>
          ) : (
            <PlaceholderPanel label="Add schematic image URLs in admin" />
          )}
        </section>

        <section className="border-t border-rule py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Gallery</p>
              <h2 className="mt-3 text-2xl font-light text-ink md:text-3xl">Project images</h2>
            </div>
            <p className="text-sm text-muted">The layout is fixed, so adding images here will not affect the page structure.</p>
          </div>

          {galleryImages.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((src, index) => (
                <DetailImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${project.title} gallery ${index + 1}`}
                  aspect={index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <PlaceholderPanel label="Add gallery image URLs in admin" />
            </div>
          )}
        </section>

        {hasAwards && (
          <section className="border-t border-rule py-10">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Awards</p>
            <h2 className="mt-3 text-2xl font-light text-ink md:text-3xl">Recognition</h2>
            <div className="mt-8 grid gap-4">
              {content.awards
                .filter((award) => award.trim())
                .map((award) => (
                  <div key={award} className="rounded-[24px] border border-rule bg-[#faf8f5] px-5 py-5">
                    <p className="text-sm leading-7 text-ink">{award}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        <div className="mt-6 border-t border-rule pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/projects" className="text-[11px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-ink">
              All projects
            </Link>
            <Link href="/contact" className="text-[11px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-ink">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
