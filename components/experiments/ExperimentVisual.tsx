'use client'

/**
 * ExperimentVisual
 * -----------------
 * Small, self-contained visuals that represent each experiment in a way
 * that hints at its actual content — so the cards are no longer plain
 * black placeholders.
 *
 * Aesthetic: editorial, architectural line drawings, warm salmon accent
 * (#C4705A) on a near-black ground. Most animations are pure CSS. The
 * AI Form Factor card uses the actual Three.js blob from the experiment
 * (see AiFormFactorBlob).
 */

import dynamic from 'next/dynamic'

const AiFormFactorBlob = dynamic(() => import('./AiFormFactorBlob'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0a0a0a]" />,
})

type Props = { slug: string }

const ACCENT = '#C4705A'

export default function ExperimentVisual({ slug }: Props) {
  switch (slug) {
    case 'data-follows':
      return <DataFollowsVisual />
    case 'dense-dot-matrix':
      return <TabletopScannerVisual />
    case 'screentrace':
      return <ScreenTraceVisual />
    case 'ai-form-factor':
      return <AiFormFactorBlob />
    default:
      return <FallbackVisual />
  }
}

/* ------------------------------------------------------------------ */
/*  1. Data Follows — extruded wireframe landscape following a point  */
/* ------------------------------------------------------------------ */

function DataFollowsVisual() {
  // 14 x 8 grid of vertical bars; height falls off from a moving "cursor"
  // We precompute positions and let CSS animate the cursor x,y.
  const cols = 14
  const rows = 8
  const cells: { x: number; y: number; d: number }[] = []
  // "cursor" sits at (cx, cy) in grid-space; baked as a loop via CSS on an overlay
  const cx = 9
  const cy = 3.2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = Math.hypot(c - cx, r - cy)
      cells.push({ x: c, y: r, d })
    }
  }
  const maxD = 8
  const stepX = 26
  const stepY = 18
  const originX = 30
  const originY = 170
  // crude isometric skew
  const skewX = 10

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      {/* subtle background glow */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(120% 80% at 70% 35%, rgba(196,112,90,0.18), transparent 55%), linear-gradient(180deg,#111 0%,#070707 100%)',
        }}
      />
      <svg
        viewBox="0 0 420 240"
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="df-bar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f0e8e2" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f0e8e2" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="df-bar-hot" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="1" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <g className="df-rig">
          {cells.map((cell, i) => {
            const h = Math.max(4, (1 - cell.d / maxD) * 68)
            const x = originX + cell.x * stepX + cell.y * skewX * 0.3
            const y = originY - cell.y * stepY * 0.55
            const hot = cell.d < 2.2
            return (
              <rect
                key={i}
                x={x}
                y={y - h}
                width={6}
                height={h}
                fill={hot ? 'url(#df-bar-hot)' : 'url(#df-bar)'}
                opacity={hot ? 0.95 : 0.55}
                rx={0.5}
              />
            )
          })}

          {/* horizon / ground line */}
          <line
            x1="20"
            y1="180"
            x2="400"
            y2="160"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.6"
          />

          {/* tracked "finger" indicator */}
          <circle cx={originX + cx * stepX + cy * skewX * 0.3} cy={originY - cy * stepY * 0.55 - 70} r="3.5" fill={ACCENT} />
          <circle
            cx={originX + cx * stepX + cy * skewX * 0.3}
            cy={originY - cy * stepY * 0.55 - 70}
            r="10"
            fill={ACCENT}
            opacity="0.18"
            className="df-pulse"
          />
        </g>
      </svg>

      <style jsx>{`
        .df-rig {
          transform-origin: 55% 60%;
          animation: df-sway 9s ease-in-out infinite alternate;
        }
        .df-pulse {
          transform-origin: center;
          transform-box: fill-box;
          animation: df-pulse 2.4s ease-in-out infinite;
        }
        @keyframes df-sway {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-14px, -4px, 0);
          }
        }
        @keyframes df-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.18;
          }
          50% {
            transform: scale(1.8);
            opacity: 0.05;
          }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  2. Tabletop Scanner — axonometric desk-city under a scanning line  */
/* ------------------------------------------------------------------ */

function TabletopScannerVisual() {
  // Axonometric blocks of varying footprints and heights = "desk city"
  // Each block: {x, y, w, d, h}  in a cheap iso projection.
  const blocks: { x: number; y: number; w: number; d: number; h: number; tag: string }[] = [
    { x: 40, y: 150, w: 70, d: 44, h: 38, tag: 'book' },
    { x: 130, y: 170, w: 38, d: 38, h: 70, tag: 'cup' },
    { x: 200, y: 140, w: 110, d: 56, h: 18, tag: 'laptop' },
    { x: 180, y: 190, w: 28, d: 28, h: 90, tag: 'bottle' },
    { x: 260, y: 205, w: 58, d: 34, h: 26, tag: 'tool' },
    { x: 330, y: 175, w: 40, d: 30, h: 48, tag: 'box' },
  ]
  const k = 0.45 // iso y-skew factor

  const iso = (x: number, y: number, z: number) => ({
    px: x + z * k,
    py: y - z,
  })

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.07), transparent 55%), linear-gradient(180deg,#101010 0%,#060606 100%)',
        }}
      />
      <svg viewBox="0 0 420 240" className="relative h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ts-scan" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0" />
            <stop offset="50%" stopColor={ACCENT} stopOpacity="0.55" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* desk grid */}
        <g opacity="0.22">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={30 + i * 36} y1={90} x2={30 + i * 36 + 40} y2={230} stroke="#fff" strokeWidth="0.4" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1={30 + i * 8} y1={120 + i * 22} x2={390 + i * 8} y2={120 + i * 22} stroke="#fff" strokeWidth="0.4" />
          ))}
        </g>

        {/* blocks */}
        {blocks.map((b, i) => {
          // bottom rect
          const p1 = iso(b.x, b.y, 0)
          const p2 = iso(b.x + b.w, b.y, 0)
          const p3 = iso(b.x + b.w, b.y + b.d, 0)
          // top rect
          const t1 = iso(b.x, b.y, b.h)
          const t2 = iso(b.x + b.w, b.y, b.h)
          const t3 = iso(b.x + b.w, b.y + b.d, b.h)
          const t4 = iso(b.x, b.y + b.d, b.h)

          return (
            <g key={i} className="ts-block" style={{ animationDelay: `${i * 0.35}s` }}>
              {/* right face */}
              <polygon
                points={`${p2.px},${p2.py} ${p3.px},${p3.py} ${t3.px},${t3.py} ${t2.px},${t2.py}`}
                fill="#f0e8e2"
                fillOpacity="0.08"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="0.7"
              />
              {/* front face */}
              <polygon
                points={`${p1.px},${p1.py} ${p2.px},${p2.py} ${t2.px},${t2.py} ${t1.px},${t1.py}`}
                fill="#f0e8e2"
                fillOpacity="0.14"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.7"
              />
              {/* top face */}
              <polygon
                points={`${t1.px},${t1.py} ${t2.px},${t2.py} ${t3.px},${t3.py} ${t4.px},${t4.py}`}
                fill="#f0e8e2"
                fillOpacity="0.18"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="0.7"
              />
              {/* detection tag */}
              <g className="ts-tag">
                <circle cx={t1.px + 2} cy={t1.py - 6} r="1.8" fill={ACCENT} />
                <text x={t1.px + 6} y={t1.py - 3} fill={ACCENT} fontSize="6" letterSpacing="1" fontFamily="Inter, system-ui, sans-serif">
                  {b.tag.toUpperCase()}
                </text>
              </g>
            </g>
          )
        })}

        {/* scanning sweep */}
        <g className="ts-scan">
          <rect x="-60" y="40" width="60" height="200" fill="url(#ts-scan)" />
        </g>
      </svg>

      <style jsx>{`
        .ts-block {
          opacity: 0;
          animation: ts-reveal 6s ease-in-out infinite;
          transform-box: fill-box;
        }
        .ts-tag {
          opacity: 0.85;
          animation: ts-tag-blink 3.2s ease-in-out infinite;
        }
        .ts-scan {
          animation: ts-scan-move 6s linear infinite;
        }
        @keyframes ts-reveal {
          0%,
          10% {
            opacity: 0;
            transform: translateY(4px);
          }
          25%,
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ts-tag-blink {
          0%,
          100% {
            opacity: 0.9;
          }
          50% {
            opacity: 0.4;
          }
        }
        @keyframes ts-scan-move {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(500px);
          }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  3. ScreenTrace — Delaunay mesh over an implied human pose          */
/* ------------------------------------------------------------------ */

function ScreenTraceVisual() {
  // Stylized 16-point pose skeleton. Indices roughly match a simplified
  // MediaPipe-like structure (head, shoulders, elbows, hands, hips,
  // knees, feet). Triangles are pre-picked to produce a readable mesh.
  const pts: [number, number][] = [
    [210, 42], // 0 head
    [210, 72], // 1 neck
    [172, 86], // 2 L shoulder
    [248, 86], // 3 R shoulder
    [148, 120], // 4 L elbow
    [272, 120], // 5 R elbow
    [128, 156], // 6 L hand
    [292, 156], // 7 R hand
    [186, 128], // 8 L hip
    [234, 128], // 9 R hip
    [178, 170], // 10 L knee
    [242, 170], // 11 R knee
    [170, 214], // 12 L foot
    [250, 214], // 13 R foot
    [200, 104], // 14 chest
    [220, 104], // 15 chest
  ]
  const tris: [number, number, number][] = [
    [0, 2, 3],
    [0, 1, 2],
    [0, 1, 3],
    [1, 2, 14],
    [1, 3, 15],
    [14, 15, 1],
    [2, 4, 14],
    [3, 5, 15],
    [4, 6, 2],
    [5, 7, 3],
    [14, 15, 8],
    [15, 9, 8],
    [8, 9, 14],
    [8, 10, 9],
    [9, 11, 10],
    [10, 12, 11],
    [11, 13, 12],
    [8, 4, 14],
    [9, 5, 15],
  ]

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 45%, rgba(196,112,90,0.22), transparent 60%), linear-gradient(180deg,#0d0d0d 0%,#060606 100%)',
        }}
      />
      <svg viewBox="0 0 420 240" className="relative h-full w-full" preserveAspectRatio="xMidYMid slice">
        <g className="st-mesh">
          {tris.map((t, i) => {
            const [a, b, c] = t
            const cy = (pts[a][1] + pts[b][1] + pts[c][1]) / 3
            // depth tint based on centroid-y
            const depth = Math.min(1, Math.max(0, (cy - 40) / 180))
            const fill = `rgba(${196 + (1 - depth) * 40},${112 + (1 - depth) * 40},${90 + (1 - depth) * 40},${0.08 + (1 - depth) * 0.28})`
            return (
              <polygon
                key={i}
                points={`${pts[a][0]},${pts[a][1]} ${pts[b][0]},${pts[b][1]} ${pts[c][0]},${pts[c][1]}`}
                fill={fill}
                stroke="rgba(240,232,226,0.5)"
                strokeWidth="0.6"
                style={{ animationDelay: `${i * 0.08}s` }}
                className="st-tri"
              />
            )
          })}
          {pts.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="1.8" fill="#f0e8e2" />
          ))}
        </g>
      </svg>

      <style jsx>{`
        .st-mesh {
          transform-origin: 50% 55%;
          animation: st-breathe 4.5s ease-in-out infinite;
        }
        .st-tri {
          animation: st-flicker 5s ease-in-out infinite;
        }
        @keyframes st-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
        @keyframes st-flicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  4. AI Form Factor — see AiFormFactorBlob.tsx (Three.js port of     */
/*     the actual experiment blob)                                     */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Fallback                                                           */
/* ------------------------------------------------------------------ */

function FallbackVisual() {
  return (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_42%),linear-gradient(135deg,_#111_0%,_#070707_45%,_#141414_100%)]" />
  )
}
