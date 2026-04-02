'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

/**
 * ArchitecturalWireframe
 *
 * A vanilla Three.js scene rendered into a div.
 * Depicts a rotating tower wireframe inspired by the Food Tower project —
 * stacked floor plates with a diamond/triangulated facade pattern.
 *
 * Usage: swap in a more elaborate model or interaction later.
 */
export default function ArchitecturalWireframe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ─── Scene ───────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()

    const w = el.clientWidth
    const h = el.clientHeight
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000)
    camera.position.set(0, 1.5, 9)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xffffff, 0) // fully transparent — page bg shows through
    el.appendChild(renderer.domElement)

    // ─── Materials ───────────────────────────────────────────────────────────
    const solidLine = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.85,
    })
    const fadeLine = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.18,
    })
    const accentLine = new THREE.LineBasicMaterial({
      color: 0xc4705a, // salmon accent
      transparent: true,
      opacity: 0.55,
    })

    // ─── Tower geometry ──────────────────────────────────────────────────────
    const towerGroup = new THREE.Group()

    const W = 1.1   // tower width
    const D = 0.65  // tower depth
    const FLOORS = 14
    const FLOOR_H = 0.42
    const totalH = FLOORS * FLOOR_H

    // Floor plate frames
    for (let i = 0; i <= FLOORS; i++) {
      const y = i * FLOOR_H - totalH / 2
      const geo = new THREE.BufferGeometry()
      const pts = [
        -W / 2, y, D / 2,
         W / 2, y, D / 2,
         W / 2, y, -D / 2,
        -W / 2, y, -D / 2,
        -W / 2, y, D / 2, // close
      ]
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
      const mat = (i === 0 || i === FLOORS) ? solidLine : fadeLine
      towerGroup.add(new THREE.Line(geo, mat))
    }

    // Vertical corner columns
    const corners: [number, number][] = [
      [-W / 2, D / 2],
      [W / 2, D / 2],
      [W / 2, -D / 2],
      [-W / 2, -D / 2],
    ]
    corners.forEach(([x, z]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -totalH / 2, z),
        new THREE.Vector3(x, totalH / 2, z),
      ])
      towerGroup.add(new THREE.Line(geo, solidLine))
    })

    // Facade triangulated pattern (front & back faces)
    const facadeZ = [D / 2, -D / 2]
    facadeZ.forEach((z) => {
      for (let i = 0; i < FLOORS; i++) {
        const y0 = i * FLOOR_H - totalH / 2
        const y1 = y0 + FLOOR_H
        const yMid = (y0 + y1) / 2

        // Upward triangle
        const geo1 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-W / 2, y0, z),
          new THREE.Vector3(0, y1, z),
          new THREE.Vector3(W / 2, y0, z),
        ])
        towerGroup.add(new THREE.Line(geo1, i % 3 === 0 ? accentLine : fadeLine))

        // Mid horizontal
        const geo2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-W / 2, yMid, z),
          new THREE.Vector3(W / 2, yMid, z),
        ])
        towerGroup.add(new THREE.Line(geo2, fadeLine))
      }
    })

    // Side faces — simple diagonal cross-bracing
    const sideXs: [number, number][] = [[-W / 2, W / 2], [-W / 2, W / 2]]
    const sideZPairs: [number, number][] = [[D / 2, -D / 2], [-D / 2, D / 2]]
    ;[0, 1].forEach((side) => {
      const x = sideXs[side][0] === sideXs[side][1] ? W / 2 : -W / 2
      void x // unused — below we do proper sides
    })

    // Side face bracing (left & right sides)
    for (let i = 0; i < FLOORS; i += 2) {
      const y0 = i * FLOOR_H - totalH / 2
      const y1 = y0 + FLOOR_H * 2
      ;[-W / 2, W / 2].forEach((x) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y0, D / 2),
          new THREE.Vector3(x, y1, -D / 2),
        ])
        towerGroup.add(new THREE.Line(geo, fadeLine))
        const geo2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y0, -D / 2),
          new THREE.Vector3(x, y1, D / 2),
        ])
        towerGroup.add(new THREE.Line(geo2, fadeLine))
      })
    }

    // Tilt the tower very slightly for a more dynamic feel
    towerGroup.rotation.x = 0.04
    scene.add(towerGroup)

    // ─── Ground plane grid (subtle) ──────────────────────────────────────────
    const groundGroup = new THREE.Group()
    groundGroup.position.y = -totalH / 2
    const gridSize = 3.5
    const gridSteps = 8
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.07,
    })
    for (let i = 0; i <= gridSteps; i++) {
      const t = -gridSize / 2 + (i / gridSteps) * gridSize
      const hGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-gridSize / 2, 0, t),
        new THREE.Vector3(gridSize / 2, 0, t),
      ])
      groundGroup.add(new THREE.Line(hGeo, gridMat))
      const vGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(t, 0, -gridSize / 2),
        new THREE.Vector3(t, 0, gridSize / 2),
      ])
      groundGroup.add(new THREE.Line(vGeo, gridMat))
    }
    scene.add(groundGroup)

    // ─── Mouse parallax ──────────────────────────────────────────────────────
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const onMouseMove = (e: MouseEvent) => {
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 0.4
      targetY = ((e.clientY / window.innerHeight) - 0.5) * 0.15
    }
    window.addEventListener('mousemove', onMouseMove)

    // ─── Resize ──────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return
      const nw = el.clientWidth
      const nh = el.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // ─── Animation loop ───────────────────────────────────────────────────────
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Slow auto-rotation
      towerGroup.rotation.y = elapsed * 0.12

      // Smooth mouse parallax
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05
      towerGroup.rotation.x = 0.04 + currentY
      towerGroup.rotation.z = -currentX * 0.3

      renderer.render(scene, camera)
    }
    animate()

    // ─── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}
