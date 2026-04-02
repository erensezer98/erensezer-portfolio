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
