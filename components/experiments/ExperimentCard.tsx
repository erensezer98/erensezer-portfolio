import Link from 'next/link'
import type { Experiment } from '@/lib/experiment-data'

export default function ExperimentCard({ experiment }: { experiment: Experiment }) {
  return (
    <Link href={`/experiments/${experiment.slug}`} className="group block">
      <div className="mb-4 aspect-[4/3] overflow-hidden bg-[#0b0b0b]">
        <div className="flex h-full w-full flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_42%),linear-gradient(135deg,_#111_0%,_#070707_45%,_#141414_100%)] p-5 text-white transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{experiment.category}</p>
          <div>
            <p className="text-xl font-medium tracking-[-0.04em]">{experiment.title}</p>
            <p className="mt-2 max-w-[18rem] text-sm leading-5 text-white/68">{experiment.shortDescription}</p>
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
