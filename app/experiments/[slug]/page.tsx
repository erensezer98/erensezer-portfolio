import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EXPERIMENTS, getExperimentBySlug } from '@/lib/experiment-data'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return EXPERIMENTS.map((experiment) => ({ slug: experiment.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experiment = getExperimentBySlug(params.slug)

  if (!experiment) {
    return { title: 'Experiment' }
  }

  return {
    title: experiment.title,
    description: experiment.shortDescription,
  }
}

export default function ExperimentDetailPage({ params }: Props) {
  const experiment = getExperimentBySlug(params.slug)

  if (!experiment) {
    notFound()
  }

  return (
    <div className="px-6 pb-32 pt-28 md:px-10">
      <Link href="/experiments" className="text-[13px] font-medium lowercase text-muted transition-colors hover:text-ink">
        {'<- experiments'}
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)] lg:items-start">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{experiment.category}</p>
          <h1 className="mt-3 text-4xl font-medium tracking-[-0.05em] text-ink">{experiment.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{experiment.description}</p>
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted">
            <span>{experiment.year}</span>
            <span>{experiment.location}</span>
            <a
              href={experiment.embedPath}
              target="_blank"
              rel="noreferrer"
              className="font-medium lowercase text-ink transition-colors hover:text-muted"
            >
              open fullscreen
            </a>
          </div>
        </div>

        <div className="overflow-hidden border border-rule bg-[#050505]">
          <iframe
            src={experiment.embedPath}
            title={experiment.title}
            className="h-[72vh] min-h-[560px] w-full"
            allow="camera; fullscreen"
          />
        </div>
      </div>
    </div>
  )
}
