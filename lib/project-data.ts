import type { Project, ProjectCategory } from '@/lib/types'

export type ProjectSceneComponent =
  | 'none'
  | 'architectural-wireframe'
  | 'exploded-axonometry'
  | 'food-tower-explosion'
  | 'interactive-relight'
  | 'istanbul-scene'
  | 'the-log-scene'
  | 'toor-toor-scene'
  | 'the-wall-scene'

export interface ProjectInfoField {
  label: string
  value: string
}

export interface ProjectDetailSectionImage {
  src?: string
  alt: string
  caption?: string
  aspectRatio?: string
}

export interface ProjectDetailSection {
  id: string
  eyebrow?: string
  title: string
  summary: string
  paragraphs: string[]
  images: ProjectDetailSectionImage[]
  defaultOpen?: boolean
  includeScene?: boolean
  driveFolderId?: string
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
  detailSections?: ProjectDetailSection[]
  // Labels
  introLabel?: string
  introTitle?: string
  processLabel?: string
  processTitle?: string
  schematicLabel?: string
  schematicTitle?: string
  chaptersLabel?: string
  chaptersTitle?: string
  galleryLabel?: string
  galleryTitle?: string
  awardsLabel?: string
  awardsTitle?: string
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
    case 'professional':
      return 'Professional'
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
    detailSections: [],
    introLabel: 'overview',
    introTitle: 'project narrative',
    processLabel: 'process',
    processTitle: 'development',
    schematicLabel: 'schematics',
    schematicTitle: 'systems and diagrams',
    chaptersLabel: 'thesis chapters',
    chaptersTitle: 'read the project deeper',
    galleryLabel: 'gallery',
    galleryTitle: 'project images',
    awardsLabel: 'awards',
    awardsTitle: 'recognition',
    ...content,
  }
}

export const STATIC_PROJECT_RECORDS: StaticProjectRecord[] = [
  {
    project: createProject(
      'static-the-wall-of-porta-romana',
      'the-wall-of-porta-romana',
      'The Wall of Porta Romana',
      2024,
      'Milan, Italy',
      'academic',
      'Thesis proposal for a future library and civic landmark in Porta Romana, developed through architecture, structure, and technology as one continuous system.',
      'The Wall of Porta Romana is a thesis project for a new public library in Milan, positioned between the historical weight of Porta Romana and the future regeneration of the surrounding urban edge. Conceived as both landmark and infrastructure, the project rethinks the library as a civic laboratory: a place for reading, making, meeting, digital production, and collective life. Its architectural identity grows from the tension between a calm urban wall and an interior sculptural journey that draws people through the building like a canyon carved into the city.',
      ['library', 'thesis', 'urban regeneration', 'structure', 'technology'],
      null,
      true,
      11
    ),
    page: createPageContent({
      sceneComponent: 'the-wall-scene',
      introText:
        'The Wall of Porta Romana started with a question: what should a library be now? Not a silent container, but a civic instrument for culture, exchange, and public life. Set in Milan at the threshold of Porta Romana, the project treats the future library as both urban landmark and shared interior world, shaped as much by the city around it as by the people moving through it.',
      processText:
        'The design process moved across five parallel disciplines — architecture, structure, technology, materiality, and urban context — developed simultaneously rather than in sequence. Each strand informed the others: the structural armature shaped the openness of the interior; the facade system drove the environmental logic; the fabrication studies tested whether the organic quality of the spaces could be translated into real components. The final result is a building where every layer is legible without being separated. The wall holds everything together, not as a boundary, but as a civic instrument.',
      schematicText:
        'The technical drawings investigate the facade as a layered system and the structure as a spatial armature. Double-glazed units, photovoltaic surfaces, concealed service risers, and natural ventilation channels are integrated directly into the building envelope. Floor plans reveal how the outer discipline of the wall produces a liberated inner landscape of voids, overlooks, and shared rooms. Sections document the journey from entrance to the upper reading terraces, where the roof becomes productive infrastructure: collecting water, harvesting energy, and opening toward the sky.',
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_PROCESS_1',
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_PROCESS_2',
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_PROCESS_3',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_WIDE_1',
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_WIDE_2',
      ],
      galleryImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_GALLERY_1',
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_GALLERY_2',
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_PORTA_ROMANA_GALLERY_3',
      ],
      infoFields: [
        { label: 'Program', value: 'Library / Civic Knowledge Hub' },
        { label: 'Status', value: 'Academic Thesis Project' },
        { label: 'Location', value: 'Porta Romana, Milan' },
        { label: 'Institution', value: 'Politecnico di Milano' },
      ],
      detailSections: [
        {
          id: 'urban-context',
          eyebrow: 'chapter 01',
          title: 'Milan and Porta Romana',
          summary:
            'The project begins with the city, placing the library at the edge of Porta Romana as a tool for urban repair and public intensity.',
          paragraphs: [
            'The thesis reads Milan through time: what it has been, what it is becoming, and where a new public institution could matter most. Porta Romana emerged not as a leftover site, but as a charged edge where infrastructure, memory, and future growth meet.',
            'Positioned between Viale Isonzo, Corso Lodi, and Piazzale Lodi, the project closes an urban gap while opening new civic possibilities. It works with transport, nearby institutions, and the regeneration of the former rail-yard to turn the site into a point of arrival rather than a boundary.',
            'This is why the library is imagined less as an isolated building and more as an urban hinge. It gathers movement, culture, and public life into one place and gives Porta Romana a new face toward the city.',
          ],
          driveFolderId: '18KxuqQLdHAE6VF54GvyNJd0-Bo7pHSBq',
          images: [
            {
              alt: 'The Wall of Porta Romana urban analysis',
              caption: 'Urban analysis / Milan perimeter',
              aspectRatio: '4/3',
            },
            {
              alt: 'The Wall of Porta Romana masterplan',
              caption: 'Porta Romana masterplan / site strategy',
              aspectRatio: '4/3',
            },
          ],
        },
        {
          id: 'architecture',
          eyebrow: 'chapter 02',
          title: 'Architecture: composition and sculpture',
          summary:
            'A clear outer wall holds a fluid inner world, making the project feel at once urban, civic, and deeply spatial.',
          paragraphs: [
            'The architectural idea is simple and deliberate: a sculpture within a box. The outer figure keeps a formal, urban discipline, while the inside unfolds as an organic landscape of voids, paths, overlooks, and public rooms.',
            'That contrast allows the project to handle a demanding program without losing clarity. Departments, forum spaces, auditorium functions, and collective interiors are not stacked mechanically, but tied together through a continuous spatial journey.',
            'The result is a library that is meant to be experienced in sequence. You do not just enter it, find a room, and leave. You move through it, discover it, and slowly understand it as a public interior carved into the thickness of the wall.',
          ],
          driveFolderId: '1KJ0GZ5cfB8f-wLmRM6FA27IhhYXesSGk',
          images: [
            {
              alt: 'The Wall of Porta Romana composition diagram',
              caption: 'Concept diagram / sculpture within a box',
              aspectRatio: '4/3',
            },
            {
              alt: 'The Wall of Porta Romana circulation section',
              caption: 'Circulation / section / program sequence',
              aspectRatio: '4/3',
            },
          ],
          includeScene: true,
        },
        {
          id: 'structure',
          eyebrow: 'chapter 03',
          title: 'Armature: structural logic',
          summary:
            'The structure had to do more than hold the building up. It had to protect openness, long spans, and the freedom of the interior.',
          paragraphs: [
            'The structural study moved through several iterations before reaching the final system. Early schemes with more columns and conventional framing solved stability, but they compromised the openness and flexibility the architecture demanded.',
            'The chosen solution is a spatial armature built through reinforced concrete cores, steel members, and tension cables. This system distributes loads efficiently while freeing the interior from repetitive supports and making room for double heights, gaps, and changing spatial configurations.',
            'CLT slabs help lighten the floors and sharpen the overall logic of the structure. What remains is an armature that stays mostly hidden, but quietly gives the project its range, its generosity, and its ability to evolve over time.',
          ],
          driveFolderId: '1at2nWxOYGhnNg9H2-xjqP-CE0cpPBe3n',
          images: [
            {
              alt: 'The Wall of Porta Romana structural evolution',
              caption: 'Structural evolution / system phases',
              aspectRatio: '4/3',
            },
            {
              alt: 'The Wall of Porta Romana structural verification',
              caption: 'Typical floor structure / verification diagrams',
              aspectRatio: '4/3',
            },
          ],
        },
        {
          id: 'technology',
          eyebrow: 'chapter 04',
          title: 'Technology: facade, environment, BIM',
          summary:
            'Performance is not layered onto the project afterward. It is folded directly into the facade, the section, and the life of the building.',
          paragraphs: [
            'Technology enters the project through necessity: how to bring air, light, comfort, and environmental control into a large civic building without weakening its architectural presence. The answer is a facade that behaves as a layered system rather than a flat skin.',
            'Double glazing, photovoltaic collection, controlled daylight, natural and cross ventilation, concealed services, and rainwater harvesting are woven into the design to improve both performance and daily use. The goal is not simply efficiency, but a building that feels intelligent in the way it works.',
            'This chapter also grounds the project in detail. BIM coordination and assembly studies translate the thesis from concept into something buildable, precise, and technically credible.',
          ],
          driveFolderId: '1F9AmFGX1pkAdRmBaiPkyAMX0_i_wAO8K',
          images: [
            {
              alt: 'The Wall of Porta Romana facade development',
              caption: 'Facade development / entrance condition',
              aspectRatio: '4/3',
            },
            {
              alt: 'The Wall of Porta Romana environmental systems',
              caption: 'Ventilation / daylight / building services',
              aspectRatio: '4/3',
            },
          ],
        },
        {
          id: 'materiality',
          eyebrow: 'chapter 05',
          title: 'Materiality: sustainability and fabrication',
          summary:
            'Materiality gives the project its final weight, tying environmental ambition to real fabrication and construction logic.',
          paragraphs: [
            'The material strategy follows the wider environmental ambitions of Milan 2030, but it also stays close to the reality of making. Recycled and recyclable materials, photovoltaic integration, water-conscious systems, and lower-emission choices are treated as architectural decisions, not technical decoration.',
            'At the same time, the thesis looks carefully at fabrication. CNC-milled components, plywood studies, custom integrated elements, and digitally controlled production methods test how the project\'s organic language can be translated into precise parts.',
            'That is what gives the project credibility. The wall is not only imagined as a powerful figure in the city, but as something that could be assembled, detailed, and built with care.',
          ],
          driveFolderId: '1iYFaENM2OFkQ2GBFvJVxjzyjGkne572P',
          images: [
            {
              alt: 'The Wall of Porta Romana sustainability diagram',
              caption: 'Sustainability goals / Milan 2030',
              aspectRatio: '4/3',
            },
            {
              alt: 'The Wall of Porta Romana fabrication study',
              caption: 'Fabrication logic / CNC / material study',
              aspectRatio: '4/3',
            },
          ],
        },
      ],
    }),
  },
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
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_FOOD_TOWER_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_FOOD_TOWER_WIDE_1',
      ],
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
      'Auditorium born from a schoolyard ritual — students rolling logs into a circle to make their own little stage.',
      'The Log began with a simple observation: students at the Alda Merini Secondary School in Milan dragging heavy timber logs across the garden, arranging them into a circle to create their own makeshift auditorium. That image became the project. The building keeps the log as its central idea — not as ornament, but as the architecture itself.',
      ['auditorium', 'timber', 'acoustics'],
      null,
      true,
      2
    ),
    page: createPageContent({
      sceneComponent: 'the-log-scene',
      introText:
        'The Log was born from a scene in the schoolyard at Alda Merini Secondary School in Milan: students dragging heavy timber logs across the garden, arranging them into a circle for their little shows. That gesture stayed with us. We wanted to hold onto what already belonged to them — the ritual, the weight, the joy of it — and turn it into architecture. The result is a bright, open auditorium where the stage can expand by folding back the wall and spilling out into the garden.',
      processText:
        'The design is built on a single contrast: the heavy log and the light shell. The auditorium is conceived as the log — grounded, solid, opaque, anchored to the earth. The foyer is its opposite: as light as it can be, transparent, semi-open, and semi-conditioned. That tension between mass and weightlessness came directly from the students themselves — from the effort of moving something heavy to create something joyful, from turning a pile of timber into a circle, and a circle into a shared place.',
      schematicText:
        'We knew the students loved their garden, and we did not want to take it from them. A bifold door behind the stage means the garden remains part of the performance — a backdrop, an extension of the stage, or simply a place to breathe. For the foyer, we kept the roof open so hot air can rise and escape, preventing the space from becoming a greenhouse. An ETFE membrane seals it against rain while keeping the space luminous and alive, hovering somewhere between inside and out.',
      infoFields: [
        { label: 'Program', value: 'Cultural / Performance' },
        { label: 'Area', value: '8,500 m2' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'Politecnico di Milano' },
      ],
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_THE_LOG_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_THE_LOG_WIDE_1',
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
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_HALIC_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_HALIC_WIDE_1',
      ],
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
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_CSARDA_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_CSARDA_WIDE_1',
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
      'A research-driven project studying how everyday street obstructions can turn into life-threatening barriers after an earthquake in Istanbul.',
      'Istanbul: A Way Out is a research-driven architectural project that investigates post-earthquake emergency conditions in Istanbul by shifting attention away from collapse alone and toward accessibility. Through urban observation and AI-based analysis, the project studies how narrow streets, parked cars, street furniture, bay windows, and informal spatial patterns can block evacuation and delay aid, proposing a new way to read urban resilience through the street itself.',
      ['urban', 'istanbul', 'light', 'installation'],
      null,
      true,
      5
    ),
    page: createPageContent({
      sceneComponent: 'istanbul-scene',
      introText:
        'Traditional disaster planning asks whether buildings will stand. Istanbul: A Way Out asks what happens when they do — and the city still cannot move. In a densely built, largely unplanned megacity like Istanbul, the aftermath of an earthquake can be defined not by structural failure alone, but by the accumulation of ordinary urban elements: a parked car, a protruding bay window, a lamp post on a narrow pavement, a cluster of street furniture. These everyday objects, invisible in normal life, can become lethal obstacles the moment emergency services need to reach survivors or residents need to escape. The project was born out of the 2023 Turkey earthquake and the unresolved seismic risk that continues to hang over Istanbul. It proposes that post-earthquake survival relies as much on movement and accessibility as it does on structural integrity — and that disaster resilience in a divided city cannot be separated from the socio-economic conditions that shape its streets.',
      processText:
        'Developed by an international team of young architects and researchers — Eren Sezer, Nour Fneich, Andrei Calin Teodorescu, Egemen Sezer, Raşit Eren Cangür, Sonya Ragimova, and Nicolo Carlini — the project employed a data-driven, AI-assisted methodology to make visible what is usually overlooked. At its core was a YOLOv (You Only Look Once) object detection model, trained on 300 Google Street View images to identify and map the physical barriers that could slow down emergency response: parked vehicles, overhanging structures, encroachments on pavement, and street clutter. To ground this in the social complexity of the city, the team selected three neighbourhoods with sharply contrasting urban and economic conditions: Dolapdere, densely populated and largely unplanned; Ortaköy, historically layered with moderate planning; and Göztepe, a recently planned, low-density, high-income area. Using a grid-based risk scoring system, they calculated a Total Risk Score for each zone — measuring the proportion of obstructed streets, sidewalks, and open spaces relative to the total area. The results confirmed a direct correlation: narrower, densely occupied streets in lower-income neighbourhoods carry significantly higher post-disaster risk than the wider, open roads of planned districts.',
      schematicText:
        'The diagrams do not attempt to predict which buildings will fall. Instead, they map where the city will fail to move. Street sections isolate the specific elements that interfere with emergency accessibility. Comparative graphs plot street width against risk score, making inequality legible as a spatial condition. Total Risk Maps overlay these findings across all three test neighbourhoods, exposing the urban bottlenecks that would most severely delay evacuation and rescue in a seismic event. Together, these drawings form a scalable analytical tool — one that reframes post-disaster vulnerability as something that can be measured, planned for, and addressed before the next earthquake arrives.',
      infoFields: [
        { label: 'Program', value: 'Urban Installation / Research' },
        { label: 'Area', value: 'Urban Scale' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'Politecnico di Milano' },
      ],
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_ISTANBUL_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_ISTANBUL_WIDE_1',
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
      'A flexible primary school inspired by Senegalese vernacular settlement patterns and designed to serve both children and the wider community.',
      'Toor-Toor, meaning "Flower" in Wolof, takes inspiration from the logic of traditional Senegalese compounds, where scattered buildings gather around a communal center. The project transforms that social structure into a circular school organized around an outdoor playground, where classroom modules, shared spaces, and community functions are woven together through flexibility, climate awareness, and local material intelligence.',
      ['education', 'rammed earth', 'circular plan', 'community'],
      null,
      true,
      6
    ),
    page: createPageContent({
      sceneComponent: 'toor-toor-scene',
      introText:
        'Toor-Toor School begins with the idea that a child\'s environment shapes the way they grow, learn, and imagine. Inspired by the spatial logic of traditional Senegalese settlements, the project organizes the school as a circular community gathered around a central playground. The plan keeps collective life at its heart while using curved forms, color, and pattern to create a place that feels playful, open, and generous rather than rigid or institutional.',
      processText:
        'The school is made of ten modules arranged radially: six classrooms and four flexible spaces in between. These intermediate spaces hold functions such as the laboratory, canteen, offices, and sickroom, but they also act as connectors, allowing the whole plan to work as one continuous learning environment. That flexibility extends beyond school hours, when the same spaces can open to the wider community and offer shelter, shared use, or support for everyday life around the school.',
      schematicText:
        'The technical logic of the project is closely tied to climate, construction, and reuse. Inclined roofs collect water, bring controlled daylight into the classrooms, and support layered solutions for ventilation and acoustics, from corrugated metal sheets to straw insulation and suspended patterned fabrics. Rammed earth walls, bamboo foldable panels, reused tire foundations, and simple modular construction make the school buildable with local means while giving it a material identity that is both practical and warm.',
      infoFields: [
        { label: 'Program', value: 'Educational / Community' },
        { label: 'Area', value: 'N/A' },
        { label: 'Status', value: 'Academic Project' },
        { label: 'Client', value: 'N/A' },
      ],
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_TOOR_TOOR_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_TOOR_TOOR_WIDE_1',
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
        'Unfolding Landscapes begins with a delicate question: how can the archaeological landscape of the Thermae of Curinga and the environmental landscape around it exist together without one overpowering the other? The proposal answers through a single continuous roof that protects the ruins while tracing their perimeter, turning preservation into an experience. More than a shelter, the roof becomes a device for looking, walking, and understanding the site as both artifact and terrain.',
      processText:
        'The project gives priority to the movement of the visitor. A panoramic walkway unfolds beneath the roof and circles the ruins, offering a slower, more distant reading of the archaeological field, while a transversal passage cuts through the site for a more direct and intimate encounter. Together, these two paths create a seamless dialogue between exterior and interior experience, allowing users to shift constantly between the scale of the ruin and the scale of the landscape.',
      schematicText:
        'The roof takes its language from two motions at once: the layered flow of the topography and the spatial rhythm of the ruins themselves. It rises where certain moments need to be framed, especially around spaces such as the frigidarium, and then softens back into the terrain, almost camouflaging the archaeology beneath it. Its structure draws from the memory of the central cross vault once covering the bath, while its clay materiality pays homage to Roman African construction traditions and the craft of pottery, giving the intervention both historical depth and a quiet, earthy presence.',
      infoFields: [
        { label: 'Program', value: 'Archaeological Reuse / Landscape Intervention' },
        { label: 'Area', value: 'Thermae of Curinga site' },
        { label: 'Status', value: 'Competition Entry' },
        { label: 'Client', value: 'Reuse Italy' },
      ],
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_WIDE_1',
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
      'Workplace transformation inside Oscar Niemeyer\'s Palazzo Mondadori, rethinking the office as a more open, reconfigurable, and social environment.',
      'The Office As A Playground is a renovation project for Oscar Niemeyer\'s Palazzo Mondadori in Milan, developed by CRA-Carlo Ratti Associati in collaboration with Italo Rota and Maestro Technologies. The intervention reimagines more than 20,000 square meters of office space, preserving the character of Niemeyer\'s landmark while introducing a more fluid and interaction-driven workplace shaped by adaptable layouts, transparent meeting spaces, natural light, and reconfigured furniture systems.',
      ['adaptive reuse', 'workplace', 'furniture design', 'site management'],
      null,
      true,
      8
    ),
    page: createPageContent({
      introText:
        'The Office As A Playground rethinks Palazzo Mondadori not as a fixed office landscape, but as a more open and sociable workplace. Developed inside one of Oscar Niemeyer\'s most celebrated buildings, the project balances respect for the original architecture with a new spatial culture shaped by informal encounters, transparency, reconfigurable furniture, and a closer relationship to daylight and the surrounding park.',
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
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_MONDADORI_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_MONDADORI_WIDE_1',
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
      'Curatorial and delivery work for Biennale Architettura 2025, centered on adaptation, collaboration, and new forms of architectural authorship.',
      'Biennale Architettura 2025 unfolds under the title Intelligens. Natural. Artificial. Collective., a curatorial framework led by Carlo Ratti that calls for architecture to move beyond mitigation and engage adaptation as its central challenge. The exhibition brings together hundreds of contributors across disciplines, generations, and forms of intelligence, proposing a more inclusive and collaborative model of authorship in response to climate change.',
      ['exhibition', 'curatorial coordination', 'executive design'],
      null,
      true,
      9
    ),
    page: createPageContent({
      introText:
        'Intelligens. Natural. Artificial. Collective. frames the 2025 Venice Architecture Biennale as a laboratory for adaptation. Rather than treating architecture as an isolated discipline, the exhibition gathers architects, scientists, artists, coders, philosophers, and many others to ask how design can respond to a world already transformed by climate change. The result is a broad, collaborative exhibition that rethinks both how we build and how authorship itself is understood.',
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
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_BIENNALE_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_BIENNALE_WIDE_1',
      ],
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
      'A floating cultural plaza developed for the 2025 Venice Biennale and COP30, designed to become permanent public infrastructure in Belem.',
      'Aquapraca is a floating cultural plaza developed by CRA-Carlo Ratti Associati and Höweler + Yoon as a platform for climate dialogue, public gathering, and long-term civic use. First unveiled in Venice and later installed in Belem for COP30, the project uses buoyancy, sensing technologies, and a shifting relationship to water level to let visitors encounter climate change at eye level. After the summit, it remains in the Amazon as permanent cultural infrastructure and a legacy of cooperation between Italy and Brazil.',
      ['international collaboration', 'executive design', 'procurement', 'cop30'],
      null,
      true,
      10
    ),
    page: createPageContent({
      introText:
        'Aquapraca is imagined as a floating public square, a civic platform that brings architecture, water, and climate awareness into direct contact. Developed for the 2025 Venice Biennale and COP30 in Belem, the project creates public space out of the sea itself, allowing visitors to experience shifting water levels and environmental change at a human scale. What begins as an exhibition piece is designed to continue its life as permanent cultural infrastructure in the Amazon.',
      processText:
        'I was one of the project managers for Aquapraca. I helped the design teams develop executive details and organized stakeholder coordination together with procurement processes across the project.',
      schematicText:
        'My role was Project Manager. In the final phase of the project, at COP30 in Belem, I was selected by the Italian Ministry of Foreign Affairs as one of the representative architects for the work.',
      infoFields: [
        { label: 'Office', value: 'Carlo Ratti Associati / Howeler + Yoon / Maestro Technologies' },
        { label: 'Role', value: 'Project Manager' },
        { label: 'Year', value: '2025' },
        { label: 'Location', value: 'Venice, Italy / Belem, Brazil' },
        { label: 'Photo credits', value: 'Leonardo Finotti' },
      ],
      processImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_AQUAPRACA_PROCESS_1',
      ],
      schematicImages: [
        'https://lh3.googleusercontent.com/d/PLACEHOLDER_AQUAPRACA_WIDE_1',
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
