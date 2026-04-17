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
  {
    slug: 'screentrace',
    title: 'ScreenTrace',
    category: 'Motion Study',
    year: 2026,
    location: 'Browser-based',
    shortDescription:
      'A Delaunay triangulation mesh that maps the body as a living wireframe — joints become vertices, movement becomes geometry.',
    description:
      'ScreenTrace turns a human pose into a dynamic triangulated mesh. Using the 33-point MediaPipe skeleton as vertices, Bowyer-Watson Delaunay triangulation is computed each frame, filling the space between joints with depth-tinted triangles that shift and breathe with the body. The experiment explores the body as data structure — a moving point cloud that generates its own topology in real time.',
    embedPath: '/experiments/screentrace-desktop.html',
    notes: [
      'Four visual modes: Mesh, Edges, Depth, and Aurora — switchable at the bottom of the screen.',
      'The animation simulates a live pose stream; the full interactive version connects an iPhone camera via PeerJS.',
    ],
  },
  {
    slug: 'ai-form-factor',
    title: 'AI Form Factor',
    category: 'Machine Learning Study',
    year: 2026,
    location: 'Browser-based / Teachable Machine',
    shortDescription:
      'A workshop study from Işık University that translates AI-detected water phenomena into generative architectural form factors.',
    description:
      "Conceived for a student workshop at Işık University, this experiment investigates the intersection of machine intelligence and architectural imagination. The study explores how students engage with AI-driven design prompts within a live generative environment. The system analyzes spatial scenes, identifies student-defined water phenomena, and synthesizes these inputs into architectural concepts, translating environmental 'tags' into shifting 3D geometries.",
    embedPath: '/experiments/teachable-wireframe.html',
    notes: [
      'This study uses an onboard AI engine hosted directly within the portfolio.',
      'Select any image to analyze it through the neural network.',
      'The wireframe geometry reacts and shifts proportionally to the inference probabilities.',
    ],
  },
]

export function getExperimentBySlug(slug: string) {
  return EXPERIMENTS.find((experiment) => experiment.slug === slug) ?? null
}
