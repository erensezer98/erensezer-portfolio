'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export default function ToorToorScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const roofMeshesRef = useRef<THREE.Object3D[]>([])
  const roofStructureMeshesRef = useRef<THREE.Object3D[]>([])
  const [showRoof, setShowRoof] = useState(true)
  const [showRoofStructure, setShowRoofStructure] = useState(true)

  useEffect(() => {
    roofMeshesRef.current.forEach((m) => { m.visible = showRoof })
  }, [showRoof])

  useEffect(() => {
    roofStructureMeshesRef.current.forEach((m) => { m.visible = showRoofStructure })
  }, [showRoofStructure])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    // Background is a CSS gradient on the container — bypasses tone mapping
    // so sampled colors render exactly as-is.
    scene.fog = new THREE.Fog('rgb(211,197,201)', 42, 105)

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500)
    camera.position.set(18, 12, 18)

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0) // transparent — CSS gradient shows through
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    // ── CSS2D Renderer for labels ──────────────────────────────────────────
    const labelRenderer = new CSS2DRenderer()
    labelRenderer.setSize(W, H)
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.top = '0'
    labelRenderer.domElement.style.left = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    el.appendChild(labelRenderer.domElement)

    // ── Lights ─────────────────────────────────────────────────────────────
    // African noon — low ambient, brutal overhead sun, warm ground bounce
    const ambient = new THREE.AmbientLight('#ffe0b0', 0.35)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight('#fff8e0', 3.8)
    sun.position.set(6, 32, 4) // nearly overhead, slight south angle
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 120
    sun.shadow.camera.left = -25
    sun.shadow.camera.right = 25
    sun.shadow.camera.top = 25
    sun.shadow.camera.bottom = -25
    sun.shadow.bias = -0.001
    scene.add(sun)

    // Minimal blue sky fill — noon sky is nearly white overhead
    const fill = new THREE.DirectionalLight('#d0d8ff', 0.15)
    fill.position.set(-8, 6, -6)
    scene.add(fill)

    // Strong warm ground bounce — ochre soil reflects heat upward
    const bounce = new THREE.HemisphereLight('#ffd890', '#c88020', 0.6)
    scene.add(bounce)


    // ── OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 5
    controls.maxDistance = 80
    controls.maxPolarAngle = Math.PI / 2.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.target.set(0, 0, 0)

    const stopAuto = () => { controls.autoRotate = false }
    el.addEventListener('pointerdown', stopAuto)

    // ── Ground plane ───────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: '#c8b888', roughness: 0.95, metalness: 0 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // ── Load GLB ───────────────────────────────────────────────────────────
    const loader = new GLTFLoader()
    loader.load(
      '/models/toor-toor.glb',
      (gltf) => {
        const model = gltf.scene

        model.traverse((child) => {
          // Collect roof meshes by material name (reliable through Rhino GLTF export)
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
            mats.forEach((mat) => {
              const matName = mat.name.toLowerCase().replace(/[\s_-]/g, '')
              if (matName === 'roof') roofMeshesRef.current.push(mesh)
              if (matName === 'roofstructure') roofStructureMeshesRef.current.push(mesh)
            })
          }

          // Shadows + materials
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true

            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
              mats.forEach((mat) => {
                if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                  const m = mat as THREE.MeshStandardMaterial
                  m.roughness = Math.max(m.roughness, 0.5)
                  m.needsUpdate = true
                }
              })
            }
          }

          // Build CSS2D labels for label_ prefixed objects
          if (child.name.startsWith('label_')) {
            const text = child.name
              .replace('label_', '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())

            const div = document.createElement('div')
            div.textContent = text
            div.style.cssText = [
              'background: #ffffff',
              'border: 1px solid #000000',
              'padding: 3px 8px',
              'font-size: 9px',
              'letter-spacing: 0.15em',
              'text-transform: uppercase',
              'font-family: var(--font-sans, sans-serif)',
              'white-space: nowrap',
              'line-height: 1.4',
            ].join(';')

            const label = new CSS2DObject(div)
            child.add(label)
          }
        })

        // Auto-fit: center + scale to view
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 12 / maxDim

        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))

        // Sit flush on ground
        const box2 = new THREE.Box3().setFromObject(model)
        model.position.y -= box2.min.y

        scene.add(model)

        // Fit camera to model
        const fittedBox = new THREE.Box3().setFromObject(model)
        const fittedCenter = fittedBox.getCenter(new THREE.Vector3())
        const fittedSize = fittedBox.getSize(new THREE.Vector3())
        const fittedMax = Math.max(fittedSize.x, fittedSize.y, fittedSize.z)

        controls.target.copy(fittedCenter)
        camera.position.set(
          fittedCenter.x + fittedMax * 1.2,
          fittedCenter.y + fittedMax * 0.9,
          fittedCenter.z + fittedMax * 1.2
        )
        camera.lookAt(fittedCenter)
        controls.update()

      },
      undefined,
      (err) => console.error('GLB load error:', err)
    )

    // ── Animate ────────────────────────────────────────────────────────────
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }
    animate()

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      labelRenderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      roofMeshesRef.current = []
      roofStructureMeshesRef.current = []
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('pointerdown', stopAuto)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      if (el.contains(labelRenderer.domElement)) el.removeChild(labelRenderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full" style={{ height: '520px' }}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ background: 'linear-gradient(to bottom, rgb(168,157,161) 0%, rgb(211,197,201) 50%, rgb(219,204,176) 100%)' }}
      />

      {/* Roof toggles */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setShowRoof((v) => !v)}
          className={`text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
            showRoof ? 'border-foreground text-foreground' : 'border-muted-foreground/30 text-muted-foreground/40'
          }`}
        >
          Roof
        </button>
        <button
          onClick={() => setShowRoofStructure((v) => !v)}
          className={`text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
            showRoofStructure ? 'border-foreground text-foreground' : 'border-muted-foreground/30 text-muted-foreground/40'
          }`}
        >
          Roof Structure
        </button>
      </div>

      <div className="absolute bottom-4 left-5 pointer-events-none select-none">
        <p className="text-[9px] tracking-[0.18em] uppercase text-muted">
          Drag to orbit · Scroll to zoom
        </p>
      </div>
    </div>
  )
}
