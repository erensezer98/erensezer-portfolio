'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getProjectCategoryLabel } from '@/lib/project-data'
import type { ResolvedProjectPageData } from '@/lib/project-page-data'

type Orientation = 'portrait' | 'landscape'

function getInfoValue(project: ResolvedProjectPageData, labels: string[]) {
  const field = project.content.infoFields.find((item) =>
    labels.some((label) => item.label.toLowerCase() === label.toLowerCase())
  )

  return field?.value?.trim() || ''
}

function getPreviewPages(projects: ResolvedProjectPageData[]) {
  return projects.filter((item) => item.project.slug !== 'awayout')
}

function PageFrame({
  orientation,
  children,
  pageNumber,
}: {
  orientation: Orientation
  children: React.ReactNode
  pageNumber: number
}) {
  const screenSize =
    orientation === 'portrait'
      ? 'w-full max-w-[580px] aspect-[297/420]'
      : 'w-full max-w-[820px] aspect-[420/297]'

  return (
    <article
      className={`portfolio-page ${orientation} ${screenSize} relative overflow-hidden border border-[#d8d0c7] bg-[#f7f2eb] text-[#211d19] shadow-[0_30px_70px_rgba(40,36,32,0.12)] print:shadow-none`}
    >
      {children}
      <div className="absolute bottom-6 right-7 text-[10px] uppercase tracking-[0.28em] text-[#8f8478]">
        {String(pageNumber).padStart(2, '0')}
      </div>
    </article>
  )
}

function CoverPage({
  projects,
  orientation,
}: {
  projects: ResolvedProjectPageData[]
  orientation: Orientation
}) {
  return (
    <PageFrame orientation={orientation} pageNumber={1}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.88),_transparent_48%),linear-gradient(140deg,_#f7f2eb_0%,_#efe5db_52%,_#f8f3ee_100%)]" />
      <div className="relative flex h-full flex-col justify-between p-9 md:p-12">
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-[60%]">
            <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[#8d8378]">Generated Portfolio</p>
            <h1 className="max-w-[8ch] text-[2.8rem] font-medium uppercase leading-[0.9] tracking-[-0.06em] md:text-[4.8rem]">
              Eren Sezer
            </h1>
          </div>
          <div className="rounded-full border border-[#d8d0c7] bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#74695f]">
            A3 {orientation}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="max-w-xl text-sm leading-7 text-[#5c5248]">
              A curated selection of work across architecture, research, design, and built collaborations.
              This layout is generated directly from the portfolio site and designed for print, PDF export,
              and quick presentation edits.
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-[#ddd2c6] bg-white/70 p-5 backdrop-blur">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#8d8378]">Included Projects</p>
            <div className="space-y-2">
              {projects.map((item) => (
                <div key={item.project.slug} className="flex items-baseline justify-between gap-4 border-b border-[#efe7df] pb-2 text-[11px]">
                  <span className="font-medium uppercase tracking-[0.16em] text-[#312c27]">{item.project.title}</span>
                  <span className="shrink-0 text-[#8d8378]">{item.project.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#ddd2c6] bg-[#201d19] px-5 py-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">Focus</p>
            <p className="mt-4 text-lg leading-tight">Architecture, exhibitions, urban research, and integrated design delivery.</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#ddd2c6] bg-white/80 px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#8d8378]">Formats</p>
            <p className="mt-4 text-sm leading-6 text-[#4d443b]">A3 portrait and landscape previews with print-ready page proportions and project-level curation.</p>
          </div>
          <div className="rounded-[1.5rem] border border-[#ddd2c6] bg-[#d8aa78] px-5 py-4 text-[#241f1a]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#5d4a38]">Count</p>
            <p className="mt-4 text-4xl font-medium tracking-[-0.06em]">{projects.length}</p>
          </div>
        </div>
      </div>
    </PageFrame>
  )
}

function PortraitProjectPage({ item, pageNumber }: { item: ResolvedProjectPageData; pageNumber: number }) {
  const gallery = item.content.galleryImages.length ? item.content.galleryImages : item.project.images
  const hero = item.project.cover_image || gallery[0] || null
  const office = getInfoValue(item, ['Office', 'Client'])
  const role = getInfoValue(item, ['Role', 'Program', 'Status'])
  const awards = item.content.awards.filter(Boolean).slice(0, 2)

  return (
    <PageFrame orientation="portrait" pageNumber={pageNumber}>
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-[1fr_auto] items-start gap-6 px-9 pb-7 pt-8">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#8f8478]">{getProjectCategoryLabel(item.project.category)}</p>
            <h2 className="max-w-[9ch] text-[2.35rem] font-medium uppercase leading-[0.92] tracking-[-0.06em]">
              {item.project.title}
            </h2>
          </div>
          <div className="pt-1 text-right text-[10px] uppercase tracking-[0.24em] text-[#8f8478]">
            <p>{item.project.year}</p>
            <p className="mt-2 max-w-[18ch] leading-4">{item.project.location}</p>
          </div>
        </div>

        <div className="mx-8 overflow-hidden rounded-[2rem] border border-[#ddd2c6] bg-[#ece2d7]">
          {hero ? (
            <div className="relative aspect-[1.2/1]">
              <Image src={hero} alt={item.project.title} fill sizes="60vw" className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[1.2/1] items-center justify-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#9d9184]">cover image pending</p>
            </div>
          )}
        </div>

        <div className="grid flex-1 gap-8 px-9 py-8">
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#8f8478]">Summary</p>
              <p className="text-[13px] leading-6 text-[#403831]">
                {item.content.introText || item.project.description || item.project.short_description}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-[#ddd2c6] bg-white/80 p-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#8f8478]">Key Notes</p>
              <div className="space-y-3 text-[11px] leading-5 text-[#4e453c]">
                {office && (
                  <div>
                    <p className="uppercase tracking-[0.18em] text-[#93887c]">Office</p>
                    <p>{office}</p>
                  </div>
                )}
                {role && (
                  <div>
                    <p className="uppercase tracking-[0.18em] text-[#93887c]">Role</p>
                    <p>{role}</p>
                  </div>
                )}
                {item.content.processText && (
                  <div>
                    <p className="uppercase tracking-[0.18em] text-[#93887c]">{item.project.category === 'involvement' ? 'Involvement' : 'Development'}</p>
                    <p>{item.content.processText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(0, 3).map((src, index) => (
                <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[1rem] border border-[#ddd2c6] bg-[#ece2d7]">
                  <Image src={src} alt={`${item.project.title} gallery ${index + 1}`} fill sizes="20vw" className="object-cover" />
                </div>
              ))}
            </div>
            {awards.length > 0 && (
              <div className="w-full max-w-[220px] rounded-[1.4rem] bg-[#201d19] px-4 py-4 text-white">
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-white/50">Recognition</p>
                <div className="space-y-3 text-[11px] leading-5">
                  {awards.map((award) => (
                    <p key={award}>{award}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  )
}

function LandscapeProjectPage({ item, pageNumber }: { item: ResolvedProjectPageData; pageNumber: number }) {
  const gallery = item.content.galleryImages.length ? item.content.galleryImages : item.project.images
  const hero = item.project.cover_image || gallery[0] || null
  const office = getInfoValue(item, ['Office', 'Client'])
  const role = getInfoValue(item, ['Role', 'Program', 'Status'])

  return (
    <PageFrame orientation="landscape" pageNumber={pageNumber}>
      <div className="grid h-full grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col justify-between border-r border-[#ddd2c6] bg-[linear-gradient(180deg,_rgba(255,255,255,0.82),_rgba(247,242,235,0.95))] p-8">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#8f8478]">{getProjectCategoryLabel(item.project.category)}</p>
            <h2 className="max-w-[10ch] text-[2.7rem] font-medium uppercase leading-[0.92] tracking-[-0.06em]">
              {item.project.title}
            </h2>
            <p className="mt-5 max-w-[24ch] text-[12px] uppercase tracking-[0.18em] text-[#8f8478]">
              {item.project.year} / {item.project.location}
            </p>
          </div>

          <div className="space-y-5">
            <p className="text-[13px] leading-6 text-[#403831]">
              {item.content.introText || item.project.description || item.project.short_description}
            </p>
            <div className="grid gap-3">
              {office && (
                <div className="rounded-[1.2rem] border border-[#ddd2c6] bg-white/80 px-4 py-3">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-[#918578]">Office</p>
                  <p className="text-[11px] leading-5 text-[#453d35]">{office}</p>
                </div>
              )}
              {role && (
                <div className="rounded-[1.2rem] border border-[#ddd2c6] bg-white/80 px-4 py-3">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.24em] text-[#918578]">Role</p>
                  <p className="text-[11px] leading-5 text-[#453d35]">{role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid h-full grid-rows-[1fr_auto] bg-[#efe6dc] p-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-[#ddd2c6] bg-[#ddd0c4]">
            {hero ? (
              <Image src={hero} alt={item.project.title} fill sizes="70vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#94887c]">cover image pending</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-6 pt-14 text-white">
              <p className="max-w-2xl text-sm leading-6">
                {item.content.schematicText || item.content.processText || item.project.short_description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 pt-5 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(0, 3).map((src, index) => (
                <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[1rem] border border-[#ddd2c6] bg-[#e8ddd2]">
                  <Image src={src} alt={`${item.project.title} gallery ${index + 1}`} fill sizes="24vw" className="object-cover" />
                </div>
              ))}
            </div>
            {item.content.awards.length > 0 && (
              <div className="max-w-[260px] rounded-[1.2rem] border border-[#d7cbbf] bg-[#201d19] px-4 py-4 text-white">
                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-white/50">Recognition</p>
                <p className="text-[11px] leading-5">{item.content.awards[0]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  )
}

export default function PortfolioBuilderClient({
  projects,
}: {
  projects: ResolvedProjectPageData[]
}) {
  const visibleProjects = getPreviewPages(projects)
  const defaultSlugs = visibleProjects.filter((item) => item.project.featured).map((item) => item.project.slug)
  const initialSelection = defaultSlugs.length ? defaultSlugs : visibleProjects.slice(0, 4).map((item) => item.project.slug)

  const [draftSlugs, setDraftSlugs] = useState<string[]>(initialSelection)
  const [draftOrientation, setDraftOrientation] = useState<Orientation>('portrait')
  const [activeSlugs, setActiveSlugs] = useState<string[]>(initialSelection)
  const [activeOrientation, setActiveOrientation] = useState<Orientation>('portrait')

  const generatedProjects = visibleProjects.filter((item) => activeSlugs.includes(item.project.slug))

  function toggleSlug(slug: string) {
    setDraftSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    )
  }

  function selectGroup(type: 'all' | 'personal' | 'involvement' | 'featured') {
    if (type === 'all') {
      setDraftSlugs(visibleProjects.map((item) => item.project.slug))
      return
    }

    if (type === 'featured') {
      const featured = visibleProjects.filter((item) => item.project.featured).map((item) => item.project.slug)
      setDraftSlugs(featured.length ? featured : visibleProjects.slice(0, 4).map((item) => item.project.slug))
      return
    }

    setDraftSlugs(
      visibleProjects
        .filter((item) => (type === 'involvement' ? item.project.category === 'involvement' : item.project.category !== 'involvement'))
        .map((item) => item.project.slug)
    )
  }

  function generatePortfolio() {
    setActiveSlugs(draftSlugs)
    setActiveOrientation(draftOrientation)
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A3 ${activeOrientation};
            margin: 0;
          }

          body {
            background: #ffffff !important;
          }

          .portfolio-builder-shell {
            display: block !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .portfolio-controls {
            display: none !important;
          }

          .portfolio-preview {
            gap: 0 !important;
            padding: 0 !important;
          }

          .portfolio-page {
            break-after: page;
            page-break-after: always;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }

          .portfolio-page.portrait {
            width: 297mm !important;
            min-height: 420mm !important;
            max-width: none !important;
          }

          .portfolio-page.landscape {
            width: 420mm !important;
            min-height: 297mm !important;
            max-width: none !important;
          }
        }
      `}</style>

      <div className="space-y-8 print:space-y-0">
        <div className="portfolio-controls flex flex-col gap-4 md:flex-row md:items-end md:justify-between print:hidden">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted">admin / portfolio</p>
            <h1 className="text-4xl font-light text-ink">Portfolio Composer</h1>
            <p className="mt-3 max-w-3xl text-sm text-muted">
              Select the projects you want to include, switch between A3 portrait and landscape,
              and generate a print-ready editorial portfolio from the site content.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generatePortfolio}
              className="inline-flex items-center justify-center border border-ink bg-ink px-6 py-2.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-ink"
            >
              Generate Portfolio
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center border border-rule bg-white px-6 py-2.5 text-xs uppercase tracking-widest text-ink transition-colors hover:border-ink"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="portfolio-builder-shell grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] print:block">
          <aside className="portfolio-controls h-fit rounded-[2rem] border border-rule bg-white p-5 xl:sticky xl:top-24 print:hidden">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted">Format</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(['portrait', 'landscape'] as Orientation[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDraftOrientation(option)}
                    className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors ${
                      draftOrientation === option
                        ? 'border-ink bg-ink text-white'
                        : 'border-rule bg-warm text-ink'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted">Quick Select</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => selectGroup('featured')} className="rounded-full border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">Featured</button>
                <button type="button" onClick={() => selectGroup('personal')} className="rounded-full border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">Personal</button>
                <button type="button" onClick={() => selectGroup('involvement')} className="rounded-full border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">Involvements</button>
                <button type="button" onClick={() => selectGroup('all')} className="rounded-full border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">All</button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted">Projects</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted">{draftSlugs.length} selected</p>
            </div>

            <div className="space-y-2">
              {visibleProjects.map((item) => {
                const checked = draftSlugs.includes(item.project.slug)

                return (
                  <label
                    key={item.project.slug}
                    className={`block cursor-pointer rounded-[1.2rem] border px-4 py-3 transition-colors ${
                      checked ? 'border-ink bg-[#f4eee8]' : 'border-rule bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSlug(item.project.slug)}
                        className="mt-1 h-4 w-4 rounded border-rule text-ink focus:ring-0"
                      />
                      <div>
                        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink">{item.project.title}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">
                          {getProjectCategoryLabel(item.project.category)} / {item.project.year}
                        </p>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </aside>

          <section className="portfolio-preview rounded-[2rem] border border-rule bg-[#ece4da] p-4 md:p-7 print:border-0 print:bg-white print:p-0">
            {generatedProjects.length > 0 ? (
              <div className="flex flex-col items-center gap-8 print:gap-0">
                <CoverPage projects={generatedProjects} orientation={activeOrientation} />
                {generatedProjects.map((item, index) =>
                  activeOrientation === 'portrait' ? (
                    <PortraitProjectPage key={item.project.slug} item={item} pageNumber={index + 2} />
                  ) : (
                    <LandscapeProjectPage key={item.project.slug} item={item} pageNumber={index + 2} />
                  )
                )}
              </div>
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center rounded-[1.5rem] border border-dashed border-[#cbbfb3] bg-[#f7f2eb] text-center">
                <div className="max-w-md px-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#8f8478]">Portfolio Preview</p>
                  <h2 className="mt-4 text-3xl font-medium tracking-[-0.05em] text-[#231f1b]">Select projects and generate a layout.</h2>
                  <p className="mt-4 text-sm leading-7 text-[#6d6257]">
                    Once you generate the portfolio, this panel becomes a print-ready A3 preview that you can review and export as a PDF.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
