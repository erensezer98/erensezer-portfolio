import { cache } from 'react'
import { PROJECT_DRIVE_FIELDS, isPlaceholderDriveValue } from '@/lib/drive-folder-settings'
import { gdriveThumbnailUrl } from '@/lib/gdrive'
import { DRIVE_FOLDERS } from '@/lib/project-images'
import { getSiteSettings } from '@/lib/supabase'
import type { Project } from '@/lib/types'

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
}

interface GoogleDriveListResponse {
  files?: GoogleDriveFile[]
}

interface DriveProjectFolders {
  folder: string
  cover: string
  gallery: string
  process: string
  wide: string
}

export interface ProjectDriveMedia {
  coverImage: string | null
  galleryImages: string[]
  processImages: string[]
  schematicImages: string[]
}

function getDriveFoldersForSlug(slug: string): DriveProjectFolders | null {
  const entry = DRIVE_FOLDERS[slug as keyof typeof DRIVE_FOLDERS]
  if (!entry || typeof entry === 'string') return null
  return entry
}

const listPublicFolderImages = cache(async (folderId: string, limit = 24) => {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey || isPlaceholderDriveValue(folderId)) return []

  const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    fields: 'files(id,name,mimeType)',
    orderBy: 'name_natural',
    pageSize: String(limit),
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
  })

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as GoogleDriveListResponse
    return (data.files ?? []).map((file) => gdriveThumbnailUrl(file.id))
  } catch {
    return []
  }
})

async function getConfiguredProjectFolders(slug: string): Promise<DriveProjectFolders | null> {
  const defaults = getDriveFoldersForSlug(slug)
  if (!defaults) return null

  const config = PROJECT_DRIVE_FIELDS.find((entry) => entry.slug === slug)
  if (!config) return defaults

  const settings = await getSiteSettings()

  return {
    folder: String(settings[config.fields.folder] ?? defaults.folder),
    cover: String(settings[config.fields.cover] ?? defaults.cover),
    gallery: String(settings[config.fields.gallery] ?? defaults.gallery),
    process: String(settings[config.fields.process] ?? defaults.process),
    wide: String(settings[config.fields.wide] ?? defaults.wide),
  }
}

export async function getProjectDriveMedia(slug: string): Promise<ProjectDriveMedia> {
  const folders = await getConfiguredProjectFolders(slug)
  if (!folders) {
    return {
      coverImage: null,
      galleryImages: [],
      processImages: [],
      schematicImages: [],
    }
  }

  const [coverImages, galleryImages, processImages, schematicImages] = await Promise.all([
    listPublicFolderImages(folders.cover, 1),
    listPublicFolderImages(folders.gallery, 24),
    listPublicFolderImages(folders.process, 24),
    listPublicFolderImages(folders.wide, 24),
  ])

  return {
    coverImage: coverImages[0] ?? null,
    galleryImages,
    processImages,
    schematicImages,
  }
}

export async function resolveProjectDisplayMedia(project: Project): Promise<Project> {
  const driveMedia = await getProjectDriveMedia(project.slug)

  return {
    ...project,
    cover_image: driveMedia.coverImage ?? (isPlaceholderDriveValue(project.cover_image) ? null : project.cover_image),
    images: driveMedia.galleryImages.length ? driveMedia.galleryImages : project.images,
  }
}
