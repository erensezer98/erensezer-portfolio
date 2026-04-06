import Image from 'next/image'
import type { Metadata } from 'next'
import { getAboutDriveMedia } from '@/lib/site-drive-media'

export const metadata: Metadata = {
  title: 'About',
  description: 'Eren Sezer — architect, researcher, and technologist. Project Manager at Maestro Technologies in Carlo Ratti Group.',
}

const work = [
  { role: 'Project Manager',      org: 'Maestro Technologies',          period: 'Mar 2025 – present',  note: 'Pioneering entirely new ways to design and build — Turin, Italy' },
  { role: 'Architect',            org: 'CRA-Carlo Ratti Associati',     period: 'Feb 2024 – present',  note: 'Turin, Italy' },
  { role: 'Architect',            org: 'Maestro Technologies',          period: 'Feb 2024 – Mar 2025', note: 'Turin, Italy' },
  { role: 'Co-founder',           org: 'Cumba Architectural Collective', period: '2023 – present',     note: 'STRAND International Architecture Exhibition; 2025 Venice Architectural Biennale' },
  { role: 'Architectural Intern', org: 'CRA-Carlo Ratti Associati',     period: 'Nov 2023 – Feb 2024', note: 'Turin, Italy' },
  { role: 'Site Architect',       org: 'Ağaoğlu Şirketler Grubu',       period: 'Dec 2020 – May 2021', note: 'Facade systems — Istanbul' },
  { role: 'Design Intern',        org: 'TAGO Architects',               period: '2019',                note: 'Interior design, housing & renovation — Istanbul' },
]

const education = [
  { role: 'Master of Architecture — MArch (110/110)', org: 'Politecnico di Milano',              period: 'Jan 2021 – Oct 2023', note: 'Building Architecture' },
  { role: 'Bachelor of Architecture (Honours)',        org: 'Işık University',                   period: '2016 – 2020',         note: '' },
  { role: 'High School Diploma',                       org: 'İstanbul Kadıköy Anadolu Lisesi',   period: '2012 – 2016',         note: '' },
]

const languages = ['Turkish', 'English', 'Italian']

export default async function AboutPage() {
  const media = await getAboutDriveMedia()

  return (
    <div className="px-6 md:px-10 pt-28 pb-32">

      <p className="text-[13px] font-medium lowercase text-muted mb-16">about</p>

      {/* Bio */}
      <div className="mb-24 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] lg:items-start">
        <div className="max-w-2xl">
          <div className="space-y-5 text-sm text-ink leading-relaxed">
            <p>
              Born in Istanbul in 1998, Eren Sezer is an architect, researcher, and technologist
              who uses the built environment as a framework to explore the future of design. He
              operates at the intersection of &ldquo;intuitive technocracy&rdquo; and traditional
              craftsmanship, constantly searching to detect and rationalize the inherent &ldquo;quality
              without a name&rdquo; of spaces, as defined by architectural theorist Christopher Alexander.
            </p>
            <p>
              Holding a Master&rsquo;s degree in Building Architecture from Politecnico di Milano,
              Eren has an obsession for the integration of advanced technologies into the
              architect&rsquo;s design process. After his studies, he collaborated with MIT Senseable
              City Lab Director Carlo Ratti, to witness the limits of architectural tech. This work
              transitioned into his current role as a Project Manager at the startup Maestro
              Technologies in Carlo Ratti Group, where he helps lead a team committed to pioneering
              entirely new ways to design and build.
            </p>
            <p>Eren&rsquo;s work has been recognized in:</p>
            <p>
              Global Climate Action: In 2025, he was selected as a representative architect for
              the Italian Ministry of External Affairs at the UN Climate Change Summit (COP30),
              as a part of Carlo Ratti Group&rsquo;s project Aquapraca.
            </p>
            <p>
              International Exhibitions: As the co-founder of the architectural collective Cumba
              (est. 2023), Eren and the team secured spots at the STRAND International Architecture
              Exhibition and the 2025 Venice Architectural Biennale with their acclaimed project,
              Istanbul A Way Out.
            </p>
          </div>
        </div>

        {media.portraitImage && (
          <div className="relative aspect-[3/4] overflow-hidden bg-warm">
            <Image
              src={media.portraitImage}
              alt="eren sezer portrait"
              fill
              sizes="(max-width: 1024px) 100vw, 28vw"
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Work Experience */}
      <section className="mb-24 max-w-2xl">
        <p className="text-xs font-medium lowercase text-muted mb-10">experience</p>
        {work.map((item, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-4 border-t border-rule py-6 last:border-b">
            <p className="text-xs text-muted pt-0.5">{item.period}</p>
            <div className="md:col-span-3">
              <p className="text-[14px] font-medium text-ink">{item.role}</p>
              <p className="text-xs text-muted mt-0.5">{item.org}</p>
              {item.note && <p className="text-xs text-muted/60 mt-1">{item.note}</p>}
            </div>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-24 max-w-2xl">
        <p className="text-xs font-medium lowercase text-muted mb-10">education</p>
        {education.map((item, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-4 border-t border-rule py-6 last:border-b">
            <p className="text-xs text-muted pt-0.5">{item.period}</p>
            <div className="md:col-span-3">
              <p className="text-[14px] font-medium text-ink">{item.role}</p>
              <p className="text-xs text-muted mt-0.5">{item.org}</p>
              {item.note && <p className="text-xs text-muted/60 mt-1">{item.note}</p>}
            </div>
          </div>
        ))}
      </section>

      {/* Languages + Contact */}
      <div className="max-w-2xl">
        <section>
          <p className="text-xs font-medium lowercase text-muted mb-8">languages</p>
          {languages.map((l) => (
            <p key={l} className="text-[14px] font-medium text-ink border-t border-rule py-3 last:border-b">{l}</p>
          ))}

          <div className="mt-12">
            <p className="text-xs font-medium lowercase text-muted mb-3">contact</p>
            <a href="mailto:eren.sezer@hotmail.com" className="text-[14px] font-medium text-ink hover:text-muted transition-colors underline underline-offset-4 decoration-rule lowercase">
              eren.sezer@hotmail.com
            </a>
          </div>
        </section>
      </div>

      {media.galleryImages.length > 0 && (
        <section className="mt-24">
          <p className="text-xs font-medium lowercase text-muted mb-8">gallery</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {media.galleryImages.map((src, index) => (
              <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden bg-warm">
                <Image
                  src={src}
                  alt={`about image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
