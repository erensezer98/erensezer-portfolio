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

export function getProjectCategoryLabel(category: ProjectCategory): string {
  switch (category) {
    case 'academic':
      return 'Academic'
    case 'freelance':
      return 'Freelance'
    case 'competition':
      return 'Competition'
    case 'research':
      return 'Research'
    case 'involvement':
      return 'Involvement'
    default:
      return category
  }
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
      'The MIND Tower',
      2022,
      'Milan, Italy',
      'academic',
      'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Skyscraper Challenge 2022.',
      'The MIND Tower is a research project set in Milan\'s MIND district, where questions about the future of cities, food, and construction meet. Conceived as a vertical factory, the proposal brings production, processing, planning, packaging, sales, and recycling into a single timber high-rise, challenging the conventional food chain by removing long-distance logistics and compressing it into a compact architectural system.',
      ['vertical farm', 'skyscraper', 'timber structure'],
      null,
      true,
      1
    ),
    page: createPageContent({
      sceneComponent: 'food-tower-explosion',
      introText:
        'How much could the food chain change if we redesigned it from the ground up? The MIND Tower begins with that question. Set in Milan\'s MIND district, the project rethinks the future of farming, production, and high-rise construction at once. Imagined as a vertical factory, it gathers production, processing, planning, packaging, sales, and recycling within one compact tower, reducing the chain by removing long-distance logistics and replacing it with a simple system of lifts between floors.',
      processText:
        'The project was never meant as a model for mass production. Instead, it works as a built manifesto, a way of making visible the hidden steps that feed the planet and extending the conversation opened by Expo 2015. That idea shaped the exhibition lifts, which allow visitors to move through the process and understand food production as an architectural experience. At the same time, the tower became a vehicle for architectural research, testing timber as the primary structural material while integrating a ventilated facade, solar panels, and energy studies to measure both consumption and potential savings.',
      schematicText:
        'The envelope combines wood and aluminum in a facade system that changes with orientation. Triangular cantilevers extend from the main slab and become deeper or shallower depending on sun exposure. On facades with direct sunlight, longer projections provide shade, enlarge the ventilation cavity, and tilt the glazing horizontally so photovoltaic panels can gather more radiation. On the cooler elevations, where direct sun is limited, the facade becomes more vertical and the profiles are angled to preserve outward views without interrupting the logic of the system.',
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
        'This project imagines an auditorium for the Alda Merini School in Milan, born from a simple scene: students gathering in a circle on logs. That image stayed with us. We wanted to keep something that already belonged to them and turn it into architecture, carrying the log from object to idea. The result is a bright, playful auditorium where the stage can expand by folding open the back wall, allowing the performance space to stretch outward and transform with use.',
      processText:
        'The Log is organized in two layers: the auditorium itself and the foyer. The foyer is conceived as an almost weightless space, light-filled and transparent beneath an ETFE roof. In contrast, the auditorium is grounded, solid, and heavy, holding the stillness and concentration of the performance room. That tension between lightness and mass came from the children themselves, from the effort of rolling heavy logs into place and turning them into a circle, then into a shared and joyful environment.',
      schematicText:
        'Inside the auditorium, acoustic panels shape the atmosphere as much as the sound. The stage is paired with a bifold door that can open the back wall completely, turning the garden into a backdrop or, even better, into an extension of the stage itself. The foyer works as a semi-conditioned buffer, helping moderate the greenhouse effect created by the polycarbonate walls while preserving its luminous, in-between character.',
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
        'Csarda was designed as the pavilion for the 25th International Scout Jamboree, with the spirit of the event built directly into the brief. The request was clear: create something inexpensive, easy to prefabricate, compact enough to ship to South Korea in a single container, and simple enough to be assembled by the scouts themselves on site. The project became not just a pavilion for the festival, but a structure shaped by the hands and habits of the people who would use it.',
      processText:
        'The design began with a simple idea: a pavilion under which scouts would not feel out of place, but comfortably in the shade. That thought led us toward the image of dense forest canopies and the familiar logic of temporary camp structures. Rather than imposing a polished object onto the site, the project developed as a lightweight shelter that felt close to the culture of scouting, direct, adaptable, and intuitive to build.',
      schematicText:
        'Fabrics and ropes became the main elements of the system, creating a gazebo-like structure that could be set up through gestures scouts already know well. The ropes were designed to be loosened or untied in severe weather conditions, while during the fourteen-day festival they held the canopy in place and cast a generous field of shade. The diagrams focus on that simple, resilient logic: light parts, easy assembly, and a structure that performs through tension rather than weight.',
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
      'A reuse proposal for the Thermae of Curinga shaped by the dialogue between archaeological remains and the surrounding landscape.',
      'Unfolding Landscapes proposes a careful reuse strategy for the Thermae of Curinga, centered on the relationship between the archaeological ruins and the environmental landscape that surrounds them. The project introduces a continuous protective roof and walkway that frame, shelter, and reveal the remains, allowing visitors to experience the site through both panoramic movement around the perimeter and a more direct transversal passage through the ruins themselves.',
      ['adaptive reuse', 'landscape', 'heritage', 'public'],
      'https://lh3.googleusercontent.com/d/USERFILE',
      true,
      7
    ),
    page: createPageContent({
      sceneComponent: 'architectural-wireframe',
      introText:
        'The proposal seeks to understand the interaction between the archaeological and environmental landscapes of Curinga and to create a design that allows both to coexist harmoniously. A singular roof element protects the ruins while establishing a continuous walkway that opens panoramic views over the site and reconnects visitors with the surrounding terrain.',
      processText:
        'Priority was given to shaping a seamless relationship between exterior and interior experience. The intervention combines an encircling path beneath the protective roof with a transversal route through the ruins, allowing visitors to alternate between distant reading and direct immersion. This movement system was developed to strengthen awareness of both the archaeological fabric and the environmental landscape of Curinga at the same time.',
      schematicText:
        'The roof language is derived from two intertwined references: the layered movement of the surrounding topography and the spatial logic of the ruins themselves. Its geometry rises and folds to frame significant spaces such as the frigidarium, while its organic continuity helps the intervention blend into the land. Structurally, the proposal draws inspiration from the historic cross vault of the central bath space, and its clay materiality pays homage to Roman African construction traditions and pottery techniques.',
      infoFields: [
        { label: 'Program', value: 'Archaeological Reuse / Landscape Intervention' },
        { label: 'Area', value: 'Thermae of Curinga site' },
        { label: 'Status', value: 'Competition Entry' },
        { label: 'Client', value: 'Reuse Italy' },
      ],
    }),
  },
  {
    project: createProject(
      'static-mondadori',
      'mondadori',
      'Palazzo Mondadori / Office As A Playground',
      2024,
      'Palazzo Mondadori, Milan, Italy',
      'involvement',
      'Revitalization work at Oscar Niemeyer\'s Palazzo Mondadori developed with Carlo Ratti Associati, Maestro Technologies, and Italo Rota Studio.',
      'CRA was granted the design of Oscar Niemeyer\'s Palazzo Mondadori. This involvement focused on the transformation of layouts, the design of new furniture elements, and the technical development required to bring those interventions into production and site execution.',
      ['adaptive reuse', 'workplace', 'furniture design', 'site management'],
      null,
      true,
      8
    ),
    page: createPageContent({
      introText:
        'A workplace transformation inside Oscar Niemeyer\'s Palazzo Mondadori, developed through the collaboration between Carlo Ratti Associati, Maestro Technologies, and Italo Rota Studio. The work moved between spatial layout design, custom furniture development, and the practical realities of delivering the project on site.',
      processText:
        'I was involved in the design of the layouts and in the design of the new furniture elements. I also worked as a technical designer, developing product-scale solutions and coordinating the transition from design intent to buildable outcomes.',
      schematicText:
        'My role was Designer & Assistant Project Manager. After the design phase was over, I was responsible for procurement, production, and site management, helping guide the project from development into execution.',
      infoFields: [
        { label: 'Office', value: 'Carlo Ratti Associati / Maestro Technologies / Italo Rota Studio' },
        { label: 'Role', value: 'Designer & Assistant Project Manager' },
        { label: 'Year', value: '2024' },
        { label: 'Photo credits', value: 'CRA & DSL Studio' },
      ],
    }),
  },
  {
    project: createProject(
      'static-biennale',
      'biennale',
      'Venice Biennale di Architettura 2025',
      2025,
      'Venice, Italy',
      'involvement',
      'Curatorial and delivery coordination work for the 2025 Venice Architecture Biennale with Carlo Ratti Associati and Maestro Technologies.',
      'An involvement within the curator\'s team for the 2025 Venice Architecture Biennale, supporting cross-studio coordination, design development, and construction processes across multiple contributors.',
      ['exhibition', 'curatorial coordination', 'executive design'],
      null,
      true,
      9
    ),
    page: createPageContent({
      introText:
        'This involvement was part of the curatorial team behind the 2025 Venice Architecture Biennale, working across design, coordination, and construction with Carlo Ratti Associati and Maestro Technologies.',
      processText:
        'I was an assistant member of the curator\'s team. I collaborated with studios including Howeler + Yoon, Diller Scofidio + Renfro, and Fondazione Pistoletto to coordinate design and construction processes across the exhibition.',
      schematicText:
        'My role was Assistant Manager to the Curatorial Team, supporting communication and delivery between contributors while helping maintain alignment between design development and execution.',
      infoFields: [
        { label: 'Office', value: 'Carlo Ratti Associati / Maestro Technologies' },
        { label: 'Role', value: 'Assistant Manager to Curatorial Team' },
        { label: 'Year', value: '2025' },
        { label: 'Location', value: 'Venice' },
      ],
      awards: ['Golden Lion Award to Canal Cafe, which I was involved in during the executive design phase.'],
    }),
  },
  {
    project: createProject(
      'static-aquapraca',
      'aquapraca',
      'Aquapraca',
      2025,
      'Venice, Italy / Belem, Brazil',
      'involvement',
      'International project delivered with Carlo Ratti Associati, Howeler + Yoon, and Maestro Technologies as a gift from the Italian Government to the Brazilian Government.',
      'Aquapraca was developed as a gift from the Italian Government to the Brazilian Government. The project brought together international collaborators across design development, executive detailing, procurement, and stakeholder coordination, eventually extending to representation at COP30 in Belem.',
      ['international collaboration', 'executive design', 'procurement', 'cop30'],
      null,
      true,
      10
    ),
    page: createPageContent({
      introText:
        'Aquapraca was developed with Carlo Ratti Associati, Howeler + Yoon, and Maestro Technologies as a diplomatic and architectural collaboration between Italy and Brazil. The project connected design development with international coordination and public representation.',
      processText:
        'I was one of the project managers for Aquapraca. I helped the design teams develop executive details and organized stakeholder coordination together with procurement processes across the project.',
      schematicText:
        'My role was Project Manager. In the final phase of the project, at COP30 in Belem, I was selected by the Italian Ministry of Foreign Affairs as one of the representative architects for the work.',
      infoFields: [
        { label: 'Office', value: 'Carlo Ratti Associati / Howeler + Yoon / Maestro Technologies' },
        { label: 'Role', value: 'Project Manager' },
        { label: 'Year', value: '2025' },
        { label: 'Location', value: 'Venice, Italy / Belem, Brazil' },
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
