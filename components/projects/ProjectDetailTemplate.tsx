'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProjectScene from '@/components/projects/ProjectScene'
import { getProjectCategoryLabel } from '@/lib/project-data'
import type { ProjectPageContent } from '@/lib/project-data'
import type { Project } from '@/lib/types'

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

export default function ProjectDetailTemplate({
  project,
  content,
}: {
  project: Project
  content: ProjectPageContent
}) {
  const isIstanbul = project.slug === 'istanbul-a-way-out'
  const isInvolvement = project.category === 'involvement'
  const coverImage = project.cover_image
  const galleryImages = content.galleryImages.length ? content.galleryImages : project.images
  const hasAwards = content.awards.some((award) => award.trim())
  const hasProcessSection = Boolean(content.processText || content.processImages.length)
  const hasSchematicSection = Boolean(content.schematicText || content.schematicImages.length)
  const hasGallerySection = galleryImages.length > 0 || isInvolvement
  const lightboxImages = [
    ...content.processImages.map((src, index) => ({ src, alt: `${project.title} process ${index + 1}` })),
    ...content.schematicImages.map((src, index) => ({ src, alt: `${project.title} schematic ${index + 1}` })),
    ...galleryImages.map((src, index) => ({ src, alt: `${project.title} image ${index + 1}` })),
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
      <article className={`min-h-screen px-6 pb-32 pt-28 md:px-10 ${theme.bg}`}>
        <Link
          href="/projects"
          className={`mb-14 inline-block text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
        >
          {'<- projects'}
        </Link>

        <div className="mb-16 grid gap-12 md:grid-cols-2">
          <div>
            <p className={`mb-3 text-xs font-medium lowercase ${theme.muted}`}>{getProjectCategoryLabel(project.category)}</p>
            <h1 className={`mb-4 text-3xl font-medium leading-tight md:text-5xl ${theme.text}`}>{project.title}</h1>
            <p className={`mb-6 text-xs ${theme.muted}`}>
              {project.year} - {project.location}
            </p>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className={`border px-3 py-1 text-[11px] font-medium lowercase ${theme.muted} ${theme.border}`}>
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
          <div className={`mb-8 aspect-[16/7] w-full overflow-hidden border ${theme.surface} ${theme.border}`}>
            <ProjectScene component={content.sceneComponent} />
          </div>
        )}

        {coverImage ? (
          <div className={`mb-3 aspect-[16/9] overflow-hidden ${theme.warm}`}>
            <Image
              src={coverImage}
              alt={project.title}
              width={1600}
              height={900}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className={`flex aspect-[16/9] items-center justify-center ${theme.warm}`}>
            <p className={`text-[11px] tracking-widest lowercase ${theme.subtle}`}>cover image</p>
          </div>
        )}

        <div className="mt-16 mb-16 grid gap-x-16 gap-y-12 md:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-8">
              <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>overview</p>
              <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>project narrative</h2>
            </div>
            <p className={`mb-5 text-sm leading-relaxed ${theme.text}`}>
              {content.introText || project.description || project.short_description}
            </p>
            {project.description && content.introText !== project.description && (
              <p className={`text-sm leading-relaxed ${theme.text}`}>{project.description}</p>
            )}
          </div>

          <div>
            <div className="mb-8">
              <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>project info</p>
              <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>details</h2>
            </div>
            <div className={`border-t ${theme.border}`}>
              {content.infoFields.map((field) => (
                <div key={field.label} className={`flex items-baseline justify-between border-b py-3 ${theme.border}`}>
                  <span className={`text-[11px] font-medium lowercase ${theme.muted}`}>{field.label}</span>
                  <span className={`max-w-[60%] text-right text-[11px] ${theme.text}`}>{field.value || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {hasProcessSection && (
          <section className="mt-16 mb-16">
            <div className="mb-8">
              <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{isInvolvement ? 'involvement' : 'process'}</p>
              <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{isInvolvement ? 'scope of work' : 'development'}</h2>
            </div>
            {content.processText && (
              <p className={`mb-8 max-w-3xl text-sm leading-relaxed ${theme.text}`}>{content.processText}</p>
            )}

            {content.processImages.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            )}
          </section>
        )}

        {hasSchematicSection && (
          <section className="mt-16 mb-16">
            <div className="mb-8">
              <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{isInvolvement ? 'role' : 'schematics'}</p>
              <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{isInvolvement ? 'contribution' : 'systems and diagrams'}</h2>
            </div>
            {content.schematicText && (
              <p className={`mb-8 max-w-3xl text-sm leading-relaxed ${theme.text}`}>{content.schematicText}</p>
            )}

            {content.schematicImages.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
            )}
          </section>
        )}

        {hasGallerySection && (
          <section className="mt-16">
            <div className="mb-8">
              <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>gallery</p>
              <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>project images</h2>
            </div>
            {galleryImages.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {galleryImages.map((src, index) => (
                  <ClickableImage
                    key={`${src}-${index}`}
                    src={src}
                    alt={`${project.title} image ${index + 1}`}
                    aspect="aspect-[4/3]"
                    onOpen={openImage}
                    backgroundClass={theme.warm}
                  />
                ))}
              </div>
            ) : (
              <div className={`mt-3 flex aspect-[16/9] items-center justify-center ${theme.warm}`}>
                <p className={`text-[11px] tracking-widest lowercase ${theme.subtle}`}>gallery images coming soon</p>
              </div>
            )}
          </section>
        )}

        {hasAwards && (
          <section className="mt-16">
            <div className="mb-8">
              <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>awards</p>
              <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>recognition</h2>
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

        <div className={`mt-20 flex items-center justify-between border-t pt-10 ${theme.border}`}>
          <Link
            href="/projects"
            className={`text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
          >
            {'<- all projects'}
          </Link>
          <Link
            href="/contact"
            className={`text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
          >
            {'get in touch ->'}
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
                {'<- prev'}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  moveImage('next')
                }}
                className="absolute right-4 top-1/2 z-[101] -translate-y-1/2 border border-white/20 bg-black/40 px-4 py-3 text-xs font-medium lowercase text-white transition-colors hover:bg-black/60"
              >
                {'next ->'}
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
