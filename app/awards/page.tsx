import { getAwards } from '@/lib/supabase'
import type { Award } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Awards',
  description: 'Awards, recognitions, and certificates received by Eren Sezer.',
}

const STATIC_AWARDS: Award[] = [
  { id: '1', title: 'Buildner Skyhive Skyscrapers Challenge — Shortlisted', organization: 'Buildner',                            year: 2022, description: 'The Food Tower, Vertical Farm and Factory in Milano.', created_at: '' },
  { id: '2', title: 'Student Projects Selection',                           organization: 'Mimdap Architecture Magazine',         year: 2020, description: 'Haliç CO-OP · Creative Industries Center, Istanbul.', created_at: '' },
  { id: '3', title: "Jury's Selection Award — Latin Dances Competition",    organization: 'Inter-universities Latin Dances',      year: 2019, description: 'Modern · Latin Fusion Choreography, Istanbul.', created_at: '' },
  { id: '4', title: 'Introduction to Basic Programming Certificate',         organization: 'Istanbul Business Institute',          year: 2019, description: '', created_at: '' },
  { id: '5', title: 'IELTS Academic Certificate',                            organization: 'IELTS',                               year: 2018, description: 'Score: 7.5 / 9', created_at: '' },
]

export default async function AwardsPage() {
  let awards: Award[] = []
  try { awards = await getAwards() } catch { /* fallback */ }
  if (!awards.length) awards = STATIC_AWARDS

  // Group by year descending
  const byYear = awards.reduce<Record<number, Award[]>>((acc, a) => {
    if (!acc[a.year]) acc[a.year] = []
    acc[a.year].push(a)
    return acc
  }, {})
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="px-6 md:px-10 pt-28 pb-32">

      <p className="text-[13px] text-muted mb-16">awards</p>

      <div className="max-w-2xl">
        {years.map((year) => (
          <div key={year} className="grid md:grid-cols-4 gap-4 mb-0">
            <p className="text-xs text-muted pt-7">{year}</p>
            <div className="md:col-span-3">
              {byYear[year].map((award) => (
                <div key={award.id} className="border-t border-rule py-7 last:border-b">
                  <p className="text-[13px] text-ink leading-snug">{award.title}</p>
                  <p className="text-xs text-muted mt-1">{award.organization}</p>
                  {award.description && (
                    <p className="text-xs text-muted/70 mt-1">{award.description}</p>
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
