'use client'

/**
 * AiFormFactorBlob
 * -----------------
 * Miniature, self-contained port of the Three.js "Spatial Fingerprint"
 * blob from /public/experiments/teachable-wireframe.html — same
 * SphereGeometry(2, 32, 32), same layered sin/cos distortion loop, same
 * 12 vortex trails, same blue wireframe + shadow copy.
 *
 * Differences vs. the full experiment:
 * - No OrbitControls (so clicks on the card still navigate)
 * - No EffectComposer/bloom (disabled in the source anyway)
 * - Uses static "target" params to produce gentle resting motion
 *   (the full page drives these from AI classifications)
 * - Pauses rendering when the card is off-screen (IntersectionObserver)
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function AiFormFactorBlob() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const width = el.clientWidth || 400
    const height = el.clientHeight || 300

    // ── Scene / camera / renderer ──────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = null

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 2, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) // transparent so the card's dark ground shows through
    renderer.toneMapping = THREE.ReinhardToneMapping
    el.appendChild(renderer.domElement)

    // ── Lighting (mirrors source) ─────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const pointLight = new THREE.PointLight(0x0044ff, 2.5, 50)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // ── Geometry & materials (exact from experiment) ───────────────
    const baseGeometry = new THREE.SphereGeometry(2, 32, 32)
    const positionAttribute = baseGeometry.attributes.position
    const originalVertices: THREE.Vector3[] = []
    for (let i = 0; i < positionAttribute.count; i++) {
      originalVertices.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i))
    }

    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const innerMesh = new THREE.Mesh(baseGeometry, coreMaterial)
    scene.add(innerMesh)

    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })
    const shadowMesh = new THREE.Mesh(baseGeometry, shadowMaterial)
    shadowMesh.scale.setScalar(1.03)
    scene.add(shadowMesh)

    // ── Vortex trails (12 helical lines, exact from experiment) ────
    const TRAIL_COUNT = 12
    type Trail = {
      line: THREE.Line
      pts: THREE.Vector3[]
      offset: number
      speed: number
    }
    const trails: Trail[] = []
    const trailMatTemplate = new THREE.LineBasicMaterial({
      color: 0x0044ff,
      transparent: true,
      opacity: 0.3,
    })

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const points: THREE.Vector3[] = []
      for (let j = 0; j < 50; j++) points.push(new THREE.Vector3())
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, trailMatTemplate.clone())
      scene.add(line)
      trails.push({
        line,
        pts: points,
        offset: Math.random() * 100,
        speed: 0.2 + Math.random() * 0.4,
      })
    }

    // ── Target params (static "resting" fingerprint) ───────────────
    // In the live experiment these are driven by AI classifications;
    // here we pick values that produce a visually interesting idle loop.
    const target = {
      flow: 0.35,
      pressure: 0.18,
      glass: 0.4,
      depth: 0.4,
      mechanism: 0.3,
      rhythm: 0.55,
      rest: 0.35,
      cameraZ: 12,
    }
    const current = { ...target }
    const lp = 0.04

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    // ── Animation loop (exact math from experiment) ────────────────
    let time = 0
    let running = true
    let rafId = 0

    const animate = () => {
      if (!running) return
      rafId = requestAnimationFrame(animate)

      for (const k of Object.keys(target) as (keyof typeof target)[]) {
        current[k] = lerp(current[k], target[k], lp)
      }

      const speed = 0.012 * (1.0 - current.rest * 0.8)
      time += speed

      const positions = baseGeometry.attributes.position

      for (let i = 0; i < positions.count; i++) {
        const v = originalVertices[i]
        const noiseFreq = 1.2 + current.mechanism * 6.0
        const noiseAmp = 0.5 * (1.0 - current.rest)

        const dist1 =
          Math.sin(v.x * noiseFreq + time) * 0.4 +
          Math.cos(v.y * (noiseFreq * 1.5) + time * 1.2) * 0.3 +
          Math.sin(v.z * (noiseFreq * 0.8) + time * 0.9) * 0.3

        const dist2 = Math.sin(v.x * (noiseFreq * 2.5) - time * 0.5) * 0.15

        let dist = dist1 + dist2
        dist = Math.sign(dist) * Math.pow(Math.abs(dist), 0.85)

        const displacement = dist * noiseAmp

        const nx = v.x / 2
        const ny = v.y / 2
        const nz = v.z / 2

        let newX = v.x + nx * displacement
        let newY = v.y + ny * displacement
        let newZ = v.z + nz * displacement

        // Flow (fluid stretching)
        if (v.y < 0) newY -= Math.abs(v.y) * current.flow * 2.5

        // Pressure elongation
        newY *= 1.0 - current.pressure * 0.5
        newX *= 1.0 + current.pressure * 0.3
        newZ *= 1.0 + current.pressure * 0.3

        positions.setXYZ(i, newX, newY, newZ)
      }

      baseGeometry.attributes.position.needsUpdate = true
      baseGeometry.computeVertexNormals()

      // Animate vortex trails
      trails.forEach((t, idx) => {
        const p = t.line.geometry.attributes.position
        for (let i = 0; i < t.pts.length; i++) {
          const pIdx = i / t.pts.length
          const angle = pIdx * Math.PI * 2 + time * t.speed + t.offset
          const r = 3 + current.flow * 2 + Math.sin(time + idx) * 0.5

          const tx = Math.cos(angle) * r
          const ty = (pIdx - 0.5) * 10 + Math.sin(time * 0.5 + t.offset) * 2
          const tz = Math.sin(angle) * r

          p.setXYZ(i, tx, ty, tz)
        }
        p.needsUpdate = true
        ;(t.line.material as THREE.LineBasicMaterial).opacity =
          (0.05 + current.flow * 0.4) * (1.0 - current.rest * 0.5)
      })

      // Material updates
      coreMaterial.opacity = 0.4 + current.rest * 0.3
      shadowMaterial.opacity = 0.05 + current.rest * 0.1

      const pulse = 1.0 + Math.sin(time * 4) * current.rhythm * 0.12
      innerMesh.scale.set(pulse, pulse, pulse)
      shadowMesh.scale.set(pulse * 1.03, pulse * 1.03, pulse * 1.03)

      innerMesh.rotation.y = time * 0.15
      shadowMesh.rotation.y = time * 0.15

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ─────────────────────────────────────────────────────
    const handleResize = () => {
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(el)

    // ── Pause when off-screen ──────────────────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !running) {
            running = true
            animate()
          } else if (!e.isIntersecting && running) {
            running = false
            cancelAnimationFrame(rafId)
          }
        }
      },
      { threshold: 0.01 },
    )
    io.observe(el)

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      running = false
      cancelAnimationFrame(rafId)
      ro.disconnect()
      io.disconnect()
      trails.forEach((t) => {
        t.line.geometry.dispose()
        ;(t.line.material as THREE.Material).dispose()
      })
      baseGeometry.dispose()
      coreMaterial.dispose()
      shadowMaterial.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      {/* Subtle backdrop tint so the blue wireframe reads with depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 50%, rgba(0,68,255,0.18), transparent 60%), linear-gradient(180deg,#0d0d0d 0%,#060606 100%)',
        }}
      />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  )
}
