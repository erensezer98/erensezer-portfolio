'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type ReactiveLine = {
  line: THREE.Line
  basePositions: Float32Array
  dynamicPositions: Float32Array
  cursorStrength: number
  driftStrength: number
  liftStrength: number
  seed: number
}

export default function ArchitecturalWireframe() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 5.5, 17.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0xffffff, 0)
    el.appendChild(renderer.domElement)

    const root = new THREE.Group()
    root.rotation.x = -0.6
    root.rotation.y = 0.5
    scene.add(root)

    const materials = {
      primary: new THREE.LineBasicMaterial({ color: 0x1e1b18, transparent: true, opacity: 0.5 }),
      secondary: new THREE.LineBasicMaterial({ color: 0x8d8175, transparent: true, opacity: 0.22 }),
      accent: new THREE.LineBasicMaterial({ color: 0xc18462, transparent: true, opacity: 0.52 }),
    }

    const reactiveLines: ReactiveLine[] = []
    const geometries: THREE.BufferGeometry[] = []
    const tempPoint = new THREE.Vector3()

    const addLine = (
      points: THREE.Vector3[],
      material: THREE.LineBasicMaterial,
      options: Partial<Omit<ReactiveLine, 'line' | 'basePositions' | 'dynamicPositions'>> = {}
    ) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const positions = geometry.getAttribute('position') as THREE.BufferAttribute
      const basePositions = new Float32Array(positions.array as Float32Array)
      const dynamicPositions = new Float32Array(basePositions)
      const line = new THREE.Line(geometry, material)

      root.add(line)
      geometries.push(geometry)
      reactiveLines.push({
        line,
        basePositions,
        dynamicPositions,
        cursorStrength: options.cursorStrength ?? 1,
        driftStrength: options.driftStrength ?? 1,
        liftStrength: options.liftStrength ?? 1,
        seed: options.seed ?? Math.random() * 1000,
      })
    }

    const addContourBand = (y: number, radiusX: number, radiusZ: number, wobble: number, material: THREE.LineBasicMaterial) => {
      const points: THREE.Vector3[] = []
      const segments = 120

      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const angle = t * Math.PI * 2
        const radialNoise =
          Math.sin(angle * 3 + y * 1.6) * wobble +
          Math.sin(angle * 5 - y * 1.4) * wobble * 0.45

        const x = Math.cos(angle) * (radiusX + radialNoise)
        const z = Math.sin(angle) * (radiusZ + radialNoise * 0.8)
        points.push(new THREE.Vector3(x, y, z))
      }

      addLine(points, material, {
        cursorStrength: 0.95,
        driftStrength: 0.8,
        liftStrength: 0.85,
      })
    }

    const addTerrace = (width: number, depth: number, y: number, offsetX: number, offsetZ: number, material: THREE.LineBasicMaterial) => {
      const halfW = width / 2
      const halfD = depth / 2

      addLine(
        [
          new THREE.Vector3(offsetX - halfW, y, offsetZ - halfD),
          new THREE.Vector3(offsetX + halfW, y, offsetZ - halfD),
          new THREE.Vector3(offsetX + halfW, y, offsetZ + halfD),
          new THREE.Vector3(offsetX - halfW, y, offsetZ + halfD),
          new THREE.Vector3(offsetX - halfW, y, offsetZ - halfD),
        ],
        material,
        {
          cursorStrength: 0.7,
          driftStrength: 0.35,
          liftStrength: 0.55,
        }
      )
    }

    const addPromenade = (points: Array<[number, number, number]>, material: THREE.LineBasicMaterial) => {
      addLine(
        points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        material,
        {
          cursorStrength: 1.1,
          driftStrength: 0.7,
          liftStrength: 0.7,
        }
      )
    }

    const addCanopyRib = (x: number, zSpan: number, baseY: number, arch: number, material: THREE.LineBasicMaterial) => {
      const points: THREE.Vector3[] = []
      const segments = 32

      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const z = (t - 0.5) * zSpan
        const y = baseY + Math.sin(t * Math.PI) * arch
        points.push(new THREE.Vector3(x, y, z))
      }

      addLine(points, material, {
        cursorStrength: 0.45,
        driftStrength: 0.5,
        liftStrength: 0.9,
      })
    }

    const addCourtyardRing = (radiusX: number, radiusZ: number, y: number, offsetX: number, offsetZ: number, material: THREE.LineBasicMaterial) => {
      const points: THREE.Vector3[] = []
      const segments = 72

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(
          new THREE.Vector3(
            offsetX + Math.cos(angle) * radiusX,
            y,
            offsetZ + Math.sin(angle) * radiusZ
          )
        )
      }

      addLine(points, material, {
        cursorStrength: 0.85,
        driftStrength: 0.45,
        liftStrength: 0.45,
      })
    }

    for (let i = 0; i < 9; i++) {
      const y = -1.6 + i * 0.32
      addContourBand(
        y,
        7.8 - i * 0.45,
        4.8 - i * 0.22,
        0.28 - i * 0.015,
        i === 3 || i === 6 ? materials.primary : materials.secondary
      )
    }

    addTerrace(5.8, 2.9, -0.42, -1.1, 0.3, materials.primary)
    addTerrace(3.7, 2.2, 0.05, 1.25, -0.65, materials.secondary)
    addTerrace(2.4, 1.5, 0.5, 0.6, 1.15, materials.accent)

    addCourtyardRing(1.05, 0.88, -0.15, -1.95, 0.75, materials.accent)
    addCourtyardRing(0.82, 0.6, 0.18, 1.55, -0.55, materials.primary)

    addPromenade(
      [
        [-7.2, -1.05, 1.6],
        [-5.4, -0.82, 1.15],
        [-3.6, -0.42, 0.9],
        [-1.6, -0.08, 0.55],
        [0.4, 0.2, 0.15],
        [2.55, 0.5, -0.2],
        [5.5, 0.95, -0.75],
      ],
      materials.accent
    )

    addPromenade(
      [
        [-6.8, -1.2, -2.25],
        [-4.2, -0.8, -1.7],
        [-1.6, -0.38, -1.1],
        [1.1, 0.05, -0.35],
        [3.55, 0.38, 0.38],
        [6.1, 0.72, 1.15],
      ],
      materials.primary
    )

    ;[-3.6, -1.8, 0, 1.8, 3.6].forEach((x, index) => {
      addCanopyRib(x, 7.8 - Math.abs(x) * 0.45, 1.55, 0.85 + (2 - Math.abs(index - 2)) * 0.14, index === 2 ? materials.accent : materials.secondary)
    })

    ;[-2.4, -1.2, 0, 1.2, 2.4].forEach((z, index) => {
      addLine(
        [
          new THREE.Vector3(-6.5, -1.28 + Math.abs(z) * 0.08, z),
          new THREE.Vector3(6.8, 0.9 - Math.abs(z) * 0.05, z - 0.45),
        ],
        index === 2 ? materials.primary : materials.secondary,
        {
          cursorStrength: 0.55,
          driftStrength: 0.35,
          liftStrength: 0.35,
        }
      )
    })

    const mouse = new THREE.Vector2(0, 0)
    const targetMouse = new THREE.Vector2(0, 0)
    let currentX = 0
    let currentY = 0

    const onPointerMove = (event: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      targetMouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      targetMouse.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
    }

    const onPointerLeave = () => {
      targetMouse.set(0, 0)
    }

    const onResize = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    el.addEventListener('mousemove', onPointerMove)
    el.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let animationFrame = 0

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate)

      const t = clock.getElapsedTime()
      mouse.lerp(targetMouse, 0.07)
      currentX += (mouse.x - currentX) * 0.055
      currentY += (mouse.y - currentY) * 0.055

      const cursorWorldX = currentX * 5.8
      const cursorWorldZ = currentY * 3.8

      root.rotation.y = 0.5 + currentX * 0.17 + Math.sin(t * 0.12) * 0.03
      root.rotation.x = -0.6 + currentY * 0.08 + Math.cos(t * 0.16) * 0.02
      root.position.y = Math.sin(t * 0.25) * 0.06

      reactiveLines.forEach((entry, lineIndex) => {
        const positions = entry.dynamicPositions
        const base = entry.basePositions

        for (let i = 0; i < positions.length; i += 3) {
          const x = base[i]
          const y = base[i + 1]
          const z = base[i + 2]

          const dx = x - cursorWorldX
          const dz = z - cursorWorldZ
          const distance = Math.sqrt(dx * dx + dz * dz)
          const influence = Math.max(0, 1 - distance / 3.8)
          const easedInfluence = influence * influence * (3 - 2 * influence)

          const ambient =
            Math.sin(t * 0.65 + entry.seed + x * 0.35 + z * 0.25) * 0.045 +
            Math.cos(t * 0.45 + entry.seed * 0.6 + x * 0.18 - z * 0.22) * 0.03

          const foldLift = easedInfluence * entry.cursorStrength * 0.72
          const terracePull = easedInfluence * entry.cursorStrength * 0.24

          positions[i] =
            x +
            currentX * 0.06 * entry.cursorStrength +
            ambient * entry.driftStrength * 0.5 +
            (-dx * terracePull * 0.08)

          positions[i + 1] =
            y +
            ambient * entry.driftStrength +
            foldLift * entry.liftStrength +
            Math.sin(t * 0.4 + lineIndex * 0.18) * 0.012

          positions[i + 2] =
            z +
            currentY * 0.04 * entry.cursorStrength +
            Math.cos(t * 0.52 + entry.seed + x * 0.12) * 0.018 * entry.driftStrength +
            (-dz * terracePull * 0.06)
        }

        const positionAttr = entry.line.geometry.getAttribute('position') as THREE.BufferAttribute
        positionAttr.array.set(positions)
        positionAttr.needsUpdate = true
      })

      camera.position.x += (currentX * 1.1 - camera.position.x) * 0.03
      camera.position.y += (5.5 + currentY * 0.35 - camera.position.y) * 0.03
      tempPoint.set(0, -0.25, 0)
      camera.lookAt(tempPoint)

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
