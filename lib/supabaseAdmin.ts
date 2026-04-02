import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// supabaseAdmin is only available server-side (service role key bypasses RLS)
// Will be null if the env var is missing — actions.ts checks for this
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null
