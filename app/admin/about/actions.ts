'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { ABOUT_BIO_SLUG } from '@/lib/about-content'

const db = supabaseAdmin ?? supabase

export async function saveAboutBio(paragraphs: string[]) {
  try {
    const cleaned = paragraphs.map((p) => p.trim()).filter((p) => p.length > 0)

    const { error } = await db
      .from('page_content')
      .upsert(
        {
          page_slug: ABOUT_BIO_SLUG,
          blocks: { paragraphs: cleaned },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_slug' }
      )

    if (error) {
      console.error('saveAboutBio error:', error)
      return { error: error.message }
    }

    revalidatePath('/about')
    revalidatePath('/admin/about')
    return { success: true }
  } catch (err) {
    console.error('saveAboutBio unexpected error:', err)
    return { error: String(err) }
  }
}
