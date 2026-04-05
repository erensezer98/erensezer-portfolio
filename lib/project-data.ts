import type { Project, ProjectCategory } from '@/lib/types'

export type ProjectSceneComponent =
  | 'none'
  | 'architectural-wireframe'
  | 'exploded-axonometry'
  | 'food-tower-explosion'
  | 'interactive-relight'
  | 'the-log-scene'
  | 'toor-toor-scene'

export interface ProjectInfoField {
  label: string
  value: string
}

export interface ProjectPageContent {
  sceneComponent: ProjectSceneComponent
  introText: string
  processText: string
  schematicText: string
  processImages: string[]
  schematicImages: string[]
  galleryImages: string[]
  infoFields: ProjectInfoField[]
  awards: string[]
}

export interface StaticProjectRecord {
  project: Project
  page: ProjectPageContent
}

function createProject(
  id: string,
  slug: string,
  title: string,
  year: number,
  location: string,
  category: ProjectCategory,
  shortDescription: string,
  description: string,
  tags: string[],
  coverImage: string | null,
  featured: boolean,
  orderIndex: number
): Project {
  return {
    id,
    slug,
    title,
    year,
    location,
    category,
    short_description: shortDescription,
    description,
    tags,
    cover_image: coverImage,
    images: [],
    featured,
    order_index: orderIndex,
    created_at: '',
  }
}

function createPageContent(content: Partial<ProjectPageContent> = {}): ProjectPageContent {
  return {
    sceneComponent: 'none',
    introText: '',
    processText: '',
    schematicText: '',
    processImages: [],
    schematicImages: [],
    galleryImages: [],
    infoFields: [],
    awards: [],
    ...content,
  }
}

export const STATIC_PROJECT_RECORDS: StaticProjectRecord[] = [
  {
    project: createProject(
      'static-food-tower',
      'food-tower',
      'The Food Tower',
      2022,
      'Milan, Italy',
      'academic',
      'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Skyscraper Challenge 2022.',
      'The Food Tower proposes a self-sustaining vertical farm integrated into Milan\'s MIND innovation district. The tower combines agricultural production, food processing, and public market space within a single mass-timber structure, creating a new typology that bridges the urban and the ecological.',
      ['vertical farm', 'skyscraper', 'timber structure'],
      null,
      true,
      1
    ),
    page: createPageContent({
      sceneComponent: 'food-tower-explosion',
      introText:
        'The project proposes a productive tower that merges cultivation, processing, and public exchange into one vertical urban ecosystem. Instead of separating agriculture from the city, it makes food infrastructure visible and civic.',
      processText:
        'The design develops through stacked environmental layers, testing how structure, daylight, logistics, and public circulation can coexist in a compact footprint. Programmatic layers separate where needed while staying visually connected.',
      schematicText:
        'The exploded axonometric logic clarifies the relationship between public ground, cultivation zones, processing floors, and the climatic skin. Each level performs as a legible piece of a larger ecological machine.',
      infoFields: [
        { label: 'Program', value: 'Mixed-Use / Vertical Agriculture' },
        { label: 'Area', value: '42,000 m2' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'Politecnico di Milano' },
      ],
      awards: ['Shortlisted for Skyhive Skyscraper Challenge 2022'],
    }),
  },
  {
    project: createProject(
      'static-the-log',
      'the-log',
      'The Log',
      2021,
      'Milan, Italy',
      'academic',
      'Auditorium project exploring organic timber form in Milan.',
      'The Log is an auditorium conceived as a single continuous timber form, a monolithic object carved from the landscape. Its sectional geometry is derived from acoustic performance requirements, while the exterior silhouette references the raw materiality of a fallen log partially reclaimed by the earth.',
      ['auditorium', 'timber', 'acoustics'],
      null,
      true,
      2
    ),
    page: createPageContent({
      sceneComponent: 'the-log-scene',
      introText:
        'This auditorium is imagined as an inhabited timber mass shaped by acoustic logic and grounded in the landscape. The project balances expressive form with a calm interior performance atmosphere.',
      processText:
        'The design studies section, enclosure thickness, and circulation as one continuous architectural operation. Structure and acoustic geometry are treated together so the space reads as a single carved volume.',
      schematicText:
        'The 3D scene emphasizes the project\'s volumetric character and the way the shell frames the internal performance space. The diagrammatic reading focuses on section, enclosure, and material continuity.',
      infoFields: [
        { label: 'Program', value: 'Cultural / Performance' },
        { label: 'Area', value: '8,500 m2' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'Politecnico di Milano' },
      ],
    }),
  },
  {
    project: createProject(
      'static-halic-co-op',
      'halic-co-op',
      'Halic Co-op',
      2020,
      'Istanbul, Turkey',
      'academic',
      'Creative Industries Center in Golden Horn, Istanbul. Selected by Mimdap Architecture Magazine.',
      'Halic Co-op is a creative industries center situated along the Golden Horn waterfront. The project reimagines the historic shipyard typology as a porous, community-driven workspace where making, exhibiting, and exchanging ideas happen simultaneously within an open, flexible framework.',
      ['cultural', 'creative hub', 'istanbul'],
      null,
      true,
      3
    ),
    page: createPageContent({
      sceneComponent: 'architectural-wireframe',
      introText:
        'The proposal transforms an industrial waterfront condition into a shared creative platform. Workshops, studios, galleries, and public circulation are woven together to support both production and exchange.',
      processText:
        'The project develops through questions of porosity, collective use, and industrial scale. Rather than a closed object, it behaves like a framework that can host changing creative programs over time.',
      schematicText:
        'Diagrams focus on the relationship between public edge, shared workspaces, and exhibition zones. The scheme maintains the site\'s infrastructural character while opening it to civic life.',
      infoFields: [
        { label: 'Program', value: 'Cultural / Co-Working' },
        { label: 'Area', value: '14,200 m2' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'Istanbul Technical University' },
      ],
      awards: ['Selected by Mimdap Architecture Magazine'],
    }),
  },
  {
    project: createProject(
      'static-csarda',
      'csarda',
      'Csarda',
      2022,
      'Saemangeum, South Korea',
      'freelance',
      'Pavilion design for the World Scout Jamboree in Saemangeum, South Korea.',
      'Csarda is a temporary pavilion designed for the Saemangeum World Scout Jamboree. The structure reinterprets the csarda typology through lightweight timber construction, creating an ephemeral gathering place that anchors a cultural presence within the temporary landscape of a global festival.',
      ['pavilion', 'festival', 'temporary'],
      null,
      false,
      4
    ),
    page: createPageContent({
      sceneComponent: 'exploded-axonometry',
      introText:
        'Csarda is conceived as a temporary cultural pavilion that brings hospitality, gathering, and visibility into the festival landscape. The design turns a light structure into an identifiable social landmark.',
      processText:
        'The project balances speed of assembly, modular logic, and cultural legibility. Timber elements are organized for straightforward construction while preserving a clear architectural identity.',
      schematicText:
        'Assembly and structural diagrams explain the pavilion through repeatable parts, quick connections, and a lightweight roof strategy suitable for temporary occupation.',
      infoFields: [
        { label: 'Program', value: 'Temporary Pavilion / Exhibition' },
        { label: 'Area', value: '320 m2' },
        { label: 'Status', value: 'Completed' },
        { label: 'Client', value: 'Freelance Commission' },
      ],
    }),
  },
  {
    project: createProject(
      'static-istanbul-a-way-out',
      'istanbul-a-way-out',
      'Istanbul: A Way Out',
      2023,
      'Istanbul, Turkey',
      'academic',
      'An urban escape strategy for Istanbul: light, shadow, and threshold.',
      'Istanbul: A Way Out is an urban research project that maps the thresholds between the city\'s formal and informal fabrics, the passages, courtyards, and light-filled voids that constitute an alternative urban geography. The project proposes a series of spatial interventions that amplify these in-between conditions.',
      ['urban', 'istanbul', 'light', 'installation'],
      null,
      true,
      5
    ),
    page: createPageContent({
      sceneComponent: 'interactive-relight',
      introText:
        'This project studies Istanbul through thresholds, traces of light, and overlooked urban rooms. It proposes a spatial reading of the city that is experiential rather than monumental.',
      processText:
        'Mappings, atmospheric studies, and on-site observations build a narrative around the city\'s in-between spaces. The work moves between urban analysis and spatial intervention.',
      schematicText:
        'The relight model foregrounds light as an active design tool, showing how orientation, shadow, and enclosure reveal hidden layers within the city\'s fabric.',
      infoFields: [
        { label: 'Program', value: 'Urban Installation / Research' },
        { label: 'Area', value: 'Urban Scale' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'Politecnico di Milano' },
      ],
    }),
  },
  {
    project: createProject(
      'static-toor-toor-school',
      'toor-toor-school',
      'Toor-Toor School',
      2023,
      'Senegal',
      'academic',
      'A flexible community school inspired by Senegalese vernacular settlements.',
      'Toor-Toor, meaning "Flower" in Wolof, draws from the traditional Senegalese arrangement of scattered houses gathered around a communal center. Six classroom modules radiate outward from a shared outdoor playground, with flexible spaces that serve the school during the day and the wider community after hours.',
      ['education', 'rammed earth', 'circular plan', 'community'],
      null,
      true,
      6
    ),
    page: createPageContent({
      sceneComponent: 'toor-toor-scene',
      introText:
        'The school is organized around a shared courtyard that keeps collective life at the center of the project. Circular geometry, local materials, and flexible use define both the architecture and its civic role.',
      processText:
        'The design translates vernacular settlement principles into a contemporary educational framework. Classroom modules, support spaces, and outdoor learning areas are composed as a coherent village-like plan.',
      schematicText:
        'Plans and diagrams explain the radial organization, climate-responsive openings, and the transitions between dedicated classroom space and shared community functions.',
      infoFields: [
        { label: 'Program', value: 'Educational / Community' },
        { label: 'Area', value: 'N/A' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'N/A' },
      ],
    }),
  },
  {
    project: createProject(
      'static-unfolding-landscapes',
      'unfolding-landscapes',
      'Unfolding Landscapes',
      2024,
      'Reuse of the Thermae, Italy',
      'competition',
      'Reactivating the Thermae of Curiga through layered topography and cultural programming.',
      'Unfolding Landscapes reimagines the Thermae of Curiga as an open, flowing topography that folds over the archaeological remnants, animating old terraces with new public routes, cultural pavilions, and pergola-covered gathering spaces.',
      ['adaptive reuse', 'landscape', 'heritage', 'public'],
      'https://lh3.googleusercontent.com/d/USERFILE',
      true,
      7
    ),
    page: createPageContent({
      sceneComponent: 'architectural-wireframe',
      introText:
        'The proposal reactivates the Thermae as a public landscape where archaeology, movement, and cultural programming are layered into one continuous spatial experience.',
      processText:
        'The design studies the site as a sequence of terraces, shaded routes, and framed views. New interventions stay light and strategic so the historic fabric remains central to the project.',
      schematicText:
        'Diagrams clarify how circulation, landscape surfaces, and pavilion insertions work together to protect the ruins while opening them to new collective uses.',
      infoFields: [
        { label: 'Program', value: 'Landscape / Cultural Reuse' },
        { label: 'Area', value: 'Thermae site at Curiga' },
        { label: 'Status', value: 'Competition Entry' },
        { label: 'Client', value: 'Reuse Italy / Thermae Project' },
      ],
    }),
  },
]

export const STATIC_PROJECTS: Project[] = STATIC_PROJECT_RECORDS.map((record) => record.project)

export const STATIC_PROJECT_PAGE_CONTENT: Record<string, ProjectPageContent> =
  Object.fromEntries(STATIC_PROJECT_RECORDS.map((record) => [record.project.slug, record.page]))

export const KNOWN_PROJECT_SLUGS = STATIC_PROJECT_RECORDS.map((record) => record.project.slug)

export function getStaticProjectBySlug(slug: string): Project | null {
  return STATIC_PROJECTS.find((project) => project.slug === slug) ?? null
}

export function getStaticProjectPageContent(slug: string): ProjectPageContent | null {
  return STATIC_PROJECT_PAGE_CONTENT[slug] ?? null
}

export function getDefaultProjectPageContent(project: Partial<Project> | null | undefined): ProjectPageContent {
  const slug = project?.slug
  const staticContent = slug ? getStaticProjectPageContent(slug) : null
  const description = project?.description?.trim() || ''
  const fallbackInfoFields: ProjectInfoField[] = [
    { label: 'Program', value: 'Add in admin' },
    { label: 'Area', value: 'Add in admin' },
    { label: 'Status', value: 'Add in admin' },
    { label: 'Client', value: 'Add in admin' },
  ]

  return createPageContent({
    ...staticContent,
    introText:
      staticContent?.introText ||
      description ||
      project?.short_description ||
      'Add a short project introduction in admin.',
    galleryImages: staticContent?.galleryImages || project?.images || [],
    infoFields: staticContent?.infoFields?.length ? staticContent.infoFields : fallbackInfoFields,
  })
}

export function mergeProjectWithStatic(projects: Project[]): Project[] {
  const merged = [...projects]

  STATIC_PROJECTS.forEach((staticProject) => {
    if (!merged.some((project) => project.slug === staticProject.slug)) {
      merged.push(staticProject)
    }
  })

  return merged
}
