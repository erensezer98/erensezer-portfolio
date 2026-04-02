import { getPublications } from '@/lib/supabase'
import type { Publication } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publications',
  description: 'Publications, workshops, and exhibitions by Eren Sezer.',
}

const STATIC_PUBLICATIONS: Publication[] = [
  {
    id: '1',
    title: 'Buildner Skyhive Skyscrapers Challenge — Shortlisted Project Publication',
    type: 'publication',
    organization: 'Buildner',
    year: 2022,
    description:
      'The Food Tower shortlisted and featured in the Buildner annual skyscraper publication.',
    url: null,
    created_at: '',
  },
  {
    id: '2',
    title: 'Mimdap Architecture Magazine — Student Projects Issue',
    type: 'publication',
    organization: 'Mimdap',
    year: 2020,
    description:
      'Haliç CO-OP selected and published in the student projects edition of Mimdap Architecture Magazine.',
    url: null,
    created_at: '',
  },
  {
    id: '3',
    title: 'School of Architecture Representative — Student Council',
    type: 'workshop',
    organization: 'FMV Işık University',
    year: 2019,
    description:
      'Planning and budgeting student-made projects. Inter-university meetings with Architecture Schools, Istanbul.',
    url: null,
    created_at: '',
  },
  {
    id: '4',
    title: 'Işık Dance Club — Executive Member',
    type: 'workshop',
    organization: 'FMV Işık University',
    year: 2018,
    description:
      'Organisation of inter-university events, management of 50+ members, Latin dances trainer. Istanbul.',
    url: null,
    created_at: '',
  },
]

const TYPE_LABELS: Record<Publication['type'], string> = {
  publication: 'Publication',
  workshop: 'Workshop / Activity',
  exhibition: 'Exhibition',
  lecture: 'Lecture',
}

export default async function PublicationsPage() {
  let pubs: Publication[] = []
  try {
    pubs = await getPublications()
  } catch {
    pubs = STATIC_PUBLICATIONS
  }
  if (pubs.length === 0) pubs = STATIC_PUBLICATIONS

  const types = ['publication', 'workshop', 'exhibition', 'lecture'] as const
  const grouped = types.reduce<Partial<Record<Publication['type'], Publication[]>>>(
    (acc, type) => {
      const items = pubs.filter((p) => p.type === type)
      if (items.length > 0) acc[type] = items
      return acc
    },
    {}
  )

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
      {/* Header */}
      <div className="mb-16">
        <p className="section-label mb-3">Dissemination</p>
        <h1 className="page-heading mb-10">Publications &amp; Workshops</h1>
        <div className="divider" />
      </div>

      <div className="space-y-20 max-w-3xl">
        {(Object.keys(grouped) as Publication['type'][]).map((type) => (
          <section key={type}>
            <p className="section-label mb-8">{TYPE_LABELS[type]}</p>
            <div className="space-y-0">
              {grouped[type]!.map((pub) => (
                <div
                  key={pub.id}
                  className="py-7 border-b border-border last:border-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {pub.url ? (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-charcoal hover:text-salmon transition-colors leading-snug"
                        >
                          {pub.title}
                        </a>
                      ) : (
                        <h3 className="font-medium text-charcoal leading-snug">
                          {pub.title}
                        </h3>
                      )}
                      <p className="text-sm text-muted mt-0.5">{pub.organization}</p>
                      {pub.description && (
                        <p className="text-sm text-muted/70 mt-2 leading-relaxed">
                          {pub.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted shrink-0 font-light">
                      {pub.year}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
