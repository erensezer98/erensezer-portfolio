import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'About',
  description: 'Eren Sezer — architect, researcher, and technologist. Project Manager at Maestro Technologies in Carlo Ratti Group.',
}

const work = [
  { role: 'Project Manager',    org: 'Maestro Technologies',                             period: 'Mar 2025 – present', note: 'Pioneering entirely new ways to design and build — Turin, Italy' },
  { role: 'Architect',          org: 'Maestro Technologies & CRA-Carlo Ratti Associati', period: 'Feb 2024 – Mar 2025', note: 'Digital innovation at the intersection of design and construction — Turin, Italy' },
  { role: 'Co-founder',         org: 'Cumba Architectural Collective',                   period: '2023 – present',      note: 'STRAND International Architecture Exhibition; 2025 Venice Architectural Biennale' },
  { role: 'Architectural Intern', org: 'CRA-Carlo Ratti Associati',                      period: 'Nov 2023 – Feb 2024', note: 'Turin, Italy' },
  { role: 'Site Architect',     org: 'Ağaoğlu Şirketler Grubu',                          period: 'Dec 2020 – May 2021', note: 'Facade systems — Istanbul' },
  { role: 'Design Intern',      org: 'TAGO Architects',                                  period: '2019',                note: 'Interior design, housing & renovation — Istanbul' },
]

const education = [
  { role: 'Master of Architecture — MArch (110/110)', org: 'Politecnico di Milano',              period: 'Jan 2021 – Oct 2023', note: 'Building Architecture' },
  { role: 'Bachelor of Architecture (Honours)',        org: 'Işık University',                   period: '2016 – 2020',         note: '' },
  { role: 'High School Diploma',                       org: 'İstanbul Kadıköy Anadolu Lisesi',   period: '2012 – 2016',         note: '' },
]

const languages = ['Turkish', 'English', 'Italian']

export default async function AboutPage() {
  const settings = await getSiteSettings()

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
            Born in Istanbul in 1998, I am an architect, researcher, and technologist who
            uses the built environment as a framework to explore the future of design. I operate
            at the intersection of{' '}<em>intuitive technocracy</em>{' '}and traditional craftsmanship,
            constantly searching to detect and rationalize the inherent{' '}
            <em>&ldquo;quality without a name&rdquo;</em>{' '}of spaces, as defined by architectural
            theorist Christopher Alexander.
          </p>
          <p>
            Holding a Master&rsquo;s degree in Building Architecture from Politecnico di Milano,
            I have an obsession for the integration of advanced technologies into the
            architect&rsquo;s design process. After my studies, I collaborated with MIT Senseable
            City Lab Director Carlo Ratti to witness the limits of architectural tech. This work
            transitioned into my current role as Project Manager at the startup Maestro
            Technologies in Carlo Ratti Group, where I help lead a team committed to pioneering
            entirely new ways to design and build.
          </p>
          <p>
            My work has been recognised on the world&rsquo;s most prominent stages — from
            representing the Italian Ministry of External Affairs at COP30&rsquo;s Italian
            Pavilion <em>Aquapraca</em>, to exhibiting at the 2025 Venice Architectural Biennale
            and the STRAND International Architecture Exhibition with the collective{' '}
            <em>Cumba</em>, co-founded in 2023.
          </p>
        </div>
        {settings.about_show_photo && settings.about_bio_cols === 2 && (
          <div className="aspect-[3/4] bg-warm" />
        )}
      </div>

      {/* Work Experience */}
      <section className="mb-24 max-w-2xl">
        <p className="text-xs text-muted mb-10">experience</p>
        {work.map((item, i) => (
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

      {/* Education */}
      <section className="mb-24 max-w-2xl">
        <p className="text-xs text-muted mb-10">education</p>
        {education.map((item, i) => (
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

      {/* Languages + Contact */}
      <div className="max-w-2xl">
        <section>
          <p className="text-xs text-muted mb-8">languages</p>
          {languages.map((l) => (
            <p key={l} className="text-[13px] text-ink border-t border-rule py-3 last:border-b">{l}</p>
          ))}

          <div className="mt-12">
            <p className="text-xs text-muted mb-3">contact</p>
            <a href="mailto:eren.sezer@hotmail.com" className="text-[13px] text-ink hover:text-muted transition-colors underline underline-offset-4 decoration-rule">
              eren.sezer@hotmail.com
            </a>
          </div>
        </section>
      </div>

    </div>
  )
}
