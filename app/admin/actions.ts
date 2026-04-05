'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'
import type { Project, Award, Publication } from '@/lib/types'

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'Megerenas98'

// Use service role client if available, otherwise fall back to anon client
// RLS policies allow public writes so either client works
const db = supabaseAdmin ?? supabase

export async function loginAdmin(passcode: string) {
  if (passcode === ADMIN_PASSCODE) {
    cookies().set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return { success: true }
  }
  return { error: 'Invalid passcode' }
}

export async function logoutAdmin() {
  cookies().delete('admin_auth')
  redirect('/admin/login')
}

import { revalidatePath } from 'next/cache'
import type { ProjectPageContent } from '@/lib/project-data'

// ─── Project Actions ────────────────────────────────────────────────────────
export async function saveProject(project: Partial<Project>) {
  try {
    const { data, error } = await db
      .from('projects')
      .upsert(project)
      .select()
      .single()

    if (error) {
      console.error('saveProject error:', error)
      return { error: error.message }
    }
    
    // Clear all cached routes to show the updated project instantly
    revalidatePath('/', 'layout')
    
    return { data }
  } catch (err) {
    console.error('saveProject unexpected error:', err)
    return { error: String(err) }
  }
}

export async function deleteProject(id: string) {
  try {
    const { error } = await db
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('deleteProject error:', error)
      return { error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error('deleteProject unexpected error:', err)
    return { error: String(err) }
  }
}

export async function saveProjectPageContent(slug: string, content: ProjectPageContent) {
  try {
    const { error } = await db
      .from('page_content')
      .upsert(
        {
          page_slug: `project:${slug}`,
          blocks: content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug' }
      )

    if (error) {
      console.error('saveProjectPageContent error:', error)
      return { error: error.message }
    }

    revalidatePath(`/projects/${slug}`)
    revalidatePath('/projects')
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('saveProjectPageContent unexpected error:', err)
    return { error: String(err) }
  }
}

// ─── Awards ──────────────────────────────────────────────────────────────────
export async function saveAward(award: Partial<Award>) {
  try {
    const { data, error } = await db.from('awards').upsert(award).select().single()
    if (error) {
      console.error('saveAward error:', error)
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { data }
  } catch (err) {
    console.error('saveAward unexpected error:', err)
    return { error: String(err) }
  }
}

export async function deleteAward(id: string) {
  try {
    const { error } = await db.from('awards').delete().eq('id', id)
    if (error) {
      console.error('deleteAward error:', error)
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('deleteAward unexpected error:', err)
    return { error: String(err) }
  }
}

// ─── Publications ────────────────────────────────────────────────────────────
export async function savePublication(publication: Partial<Publication>) {
  try {
    const { data, error } = await db.from('publications').upsert(publication).select().single()
    if (error) {
      console.error('savePublication error:', error)
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { data }
  } catch (err) {
    console.error('savePublication unexpected error:', err)
    return { error: String(err) }
  }
}

export async function deletePublication(id: string) {
  try {
    const { error } = await db.from('publications').delete().eq('id', id)
    if (error) {
      console.error('deletePublication error:', error)
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('deletePublication unexpected error:', err)
    return { error: String(err) }
  }
}

// ─── Messages ────────────────────────────────────────────────────────────────
export async function deleteMessage(id: string) {
  try {
    const { error } = await db.from('contact_messages').delete().eq('id', id)
    if (error) {
      console.error('deleteMessage error:', error)
      return { error: error.message }
    }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('deleteMessage unexpected error:', err)
    return { error: String(err) }
  }
}
