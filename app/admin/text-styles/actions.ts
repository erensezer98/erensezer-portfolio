'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { TextStyle } from '@/lib/types'

const db = supabaseAdmin ?? supabase

export async function saveTextStyle(style: Partial<TextStyle>) {
  try {
    const { data, error } = await db
      .from('text_styles')
      .upsert(style)
      .select()
      .single()

    if (error) {
      console.error('saveTextStyle error:', error)
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { data }
  } catch (err) {
    console.error('saveTextStyle unexpected error:', err)
    return { error: String(err) }
  }
}

export async function deleteTextStyle(id: string) {
  try {
    const { error } = await db
      .from('text_styles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('deleteTextStyle error:', error)
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('deleteTextStyle unexpected error:', err)
    return { error: String(err) }
  }
}
