'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const CLASSROOMS = [
  'Classroom 01', 'Classroom 02', 'Classroom 03',
  'Classroom 04', 'Classroom 05', 'Classroom 06',
]

const CONNECTORS = [
  'Laboratory', 'Canteen', 'Offices', 'Sickroom', 'Bathrooms', 'Entrance',
]

export default function ToorToorScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f7f1ea')

    // Orthographic camera — axonometric feel
    const frustum = 14
    const aspect = W / H
    const camera = new THREE.OrthographicCamera(
      (-frustum * aspect) / 2, (frustum * aspect) / 2,
      frustum / 2, -frustum / 2,
      0.1, 100
    )
    let autoAngle = Math.PI / 5
    const camDist = 14
    camera.position.set(Math.sin(autoAngle) * camDist, 10, Math.cos(autoAngle) * camDist)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight('#fff5e0', 1.0)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight('#ffe0b0', 1.8)
    sun.position.set(7, 14, 5)
    sun.castShadow = true
    sun.shadow.camera.left = -14
    sun.shadow.camera.right = 14
    sun.shadow.camera.top = 14
    sun.shadow.camera.bottom = -14
    sun.shadow.mapSize.set(1024, 1024)
    scene.add(sun)

    // Ground
    const groundGeo = new THREE.CircleGeometry(9, 80)
    const groundMat = new THREE.MeshStandardMaterial({ color: '#d8c8ac', roughness: 0.98 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Inner courtyard disc
    const courtGeo = new THREE.CircleGeometry(3.8, 64)
    const courtMat = new THREE.MeshStandardMaterial({ color: '#e4d8c0', roughness: 0.92 })
    const court = new THREE.Mesh(courtGeo, courtMat)
    court.rotation.x = -Math.PI / 2
    court.position.y = 0.01
    court.receiveShadow = true
    scene.add(court)

    // Translucent roof ring (suggests the covered corridor)
    const roofGeo = new THREE.RingGeometry(3.7, 6.8, 64)
    const roofMat = new THREE.MeshStandardMaterial({
      color: '#b0a090',
      roughness: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
    const roofRing = new THREE.Mesh(roofGeo, roofMat)
    roofRing.rotation.x = -Math.PI / 2
    roofRing.position.y = 1.05
    scene.add(roofRing)

    const interactables: THREE.Mesh[] = []

    // ── Classroom modules (6, outer ring) ──────────────────────────────────
    const classRadius = 5.6
    const classW = 2.5
    const classD = 1.3
    const classH = 0.85

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const x = Math.sin(angle) * classRadius
      const z = Math.cos(angle) * classRadius

      const geo = new THREE.BoxGeometry(classW, classH, classD)
      const mat = new THREE.MeshStandardMaterial({
        color: '#c08860',
        roughness: 0.88,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, classH / 2, z)
      mesh.rotation.y = angle
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { label: CLASSROOMS[i], baseY: classH / 2 }
      interactables.push(mesh)
      scene.add(mesh)

      // Thin inclined roof slab
      const roofSlabGeo = new THREE.BoxGeometry(classW + 0.3, 0.05, classD + 0.5)
      const roofSlabMat = new THREE.MeshStandardMaterial({ color: '#989080', roughness: 0.6 })
      const roofSlab = new THREE.Mesh(roofSlabGeo, roofSlabMat)
      roofSlab.position.set(x, classH + 0.025, z)
      roofSlab.rotation.y = angle
      roofSlab.castShadow = true
      mesh.userData.roofSlab = roofSlab
      scene.add(roofSlab)
    }

    // ── Connector / flexible spaces (6, inner ring between classrooms) ──────
    const connRadius = 4.6
    const connW = 1.3
    const connD = 1.0
    const connH = 0.65

    for (let i = 0; i < 6; i++) {
      const angle = ((i + 0.5) / 6) * Math.PI * 2
      const x = Math.sin(angle) * connRadius
      const z = Math.cos(angle) * connRadius

      const geo = new THREE.BoxGeometry(connW, connH, connD)
      const mat = new THREE.MeshStandardMaterial({
        color: '#b4a080',
        roughness: 0.92,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, connH / 2, z)
      mesh.rotation.y = angle
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { label: CONNECTORS[i], baseY: connH / 2 }
      interactables.push(mesh)
      scene.add(mesh)
    }

    // ── Central tree ────────────────────────────────────────────────────────
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.16, 1.1, 8)
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b4c1e', roughness: 0.95 })
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.set(0, 0.55, 0)
    trunk.castShadow = true
    scene.add(trunk)

    // Canopy in two layers for depth
    for (const [dy, r, c] of [
      [1.6, 1.1, '#72a052'],
      [2.1, 0.75, '#5e8e40'],
    ] as [number, number, string][]) {
      const geo = new THREE.SphereGeometry(r, 14, 10)
      const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 })
      const m = new THREE.Mesh(geo, mat)
      m.position.set(0, dy, 0)
      m.castShadow = true
      scene.add(m)
    }

    // ── Mouse + raycaster ────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-9999, -9999)
    let currentHover: THREE.Mesh | null = null
    let isHovering = false

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / el.clientWidth) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / el.clientHeight) * 2 + 1
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    const onMouseLeave = () => {
      mouse.set(-9999, -9999)
    }
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    // ── Animation ────────────────────────────────────────────────────────────
    let animId: number

    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Raycasting
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(interactables)
      const newHover = hits.length > 0 ? (hits[0].object as THREE.Mesh) : null

      if (newHover !== currentHover) {
        if (currentHover) {
          ;(currentHover.material as THREE.MeshStandardMaterial).emissive.set(0x000000)
        }
        currentHover = newHover
        if (currentHover) {
          ;(currentHover.material as THREE.MeshStandardMaterial).emissive.set(0x3a1800)
          ;(currentHover.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.18
          setHovered(currentHover.userData.label)
          isHovering = true
        } else {
          setHovered(null)
          isHovering = false
        }
      }

      // Float hovered block up; settle others
      for (const mesh of interactables) {
        const targetY = mesh === currentHover
          ? mesh.userData.baseY + 0.75
          : mesh.userData.baseY
        mesh.position.y += (targetY - mesh.position.y) * 0.12

        // Keep roof slab glued to the classroom top
        if (mesh.userData.roofSlab) {
          const classH = 0.85
          mesh.userData.roofSlab.position.y = mesh.position.y - mesh.userData.baseY + classH + 0.025
        }
      }

      // Auto-rotate when nothing is hovered
      if (!isHovering) {
        autoAngle += 0.0035
        camera.position.set(
          Math.sin(autoAngle) * camDist,
          10,
          Math.cos(autoAngle) * camDist
        )
        camera.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const a = w / h
      camera.left = (-frustum * a) / 2
      camera.right = (frustum * a) / 2
      camera.top = frustum / 2
      camera.bottom = -frustum / 2
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full" style={{ height: '480px' }}>
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none text-[10px] tracking-[0.18em] uppercase font-light text-ink bg-white/95 px-3 py-2 border border-rule"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 12,
          }}
        >
          {hovered}
        </div>
      )}

      {/* Legend + instruction */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between items-end px-5 pointer-events-none select-none">
        <p className="text-[9px] tracking-[0.18em] uppercase text-muted">
          Hover to explore programme
        </p>
        <div className="flex gap-5 items-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2" style={{ background: '#c08860' }} />
            <span className="text-[9px] tracking-widest uppercase text-muted">Classroom</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2" style={{ background: '#b4a080' }} />
            <span className="text-[9px] tracking-widest uppercase text-muted">Flexible Space</span>
          </span>
        </div>
      </div>
    </div>
  )
}
