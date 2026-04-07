import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          color: '#1e1b18', // Standard text-ink color
          fontSize: 20,
          fontWeight: 400, // matches font-normal
          letterSpacing: '-0.02em',
          paddingBottom: '2px', // Centers lowercase better
        }}
      >
        es
      </div>
    ),
    { ...size }
  )
}
