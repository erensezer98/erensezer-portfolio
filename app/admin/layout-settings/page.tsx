export const dynamic = 'force-dynamic'

import { getSiteSettings } from '@/lib/supabase'
import LayoutSettingsClient from './LayoutSettingsClient'

export default async function LayoutSettingsPage() {
  const settings = await getSiteSettings()
  return <LayoutSettingsClient initialSettings={settings} />
}
