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
    title: 'Dense Dot Matrix',
    category: 'Networked Study',
    year: 2026,
    location: 'Desktop + mobile',
    shortDescription:
      'A dual-device spatial field where an iPhone streams live body telemetry into a reactive point-cloud landscape.',
    description:
      'Dense Dot Matrix splits sensing and rendering across two devices. The phone runs MediaPipe Pose and broadcasts lightweight landmark data over PeerJS, while the desktop receives that stream and translates it into a dense, glowing topography of points that swells around the moving body in real time.',
    embedPath: '/experiments/dense-dot-matrix-desktop.html',
    notes: [
      'Open this page on a desktop or laptop first.',
      'Scan the QR code with your phone to launch the companion mobile page.',
      'Allow camera access on the phone to begin streaming pose data into the desktop scene.',
    ],
  },
]

export function getExperimentBySlug(slug: string) {
  return EXPERIMENTS.find((experiment) => experiment.slug === slug) ?? null
}
