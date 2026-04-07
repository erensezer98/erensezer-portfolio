import type { Metadata } from 'next'
import ExperimentCard from '@/components/experiments/ExperimentCard'
import { getSiteSettings } from '@/lib/supabase'
import { EXPERIMENTS } from '@/lib/experiment-data'

export const metadata: Metadata = {
  title: 'Experiments',
  description: 'Interactive experiments and digital studies by Eren Sezer.',
}

export default async function ExperimentsPage() {
  const settings = await getSiteSettings()
  const gridCols =
    settings.projects_grid_cols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="px-6 pb-32 pt-28 md:px-10">
      <p className="mb-16 text-[13px] text-muted">experiments</p>

      <section>
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Interactive Studies</p>
          <h1 className="mt-3 text-2xl font-medium text-ink">Spatial tests, prototypes, and live digital sketches</h1>
        </div>
        <div className={`grid ${gridCols} gap-x-8 gap-y-14`}>
          {EXPERIMENTS.map((experiment) => (
            <ExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>
      </section>
    </div>
  )
}
