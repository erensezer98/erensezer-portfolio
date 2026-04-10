'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProjectScene from '@/components/projects/ProjectScene'
import { getProjectCategoryLabel } from '@/lib/project-data'
import type { ProjectDetailSectionImage, ProjectPageContent } from '@/lib/project-data'
import type { Project } from '@/lib/types'

// ─── RPBW-style image row composition ──────────────────────────────────────

// Distributes items into flex rows cycling through RPBW compositions:
// [1,2], [2,1], [1,1,1], [1,2], [2,1] …
function composeRows<T>(items: T[]): Array<{ items: T[]; sizes: number[] }> {
  if (items.length === 0) return []
  const comps = [[1, 2], [2, 1], [1, 1, 1], [1, 2], [2, 1]]
  const rows: Array<{ items: T[]; sizes: number[] }> = []
  let i = 0
  let ci = 0
  while (i < items.length) {
    const remaining = items.length - i
    if (remaining === 1) {
      rows.push({ items: [items[i]], sizes: [1] })
      i++
    } else {
      const comp = comps[ci % comps.length]
      const count = Math.min(comp.length, remaining)
      rows.push({ items: items.slice(i, i + count), sizes: comp.slice(0, count) })
      i += count
      ci++
    }
  }
  return rows
}

// ─── Simple image rows (gallery / process / schematic) ─────────────────────
// Images render at their natural aspect ratio – no cropping.

function SimpleImageRows({
  srcs,
  altPrefix,
  onOpen,
}: {
  srcs: string[]
  altPrefix: string
  onOpen: (src: string, alt: string) => void
}) {
  const items = srcs.map((src, i) => ({ src, alt: `${altPrefix} ${i + 1}` }))
  const rows = composeRows(items)

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-start gap-3">
          {row.items.map((item, itemIndex) => (
            <button
              key={`${item.src}-${itemIndex}`}
              type="button"
              onClick={() => onOpen(item.src, item.alt)}
              aria-label={`Open large view of ${item.alt}`}
              style={{ flex: row.sizes[itemIndex] }}
              className="min-w-0 block text-left transition-opacity hover:opacity-95"
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={1200}
                height={800}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Detail section image rows (with admin-set aspect ratios / captions) ───

function DetailImageRows({
  images,
  fallbackPrefix,
  onOpen,
  backgroundClass,
  borderClass,
  textClass,
  priority = false,
}: {
  images: ProjectDetailSectionImage[]
  fallbackPrefix: string
  onOpen: (src: string, alt: string) => void
  backgroundClass: string
  borderClass: string
  textClass: string
  priority?: boolean
}) {
  const rows = composeRows(images)

  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-start gap-3">
          {row.items.map((image, itemIndex) => {
            const isFirst = priority && rowIndex === 0 && itemIndex === 0
            return (
              <div
                key={`${image.alt}-${itemIndex}`}
                style={{ flex: row.sizes[itemIndex] }}
                className="min-w-0 space-y-2"
              >
                {image.src ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpen(image.src as string, image.alt || `${fallbackPrefix} ${itemIndex + 1}`)}
                      aria-label={`Open large view of ${image.alt}`}
                      className="block w-full text-left transition-opacity hover:opacity-95"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt || `${fallbackPrefix} ${itemIndex + 1}`}
                        width={1200}
                        height={800}
                        priority={isFirst}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </button>
                    {image.caption && (
                      <p className={`text-[11px] leading-relaxed ${textClass}`}>{image.caption}</p>
                    )}
                  </>
                ) : (
                  <div className={`aspect-[4/3] flex items-center justify-center border border-dashed ${backgroundClass} ${borderClass}`}>
                    <p className={`px-6 text-center text-[11px] tracking-[0.18em] lowercase ${textClass}`}>
                      {image.caption || 'image slot'}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Main template ──────────────────────────────────────────────────────────

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
  const hasDetailSections = Boolean(content.detailSections?.length)
  const hasProcessSection = Boolean(content.processText || content.processImages.length)
  const hasSchematicSection = Boolean(content.schematicText || content.schematicImages.length)
  const hasGallerySection = galleryImages.length > 0 || isInvolvement

  const lightboxImages = [
    ...content.processImages.map((src, index) => ({ src, alt: `${project.title} process ${index + 1}` })),
    ...content.schematicImages.map((src, index) => ({ src, alt: `${project.title} schematic ${index + 1}` })),
    ...(content.detailSections ?? []).flatMap((section) =>
      section.images
        .filter((image) => Boolean(image.src))
        .map((image, index) => ({
          src: image.src as string,
          alt: image.alt || `${project.title} ${section.title} ${index + 1}`,
        }))
    ),
    ...galleryImages.map((src, index) => ({ src, alt: `${project.title} image ${index + 1}` })),
  ]

  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries((content.detailSections ?? []).map((section) => [section.id, Boolean(section.defaultOpen)]))
  )
  const [schematicOpen, setSchematicOpen] = useState(false)

  const theme = isIstanbul
    ? {
        bg: 'bg-black',
        text: 'text-white',
        muted: 'text-zinc-500',
        border: 'border-zinc-800',
        surface: 'bg-zinc-900',
        subtle: 'text-zinc-700',
        warm: 'bg-zinc-900',
        accent: 'text-white',
      }
    : {
        bg: 'bg-white',
        text: 'text-ink',
        muted: 'text-muted',
        border: 'border-rule',
        surface: 'bg-[#faf5f0]',
        subtle: 'text-subtle',
        warm: 'bg-warm',
        accent: 'text-ink',
      }

  useEffect(() => {
    setOpenSections(
      Object.fromEntries((content.detailSections ?? []).map((section) => [section.id, Boolean(section.defaultOpen)]))
    )
  }, [content.detailSections])

  useEffect(() => {
    if (activeImageIndex === null) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveImageIndex(null)
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
      if (direction === 'next') return (current + 1) % lightboxImages.length
      return (current - 1 + lightboxImages.length) % lightboxImages.length
    })
  }

  function toggleSection(sectionId: string) {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
  }

  return (
    <>
      <div className={`${theme.bg}`}>
        <article className={`min-h-screen w-full px-6 pb-32 pt-28 md:mx-auto md:max-w-[1200px] md:px-10 ${theme.bg}`}>

          {/* ── Back link ── */}
          <Link
            href="/projects"
            aria-label="Back to projects"
            className={`mb-14 inline-block text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
          >
            {'<- projects'}
          </Link>

          {/* ── Header: title + intro ── */}
          <div className="mb-16 grid gap-12 md:grid-cols-2">
            <header>
              <p className={`mb-3 text-xs font-medium lowercase ${theme.muted}`}>{getProjectCategoryLabel(project.category)}</p>
              <h1 className={`mb-4 text-3xl font-medium leading-tight md:text-5xl ${theme.text}`}>{project.title}</h1>
              <p className={`mb-6 text-xs ${theme.muted}`}>
                {project.year} - {project.location}
              </p>
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {project.tags.map((tag) => (
                    <span key={tag} className={`border px-3 py-1 text-[11px] font-medium lowercase ${theme.muted} ${theme.border}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>
            <div>
              <p className={`text-sm leading-relaxed ${theme.text}`}>
                {content.introText || project.description || project.short_description}
              </p>
            </div>
          </div>

          {/* ── Three.js scene ── */}
          {content.sceneComponent !== 'none' && (
            <div className={`mb-12 overflow-hidden ${theme.surface} ${
              isIstanbul
                ? 'w-full aspect-[21/9] md:aspect-[24/9]'
                : `border ${theme.border} w-full aspect-[16/7]`
            }`}>
              <ProjectScene component={content.sceneComponent} />
            </div>
          )}

          {/* ── Cover image ── */}
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

          {/* ── Overview + info fields ── */}
          <div className="mt-16 mb-16 grid gap-x-16 gap-y-12 md:grid-cols-[1fr_280px]">
            <div>
              <div className="mb-8">
                <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{content.introLabel || 'overview'}</p>
                <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{content.introTitle || 'project narrative'}</h2>
              </div>
              <p className={`mb-5 text-sm leading-relaxed ${theme.text}`}>
                {content.introText || project.description || project.short_description}
              </p>
              {hasDetailSections && content.processText ? (
                <p className={`text-sm leading-relaxed ${theme.text}`}>{content.processText}</p>
              ) : (
                project.description &&
                content.introText !== project.description && (
                  <p className={`text-sm leading-relaxed ${theme.text}`}>{project.description}</p>
                )
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

          {/* ── Process section ── */}
          {hasProcessSection && (
            <section className="mt-16 mb-16">
              <div className="mb-8">
                <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{content.processLabel || (isInvolvement ? 'involvement' : 'process')}</p>
                <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{content.processTitle || (isInvolvement ? 'scope of work' : 'development')}</h2>
              </div>
              {content.processText && (
                <p className={`mb-10 max-w-3xl text-sm leading-relaxed ${theme.text}`}>{content.processText}</p>
              )}
              {content.processImages.length > 0 && (
                <SimpleImageRows
                  srcs={content.processImages}
                  altPrefix={`${project.title} process`}
                  onOpen={openImage}
                />
              )}
            </section>
          )}

          {/* ── Detail sections (accordion chapters) ── */}
          {hasDetailSections && (
            <section className="mt-16 mb-16">
              <div className="mb-8">
                <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{content.chaptersLabel || 'thesis chapters'}</p>
                <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{content.chaptersTitle || 'read the project deeper'}</h2>
              </div>

              <div className={`border-t ${theme.border}`}>
                {(content.detailSections ?? []).map((section, sectionIndex) => {
                  const isOpen = Boolean(openSections[section.id])

                  return (
                    <div key={section.id} className={`border-b ${theme.border}`}>
                      {/* Accordion trigger */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-6 py-6 text-left"
                      >
                        <div className="max-w-3xl">
                          {section.eyebrow && (
                            <p className={`mb-2 text-[11px] tracking-widest lowercase ${theme.muted}`}>{section.eyebrow}</p>
                          )}
                          <h3 className={`text-xl font-medium lowercase md:text-2xl ${theme.text}`}>{section.title}</h3>
                          <p className={`mt-3 text-sm leading-relaxed ${theme.text}`}>{section.summary}</p>
                        </div>
                        <span
                          className={`mt-1 text-xl leading-none transition-transform ${theme.accent} ${isOpen ? 'rotate-90' : ''}`}
                          aria-hidden="true"
                        >
                          {'->'}
                        </span>
                      </button>

                      {/* Accordion content */}
                      {isOpen && (
                        <div className="pb-10">
                          {/* Three.js scene – full content width or screen width */}
                          {section.includeScene && content.sceneComponent !== 'none' && (
                            <div className="mb-12">
                              <div className={`overflow-hidden ${theme.surface} ${
                                isIstanbul
                                  ? 'w-full aspect-[21/9] md:aspect-[24/9]'
                                  : `border ${theme.border} w-full aspect-[16/7]`
                              }`}>
                                <ProjectScene component={content.sceneComponent} />
                              </div>
                              <p className={`mt-3 text-[11px] leading-relaxed uppercase tracking-widest ${theme.muted}`}>
                                {isIstanbul ? 'Interactive Hazard Simulation' : '3D Study'}
                              </p>
                            </div>
                          )}

                          {/* Text paragraphs */}
                          {section.paragraphs.length > 0 && (
                            <div className="mb-10 max-w-3xl">
                              {section.paragraphs.map((paragraph) => (
                                <p key={paragraph} className={`mb-5 text-sm leading-relaxed ${theme.text}`}>
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Images in RPBW scattered rows */}
                          {section.images.length > 0 && (
                            <DetailImageRows
                              images={section.images}
                              fallbackPrefix={`${project.title} ${section.title}`}
                              onOpen={openImage}
                              backgroundClass={theme.warm}
                              borderClass={theme.border}
                              textClass={theme.muted}
                              priority={sectionIndex === 0}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Schematic section (accordion) ── */}
          {hasSchematicSection && (
            <section className="mt-16 mb-16">
              <div className={`border-t ${theme.border}`}>
                <div className={`border-b ${theme.border}`}>
                  <button
                    type="button"
                    onClick={() => setSchematicOpen(!schematicOpen)}
                    aria-expanded={schematicOpen}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left"
                  >
                    <div className="max-w-3xl">
                      <p className={`mb-2 text-[11px] tracking-widest lowercase ${theme.muted}`}>{content.schematicLabel || (isInvolvement ? 'role' : 'schematics')}</p>
                      <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{content.schematicTitle || (isInvolvement ? 'contribution' : 'systems and diagrams')}</h2>
                    </div>
                    <span
                      className={`mt-1 text-xl leading-none transition-transform ${theme.accent} ${schematicOpen ? 'rotate-90' : ''}`}
                      aria-hidden="true"
                    >
                      {'->'}
                    </span>
                  </button>

                  {schematicOpen && (
                    <div className="pb-10">
                      {content.schematicText && (
                        <p className={`mb-10 max-w-3xl text-sm leading-relaxed ${theme.text}`}>{content.schematicText}</p>
                      )}
                      {content.schematicImages.length > 0 && (
                        <SimpleImageRows
                          srcs={content.schematicImages}
                          altPrefix={`${project.title} schematic`}
                          onOpen={openImage}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Gallery section ── */}
          {hasGallerySection && (
            <section className="mt-16">
              <div className="mb-8">
                <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{content.galleryLabel || 'gallery'}</p>
                <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{content.galleryTitle || 'project images'}</h2>
              </div>
              {galleryImages.length > 0 ? (
                <SimpleImageRows
                  srcs={galleryImages}
                  altPrefix={`${project.title} image`}
                  onOpen={openImage}
                />
              ) : (
                <div className={`mt-3 flex aspect-[16/9] items-center justify-center ${theme.warm}`}>
                  <p className={`text-[11px] tracking-widest lowercase ${theme.subtle}`}>gallery images coming soon</p>
                </div>
              )}
            </section>
          )}

          {/* ── Awards ── */}
          {hasAwards && (
            <section className="mt-16">
              <div className="mb-8">
                <p className={`mb-3 text-[11px] tracking-widest lowercase ${theme.muted}`}>{content.awardsLabel || 'awards'}</p>
                <h2 className={`text-2xl font-medium lowercase md:text-3xl ${theme.text}`}>{content.awardsTitle || 'recognition'}</h2>
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

          {/* ── Footer nav ── */}
          <div className={`mt-20 flex items-center justify-between border-t pt-10 ${theme.border}`}>
            <Link
              href="/projects"
              aria-label="Back to all projects"
              className={`text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
            >
              {'<- all projects'}
            </Link>
            <Link
              href="/contact"
              aria-label="Contact page"
              className={`text-xs font-medium lowercase transition-colors ${theme.muted} ${isIstanbul ? 'hover:text-white' : 'hover:text-ink'}`}
            >
              {'get in touch ->'}
            </Link>
          </div>
        </article>
      </div>

      {/* ── Lightbox ── */}
      {activeImageIndex !== null && lightboxImages[activeImageIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8"
          onClick={() => setActiveImageIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Close lightbox"
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
                aria-label="Previous image"
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
                aria-label="Next image"
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
