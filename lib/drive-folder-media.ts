import { PROJECT_DRIVE_FIELDS, isPlaceholderDriveValue } from '@/lib/drive-folder-settings'
import { gdriveThumbnailUrl, protectGoogleDriveImageUrl } from '@/lib/gdrive'
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

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const normalized = trimmed
    .replace(/^https:\/\/ih3\.googleusercontent\.com/i, 'https://lh3.googleusercontent.com')
    .replace(/^https:\/\/Ih3\.googleusercontent\.com/i, 'https://lh3.googleusercontent.com')

  return protectGoogleDriveImageUrl(normalized)
}

function normalizeImageList(values: string[] | null | undefined) {
  return (values ?? [])
    .map((value) => normalizeImageUrl(value))
    .filter((value): value is string => Boolean(value))
}

function getDriveFoldersForSlug(slug: string): DriveProjectFolders | null {
  const entry = DRIVE_FOLDERS[slug as keyof typeof DRIVE_FOLDERS]
  if (!entry || typeof entry === 'string') return null
  return entry
}

export async function listPublicFolderImages(folderId: string, limit = 24) {
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
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as any

    if (data.error) {
      console.error(`[Drive] API Error for folder ${folderId}:`, data.error.message)
      return []
    }

    if (!data.files || data.files.length === 0) {
      if (folderId && !folderId.includes('PLACEHOLDER')) {
        console.warn(`[Drive] No images found in folder: ${folderId}. Check sharing permissions.`)
      }
      return []
    }

    return data.files.map((file: any) => gdriveThumbnailUrl(file.id))
  } catch {
    return []
  }
}

async function getConfiguredProjectFolders(slug: string): Promise<DriveProjectFolders | null> {
  const defaults = getDriveFoldersForSlug(slug)
  if (!defaults) return null

  const config = PROJECT_DRIVE_FIELDS.find((entry) => entry.slug === slug)
  if (!config) return defaults

  const settings = await getSiteSettings()

  const resolveVal = (key: string, fallback: string | undefined) => {
    const val = settings[key] as string | undefined
    return isPlaceholderDriveValue(val) ? String(fallback ?? '') : String(val)
  }

  return {
    folder: resolveVal(config.fields.folder, defaults.folder),
    cover: resolveVal(config.fields.cover, defaults.cover),
    gallery: resolveVal(config.fields.gallery, defaults.gallery),
    process: resolveVal(config.fields.process, defaults.process),
    wide: resolveVal(config.fields.wide, defaults.wide),
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
  const preferredCoverImage = driveMedia.coverImage ?? driveMedia.galleryImages[0] ?? null
  const manualCoverImage = normalizeImageUrl(project.cover_image)
  const manualImages = normalizeImageList(project.images)

  return {
    ...project,
    cover_image: preferredCoverImage ?? (isPlaceholderDriveValue(manualCoverImage) ? null : manualCoverImage),
    images: driveMedia.galleryImages.length ? driveMedia.galleryImages : manualImages,
  }
}
