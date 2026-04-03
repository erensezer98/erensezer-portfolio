export type ProjectCategory = 'academic' | 'freelance' | 'competition' | 'research'

export interface Project {
  id: string
  title: string
  slug: string
  category: ProjectCategory
  short_description: string
  description: string
  year: number
  location: string
  tags: string[]
  cover_image: string | null
  images: string[]
  featured: boolean
  order_index: number
  created_at: string
}

export interface Award {
  id: string
  title: string
  organization: string
  year: number
  description: string | null
  created_at: string
}

export interface Publication {
  id: string
  title: string
  type: 'publication' | 'workshop' | 'exhibition' | 'lecture'
  organization: string
  year: number
  description: string | null
  url: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

// ─── Site / Layout Settings ───────────────────────────────────────────────────

export interface SiteSettings {
  // Homepage
  home_hero_size: 'large' | 'compact'
  home_grid_cols: 1 | 2

  // Projects listing
  projects_grid_cols: 2 | 3

  // About page
  about_show_photo: boolean
  about_bio_cols: 1 | 2

  // Project detail
  project_show_tags: boolean
}

export const DEFAULT_SETTINGS: SiteSettings = {
  home_hero_size: 'large',
  home_grid_cols: 2,
  projects_grid_cols: 3,
  about_show_photo: true,
  about_bio_cols: 2,
  project_show_tags: true,
}
