'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [hazardCount, setHazardCount] = useState(0)
  const [activeHazard, setActiveHazard] = useState<string | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020205)

    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(0, 18, 25)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Standard lighting to ensure we see the model
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 5)
    scene.add(directionalLight)

    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    // Helpers to verify coordinate system
    const grid = new THREE.GridHelper(30, 30, 0x444444, 0x222222)
    scene.add(grid)

    const obstacleEntries: any[] = []
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-10, -10)
    const targetMouse = new THREE.Vector2(-10, -10)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hoverPoint = new THREE.Vector3()

    loader.load(
      '/models/objects.glb',
      (gltf) => {
        const model = gltf.scene
        console.log('Hazard model loaded successfully:', model)

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const scale = 20 / Math.max(size.x, size.z)
        model.scale.setScalar(scale)
        
        // Ground the model
        const centeredBox = new THREE.Box3().setFromObject(model)
        model.position.y = -centeredBox.min.y
        modelGroup.add(model)

        const hazardLabels = ['BLOCKED PATH', 'DEBRIS HAZARD', 'UNSTABLE WALL', 'DAMAGED ROAD']

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            console.log('Found mesh:', mesh.name)
            
            // For now, give everything a visible wireframe material
            const material = new THREE.MeshPhongMaterial({
              color: 0x888888,
              wireframe: true,
              emissive: 0x222222,
              transparent: true,
              opacity: 0.7
            })
            mesh.material = material

            const b = new THREE.Box3().setFromObject(mesh)
            obstacleEntries.push({
              mesh,
              basePosition: mesh.position.clone(),
              center: b.getCenter(new THREE.Vector3()),
              material,
              detectionLevel: 0,
              hazardType: hazardLabels[Math.floor(Math.random() * hazardLabels.length)]
            })
          }
        })
      },
      undefined,
      (err) => console.error('GLB ERROR:', err)
    )

    const onPointerMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect()
      targetMouse.x = ((e.clientX - b.left) / b.width) * 2 - 1
      targetMouse.y = -((e.clientY - b.top) / b.height) * 2 + 1
    }

    el.addEventListener('mousemove', onPointerMove)

    const clock = new THREE.Clock()
    const animate = () => {
      requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      mouse.lerp(targetMouse, 0.1)

      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(groundPlane, hoverPoint)

      let count = 0
      let active: string | null = null

      obstacleEntries.forEach((obj) => {
        const dist = hoverPoint.distanceTo(obj.center)
        const isNear = dist < 3.5
        obj.detectionLevel += ((isNear ? 1 : 0) - obj.detectionLevel) * 0.1

        if (obj.detectionLevel > 0.05) {
          count++
          obj.material.emissive.setHex(0xff0000)
          obj.material.emissiveIntensity = obj.detectionLevel * 2
          obj.mesh.position.y = obj.basePosition.y + obj.detectionLevel * 0.2
          if (obj.detectionLevel > 0.8) active = obj.hazardType
        } else {
          obj.material.emissive.setHex(0x222222)
          obj.material.emissiveIntensity = 1
          obj.mesh.position.y = obj.basePosition.y
        }
      })

      setHazardCount(count)
      setActiveHazard(active)

      modelGroup.rotation.y += 0.002
      renderer.render(scene, camera)
    }

    animate()

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      el.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative h-full min-h-[500px] w-full bg-[#050508] font-mono">
      <div ref={mountRef} className="h-full w-full" />
      
      {/* HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 p-8">
        <div className="flex flex-col gap-1 border-l-2 border-cyan-500 pl-4">
          <div className="text-[10px] tracking-[0.4em] text-cyan-400 uppercase font-bold">Tactical Scanner v2.1</div>
          <div className="text-[9px] text-white/50">SECTOR: IST_EVAC_01</div>
        </div>

        {activeHazard && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-red-600/20 backdrop-blur-md border border-red-500 px-6 py-2 text-red-500 text-xs tracking-widest uppercase">
              Caution: {activeHazard}
            </div>
          </div>
        )}

        <div className="absolute bottom-10 left-10 text-[9px] text-white/40 leading-relaxed uppercase">
          <div>Objects Scanned: {hazardCount}</div>
          <div>Status: {hazardCount > 0 ? 'Hazard identified' : 'Scanning street...'}</div>
        </div>
      </div>
    </div>
  )
}
