import { createClient } from '@supabase/supabase-js'
import type { Project, Award, Publication, ContactMessage } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching projects:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getProjects:', err)
    return []
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('featured', true)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

// ─── Awards ──────────────────────────────────────────────────────────────────

export async function getAwards(): Promise<Award[]> {
  const { data, error } = await supabase
    .from('awards')
    .select('*')
    .order('year', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─── Publications ─────────────────────────────────────────────────────────────

export async function getPublications(): Promise<Publication[]> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('year', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export async function submitContactMessage(
  message: Omit<ContactMessage, 'id' | 'created_at'>
): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert(message)
  if (error) throw error
}
