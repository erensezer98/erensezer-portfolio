import { getProjectBySlug, getProjectPageContent } from './lib/supabase'
import { getDefaultProjectPageContent } from './lib/project-data'

async function run() {
  const slug = 'the-wall-of-porta-romana'
  const project = await getProjectBySlug(slug)
  const savedContent = await getProjectPageContent(slug)
  const defaultContent = getDefaultProjectPageContent(project)

  console.log('--- DB Project ---')
  console.log(project?.slug)

  console.log('--- Saved Content ---')
  console.log('Detail Sections length:', savedContent?.detailSections?.length)
  
  console.log('--- Default Content ---')
  console.log('Detail Sections length:', defaultContent?.detailSections?.length)
  console.log('Intro Text excerpt:', defaultContent?.introText?.substring(0, 50))
}

run()
