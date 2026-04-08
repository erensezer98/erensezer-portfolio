export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import ProjectDetailTemplate from '@/components/projects/ProjectDetailTemplate'
import { getResolvedProjectPageDataBySlug } from '@/lib/project-page-data'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  noStore()
  const resolved = await getResolvedProjectPageDataBySlug(params.slug)
  const project = resolved?.project ?? null

  if (!project) {
    return { title: 'Project' }
  }

  const url = `https://www.erensezer.com/projects/${project.slug}`
  const description = project.short_description || project.description || `Project by Eren Sezer: ${project.title}`
  const image = project.cover_image || (resolved?.content.galleryImages.length ? resolved.content.galleryImages[0] : undefined)

  return {
    title: project.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${project.title} | Eren Sezer`,
      description,
      url,
      siteName: 'Eren Sezer',
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630, alt: project.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  noStore()
  const resolved = await getResolvedProjectPageDataBySlug(params.slug)

  if (!resolved) {
    notFound()
  }

  const { project } = resolved
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Projects',
        item: 'https://www.erensezer.com/projects',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: project.title,
        item: `https://www.erensezer.com/projects/${project.slug}`,
      },
    ],
  }

  const creativeWorkJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    description: project.short_description || project.description,
    author: {
      '@type': 'Person',
      name: 'Eren Sezer',
      url: 'https://www.erensezer.com',
    },
    image: project.cover_image,
    datePublished: project.created_at || '2024-01-01',
    dateModified: project.created_at || '2024-01-01',
    publisher: {
      '@type': 'Person',
      name: 'Eren Sezer',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.erensezer.com/og-image.jpg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.erensezer.com/projects/${project.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkJsonLd) }}
      />
      <ProjectDetailTemplate project={resolved.project} content={resolved.content} />
    </>
  )
}
