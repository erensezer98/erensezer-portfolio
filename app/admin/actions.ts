'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'

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
