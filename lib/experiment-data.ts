export interface Experiment {
  slug: string
  title: string
  category: string
  year: number
  location: string
  shortDescription: string
  description: string
  embedPath: string
  notes?: string[]
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
  {
    slug: 'dense-dot-matrix',
    title: 'Tabletop Scanner',
    category: 'Networked Study',
    year: 2026,
    location: 'Desktop + mobile',
    shortDescription:
      'A dual-device experiment that reads objects on a desk and turns them into a miniature city in real time.',
    description:
      'Tabletop Scanner uses the iPhone as a live sensing tool and the desktop as a playful urban renderer. The phone detects objects on a desk such as books, cups, bottles, laptops, and tools, then streams those detections over PeerJS. The desktop translates them into a miniature city, where each object becomes a distinct architectural mass, street fragment, or landmark.',
    embedPath: '/experiments/dense-dot-matrix-desktop.html',
    notes: [
      'Open this page on a desktop or laptop first.',
      'Scan the QR code with your phone to launch the companion mobile page.',
      'Point the phone at a desk or tabletop with a few recognizable objects.',
      'Books, cups, bottles, laptops, and small tools will be translated into a live desk-city on the desktop.',
    ],
  },
]

export function getExperimentBySlug(slug: string) {
  return EXPERIMENTS.find((experiment) => experiment.slug === slug) ?? null
}
