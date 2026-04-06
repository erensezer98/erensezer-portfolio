import { NextResponse } from 'next/server'

interface Props {
  params: {
    fileId: string
  }
}

export async function GET(request: Request, { params }: Props) {
  const fileId = params.fileId?.trim()
  if (!fileId) {
    return new NextResponse('Missing file id', { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const requestedSize = Number(searchParams.get('size') ?? '1600')
  const size = Number.isFinite(requestedSize) ? Math.min(Math.max(requestedSize, 200), 2400) : 1600
  const upstreamUrl = `https://lh3.googleusercontent.com/d/${fileId}=w${size}`

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      next: { revalidate: 60 * 60 * 24 },
    })

    if (!upstream.ok) {
      return new NextResponse('Image not found', { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Unsupported content type', { status: 415 })
    }

    const buffer = await upstream.arrayBuffer()
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 })
  }
}
