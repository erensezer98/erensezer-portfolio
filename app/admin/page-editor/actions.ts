'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { PageBlock } from '@/lib/types'

const db = supabaseAdmin ?? supabase

export async function savePageContent(pageSlug: string, blocks: PageBlock[]) {
  try {
    const { error } = await db
      .from('page_content')
      .upsert(
        {
          page_slug: pageSlug,
          blocks: blocks,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug' }
      )

    if (error) {
      console.error('savePageContent error:', error)
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    revalidatePath(`/${pageSlug === 'home' ? '' : pageSlug}`)
    return { success: true }
  } catch (err) {
    console.error('savePageContent unexpected error:', err)
    return { error: String(err) }
  }
}
