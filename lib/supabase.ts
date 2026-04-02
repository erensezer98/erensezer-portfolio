import { createClient } from '@supabase/supabase-js'
import type { Project, Award, Publication, ContactMessage } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

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
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching featured projects:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getFeaturedProjects:', err)
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching project by slug:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.error('Unexpected error in getProjectBySlug:', err)
    return null
  }
}

// ─── Awards ──────────────────────────────────────────────────────────────────

export async function getAwards(): Promise<Award[]> {
  try {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching awards:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getAwards:', err)
    return []
  }
}

// ─── Publications ─────────────────────────────────────────────────────────────

export async function getPublications(): Promise<Publication[]> {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching publications:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getPublications:', err)
    return []
  }
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export async function submitContactMessage(
  message: Omit<ContactMessage, 'id' | 'created_at'>
): Promise<void> {
  try {
    const { error } = await supabase.from('contact_messages').insert(message)
    if (error) {
      console.error('Error submitting contact message:', error.message)
    }
  } catch (err) {
    console.error('Unexpected error in submitContactMessage:', err)
  }
}
