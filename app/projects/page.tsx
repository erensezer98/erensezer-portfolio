import { getProjects } from '@/lib/supabase'
import ProjectCard from '@/components/projects/ProjectCard'
import type { Metadata } from 'next'
import type { Project, ProjectCategory } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Architectural and design projects by Eren Sezer.',
}

const CATEGORIES: { value: ProjectCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'academic', label: 'Academic' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'competition', label: 'Competition' },
  { value: 'research', label: 'Research' },
]

// Static fallback projects when Supabase is not yet configured
const STATIC_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'The Food Tower',
    slug: 'food-tower',
    category: 'academic',
    short_description:
      'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Skyscraper Challenge 2022.',
    description: '',
    year: 2022,
    location: 'Milan, Italy',
    tags: ['vertical farm', 'skyscraper', 'timber structure'],
    cover_image: null,
    images: [],
    featured: true,
    order_index: 1,
    created_at: '',
  },
  {
    id: '2',
    title: 'The Log',
    slug: 'the-log',
    category: 'academic',
    short_description: 'Auditorium project exploring organic timber form in Milan.',
    description: '',
    year: 2021,
    location: 'Milan, Italy',
    tags: ['auditorium', 'timber', 'acoustics'],
    cover_image: null,
    images: [],
    featured: true,
    order_index: 2,
    created_at: '',
  },
  {
    id: '3',
    title: 'Haliç Co-op',
    slug: 'halic-co-op',
    category: 'academic',
    short_description:
      'Creative Industries Center in Goldenhorn, Istanbul. Selected by Mimdap Architecture Magazine.',
    description: '',
    year: 2020,
    location: 'Istanbul, Turkey',
    tags: ['cultural', 'creative hub', 'istanbul'],
    cover_image: null,
    images: [],
    featured: true,
    order_index: 3,
    created_at: '',
  },
  {
    id: '4',
    title: 'Hungarian Csarda',
    slug: 'hungarian-csarda',
    category: 'freelance',
    short_description: 'Pavilion design for a festival in Saemangeum, South Korea.',
    description: '',
    year: 2022,
    location: 'South Korea',
    tags: ['pavilion', 'festival', 'temporary'],
    cover_image: null,
    images: [],
    featured: true,
    order_index: 4,
    created_at: '',
  },
]

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  let projects: Project[] = []
  try {
    projects = await getProjects()
  } catch {
    projects = STATIC_PROJECTS
  }
  if (projects.length === 0) projects = STATIC_PROJECTS

  const activeCategory = (searchParams.category as ProjectCategory | 'all') ?? 'all'
  const filtered =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory)

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-24">
      {/* Header */}
      <div className="mb-14">
        <p className="section-label mb-3">Work</p>
        <h1 className="page-heading">Projects</h1>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-14">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.value}
            href={cat.value === 'all' ? '/projects' : `/projects?category=${cat.value}`}
            className={`text-xs tracking-widest uppercase px-4 py-2 border transition-colors duration-200 ${
              activeCategory === cat.value
                ? 'border-charcoal bg-charcoal text-white'
                : 'border-border text-muted hover:border-charcoal hover:text-charcoal'
            }`}
          >
            {cat.label}
          </a>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-16 text-center">
          No projects in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
