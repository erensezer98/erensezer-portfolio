// app/[...page]/page.tsx
import { builder } from '@builder.io/react'
import { RenderBuilderContent } from '../../components/builder'

// Initialize the Builder client
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!)

interface PageProps {
  params: {
    page: string[]
  }
}

export default async function Page(props: PageProps) {
  const content = await builder
    .get('page', {
      userAttributes: {
        urlPath: '/' + (props.params?.page?.join('/') || ''),
      },
    })
    .toPromise()

  return (
    <>
      {/* Render the Builder page content */}
      <RenderBuilderContent content={content} model="page" />
    </>
  )
}
