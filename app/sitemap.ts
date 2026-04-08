import type { MetadataRoute } from 'next'
import { getAllProjectsForDisplay } from '@/lib/project-page-data'
import { EXPERIMENTS } from '@/lib/experiment-data'
import type { Project } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.erensezer.com'

  const staticRoutes = [
    '',
    '/about',
    '/projects',
    '/awards',
    '/publications',
    '/contact',
    '/experiments',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  let projects: Project[] = []
  try {
    projects = await getAllProjectsForDisplay()
  } catch {
    // If supabase fails, we just don't include dynamic links
  }

  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.created_at ? new Date(project.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: project.featured ? 0.9 : 0.7,
  }))

  const experimentRoutes = EXPERIMENTS.map((experiment) => ({
    url: `${baseUrl}/experiments/${experiment.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...experimentRoutes]
}
