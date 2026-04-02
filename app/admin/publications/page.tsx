export const dynamic = 'force-dynamic'

import { getPublications } from '@/lib/supabase'
import PublicationsManager from './PublicationsManager'

export default async function AdminPublicationsPage() {
  const publications = await getPublications()

  return <PublicationsManager initialPublications={publications} />
}
