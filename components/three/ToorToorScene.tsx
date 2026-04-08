'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function ToorToorScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ffffff')
    scene.fog = new THREE.Fog('#ffffff', 60, 120)

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 500)
    camera.position.set(18, 12, 18)

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    // ── Lights ─────────────────────────────────────────────────────────────
    // Warm ambient (sky)
    const ambient = new THREE.AmbientLight('#ffe8c8', 0.7)
    scene.add(ambient)

    // Main sun — warm, from upper left (Senegalese high sun)
    const sun = new THREE.DirectionalLight('#fff0d0', 2.2)
    sun.position.set(12, 20, 8)
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

    // Soft fill from opposite side (sky bounce)
    const fill = new THREE.DirectionalLight('#c8e0ff', 0.5)
    fill.position.set(-8, 6, -6)
    scene.add(fill)

    // Ground bounce
    const bounce = new THREE.HemisphereLight('#ffe0a0', '#c8b090', 0.4)
    scene.add(bounce)

    // ── Ground plane ───────────────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(100, 100)
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 1.0,
    })
    const groundPlane = new THREE.Mesh(groundGeo, groundMat)
    groundPlane.rotation.x = -Math.PI / 2
    groundPlane.receiveShadow = true
    scene.add(groundPlane)

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

    // Stop auto-rotate on user interaction
    const stopAuto = () => { controls.autoRotate = false }
    el.addEventListener('pointerdown', stopAuto)

    // ── Load GLB ───────────────────────────────────────────────────────────
    const loader = new GLTFLoader()
    loader.load(
      '/models/toor-toor.glb',
      (gltf) => {
        const model = gltf.scene

        // Enable shadows on every mesh
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true

            // Ensure materials respond well to the lighting
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
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-5 pointer-events-none select-none">
        <p className="text-[9px] tracking-[0.18em] uppercase text-muted">
          Drag to orbit · Scroll to zoom
        </p>
      </div>
    </div>
  )
}
