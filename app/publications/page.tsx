import { getPublications } from '@/lib/supabase'
import type { Publication } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Publications',
  description: 'Publications, workshops, and activities by Eren Sezer.',
}

const STATIC_PUBLICATIONS: Publication[] = [
  { id: '1', title: 'Buildner Skyhive Skyscrapers Challenge — Shortlisted Project Publication', type: 'publication', organization: 'Buildner',          year: 2022, description: 'The Food Tower shortlisted and featured in the Buildner annual skyscraper publication.', url: null, created_at: '' },
  { id: '2', title: 'Mimdap Architecture Magazine — Student Projects Issue',                    type: 'publication', organization: 'Mimdap',            year: 2020, description: 'Haliç CO-OP selected and published in the student projects edition.', url: null, created_at: '' },
  { id: '3', title: 'School of Architecture Representative — Student Council',                  type: 'workshop',    organization: 'FMV Işık University', year: 2019, description: 'Planning and budgeting student-made projects. Inter-university meetings, Istanbul.', url: null, created_at: '' },
  { id: '4', title: 'Işık Dance Club — Executive Member',                                       type: 'workshop',    organization: 'FMV Işık University', year: 2018, description: 'Organisation of inter-university events, management of 50+ members, Latin dances trainer.', url: null, created_at: '' },
]

const TYPE_LABELS: Record<Publication['type'], string> = {
  publication: 'publications',
  workshop:    'workshops & activities',
  exhibition:  'exhibitions',
  lecture:     'lectures',
}

export default async function PublicationsPage() {
  let pubs: Publication[] = []
  try { pubs = await getPublications() } catch { /* fallback */ }
  if (!pubs.length) pubs = STATIC_PUBLICATIONS

  const types = ['publication', 'workshop', 'exhibition', 'lecture'] as const
  const grouped = types.reduce<Partial<Record<Publication['type'], Publication[]>>>((acc, t) => {
    const items = pubs.filter((p) => p.type === t)
    if (items.length) acc[t] = items
    return acc
  }, {})

  return (
    <div className="px-6 md:px-10 pt-28 pb-32">

      <p className="text-[13px] text-muted mb-16">publications</p>

      <div className="space-y-20 max-w-2xl">
        {(Object.keys(grouped) as Publication['type'][]).map((type) => (
          <section key={type}>
            <p className="text-xs text-muted mb-8">{TYPE_LABELS[type]}</p>
            {grouped[type]!.map((pub) => (
              <div key={pub.id} className="border-t border-rule py-7 last:border-b">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    {pub.url ? (
                      <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-ink hover:text-muted transition-colors leading-snug underline underline-offset-4 decoration-rule">
                        {pub.title}
                      </a>
                    ) : (
                      <p className="text-[13px] text-ink leading-snug">{pub.title}</p>
                    )}
                    <p className="text-xs text-muted mt-1">{pub.organization}</p>
                    {pub.description && (
                      <p className="text-xs text-muted/70 mt-1 leading-relaxed">{pub.description}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted shrink-0">{pub.year}</p>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

    </div>
  )
}
