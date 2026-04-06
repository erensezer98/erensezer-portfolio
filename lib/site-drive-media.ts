import { cache } from 'react'
import { SITE_DRIVE_FIELDS, isPlaceholderDriveValue } from '@/lib/drive-folder-settings'
import { gdriveThumbnailUrl } from '@/lib/gdrive'
import { getSiteSettings } from '@/lib/supabase'

interface GoogleDriveFile {
  id: string
}

interface GoogleDriveListResponse {
  files?: GoogleDriveFile[]
}

const listFolderImages = cache(async (folderId: string, limit = 24) => {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  if (!apiKey || isPlaceholderDriveValue(folderId)) return []

  const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    fields: 'files(id)',
    orderBy: 'name_natural',
    pageSize: String(limit),
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
  })

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) return []

    const data = (await response.json()) as GoogleDriveListResponse
    return (data.files ?? []).map((file) => gdriveThumbnailUrl(file.id))
  } catch {
    return []
  }
})

export async function getAboutDriveMedia() {
  const settings = await getSiteSettings()
  const portraitFolder = String(settings[SITE_DRIVE_FIELDS.about.fields.portrait] ?? '')
  const galleryFolder = String(settings[SITE_DRIVE_FIELDS.about.fields.gallery] ?? '')

  const [portraitImages, galleryImages] = await Promise.all([
    listFolderImages(portraitFolder, 3),
    listFolderImages(galleryFolder, 12),
  ])

  return {
    portraitImage: portraitImages[0] ?? null,
    galleryImages,
  }
}

export async function getAwardsDriveMedia() {
  const settings = await getSiteSettings()
  const coverFolder = String(settings[SITE_DRIVE_FIELDS.awards.fields.cover] ?? '')
  const coverImages = await listFolderImages(coverFolder, 3)

  return {
    coverImage: coverImages[0] ?? null,
  }
}
