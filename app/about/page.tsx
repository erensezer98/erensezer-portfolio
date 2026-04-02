import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Eren Sezer — architect and digital designer. Master of Building Architecture at Politecnico di Milano.',
}

const skills = [
  { name: 'Autodesk AutoCAD', level: 7 },
  { name: 'Autodesk Revit', level: 6 },
  { name: 'Rhino + Grasshopper', level: 5 },
  { name: 'SketchUp', level: 7 },
  { name: 'Autodesk 3DS Max', level: 4 },
  { name: 'Adobe Creative Suite', level: 6 },
  { name: 'Lumion / V-Ray', level: 7 },
  { name: 'ArchiCAD', level: 5 },
]

const experience = [
  {
    role: 'Master of Building Architecture',
    org: 'Politecnico di Milano',
    period: '2021 – Present',
    type: 'education',
  },
  {
    role: 'Office & Design, Execution Drawings',
    org: 'Agaoğlu Architecture and Construction',
    period: '2021 – 2022',
    type: 'work',
    note: 'Facade Systems, Housing & Shopping Malls, Istanbul',
  },
  {
    role: 'Architectural Internship',
    org: 'TAGO Architects',
    period: '2019',
    type: 'work',
    note: 'Interior design, housing office & renovation, Istanbul',
  },
  {
    role: 'Architectural Internship',
    org: 'Metrekare Yapı Construction Inc.',
    period: '2018',
    type: 'work',
    note: 'Site management & technical drawings, Istanbul',
  },
  {
    role: 'Bachelor of Architecture (Honours)',
    org: 'FMV Işık University, Istanbul',
    period: '2016 – 2020',
    type: 'education',
  },
]

const languages = [
  { name: 'Turkish', level: 'Native' },
  { name: 'English', level: 'Advanced C1' },
  { name: 'Italian', level: 'Beginner B1' },
]

export default function AboutPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
      {/* Header */}
      <div className="mb-16">
        <p className="section-label mb-3">About</p>
        <h1 className="page-heading mb-10">Eren Sezer</h1>
        <div className="divider" />
      </div>

      {/* Bio + photo layout */}
      <div className="grid md:grid-cols-3 gap-16 mb-20">
        <div className="md:col-span-2 space-y-5 text-charcoal/80 text-base leading-relaxed">
          <p>
            I am an architect with a deep interest in digital technologies and
            how they reshape the way we conceive space. Currently completing my
            Master of Sciences in Building Architecture at the Politecnico di
            Milano, I explore the question:{' '}
            <em>
              how will the increasing digitalisation of the world affect
              architectural design?
            </em>
          </p>
          <p>
            My work spans academic research projects, competition entries, and
            freelance commissions — from vertical farms in Milan to festival
            pavilions in South Korea. I believe architecture should bridge the
            material and the digital, using technology not as an end but as a
            tool for richer spatial experiences.
          </p>
          <p>
            When I am not designing, I am engaged in student councils, dance
            competitions, and exploring new tools at the boundary of architecture
            and computation.
          </p>
        </div>

        {/* Placeholder for photo */}
        <div className="aspect-[3/4] bg-cream flex items-center justify-center">
          <p className="text-xs tracking-widest uppercase text-muted opacity-50">
            Photo
          </p>
        </div>
      </div>

      {/* Experience timeline */}
      <div className="mb-20">
        <p className="section-label mb-8">Experience &amp; Education</p>
        <div className="space-y-0">
          {experience.map((item, i) => (
            <div
              key={i}
              className="grid md:grid-cols-4 gap-4 py-6 border-b border-border last:border-0"
            >
              <div className="md:col-span-1">
                <p className="text-xs text-muted">{item.period}</p>
                <span
                  className={`inline-block mt-1 text-xs tracking-widest uppercase px-2 py-0.5 ${
                    item.type === 'education'
                      ? 'bg-salmon-pale text-salmon'
                      : 'bg-cream text-muted'
                  }`}
                >
                  {item.type}
                </span>
              </div>
              <div className="md:col-span-3">
                <h3 className="font-medium text-charcoal">{item.role}</h3>
                <p className="text-sm text-muted mt-0.5">{item.org}</p>
                {item.note && (
                  <p className="text-sm text-muted/70 mt-1">{item.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills + Languages */}
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <p className="section-label mb-8">Software &amp; Tools</p>
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-charcoal">{skill.name}</span>
                  <span className="text-xs text-muted">{skill.level}/7</span>
                </div>
                <div className="h-px bg-border w-full relative">
                  <div
                    className="absolute top-0 left-0 h-px bg-salmon transition-all duration-700"
                    style={{ width: `${(skill.level / 7) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label mb-8">Languages</p>
          <div className="space-y-5">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="flex justify-between items-baseline border-b border-border pb-4 last:border-0"
              >
                <span className="font-medium text-charcoal">{lang.name}</span>
                <span className="text-sm text-muted">{lang.level}</span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="section-label mb-4">Contact</p>
            <a
              href="mailto:eren@maestro-tech.com"
              className="text-sm text-charcoal hover:text-salmon transition-colors underline underline-offset-4 decoration-border"
            >
              eren@maestro-tech.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
