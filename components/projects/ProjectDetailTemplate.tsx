'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProjectScene from '@/components/projects/ProjectScene'
import type { Project } from '@/lib/types'
import type { ProjectPageContent } from '@/lib/project-data'

function ClickableImage({
  src,
  alt,
  aspect,
  priority = false,
  onOpen,
  backgroundClass,
}: {
  src: string
  alt: string
  aspect: string
  priority?: boolean
  onOpen: (src: string, alt: string) => void
  backgroundClass: string
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(src, alt)}
      className={`${aspect} relative overflow-hidden ${backgroundClass} text-left transition-opacity hover:opacity-95`}
    >
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1200}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </button>
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
  const lightboxImages = [
    ...content.processImages.map((src, index) => ({ src, alt: `${project.title} process ${index + 1}` })),
    ...content.schematicImages.map((src, index) => ({ src, alt: `${project.title} schematic ${index + 1}` })),
    ...galleryImages.map((src, index) => ({ src, alt: `${project.title} — ${index + 1}` })),
  ]
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
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

  useEffect(() => {
    if (activeImageIndex === null) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveImageIndex(null)
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((current) => {
          if (current === null || lightboxImages.length === 0) return null
          return (current + 1) % lightboxImages.length
        })
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((current) => {
          if (current === null || lightboxImages.length === 0) return null
          return (current - 1 + lightboxImages.length) % lightboxImages.length
        })
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImageIndex, lightboxImages.length])

  function openImage(src: string, alt: string) {
    const nextIndex = lightboxImages.findIndex((image) => image.src === src && image.alt === alt)
    setActiveImageIndex(nextIndex >= 0 ? nextIndex : null)
  }

  function moveImage(direction: 'prev' | 'next') {
    setActiveImageIndex((current) => {
      if (current === null || lightboxImages.length === 0) return null

      if (direction === 'next') {
        return (current + 1) % lightboxImages.length
      }

      return (current - 1 + lightboxImages.length) % lightboxImages.length
    })
  }

  return (
    <>
      <article className={`min-h-screen px-6 pt-28 pb-32 md:px-10 ${theme.bg}`}>
        <Link
          href="/projects"
          className={`inline-block mb-14 text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
        >
          ← projects
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <p className={`text-xs mb-3 font-medium lowercase ${theme.muted}`}>{project.category}</p>
            <h1 className={`text-3xl md:text-5xl font-medium leading-tight mb-4 ${theme.text}`}>{project.title}</h1>
            <p className={`text-xs mb-6 ${theme.muted}`}>
              {project.year} — {project.location}
            </p>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className={`text-[11px] px-3 py-1 border font-medium lowercase ${theme.muted} ${theme.border}`}>
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
            <p className={`text-[11px] tracking-widest lowercase ${theme.subtle}`}>cover image</p>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_280px] gap-x-16 gap-y-12 mt-16 mb-16">
          <div>
            <div className="mb-8">
              <p className={`text-[11px] tracking-widest lowercase mb-3 ${theme.muted}`}>overview</p>
              <h2 className={`text-2xl md:text-3xl font-medium lowercase ${theme.text}`}>project narrative</h2>
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
              <p className={`text-[11px] tracking-widest lowercase mb-3 ${theme.muted}`}>project info</p>
              <h2 className={`text-2xl md:text-3xl font-medium lowercase ${theme.text}`}>details</h2>
            </div>
            <div className={`border-t ${theme.border}`}>
              {content.infoFields.map((field) => (
                <div key={field.label} className={`flex justify-between items-baseline py-3 border-b ${theme.border}`}>
                  <span className={`text-[11px] font-medium lowercase ${theme.muted}`}>{field.label}</span>
                  <span className={`text-[11px] text-right max-w-[60%] ${theme.text}`}>{field.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-16 mb-16">
          <div className="mb-8">
            <p className={`text-[11px] tracking-widest lowercase mb-3 ${theme.muted}`}>process</p>
            <h2 className={`text-2xl md:text-3xl font-medium lowercase ${theme.text}`}>development</h2>
          </div>
          {content.processText && (
            <p className={`text-sm leading-relaxed max-w-3xl mb-8 ${theme.text}`}>{content.processText}</p>
          )}

          {content.processImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.processImages.map((src, index) => (
                <ClickableImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${project.title} process ${index + 1}`}
                  aspect="aspect-[4/3]"
                  onOpen={openImage}
                  backgroundClass={theme.warm}
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
            <p className={`text-[11px] tracking-widest lowercase mb-3 ${theme.muted}`}>schematics</p>
            <h2 className={`text-2xl md:text-3xl font-medium lowercase ${theme.text}`}>systems and diagrams</h2>
          </div>
          {content.schematicText && (
            <p className={`text-sm leading-relaxed max-w-3xl mb-8 ${theme.text}`}>{content.schematicText}</p>
          )}

          {content.schematicImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.schematicImages.map((src, index) => (
                <ClickableImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${project.title} schematic ${index + 1}`}
                  aspect="aspect-[4/3]"
                  onOpen={openImage}
                  backgroundClass={theme.warm}
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
            <p className={`text-[11px] tracking-widest lowercase mb-3 ${theme.muted}`}>gallery</p>
            <h2 className={`text-2xl md:text-3xl font-medium lowercase ${theme.text}`}>project images</h2>
          </div>
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {galleryImages.map((src, index) => (
                <ClickableImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${project.title} — ${index + 1}`}
                  aspect="aspect-[4/3]"
                  onOpen={openImage}
                  backgroundClass={theme.warm}
                />
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
              <p className={`text-[11px] tracking-widest lowercase mb-3 ${theme.muted}`}>awards</p>
              <h2 className={`text-2xl md:text-3xl font-medium lowercase ${theme.text}`}>recognition</h2>
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
            className={`text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
          >
            ← all projects
          </Link>
          <Link
            href="/contact"
            className={`text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
          >
            get in touch →
          </Link>
        </div>
      </article>

      {activeImageIndex !== null && lightboxImages[activeImageIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8"
          onClick={() => setActiveImageIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImageIndex(null)}
            className="absolute right-4 top-4 text-xs font-medium lowercase text-white transition-opacity hover:opacity-70"
          >
            close
          </button>
          {lightboxImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  moveImage('prev')
                }}
                className="absolute left-4 top-1/2 z-[101] -translate-y-1/2 border border-white/20 bg-black/40 px-4 py-3 text-xs font-medium lowercase text-white transition-colors hover:bg-black/60"
              >
                ← prev
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  moveImage('next')
                }}
                className="absolute right-4 top-1/2 z-[101] -translate-y-1/2 border border-white/20 bg-black/40 px-4 py-3 text-xs font-medium lowercase text-white transition-colors hover:bg-black/60"
              >
                next →
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 z-[101] -translate-x-1/2 text-xs font-medium lowercase text-white/75">
            {activeImageIndex + 1} / {lightboxImages.length}
          </div>
          <div
            className="relative h-full w-full max-w-7xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightboxImages[activeImageIndex].src}
              alt={lightboxImages[activeImageIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
