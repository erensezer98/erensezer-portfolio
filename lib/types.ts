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

// ─── Text Styles ──────────────────────────────────────────────────────────────

export interface TextStyle {
  id: string
  name: string
  font_size: string
  font_weight: string
  color: string
  letter_spacing: string
  line_height: string
  text_transform: string
  font_style: string
  margin_bottom: string
  created_at: string
}

// ─── Page Editor / Blocks ─────────────────────────────────────────────────────

export type BlockType = 'text' | 'image' | 'threejs' | 'spacer'

export interface TextBlockProps {
  content: string
  styleId: string | null
  alignment: 'left' | 'center' | 'right'
}

export interface ImageBlockProps {
  src: string
  alt: string
  aspectRatio: string       // e.g. "4/3", "16/9", "1/1"
  objectFit: 'cover' | 'contain'
}

export interface ThreeJSBlockProps {
  component: 'ArchitecturalWireframe' | 'InteractiveRelight' | 'ProjectSphere'
  height: string            // e.g. "400px"
}

export interface SpacerBlockProps {
  height: string            // e.g. "4rem"
}

export interface BlockLayout {
  width: 'full' | 'wide' | 'half' | 'third'
  marginTop: string
  marginBottom: string
  paddingX: string
}

export interface PageBlock {
  id: string
  type: BlockType
  order: number
  props: TextBlockProps | ImageBlockProps | ThreeJSBlockProps | SpacerBlockProps
  layout: BlockLayout
}

export interface PageContent {
  id: string
  page_slug: string
  blocks: PageBlock[]
  updated_at: string
}

export const DEFAULT_BLOCK_LAYOUT: BlockLayout = {
  width: 'full',
  marginTop: '0',
  marginBottom: '1rem',
  paddingX: '0',
}

export const EDITABLE_PAGES = [
  { slug: 'home', label: 'Homepage' },
  { slug: 'about', label: 'About' },
  { slug: 'contact', label: 'Contact' },
] as const

export const THREEJS_COMPONENTS = [
  { value: 'ArchitecturalWireframe', label: 'Architectural Wireframe' },
  { value: 'InteractiveRelight', label: 'Interactive Relight' },
  { value: 'ProjectSphere', label: 'Project Sphere' },
] as const
