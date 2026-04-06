import { DRIVE_FOLDERS } from '@/lib/project-images'

export const SITE_DRIVE_FIELDS = {
  about: {
    label: 'about',
    fields: {
      portrait: 'drive_about_portrait_folder',
      gallery: 'drive_about_gallery_folder',
    },
  },
  awards: {
    label: 'awards',
    fields: {
      cover: 'drive_awards_cover_folder',
    },
  },
} as const

export const PROJECT_DRIVE_FIELDS = [
  {
    slug: 'food-tower',
    label: 'food tower',
    fields: {
      folder: 'drive_food_tower_folder',
      cover: 'drive_food_tower_cover_folder',
      gallery: 'drive_food_tower_gallery_folder',
      process: 'drive_food_tower_process_folder',
      wide: 'drive_food_tower_wide_folder',
    },
  },
  {
    slug: 'istanbul-a-way-out',
    label: 'istanbul: a way out',
    fields: {
      folder: 'drive_istanbul_a_way_out_folder',
      cover: 'drive_istanbul_a_way_out_cover_folder',
      gallery: 'drive_istanbul_a_way_out_gallery_folder',
      process: 'drive_istanbul_a_way_out_process_folder',
      wide: 'drive_istanbul_a_way_out_wide_folder',
    },
  },
  {
    slug: 'the-log',
    label: 'the log',
    fields: {
      folder: 'drive_the_log_folder',
      cover: 'drive_the_log_cover_folder',
      gallery: 'drive_the_log_gallery_folder',
      process: 'drive_the_log_process_folder',
      wide: 'drive_the_log_wide_folder',
    },
  },
  {
    slug: 'halic-co-op',
    label: 'halic co-op',
    fields: {
      folder: 'drive_halic_co_op_folder',
      cover: 'drive_halic_co_op_cover_folder',
      gallery: 'drive_halic_co_op_gallery_folder',
      process: 'drive_halic_co_op_process_folder',
      wide: 'drive_halic_co_op_wide_folder',
    },
  },
  {
    slug: 'csarda',
    label: 'csarda',
    fields: {
      folder: 'drive_csarda_folder',
      cover: 'drive_csarda_cover_folder',
      gallery: 'drive_csarda_gallery_folder',
      process: 'drive_csarda_process_folder',
      wide: 'drive_csarda_wide_folder',
    },
  },
  {
    slug: 'unfolding-landscapes',
    label: 'unfolding landscapes',
    fields: {
      folder: 'drive_unfolding_landscapes_folder',
      cover: 'drive_unfolding_landscapes_cover_folder',
      gallery: 'drive_unfolding_landscapes_gallery_folder',
      process: 'drive_unfolding_landscapes_process_folder',
      wide: 'drive_unfolding_landscapes_wide_folder',
    },
  },
  {
    slug: 'toor-toor-school',
    label: 'toor toor school',
    fields: {
      folder: 'drive_toor_toor_school_folder',
      cover: 'drive_toor_toor_school_cover_folder',
      gallery: 'drive_toor_toor_school_gallery_folder',
      process: 'drive_toor_toor_school_process_folder',
      wide: 'drive_toor_toor_school_wide_folder',
    },
  },
  {
    slug: 'mondadori',
    label: 'palazzo mondadori',
    fields: {
      folder: 'drive_mondadori_folder',
      cover: 'drive_mondadori_cover_folder',
      gallery: 'drive_mondadori_gallery_folder',
      process: 'drive_mondadori_process_folder',
      wide: 'drive_mondadori_wide_folder',
    },
  },
  {
    slug: 'biennale',
    label: 'venice biennale di architettura 2025',
    fields: {
      folder: 'drive_biennale_folder',
      cover: 'drive_biennale_cover_folder',
      gallery: 'drive_biennale_gallery_folder',
      process: 'drive_biennale_process_folder',
      wide: 'drive_biennale_wide_folder',
    },
  },
  {
    slug: 'aquapraca',
    label: 'aquapraca',
    fields: {
      folder: 'drive_aquapraca_folder',
      cover: 'drive_aquapraca_cover_folder',
      gallery: 'drive_aquapraca_gallery_folder',
      process: 'drive_aquapraca_process_folder',
      wide: 'drive_aquapraca_wide_folder',
    },
  },
] as const

type ProjectConfig = (typeof PROJECT_DRIVE_FIELDS)[number]
type ProjectFieldName = keyof ProjectConfig['fields']

export const DRIVE_FOLDER_SETTING_DEFAULTS: Record<string, string> = {
  drive_about_portrait_folder: 'PLACEHOLDER_ABOUT_PORTRAIT_FOLDER',
  drive_about_gallery_folder: 'PLACEHOLDER_ABOUT_GALLERY_FOLDER',
  drive_awards_cover_folder: 'PLACEHOLDER_AWARDS_COVER_FOLDER',
}

for (const project of PROJECT_DRIVE_FIELDS) {
  const projectFolders = DRIVE_FOLDERS[project.slug] as Record<ProjectFieldName, string>
  for (const [fieldName, settingKey] of Object.entries(project.fields) as [ProjectFieldName, string][]) {
    DRIVE_FOLDER_SETTING_DEFAULTS[settingKey] = projectFolders[fieldName]
  }
}

export function normalizeDriveFolderInput(value: string | null | undefined) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return ''

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (folderMatch) return folderMatch[1]

  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idMatch) return idMatch[1]

  return trimmed
}

export function isPlaceholderDriveValue(value: string | null | undefined) {
  if (!value) return true
  return value.includes('PLACEHOLDER') || value.includes('USERFILE')
}
