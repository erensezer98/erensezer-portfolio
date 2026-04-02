import dynamic from 'next/dynamic'
import { getFeaturedProjects } from '@/lib/supabase'

const ProjectSphere = dynamic(
  () => import('@/components/three/ProjectSphere'),
  { ssr: false }
)

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getFeaturedProjects>> = []
  try {
    featured = await getFeaturedProjects()
  } catch {
    // Supabase not yet configured — show static fallback
  }

  // Fallback data if needed
  if (featured.length === 0) {
      featured = [
          { id: '1', slug: 'food-tower', title: 'The Food Tower', year: 2022, location: 'Milan', category: 'academic', created_at: '', order_index: 0, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '2', slug: 'log', title: 'The Log', year: 2021, location: 'Milan', category: 'academic', created_at: '', order_index: 1, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '3', slug: 'halic', title: 'Haliç Co-op', year: 2020, location: 'Istanbul', category: 'academic', created_at: '', order_index: 2, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
          { id: '4', slug: 'csarda', title: 'Hungarian Csarda', year: 2022, location: 'South Korea', category: 'freelance', created_at: '', order_index: 3, featured: true, short_description: '', description: '', tags: [], cover_image: '', images: [] },
      ]
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F9F9F8]">
      <ProjectSphere projects={featured} />
    </div>
  )
}
