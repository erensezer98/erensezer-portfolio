import { getAwards } from '@/lib/supabase'
import type { Award } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Awards',
  description: 'Awards, recognitions, and certificates received by Eren Sezer.',
}

const STATIC_AWARDS: Award[] = [
  {
    id: '1',
    title: 'Buildner Skyhive Skyscrapers Challenge — Shortlisted',
    organization: 'Buildner',
    year: 2022,
    description: 'Shortlisted project: The Food Tower, Vertical Farm and Factory in Milano.',
    created_at: '',
  },
  {
    id: '2',
    title: 'Student Projects Selection — Mimdap Architecture Magazine',
    organization: 'Mimdap Architecture Magazine',
    year: 2020,
    description: 'Haliç CO-OP · Creative Industries Center, Istanbul.',
    created_at: '',
  },
  {
    id: '3',
    title: "Jury's Selection Award — Latin Dances Competition",
    organization: 'Inter-universities Latin Dances Competition',
    year: 2019,
    description: 'Modern · Latin Fusion Choreography, Istanbul.',
    created_at: '',
  },
  {
    id: '4',
    title: 'Introduction to Basic Programming Certificate',
    organization: 'Istanbul Business Institute',
    year: 2019,
    description: '',
    created_at: '',
  },
  {
    id: '5',
    title: 'IELTS English Certificate',
    organization: 'IELTS',
    year: 2018,
    description: 'Academic Score: 7.5/9',
    created_at: '',
  },
]

export default async function AwardsPage() {
  let awards: Award[] = []
  try {
    awards = await getAwards()
  } catch {
    awards = STATIC_AWARDS
  }
  if (awards.length === 0) awards = STATIC_AWARDS

  // Group by year
  const byYear = awards.reduce<Record<number, Award[]>>((acc, award) => {
    const y = award.year
    if (!acc[y]) acc[y] = []
    acc[y].push(award)
    return acc
  }, {})
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
      {/* Header */}
      <div className="mb-16">
        <p className="section-label mb-3">Recognition</p>
        <h1 className="page-heading mb-10">Awards</h1>
        <div className="divider" />
      </div>

      {/* Timeline */}
      <div className="space-y-0 max-w-3xl">
        {years.map((year) => (
          <div key={year} className="grid md:grid-cols-4 gap-6 mb-0">
            {/* Year label */}
            <div className="md:col-span-1 pt-8">
              <span className="font-serif text-4xl font-light text-border">
                {year}
              </span>
            </div>

            {/* Awards in this year */}
            <div className="md:col-span-3 border-l border-border pl-8">
              {byYear[year].map((award) => (
                <div
                  key={award.id}
                  className="py-8 border-b border-border last:border-0 relative"
                >
                  {/* Dot */}
                  <div className="absolute -left-8 top-9 w-2 h-2 rounded-full bg-salmon -translate-x-[3px]" />

                  <h3 className="font-medium text-charcoal leading-snug mb-1">
                    {award.title}
                  </h3>
                  <p className="text-sm text-muted">{award.organization}</p>
                  {award.description && (
                    <p className="text-sm text-muted/70 mt-2">
                      {award.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
