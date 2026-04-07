'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ArchitecturalWireframe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(20, 15, 25)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0xffffff, 0)
    el.appendChild(renderer.domElement)

    const root = new THREE.Group()
    scene.add(root)

    const darkMaterial = new THREE.LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.6 })
    const lightMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.25 })

    // Build an architectural structure (grid of columns, floors, core)
    const gridSizeX = 4
    const gridSizeZ = 4
    const span = 3
    const stories = 6
    const floorHeight = 2.5

    const structureGeometry = new THREE.BufferGeometry()
    const coreGeometry = new THREE.BufferGeometry()

    const points: number[] = []
    const corePoints: number[] = []

    const addLine = (arr: number[], x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      arr.push(x1, y1, z1, x2, y2, z2)
    }

    // Generate grid columns and beams
    for (let f = 0; f <= stories; f++) {
      const y = f * floorHeight
      for (let x = 0; x <= gridSizeX; x++) {
        for (let z = 0; z <= gridSizeZ; z++) {
          const px = (x - gridSizeX / 2) * span
          const pz = (z - gridSizeZ / 2) * span

          // Columns
          if (f < stories) {
            addLine(points, px, y, pz, px, y + floorHeight, pz)
          }

          // X Beams
          if (x < gridSizeX) {
            addLine(points, px, y, pz, px + span, y, pz)
          }

          // Z Beams
          if (z < gridSizeZ) {
            addLine(points, px, y, pz, px, y, pz + span)
          }
        }
      }
    }

    // Generate core structural cross-bracing
    const cx1 = -span/2, cx2 = span/2, cz1 = -span/2, cz2 = span/2
    for (let f = 0; f < stories; f++) {
      const y1 = f * floorHeight, y2 = (f + 1) * floorHeight
      addLine(corePoints, cx1, y1, cz1, cx2, y2, cz1)
      addLine(corePoints, cx2, y1, cz1, cx1, y2, cz1)

      addLine(corePoints, cx1, y1, cz2, cx2, y2, cz2)
      addLine(corePoints, cx2, y1, cz2, cx1, y2, cz2)

      addLine(corePoints, cx1, y1, cz1, cx1, y2, cz2)
      addLine(corePoints, cx1, y2, cz1, cx1, y1, cz2)

      addLine(corePoints, cx2, y1, cz1, cx2, y2, cz2)
      addLine(corePoints, cx2, y2, cz1, cx2, y1, cz2)
    }

    structureGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    coreGeometry.setAttribute('position', new THREE.Float32BufferAttribute(corePoints, 3))

    const mainStructure = new THREE.LineSegments(structureGeometry, lightMaterial)
    const coreStructure = new THREE.LineSegments(coreGeometry, darkMaterial)

    root.add(mainStructure)
    root.add(coreStructure)
    
    // Center root
    root.position.y = -stories * floorHeight * 0.45

    const onResize = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', onResize)

    let currentX = 0
    let currentY = 0
    const targetX = { value: 0 }
    const targetY = { value: 0 }

    const onPointerMove = (e: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      targetX.value = ((e.clientX - bounds.left) / bounds.width) * 2 - 1
      targetY.value = -(((e.clientY - bounds.top) / bounds.height) * 2 - 1)
    }

    const onPointerLeave = () => {
      targetX.value = 0
      targetY.value = 0
    }

    el.addEventListener('mousemove', onPointerMove)
    el.addEventListener('mouseleave', onPointerLeave)

    let animationFrame = 0
    const baseRotationY = Math.PI / 4

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate)

      currentX += (targetX.value - currentX) * 0.05
      currentY += (targetY.value - currentY) * 0.05

      // Parallax rotation
      root.rotation.y = baseRotationY + currentX * 0.4
      root.rotation.x = currentY * 0.15

      // Always look at the center of the structure
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('mousemove', onPointerMove)
      el.removeEventListener('mouseleave', onPointerLeave)

      structureGeometry.dispose()
      coreGeometry.dispose()
      darkMaterial.dispose()
      lightMaterial.dispose()
      renderer.dispose()

      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="h-full w-full opacity-80" />
}
