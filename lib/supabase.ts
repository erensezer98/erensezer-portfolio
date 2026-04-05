import { createClient } from '@supabase/supabase-js'
import type { Project, Award, Publication, ContactMessage, SiteSettings, TextStyle, PageContent } from './types'
import type { ProjectPageContent } from './project-data'
import { DEFAULT_SETTINGS } from './types'

// Provide dummy values to prevent 'supabaseKey is required' crash on importing this file server-side when env vars leak
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function shouldSuppressFetchError(error: unknown) {
  if (typeof error === 'string') {
    return error.toLowerCase().includes('fetch failed')
  }

  if (error instanceof TypeError) {
    return error.message.toLowerCase().includes('fetch failed')
  }

  if (typeof error === 'object' && error && 'message' in error) {
    const message = String(error.message).toLowerCase()
    return message.includes('fetch failed')
  }

  return false
}

function logDataAccessError(context: string, error: unknown) {
  if (shouldSuppressFetchError(error)) return
  console.error(context, error)
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      logDataAccessError('Error fetching projects:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    logDataAccessError('Unexpected error in getProjects:', err)
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
      logDataAccessError('Error fetching featured projects:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    logDataAccessError('Unexpected error in getFeaturedProjects:', err)
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
      logDataAccessError('Error fetching project by slug:', error.message)
      return null
    }
    return data
  } catch (err) {
    logDataAccessError('Unexpected error in getProjectBySlug:', err)
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
      logDataAccessError('Error fetching awards:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    logDataAccessError('Unexpected error in getAwards:', err)
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
      logDataAccessError('Error fetching publications:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    logDataAccessError('Unexpected error in getPublications:', err)
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
      logDataAccessError('Error fetching contact messages:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    logDataAccessError('Unexpected error in getContactMessages:', err)
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

// ─── Text Styles ──────────────────────────────────────────────────────────────

export async function getTextStyles(): Promise<TextStyle[]> {
  try {
    const { data, error } = await supabase
      .from('text_styles')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching text styles:', error.message)
      return []
    }
    return data ?? []
  } catch (err) {
    console.error('Unexpected error in getTextStyles:', err)
    return []
  }
}

// ─── Page Content ─────────────────────────────────────────────────────────────

export async function getPageContent(pageSlug: string): Promise<PageContent | null> {
  try {
    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('page_slug', pageSlug)
      .single()

    if (error) {
      // PGRST116 = no rows found, which is normal for a new page
      if (error.code !== 'PGRST116') {
        logDataAccessError('Error fetching page content:', error.message)
      }
      return null
    }
    return data
  } catch (err) {
    logDataAccessError('Unexpected error in getPageContent:', err)
    return null
  }
}

export async function getProjectPageContent(slug: string): Promise<ProjectPageContent | null> {
  try {
    const { data, error } = await supabase
      .from('page_content')
      .select('blocks')
      .eq('page_slug', `project:${slug}`)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') {
        logDataAccessError('Error fetching project page content:', error.message)
      }
      return null
    }

    return (data?.blocks as ProjectPageContent) ?? null
  } catch (err) {
    logDataAccessError('Unexpected error in getProjectPageContent:', err)
    return null
  }
}
