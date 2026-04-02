'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Project } from '@/lib/types'

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123'

export async function loginAdmin(passcode: string) {
  if (passcode === ADMIN_PASSCODE) {
    cookies().set('admin_auth', 'authenticated', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 })
    redirect('/admin')
  }
  return { error: 'Invalid passcode' }
}

export async function logoutAdmin() {
  cookies().delete('admin_auth')
  redirect('/admin/login')
}

// ─── Project Actions ────────────────────────────────────────────────────────
export async function saveProject(project: Partial<Project>) {
  // Use supabaseAdmin to bypass RLS
  const { data, error } = await supabaseAdmin
    .from('projects')
    .upsert(project)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }
  return { data }
}

export async function deleteProject(id: string) {
  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}
