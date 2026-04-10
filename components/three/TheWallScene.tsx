'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function TheWallScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const facadeMeshesRef = useRef<THREE.Object3D[]>([])
  const [showFacade, setShowFacade] = useState(true)

  useEffect(() => {
    facadeMeshesRef.current.forEach((m) => { m.visible = showFacade })
  }, [showFacade])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog('rgb(200,200,200)', 42, 120)

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500)
    camera.position.set(18, 12, 18)

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    // ── Lights ─────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight('#ffffff', 0.5)
    scene.add(ambient)

    const sun = new THREE.DirectionalLight('#fff8f0', 3.0)
    sun.position.set(10, 30, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 150
    sun.shadow.camera.left = -30
    sun.shadow.camera.right = 30
    sun.shadow.camera.top = 30
    sun.shadow.camera.bottom = -30
    sun.shadow.bias = -0.001
    scene.add(sun)

    const fill = new THREE.DirectionalLight('#c8d8ff', 0.3)
    fill.position.set(-10, 8, -8)
    scene.add(fill)

    const bounce = new THREE.HemisphereLight('#e8e8e8', '#b0a090', 0.4)
    scene.add(bounce)

    // ── OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 3
    controls.maxDistance = 100
    controls.maxPolarAngle = Math.PI / 2.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.target.set(0, 0, 0)

    const stopAuto = () => { controls.autoRotate = false }
    el.addEventListener('pointerdown', stopAuto)

    // ── Ground plane ───────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: 0.95, metalness: 0 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // ── Load GLB ───────────────────────────────────────────────────────────
    const loader = new GLTFLoader()
    loader.load(
      '/models/thewall.glb',
      (gltf) => {
        const model = gltf.scene

        model.traverse((child) => {
          // Collect facade objects by name (case-insensitive)
          if (child.name.toLowerCase().replace(/[\s_-]/g, '') === 'facade') {
            facadeMeshesRef.current.push(child)
          }

          // Shadows + material tweaks
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true

            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
              mats.forEach((mat) => {
                if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                  const m = mat as THREE.MeshStandardMaterial
                  m.roughness = Math.max(m.roughness, 0.4)
                  m.needsUpdate = true
                }
              })
            }
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

        // Fit camera
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
    }
    animate()

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      facadeMeshesRef.current = []
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('pointerdown', stopAuto)
      controls.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full" style={{ height: '520px' }}>
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ background: 'linear-gradient(to bottom, rgb(160,160,165) 0%, rgb(200,200,205) 50%, rgb(210,205,195) 100%)' }}
      />

      {/* Facade toggle */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setShowFacade((v) => !v)}
          className={`text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${
            showFacade
              ? 'border-foreground text-foreground'
              : 'border-muted-foreground/30 text-muted-foreground/40'
          }`}
        >
          Facade
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
