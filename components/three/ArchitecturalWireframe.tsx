'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type ReactiveLine = {
  line: THREE.Line
  basePositions: Float32Array
  dynamicPositions: Float32Array
  amplitude: number
  biasX: number
  biasY: number
  biasZ: number
  seed: number
}

export default function ArchitecturalWireframe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    const w = el.clientWidth
    const h = el.clientHeight

    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100)
    camera.position.set(0, 2.8, 13.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.setClearColor(0xffffff, 0)
    el.appendChild(renderer.domElement)

    const root = new THREE.Group()
    root.rotation.x = -0.2
    root.rotation.y = 0.42
    scene.add(root)

    const materials = {
      bold: new THREE.LineBasicMaterial({ color: 0x161616, transparent: true, opacity: 0.9 }),
      soft: new THREE.LineBasicMaterial({ color: 0x161616, transparent: true, opacity: 0.16 }),
      accent: new THREE.LineBasicMaterial({ color: 0xc4705a, transparent: true, opacity: 0.58 }),
    }

    const reactiveLines: ReactiveLine[] = []
    const geometries: THREE.BufferGeometry[] = []

    const addLine = (
      points: THREE.Vector3[],
      material: THREE.LineBasicMaterial,
      options: Partial<Omit<ReactiveLine, 'line' | 'basePositions' | 'dynamicPositions'>> = {}
    ) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute
      const basePositions = new Float32Array(positionAttr.array as Float32Array)
      const dynamicPositions = new Float32Array(basePositions)
      const line = new THREE.Line(geometry, material)
      root.add(line)
      geometries.push(geometry)

      reactiveLines.push({
        line,
        basePositions,
        dynamicPositions,
        amplitude: options.amplitude ?? 0.12,
        biasX: options.biasX ?? 0,
        biasY: options.biasY ?? 0,
        biasZ: options.biasZ ?? 0,
        seed: options.seed ?? Math.random() * 1000,
      })
    }

    const addPolyline = (
      tuples: Array<[number, number, number]>,
      material: THREE.LineBasicMaterial,
      options: Partial<Omit<ReactiveLine, 'line' | 'basePositions' | 'dynamicPositions'>> = {}
    ) => {
      addLine(
        tuples.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        material,
        options
      )
    }

    const addEllipse = (
      radiusX: number,
      radiusZ: number,
      y: number,
      segments: number,
      material: THREE.LineBasicMaterial,
      options: Partial<Omit<ReactiveLine, 'line' | 'basePositions' | 'dynamicPositions'>> = {}
    ) => {
      const points: THREE.Vector3[] = []
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(a) * radiusX, y, Math.sin(a) * radiusZ))
      }
      addLine(points, material, options)
    }

    const addVerticalLoop = (radius: number, centerX: number, centerY: number, centerZ: number) => {
      const points: THREE.Vector3[] = []
      const segments = 48
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2
        points.push(
          new THREE.Vector3(
            centerX + Math.cos(a) * radius,
            centerY + Math.sin(a) * radius * 0.55,
            centerZ + Math.sin(a * 0.5) * 0.8
          )
        )
      }
      addLine(points, materials.accent, { amplitude: 0.16, biasX: 0.5, biasY: 0.4, biasZ: 0.3 })
    }

    const addPetal = (angle: number, length: number, width: number) => {
      const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle))
      const perp = new THREE.Vector3(-dir.z, 0, dir.x)
      const center = dir.clone().multiplyScalar(length * 0.52)
      const base = center.clone().add(dir.clone().multiplyScalar(-length * 0.5))
      const tip = center.clone().add(dir.clone().multiplyScalar(length * 0.5))
      const left = center.clone().add(perp.clone().multiplyScalar(width))
      const right = center.clone().add(perp.clone().multiplyScalar(-width))

      addLine([base, left, tip, right, base], materials.bold, {
        amplitude: 0.08,
        biasX: dir.x * 0.3,
        biasY: 0.1,
        biasZ: dir.z * 0.3,
      })

      addLine([left, new THREE.Vector3(0, 0, 0), right], materials.soft, {
        amplitude: 0.05,
        biasX: dir.x * 0.2,
        biasY: 0.08,
        biasZ: dir.z * 0.2,
      })
    }

    const addTopography = (y: number, width: number, depth: number, phase: number, material: THREE.LineBasicMaterial) => {
      const points: THREE.Vector3[] = []
      const segments = 24
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const x = (t - 0.5) * width
        const z = Math.sin(t * Math.PI * 2 + phase) * depth + Math.sin(t * Math.PI * 5 + phase * 0.7) * 0.25
        points.push(new THREE.Vector3(x, y, z))
      }
      addLine(points, material, { amplitude: 0.09, biasX: 0.2, biasY: 0.12, biasZ: 0.35 })
    }

    const addShellRib = (x: number, peak: number, depth: number, material: THREE.LineBasicMaterial) => {
      const points: THREE.Vector3[] = []
      const segments = 20
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const y = 2 + Math.sin(t * Math.PI) * peak
        const z = (t - 0.5) * depth
        points.push(new THREE.Vector3(x, y, z))
      }
      addLine(points, material, { amplitude: 0.12, biasX: 0.05, biasY: 0.45, biasZ: 0.18 })
    }

    const slabLevels = [-1.45, -0.85, -0.2, 0.45, 1.1]
    slabLevels.forEach((level, index) => {
      const radiusX = 4.7 - index * 0.38
      const radiusZ = 2.5 + index * 0.08
      addEllipse(radiusX, radiusZ, level, 72, index === 0 || index === slabLevels.length - 1 ? materials.bold : materials.soft, {
        amplitude: 0.08,
        biasX: 0.18,
        biasY: 0.07,
        biasZ: 0.22,
      })
    })

    ;[-3.2, -1.3, 0, 1.3, 3.2].forEach((x, index) => {
      addPolyline(
        [
          [x, -1.45, -1.8],
          [x, 1.1, -1.8],
        ],
        index === 2 ? materials.accent : materials.soft,
        { amplitude: 0.07, biasX: x * 0.05, biasY: 0.2, biasZ: -0.12 }
      )
      addPolyline(
        [
          [x, -1.45, 1.8],
          [x, 1.1, 1.8],
        ],
        materials.soft,
        { amplitude: 0.07, biasX: x * 0.05, biasY: 0.2, biasZ: 0.12 }
      )
    })

    for (let i = 0; i < 6; i++) {
      addPetal((i / 6) * Math.PI * 2 + Math.PI / 6, 2.6, 0.72)
    }

    addEllipse(1.05, 1.05, 0, 60, materials.accent, { amplitude: 0.05, biasX: 0, biasY: 0.1, biasZ: 0 })
    addVerticalLoop(1.9, -3.55, 0.9, 0.4)

    ;[-1.7, -0.7, 0.3, 1.3].forEach((y, index) => {
      addTopography(y, 9.5, 1.45 - index * 0.12, index * 0.8, index % 2 === 0 ? materials.soft : materials.bold)
    })

    ;[-2.4, -1.2, 0, 1.2, 2.4].forEach((x, index) => {
      addShellRib(x, 1.1 + (2 - Math.abs(index - 2)) * 0.12, 4.2, index === 2 ? materials.accent : materials.soft)
    })

    addPolyline(
      [
        [-4.5, -0.95, -0.8],
        [-2.8, -0.55, -0.2],
        [-1.1, -0.35, 0.4],
        [0.8, 0.08, 0.9],
        [2.7, 0.55, 0.45],
        [4.4, 1.1, -0.15],
      ],
      materials.bold,
      { amplitude: 0.14, biasX: 0.4, biasY: 0.2, biasZ: 0.1 }
    )

    addPolyline(
      [
        [-4.2, -1.2, 1.6],
        [-2.6, -0.62, 1.1],
        [-0.9, -0.15, 0.55],
        [1.2, 0.22, -0.1],
        [3.4, 0.82, -0.8],
      ],
      materials.accent,
      { amplitude: 0.16, biasX: 0.15, biasY: 0.12, biasZ: -0.28 }
    )

    const mouse = new THREE.Vector2(0, 0)
    const target = new THREE.Vector2(0, 0)
    let currentX = 0
    let currentY = 0

    const onPointerMove = (event: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    }

    const onPointerLeave = () => {
      target.set(0, 0)
    }

    const onResize = () => {
      const nextW = el.clientWidth
      const nextH = el.clientHeight
      camera.aspect = nextW / nextH
      camera.updateProjectionMatrix()
      renderer.setSize(nextW, nextH)
    }

    el.addEventListener('mousemove', onPointerMove)
    el.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let animationFrame = 0

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate)

      const t = clock.getElapsedTime()
      mouse.lerp(target, 0.06)
      currentX += (mouse.x - currentX) * 0.05
      currentY += (mouse.y - currentY) * 0.05

      root.rotation.y = 0.42 + currentX * 0.2 + Math.sin(t * 0.2) * 0.035
      root.rotation.x = -0.2 + currentY * 0.1 + Math.cos(t * 0.18) * 0.025
      root.rotation.z = currentX * -0.045 + Math.sin(t * 0.12) * 0.015
      root.position.y = Math.sin(t * 0.35) * 0.08

      reactiveLines.forEach((entry, index) => {
        const positions = entry.dynamicPositions
        const base = entry.basePositions
        for (let i = 0; i < positions.length; i += 3) {
          const x = base[i]
          const y = base[i + 1]
          const z = base[i + 2]
          const wave =
            Math.sin(t * 0.9 + entry.seed + x * 0.8 + z * 0.4) * 0.45 +
            Math.cos(t * 1.15 + entry.seed * 0.7 + y * 1.4) * 0.55

          positions[i] = x + currentX * entry.biasX * entry.amplitude + wave * entry.amplitude * 0.08
          positions[i + 1] = y + currentY * entry.biasY * entry.amplitude + Math.sin(t + index * 0.35 + x) * entry.amplitude * 0.04
          positions[i + 2] = z + currentX * entry.biasZ * entry.amplitude + Math.cos(t * 0.85 + index * 0.18 + z) * entry.amplitude * 0.05
        }

        const positionAttr = entry.line.geometry.getAttribute('position') as THREE.BufferAttribute
        positionAttr.array.set(positions)
        positionAttr.needsUpdate = true
      })

      camera.position.x += (currentX * 0.75 - camera.position.x) * 0.035
      camera.position.y += (2.8 + currentY * 0.45 - camera.position.y) * 0.035
      camera.lookAt(0, 0.2, 0)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      el.removeEventListener('mousemove', onPointerMove)
      el.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('resize', onResize)

      geometries.forEach((geometry) => geometry.dispose())
      Object.values(materials).forEach((material) => material.dispose())
      renderer.dispose()

      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="h-full w-full" />
}
