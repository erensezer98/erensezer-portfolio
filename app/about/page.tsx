import type { Metadata } from 'next'
import { getSiteSettings, getPageContent, getTextStyles } from '@/lib/supabase'
import PageRenderer from '@/components/page-renderer/PageRenderer'

export const metadata: Metadata = {
  title: 'About',
  description: 'Eren Sezer — architect and digital designer. Master of Building Architecture at Politecnico di Milano.',
}

const experience = [
  { role: 'Master of Building Architecture',     org: 'Politecnico di Milano',            period: '2021 – present', note: '' },
  { role: 'Office & Design, Execution Drawings', org: 'Agaoğlu Architecture',             period: '2021 – 2022',    note: 'Facade systems, housing & shopping malls — Istanbul' },
  { role: 'Architectural Internship',            org: 'TAGO Architects',                  period: '2019',           note: 'Interior design, housing & renovation — Istanbul' },
  { role: 'Architectural Internship',            org: 'Metrekare Yapı Construction Inc.', period: '2018',           note: 'Site management & technical drawings — Istanbul' },
  { role: 'Bachelor of Architecture (Honours)',  org: 'FMV Işık University, Istanbul',    period: '2016 – 2020',    note: '' },
]

const software = [
  'Autodesk AutoCAD', 'Autodesk Revit', 'Rhino + Grasshopper',
  'SketchUp', 'Adobe Creative Suite', 'Lumion / V-Ray', 'ArchiCAD',
]

const languages = [
  { name: 'Turkish', level: 'Native' },
  { name: 'English', level: 'C1 Advanced' },
  { name: 'Italian',  level: 'B1 Beginner' },
]

export default async function AboutPage() {
  const [settings, pageContent, textStyles] = await Promise.all([
    getSiteSettings(),
    getPageContent('about'),
    getTextStyles()
  ])

  if (pageContent?.blocks?.length) {
    return (
      <div className="px-6 md:px-10 pt-28 pb-32 max-w-screen-xl mx-auto flex flex-col items-center">
        <PageRenderer blocks={pageContent.blocks} textStyles={textStyles} />
      </div>
    )
  }

  const bioGrid = settings.about_bio_cols === 2
    ? 'grid md:grid-cols-2 gap-16'
    : 'max-w-2xl'

  return (
    <div className="px-6 md:px-10 pt-28 pb-32">

      <p className="text-[13px] text-muted mb-16">about</p>

      {/* Bio */}
      <div className={`${bioGrid} mb-24`}>
        <div className="space-y-5 text-sm text-ink leading-relaxed">
          <p>
            I am an architect with a deep interest in digital technologies and how
            they reshape the way we conceive space. Currently completing my Master of
            Sciences in Building Architecture at the Politecnico di Milano, I explore:{' '}
            <em>how will the increasing digitalisation of the world affect architectural design?</em>
          </p>
          <p>
            My work spans academic research projects, competition entries, and freelance
            commissions — from vertical farms in Milan to festival pavilions in South Korea.
            I believe architecture should bridge the material and the digital, using technology
            not as an end but as a tool for richer spatial experiences.
          </p>
          <p>
            When I am not designing, I am engaged in student councils, dance competitions,
            and exploring new tools at the boundary of architecture and computation.
          </p>
        </div>
        {settings.about_show_photo && settings.about_bio_cols === 2 && (
          <div className="aspect-[3/4] bg-warm" />
        )}
      </div>

      {/* Experience */}
      <section className="mb-24 max-w-2xl">
        <p className="text-xs text-muted mb-10">experience & education</p>
        {experience.map((item, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-4 border-t border-rule py-6 last:border-b">
            <p className="text-xs text-muted pt-0.5">{item.period}</p>
            <div className="md:col-span-3">
              <p className="text-[13px] text-ink">{item.role}</p>
              <p className="text-xs text-muted mt-0.5">{item.org}</p>
              {item.note && <p className="text-xs text-muted/60 mt-1">{item.note}</p>}
            </div>
          </div>
        ))}
      </section>

      {/* Software + Languages */}
      <div className="grid md:grid-cols-2 gap-16 max-w-2xl">
        <section>
          <p className="text-xs text-muted mb-8">software</p>
          {software.map((s) => (
            <p key={s} className="text-[13px] text-ink border-t border-rule py-3 last:border-b">{s}</p>
          ))}
        </section>

        <section>
          <p className="text-xs text-muted mb-8">languages</p>
          {languages.map((l) => (
            <div key={l.name} className="flex justify-between border-t border-rule py-3 last:border-b">
              <p className="text-[13px] text-ink">{l.name}</p>
              <p className="text-xs text-muted">{l.level}</p>
            </div>
          ))}

          <div className="mt-12">
            <p className="text-xs text-muted mb-3">contact</p>
            <a href="mailto:eren@maestro-tech.com" className="text-[13px] text-ink hover:text-muted transition-colors underline underline-offset-4 decoration-rule">
              eren@maestro-tech.com
            </a>
          </div>
        </section>
      </div>

    </div>
  )
}
