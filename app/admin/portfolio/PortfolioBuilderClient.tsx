'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getProjectCategoryLabel } from '@/lib/project-data'
import type { ResolvedProjectPageData } from '@/lib/project-page-data'

type Orientation = 'portrait' | 'landscape'

const ABOUT_TEXT = [
  'Architect, researcher, and technologist working across built environments, exhibitions, and systems of design production.',
  'This section is a placeholder for a concise statement about your approach, background, and current direction. Replace this with the text you want in the final portfolio.',
]

const EXPERIENCE_ITEMS = [
  { period: '2025 - present', title: 'Project Manager', place: 'Maestro Technologies' },
  { period: '2024 - present', title: 'Architect', place: 'CRA-Carlo Ratti Associati' },
  { period: '2023 - present', title: 'Co-founder', place: 'Cumba Architectural Collective' },
]

const SKILL_GROUPS = [
  { label: 'Design', items: ['Architecture', 'Exhibitions', 'Spatial Strategy', 'Furniture'] },
  { label: 'Delivery', items: ['Project Management', 'Procurement', 'Site Coordination', 'Executive Detailing'] },
  { label: 'Tools', items: ['Rhino', 'Adobe Suite', 'Visualization', 'Digital Workflows'] },
]

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
      className={`portfolio-page ${orientation} ${screenSize} relative overflow-hidden border border-black bg-white text-black shadow-[0_18px_40px_rgba(0,0,0,0.08)] print:shadow-none`}
    >
      {children}
      <div className="absolute bottom-6 right-8 text-[10px] uppercase tracking-[0.28em] text-black/45">
        {String(pageNumber).padStart(2, '0')}
      </div>
    </article>
  )
}

function SectionTitle({
  label,
  title,
}: {
  label: string
  title: string
}) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-[10px] uppercase tracking-[0.32em] text-black/45">{label}</p>
      <h2 className="max-w-[12ch] text-[2.25rem] font-medium uppercase leading-[0.92] tracking-[-0.06em] md:text-[3rem]">
        {title}
      </h2>
    </div>
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
      <div className="flex h-full flex-col justify-between p-10 md:p-12">
        <div className="flex items-start justify-between border-b border-black pb-8">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-black/45">Portfolio</p>
            <h1 className="max-w-[8ch] text-[3.25rem] font-medium uppercase leading-[0.88] tracking-[-0.08em] md:text-[5rem]">
              Eren Sezer
            </h1>
          </div>
          <p className="pt-1 text-[10px] uppercase tracking-[0.28em] text-black/45">A3 {orientation}</p>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="max-w-xl text-[15px] leading-8 text-black/78">
              Selected works in architecture, research, exhibition design, and collaborative project delivery.
            </p>
            <p className="max-w-xl text-[13px] leading-7 text-black/62">
              This portfolio is generated from the website content and arranged in a simple print layout for review, export, and iteration.
            </p>
          </div>
          <div className="border-l border-black pl-6">
            <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-black/45">Included Projects</p>
            <div className="space-y-3">
              {projects.map((item) => (
                <div key={item.project.slug} className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em]">{item.project.title}</span>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-black/45">{item.project.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-black pt-5 md:grid-cols-3">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">Architecture</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">Research</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">Project Delivery</p>
        </div>
      </div>
    </PageFrame>
  )
}

function AboutPage({ orientation, pageNumber }: { orientation: Orientation; pageNumber: number }) {
  return (
    <PageFrame orientation={orientation} pageNumber={pageNumber}>
      <div className="grid h-full md:grid-cols-[0.9fr_1.1fr]">
        <div className="border-r border-black p-10 md:p-12">
          <SectionTitle label="Profile" title="About" />
          <div className="space-y-6">
            {ABOUT_TEXT.map((paragraph) => (
              <p key={paragraph} className="text-[14px] leading-8 text-black/75">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between p-10 md:p-12">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-black/45">Notes</p>
            <div className="space-y-5 border-t border-black pt-5 text-[12px] leading-7 text-black/68">
              <p>Use this page for your short biography, current position, research interests, and editorial statement.</p>
              <p>The layout is intentionally simple so it can support text-only versions or portrait-image versions later.</p>
            </div>
          </div>
          <div className="border-t border-black pt-5">
            <p className="text-[10px] uppercase tracking-[0.32em] text-black/45">Contact</p>
            <p className="mt-3 text-[13px] leading-7">eren.sezer@hotmail.com</p>
          </div>
        </div>
      </div>
    </PageFrame>
  )
}

function ExperiencePage({ orientation, pageNumber }: { orientation: Orientation; pageNumber: number }) {
  return (
    <PageFrame orientation={orientation} pageNumber={pageNumber}>
      <div className="h-full p-10 md:p-12">
        <SectionTitle label="Background" title="Experience" />
        <div className="border-t border-black">
          {EXPERIENCE_ITEMS.map((item) => (
            <div key={`${item.period}-${item.title}`} className="grid gap-4 border-b border-black py-5 md:grid-cols-[140px_1fr_1fr]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">{item.period}</p>
              <p className="text-[14px] font-medium uppercase tracking-[0.08em]">{item.title}</p>
              <p className="text-[13px] leading-7 text-black/72">{item.place}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 max-w-2xl">
          <p className="text-[12px] leading-7 text-black/62">
            Replace these entries with your preferred roles, dates, collaborators, and a shorter or longer chronology depending on the portfolio version.
          </p>
        </div>
      </div>
    </PageFrame>
  )
}

function SkillsPage({ orientation, pageNumber }: { orientation: Orientation; pageNumber: number }) {
  return (
    <PageFrame orientation={orientation} pageNumber={pageNumber}>
      <div className="h-full p-10 md:p-12">
        <SectionTitle label="Capabilities" title="Skills" />
        <div className="grid gap-8 md:grid-cols-3">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label} className="border-t border-black pt-4">
              <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-black/45">{group.label}</p>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <p key={item} className="border-b border-black/10 pb-3 text-[13px] uppercase tracking-[0.1em] text-black/78">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-black pt-5">
          <p className="max-w-2xl text-[12px] leading-7 text-black/62">
            This page is a placeholder. You can turn it into software skills, design competencies, fabrication methods, or a combination of all three.
          </p>
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
  const involvement = item.content.processText
  const awards = item.content.awards.filter(Boolean).slice(0, 2)

  return (
    <PageFrame orientation="portrait" pageNumber={pageNumber}>
      <div className="flex h-full flex-col p-9">
        <div className="grid grid-cols-[1fr_auto] items-start gap-6 border-b border-black pb-6">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-black/45">{getProjectCategoryLabel(item.project.category)}</p>
            <h2 className="max-w-[10ch] text-[2.4rem] font-medium uppercase leading-[0.92] tracking-[-0.06em]">
              {item.project.title}
            </h2>
          </div>
          <div className="pt-1 text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">{item.project.year}</p>
            <p className="mt-2 max-w-[18ch] text-[10px] uppercase tracking-[0.18em] leading-4 text-black/45">{item.project.location}</p>
          </div>
        </div>

        <div className="mt-7 border border-black bg-[#f3f3f3]">
          {hero ? (
            <div className="relative aspect-[1.25/1]">
              <Image src={hero} alt={item.project.title} fill sizes="60vw" className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[1.25/1] items-center justify-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/35">image pending</p>
            </div>
          )}
        </div>

        <div className="mt-7 grid flex-1 gap-8">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-black/45">Summary</p>
              <p className="text-[13px] leading-7 text-black/74">
                {item.content.introText || item.project.description || item.project.short_description}
              </p>
            </div>
            <div className="border-l border-black pl-5">
              <div className="space-y-4 text-[11px] leading-6 text-black/72">
                {office && (
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/42">Office</p>
                    <p>{office}</p>
                  </div>
                )}
                {role && (
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/42">Role</p>
                    <p>{role}</p>
                  </div>
                )}
                {involvement && (
                  <div>
                    <p className="uppercase tracking-[0.18em] text-black/42">{item.project.category === 'involvement' ? 'Involvement' : 'Development'}</p>
                    <p>{involvement}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(gallery.length > 1 || awards.length > 0) && (
            <div className="grid gap-5 md:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-2 gap-3">
                {gallery.slice(1, 3).map((src, index) => (
                  <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden border border-black bg-[#f3f3f3]">
                    <Image src={src} alt={`${item.project.title} gallery ${index + 1}`} fill sizes="30vw" className="object-cover" />
                  </div>
                ))}
              </div>
              {awards.length > 0 && (
                <div className="w-full max-w-[220px] border border-black p-4">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-black/45">Recognition</p>
                  <div className="space-y-3 text-[11px] leading-6 text-black/75">
                    {awards.map((award) => (
                      <p key={award}>{award}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
  const awards = item.content.awards.filter(Boolean)

  return (
    <PageFrame orientation="landscape" pageNumber={pageNumber}>
      <div className="grid h-full grid-cols-[0.74fr_1.26fr]">
        <div className="border-r border-black p-8">
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-black/45">{getProjectCategoryLabel(item.project.category)}</p>
          <h2 className="max-w-[10ch] text-[2.65rem] font-medium uppercase leading-[0.92] tracking-[-0.06em]">
            {item.project.title}
          </h2>
          <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-black/45">
            {item.project.year} / {item.project.location}
          </p>

          <div className="mt-10 space-y-7">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-black/45">Summary</p>
              <p className="text-[13px] leading-7 text-black/74">
                {item.content.introText || item.project.description || item.project.short_description}
              </p>
            </div>

            <div className="space-y-4 border-t border-black pt-4 text-[11px] leading-6 text-black/72">
              {office && (
                <div>
                  <p className="uppercase tracking-[0.18em] text-black/42">Office</p>
                  <p>{office}</p>
                </div>
              )}
              {role && (
                <div>
                  <p className="uppercase tracking-[0.18em] text-black/42">Role</p>
                  <p>{role}</p>
                </div>
              )}
              {item.content.processText && (
                <div>
                  <p className="uppercase tracking-[0.18em] text-black/42">{item.project.category === 'involvement' ? 'Involvement' : 'Development'}</p>
                  <p>{item.content.processText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid h-full grid-rows-[1fr_auto] p-8">
          <div className="border border-black bg-[#f3f3f3]">
            {hero ? (
              <div className="relative h-full w-full">
                <Image src={hero} alt={item.project.title} fill sizes="70vw" className="object-cover" />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/35">image pending</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 pt-4 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-3 gap-3">
              {gallery.slice(1, 4).map((src, index) => (
                <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden border border-black bg-[#f3f3f3]">
                  <Image src={src} alt={`${item.project.title} gallery ${index + 1}`} fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
            {awards.length > 0 && (
              <div className="max-w-[240px] border border-black p-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-black/45">Recognition</p>
                <p className="text-[11px] leading-6 text-black/75">{awards[0]}</p>
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
              Select projects, choose A3 portrait or landscape, and generate a stripped-back print layout.
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
          <aside className="portfolio-controls h-fit border border-rule bg-white p-5 xl:sticky xl:top-24 print:hidden">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted">Format</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(['portrait', 'landscape'] as Orientation[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDraftOrientation(option)}
                    className={`border px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition-colors ${
                      draftOrientation === option
                        ? 'border-ink bg-ink text-white'
                        : 'border-rule bg-white text-ink'
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
                <button type="button" onClick={() => selectGroup('featured')} className="border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">Featured</button>
                <button type="button" onClick={() => selectGroup('personal')} className="border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">Personal</button>
                <button type="button" onClick={() => selectGroup('involvement')} className="border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">Involvements</button>
                <button type="button" onClick={() => selectGroup('all')} className="border border-rule px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-ink">All</button>
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
                    className={`block cursor-pointer border px-4 py-3 transition-colors ${
                      checked ? 'border-ink bg-warm' : 'border-rule bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSlug(item.project.slug)}
                        className="mt-1 h-4 w-4 border-rule text-ink focus:ring-0"
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

          <section className="portfolio-preview border border-rule bg-[#f3efe9] p-4 md:p-7 print:border-0 print:bg-white print:p-0">
            {generatedProjects.length > 0 ? (
              <div className="flex flex-col items-center gap-8 print:gap-0">
                <CoverPage projects={generatedProjects} orientation={activeOrientation} />
                <AboutPage orientation={activeOrientation} pageNumber={2} />
                <ExperiencePage orientation={activeOrientation} pageNumber={3} />
                <SkillsPage orientation={activeOrientation} pageNumber={4} />
                {generatedProjects.map((item, index) =>
                  activeOrientation === 'portrait' ? (
                    <PortraitProjectPage key={item.project.slug} item={item} pageNumber={index + 5} />
                  ) : (
                    <LandscapeProjectPage key={item.project.slug} item={item} pageNumber={index + 5} />
                  )
                )}
              </div>
            ) : (
              <div className="flex min-h-[60vh] items-center justify-center border border-dashed border-[#cbbfb3] bg-white text-center">
                <div className="max-w-md px-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">Portfolio Preview</p>
                  <h2 className="mt-4 text-3xl font-medium tracking-[-0.05em] text-black">Select projects and generate a layout.</h2>
                  <p className="mt-4 text-sm leading-7 text-black/62">
                    The preview includes a cover, about, experience, skills, and the selected project pages.
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
