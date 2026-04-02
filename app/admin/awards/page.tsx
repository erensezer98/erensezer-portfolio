export const dynamic = 'force-dynamic'

import { getAwards } from '@/lib/supabase'
import AwardsManager from './AwardsManager'

export default async function AdminAwardsPage() {
  const awards = await getAwards()

  return <AwardsManager initialAwards={awards} />
}
