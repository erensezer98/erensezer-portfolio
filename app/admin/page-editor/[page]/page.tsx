export const dynamic = 'force-dynamic'

import { getPageContent, getTextStyles } from '@/lib/supabase'
import { EDITABLE_PAGES } from '@/lib/types'
import { notFound } from 'next/navigation'
import PageEditorClient from './PageEditorClient'

interface Props {
  params: { page: string }
}

export default async function PageEditorPage({ params }: Props) {
  const pageMeta = EDITABLE_PAGES.find((p) => p.slug === params.page)
  if (!pageMeta) notFound()

  const [content, styles] = await Promise.all([
    getPageContent(params.page),
    getTextStyles(),
  ])

  return (
    <PageEditorClient
      pageSlug={params.page}
      pageLabel={pageMeta.label}
      initialBlocks={content?.blocks ?? []}
      textStyles={styles}
    />
  )
}
