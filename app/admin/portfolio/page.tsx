export const dynamic = 'force-dynamic'

import PortfolioBuilderClient from './PortfolioBuilderClient'
import { getAllResolvedProjectPageData } from '@/lib/project-page-data'

export default async function AdminPortfolioPage() {
  const projects = await getAllResolvedProjectPageData()

  return <PortfolioBuilderClient projects={projects} />
}
