import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1e1b18',
          fontSize: 72,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          paddingBottom: '6px',
        }}
      >
        es
      </div>
    ),
    { ...size }
  )
}
