import dynamic from 'next/dynamic'
import { getProjects } from '@/lib/supabase'

const ProjectSphere = dynamic(
  () => import('@/components/three/ProjectSphere'),
  { ssr: false }
)

export default async function HomePage() {
  let allProjects: Awaited<ReturnType<typeof getProjects>> = []
  try {
    allProjects = await getProjects()
  } catch {
    // fallback
  }

  // Fallback data if needed
  if (allProjects.length === 0) {
      allProjects = [
          { id: '1', slug: 'food-tower', title: 'The Food Tower', year: 2022, location: 'Milan', category: 'academic', created_at: '', order_index: 0, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '2', slug: 'log', title: 'The Log', year: 2021, location: 'Milan', category: 'academic', created_at: '', order_index: 1, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '3', slug: 'halic', title: 'Haliç Co-op', year: 2020, location: 'Istanbul', category: 'academic', created_at: '', order_index: 2, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '4', slug: 'csarda', title: 'Hungarian Csarda', year: 2022, location: 'South Korea', category: 'freelance', created_at: '', order_index: 3, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '5', slug: 'museum', title: 'Modern Museum', year: 2023, location: 'London', category: 'academic', created_at: '', order_index: 4, featured: false, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '6', slug: 'villa', title: 'Lakeside Villa', year: 2023, location: 'Como', category: 'freelance', created_at: '', order_index: 5, featured: false, short_description: '', description: '', tags: [], cover_image: '', images: [] },
      ]
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0A0A0A]">
      <ProjectSphere projects={allProjects} />
    </div>
  )
}
