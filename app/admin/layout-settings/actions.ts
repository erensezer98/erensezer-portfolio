'use server'

import { normalizeDriveFolderInput } from '@/lib/drive-folder-settings'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { revalidatePath } from 'next/cache'

export async function saveLayoutSettings(raw: Record<string, string>) {
  if (!supabaseAdmin) {
    throw new Error('Admin client not initialised — check SUPABASE_SERVICE_ROLE_KEY env var.')
  }

  const rows = Object.entries(raw).map(([key, value]) => ({
    key,
    value: key.startsWith('drive_') ? normalizeDriveFolderInput(value) : value,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) throw new Error(error.message)

  // Revalidate every page that consumes settings
  revalidatePath('/admin')
  revalidatePath('/admin/layout-settings')
  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath('/about')
  revalidatePath('/awards')
  revalidatePath('/projects/[slug]', 'page')
}
