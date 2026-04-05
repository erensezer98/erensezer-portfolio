'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'

type Phase = 'sphere' | 'main' | 'projects'

/** Golden-spiral distribution of n points on a sphere of radius r */
function goldenPoints(n: number, r: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const cr = Math.sqrt(Math.max(0, 1 - y * y))
    pts.push(
      new THREE.Vector3(Math.cos(phi * i) * cr, y, Math.sin(phi * i) * cr)
        .multiplyScalar(r)
    )
  }
  return pts
}

export default function ProjectSphere({ projects }: { projects: Project[] }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('sphere')
  const [hovered, setHovered] = useState<Project | null>(null)
  const phaseRef = useRef<Phase>('sphere')

  const toPhase = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ── Scene & camera ──────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 200)
    cam.position.set(0, 0, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x0a0a0a)
    el.appendChild(renderer.domElement)

    const mouse = new THREE.Vector2(-9999, -9999)
    const rc = new THREE.Raycaster()

    // ── Textures ────────────────────────────────────────────────────────────
    const loader = new THREE.TextureLoader()
    const textures = projects.map(p =>
      p.cover_image ? loader.load(p.cover_image) : null
    )

    // ── Sphere photo dots ───────────────────────────────────────────────────
    // Each dot is a tiny PlaneGeometry textured with a project photo
    const N = Math.max(projects.length, 1)
    const DOT_N = Math.max(N * 14, 84)
    const SPHERE_R = 3.2
    const pts = goldenPoints(DOT_N, SPHERE_R)

    const sphereGroup = new THREE.Group()
    const dotMats: THREE.MeshBasicMaterial[] = []

    pts.forEach((pt, i) => {
      const tex = textures[i % N]
      const mat = new THREE.MeshBasicMaterial({
        map: tex ?? undefined,
        color: tex ? 0xffffff : 0x505050,
        transparent: true,
        opacity: 1,
      })
      dotMats.push(mat)
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.19), mat)
      mesh.position.copy(pt)
      // lookAt origin while child of sphereGroup: -Z faces center → front face faces outward
      mesh.lookAt(new THREE.Vector3(0, 0, 0))
      sphereGroup.add(mesh)
    })
    scene.add(sphereGroup)

    // ── Project frames (one per project) ────────────────────────────────────
    // Used both as floating background (main phase) and clickable 3D grid (projects phase)
    const fGroups: THREE.Group[] = []
    const fMats: THREE.MeshBasicMaterial[] = []
    const hitMeshes: THREE.Mesh[] = []

    // Per-frame orbit data
    const fAngle = projects.map((_, i) => (i / N) * Math.PI * 2)
    const fSpeed = projects.map((_, i) => 0.007 + i * 0.002)
    const fRadius = projects.map((_, i) => 5.2 + (i % 3) * 0.7)
    const fTilt   = projects.map(() => (Math.random() - 0.5) * 0.5)

    // Grid positions for the projects phase (centered, 3 columns)
    const COLS = Math.min(3, N)
    const GX = 3.2, GY = 2.4
    const gridPos = projects.map((_, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const rows = Math.ceil(N / COLS)
      return new THREE.Vector3(
        col * GX - ((COLS - 1) * GX) / 2,
        -(row * GY) + ((rows - 1) * GY) / 2,
        0
      )
    })

    projects.forEach((proj, i) => {
      const tex = textures[i]
      const mat = new THREE.MeshBasicMaterial({
        map: tex ?? undefined,
        color: tex ? 0xffffff : 0x2a2a2a,
        transparent: true,
        opacity: 0,
      })
      fMats.push(mat)
      const frame = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.9), mat)

      // Invisible hit mesh for raycasting
      const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      const hit = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.9), hitMat)
      hit.userData = { proj }
      hitMeshes.push(hit)

      const g = new THREE.Group()
      g.add(frame)
      g.add(hit)
      g.scale.setScalar(0.001)
      scene.add(g)
      fGroups.push(g)
    })

    // ── Animation loop ───────────────────────────────────────────────────────
    let camZ = 12
    const t0 = performance.now()
    let running = true

    const loop = () => {
      if (!running) return
      requestAnimationFrame(loop)

      const t = (performance.now() - t0) / 1000
      const p = phaseRef.current

      // Camera Z lerp
      camZ += ((p === 'sphere' ? 12 : 7) - camZ) * 0.025
      cam.position.z = camZ

      // Mouse parallax (sphere phase only)
      if (p === 'sphere') {
        cam.position.x += (mouse.x * 0.35 - cam.position.x) * 0.04
        cam.position.y += (mouse.y * 0.20 - cam.position.y) * 0.04
      } else {
        cam.position.x += -cam.position.x * 0.05
        cam.position.y += -cam.position.y * 0.05
      }
      cam.lookAt(0, 0, 0)

      // Sphere slow rotation
      sphereGroup.rotation.y = t * 0.07
      sphereGroup.rotation.x = Math.sin(t * 0.025) * 0.1

      // Sphere dot opacity
      const sphereTargetOp = p === 'sphere' ? 1 : p === 'main' ? 0.07 : 0
      dotMats.forEach(m => { m.opacity += (sphereTargetOp - m.opacity) * 0.04 })

      // Frames
      fGroups.forEach((g, i) => {
        // Scale in/out
        const ts = p !== 'sphere' ? 1 : 0.001
        g.scale.setScalar(g.scale.x + (ts - g.scale.x) * 0.07)

        // Opacity
        const top = p === 'sphere' ? 0 : p === 'main' ? 0.45 : 1
        fMats[i].opacity += (top - fMats[i].opacity) * 0.04

        if (p === 'main') {
          // Slow orbit as background decoration
          fAngle[i] += fSpeed[i]
          const r = fRadius[i]
          const x = Math.cos(fAngle[i]) * r
          const z = Math.sin(fAngle[i]) * r * 0.3 - 6
          const y = Math.sin(fAngle[i] * 0.6 + fTilt[i]) * 1.4
          g.position.lerp(new THREE.Vector3(x, y, z), 0.04)
          g.lookAt(cam.position)
        } else if (p === 'projects') {
          // Arrange into grid
          g.position.lerp(gridPos[i], 0.07)
          g.lookAt(cam.position)
        }
      })

      renderer.render(scene, cam)
    }
    loop()

    // ── Event listeners ──────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect()
      mouse.set(
        ((e.clientX - b.left) / b.width) * 2 - 1,
        -((e.clientY - b.top) / b.height) * 2 + 1
      )
      if (phaseRef.current === 'projects') {
        rc.setFromCamera(mouse, cam)
        const hits = rc.intersectObjects(hitMeshes)
        setHovered(hits.length ? (hits[0].object as THREE.Mesh).userData.proj : null)
        el.style.cursor = hits.length ? 'pointer' : 'default'
      }
    }

    const onClick = (e: MouseEvent) => {
      const b = el.getBoundingClientRect()
      mouse.set(
        ((e.clientX - b.left) / b.width) * 2 - 1,
        -((e.clientY - b.top) / b.height) * 2 + 1
      )
      if (phaseRef.current === 'sphere') {
        toPhase('main')
      } else if (phaseRef.current === 'projects') {
        rc.setFromCamera(mouse, cam)
        const hits = rc.intersectObjects(hitMeshes)
        if (hits.length) {
          router.push(`/projects/${(hits[0].object as THREE.Mesh).userData.proj.slug}`)
        }
      }
    }

    const onResize = () => {
      cam.aspect = el.clientWidth / el.clientHeight
      cam.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('click', onClick)
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      textures.forEach(t => t?.dispose())
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [projects, router, toPhase])

  return (
    <div className="fixed inset-0 bg-[#0a0a0a]">

      {/* ── Three.js canvas ─────────────────────────────────────────────────── */}
      {/* Disabled pointer events when main overlay is scrollable on top */}
      <div
        ref={mountRef}
        className={`absolute inset-0 ${phase === 'main' ? 'pointer-events-none' : ''}`}
      />

      {/* ── Phase 0: enter hint ─────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 pointer-events-none flex items-end justify-center pb-16
          transition-opacity duration-700 ${phase === 'sphere' ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-px h-8 bg-white/20 animate-pulse" />
          <p className="text-[10px] tracking-[0.4em] uppercase font-mono text-white/35">
            click to enter
          </p>
        </div>
      </div>

      {/* ── Phase 1: main portfolio page (scrollable HTML) ──────────────────── */}
      <div
        className={`absolute inset-0 z-10 overflow-y-auto
          transition-opacity duration-1000
          ${phase === 'main' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Hero */}
        <div className="h-screen flex flex-col items-center justify-center text-center px-8 relative">
          <button
            onClick={() => toPhase('sphere')}
            className="absolute top-8 left-8 text-[10px] tracking-[0.3em] uppercase font-mono text-white/30 hover:text-white/70 transition-colors"
          >
            ← Exit
          </button>

          <div className="w-10 h-10 border border-white/20 flex items-center justify-center mb-10">
            <span className="text-[11px] font-bold tracking-wider text-white/70">ES</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-extralight text-white leading-none tracking-tight mb-4">
            Eren Sezer
          </h1>
          <p className="text-white/25 text-[11px] tracking-[0.45em] uppercase font-mono mb-14">
            Architecture · Space · Technology
          </p>

          <div className="flex items-center gap-10">
            <button
              onClick={() => toPhase('projects')}
              className="text-[11px] tracking-[0.3em] uppercase text-white/60 hover:text-white border border-white/20 hover:border-white/50 px-7 py-3 transition-all duration-300"
            >
              Projects
            </button>
            <a href="/about"   className="text-[11px] tracking-[0.3em] uppercase text-white/35 hover:text-white/80 transition-colors">About</a>
            <a href="/contact" className="text-[11px] tracking-[0.3em] uppercase text-white/35 hover:text-white/80 transition-colors">Contact</a>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-25 pointer-events-none">
            <p className="text-[9px] tracking-[0.4em] uppercase font-mono text-white">scroll</p>
            <div className="w-px h-8 bg-white" />
          </div>
        </div>

        {/* Selected work */}
        <div className="max-w-screen-lg mx-auto px-8 md:px-16 py-24">
          <div className="flex items-baseline justify-between mb-12">
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 font-mono">
              Selected Work
            </p>
            <button
              onClick={() => toPhase('projects')}
              className="text-[10px] tracking-[0.3em] uppercase text-white/25 hover:text-white/70 transition-colors font-mono"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.slice(0, 4).map(proj => (
              <button
                key={proj.id}
                onClick={() => router.push(`/projects/${proj.slug}`)}
                className="group text-left"
              >
                <div className="relative aspect-[3/2] bg-white/[0.04] border border-white/[0.07] overflow-hidden mb-4">
                  {proj.cover_image ? (
                    <Image
                      src={proj.cover_image}
                      alt={proj.title}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover opacity-55 group-hover:opacity-90 scale-[1.04] group-hover:scale-100 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/10 text-xs font-mono">{proj.year}</span>
                    </div>
                  )}
                </div>
                <p className="text-white/65 text-sm font-light group-hover:text-white transition-colors duration-300">
                  {proj.title}
                </p>
                <p className="text-white/25 text-xs font-mono mt-1">
                  {proj.year} · {proj.location}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-white/[0.07] py-12 flex justify-center gap-14">
          {[['About', '/about'], ['Awards', '/awards'], ['Publications', '/publications'], ['Contact', '/contact']].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[10px] tracking-[0.3em] uppercase text-white/20 hover:text-white/60 transition-colors font-mono"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Phase 2: projects overlay chrome (frames are Three.js) ─────────── */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none
          transition-opacity duration-700 ${phase === 'projects' ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center justify-between px-8 py-7 pointer-events-auto">
          <button
            onClick={() => toPhase('main')}
            className="text-[10px] tracking-[0.3em] uppercase font-mono text-white/35 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <p className="text-[10px] tracking-[0.4em] uppercase font-mono text-white/25">
            Projects
          </p>
          <div />
        </div>

        {hovered && (
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-white text-lg font-extralight tracking-wide">{hovered.title}</p>
              <p className="text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase mt-1">
                {hovered.year} · {hovered.location} · click to view
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
