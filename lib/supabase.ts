import { createClient } from '@supabase/supabase-js'
import type { Project, Award, Publication, ContactMessage, SiteSettings } from './types'
import { DEFAULT_SETTINGS } from './types'

// Provide dummy values to prevent 'supabaseKey is required' crash on importing this file server-side when env vars leak
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'

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

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contact messages:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getContactMessages:', err)
    return []
  }
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error || !data) return DEFAULT_SETTINGS

    const parsed: Record<string, unknown> = {}
    for (const row of data) {
      const v = row.value
      if (v === 'true')       parsed[row.key] = true
      else if (v === 'false') parsed[row.key] = false
      else if (!isNaN(Number(v)) && v !== '') parsed[row.key] = Number(v)
      else                    parsed[row.key] = v
    }

    return { ...DEFAULT_SETTINGS, ...(parsed as Partial<SiteSettings>) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

