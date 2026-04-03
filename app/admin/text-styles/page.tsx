export const dynamic = 'force-dynamic'

import { getTextStyles } from '@/lib/supabase'
import TextStylesManager from './TextStylesManager'

export default async function TextStylesPage() {
  const styles = await getTextStyles()
  return <TextStylesManager initialStyles={styles} />
}
