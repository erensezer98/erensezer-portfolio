export interface Experiment {
  slug: string
  title: string
  category: string
  year: number
  location: string
  shortDescription: string
  description: string
  embedPath: string
}

export const EXPERIMENTS: Experiment[] = [
  {
    slug: 'data-follows',
    title: 'Data Follows',
    category: 'Interactive Study',
    year: 2026,
    location: 'Browser-based',
    shortDescription:
      'A hand-tracked wireframe landscape where data, gesture, and spatial extrusion unfold in real time.',
    description:
      'Data Follows turns a field of wireframe volumes into an interactive terrain. Using MediaPipe hand tracking and Three.js, the experiment reads the movement of a single index finger and translates it into shifting extrusions across a gridded landscape, creating a live conversation between body, data, and form.',
    embedPath: '/experiments/data-follows.html',
  },
]

export function getExperimentBySlug(slug: string) {
  return EXPERIMENTS.find((experiment) => experiment.slug === slug) ?? null
}
