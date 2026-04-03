import { getProjects, getSiteSettings } from '@/lib/supabase'
import ProjectCard from '@/components/projects/ProjectCard'
import type { Metadata } from 'next'
import type { Project } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Architectural and design projects by Eren Sezer.',
}

const STATIC_PROJECTS: Project[] = [
  { id: '1', slug: 'food-tower',         title: 'The Food Tower',      year: 2022, location: 'Milan, Italy',    category: 'academic',  short_description: 'Vertical farm and factory in the MIND district, Milan. Shortlisted for Skyhive Skyscraper Challenge 2022.', description: '', tags: ['vertical farm', 'skyscraper', 'timber structure'], cover_image: null, images: [], featured: true,  order_index: 1, created_at: '' },
  { id: '2', slug: 'the-log',            title: 'The Log',             year: 2021, location: 'Milan, Italy',    category: 'academic',  short_description: 'Auditorium project exploring organic timber form in Milan.',                                                  description: '', tags: ['auditorium', 'timber', 'acoustics'],             cover_image: null, images: [], featured: true,  order_index: 2, created_at: '' },
  { id: '3', slug: 'halic-co-op',        title: 'Haliç Co-op',         year: 2020, location: 'Istanbul, Turkey',category: 'academic',  short_description: 'Creative Industries Center in Goldenhorn, Istanbul. Selected by Mimdap Architecture Magazine.',              description: '', tags: ['cultural', 'creative hub', 'istanbul'],           cover_image: null, images: [], featured: true,  order_index: 3, created_at: '' },
  { id: '4', slug: 'csarda',             title: 'Csarda',              year: 2022, location: 'South Korea',     category: 'freelance', short_description: 'Pavilion design for the World Scout Jamboree in Saemangeum, South Korea.',                                      description: '', tags: ['pavilion', 'festival', 'temporary'],             cover_image: null, images: [], featured: true,  order_index: 4, created_at: '' },
  { id: '5', slug: 'istanbul-a-way-out', title: 'Istanbul: A Way Out', year: 2023, location: 'Istanbul, Turkey',category: 'academic',  short_description: 'An urban escape strategy for Istanbul — light, shadow, and threshold.',                                      description: '', tags: ['urban', 'istanbul', 'light', 'installation'],   cover_image: null, images: [], featured: true,  order_index: 5, created_at: '' },
]

export default async function ProjectsPage() {
  let projects: Project[] = []
  try { projects = await getProjects() } catch { /* use fallback */ }
  if (!projects.length) projects = STATIC_PROJECTS

  const settings = await getSiteSettings()

  const gridCols = settings.projects_grid_cols === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="px-6 md:px-10 pt-28 pb-32">
      <p className="text-[13px] text-muted mb-16">projects</p>

      <div className={`grid ${gridCols} gap-x-8 gap-y-14`}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
