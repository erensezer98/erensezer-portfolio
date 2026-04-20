import Link from 'next/link'
import type { Experiment } from '@/lib/experiment-data'
import ExperimentVisual from './ExperimentVisual'

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <Link href={`/experiments/${experiment.slug}`} className="group block">
      <div className="mb-4 aspect-[4/3] overflow-hidden bg-[#0b0b0b]">
        <div className="relative h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]">
          {/* Per-experiment visual */}
          <div className="absolute inset-0">
            <ExperimentVisual slug={experiment.slug} />
          </div>

          {/* Readability scrim + text overlay */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.75) 100%)',
            }}
          />
          <div className="relative flex h-full w-full flex-col justify-between p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">{experiment.category}</p>
            <div>
              <p className="text-xl font-medium tracking-[-0.04em]">{experiment.title}</p>
              <p className="mt-2 max-w-[18rem] text-sm leading-5 text-white/75">{experiment.shortDescription}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[14px] font-medium text-ink">{experiment.title}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">{experiment.category}</p>
      <p className="mt-0.5 text-xs text-muted">
        {experiment.year} - {experiment.location}
      </p>
    </Link>
  )
}
