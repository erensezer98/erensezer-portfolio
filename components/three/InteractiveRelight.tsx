'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// --- Tactical Color Palette ---
const COLOR_HAZARD = new THREE.Color(0xff3300)  // Emergency Red
const COLOR_SCANNER = new THREE.Color(0x0066ff) // Deep Scan Blue

type ObstacleEntry = {
  mesh: THREE.Mesh
  basePosition: THREE.Vector3
  center: THREE.Vector3
  influenceRadius: number
  material: THREE.MeshStandardMaterial
  detectionLevel: number
  hazardType: string
}

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [scanStatus, setScanStatus] = useState('IDLE')
  const [hazardCount, setHazardCount] = useState(0)
  const [activeHazard, setActiveHazard] = useState<string | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050508)
    scene.fog = new THREE.FogExp2(0x050508, 0.05)

    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(0, 15, 20)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5)
    scene.add(ambientLight)

    const scannerLight = new THREE.PointLight(COLOR_SCANNER, 20, 15)
    scene.add(scannerLight)

    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    const ringGeo = new THREE.RingGeometry(1.9, 2.0, 64)
    const ringMat = new THREE.MeshBasicMaterial({ color: COLOR_SCANNER, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    const scannerRing = new THREE.Mesh(ringGeo, ringMat)
    scannerRing.rotation.x = -Math.PI / 2
    scene.add(scannerRing)

    const obstacleEntries: ObstacleEntry[] = []
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
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const scale = 25 / Math.max(size.x, size.z)
        model.scale.setScalar(scale)
        model.position.y = -box.min.y * scale
        modelGroup.add(model)

        const hazardLabels = ['DEBRIS BLOCKAGE', 'UNSTABLE STRUCTURE', 'VEHICLE ABANDONMENT', 'STREET DAMAGE']

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            const isRoad = mesh.name.toLowerCase().includes('road') || mesh.name.toLowerCase().includes('ground')

            const material = new THREE.MeshStandardMaterial({
              color: isRoad ? 0x222222 : 0x444444,
              wireframe: !isRoad,
              transparent: true,
              opacity: isRoad ? 0.8 : 0.4,
              emissive: new THREE.Color(0x000000),
            })
            mesh.material = material

            if (!isRoad) {
              const b = new THREE.Box3().setFromObject(mesh)
              obstacleEntries.push({
                mesh,
                basePosition: mesh.position.clone(),
                center: b.getCenter(new THREE.Vector3()),
                influenceRadius: 2.5,
                material,
                detectionLevel: 0,
                hazardType: hazardLabels[Math.floor(Math.random() * hazardLabels.length)]
              })
            }
          }
        })
      }
    )

    const onPointerMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect()
      targetMouse.x = ((e.clientX - b.left) / b.width) * 2 - 1
      targetMouse.y = -((e.clientY - b.top) / b.height) * 2 + 1
    }

    el.addEventListener('mousemove', onPointerMove)

    const clock = new THREE.Clock()
    let animationId: number

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      mouse.lerp(targetMouse, 0.1)

      raycaster.setFromCamera(mouse, camera)
      if (raycaster.ray.intersectPlane(groundPlane, hoverPoint)) {
        scannerLight.position.copy(hoverPoint).y = 2
        scannerRing.position.set(hoverPoint.x, 0.05, hoverPoint.z)
        scannerRing.scale.setScalar(1 + Math.sin(t * 4) * 0.1)
        scannerRing.material.opacity = 0.3 + Math.sin(t * 4) * 0.2
      }

      let detectedThisFrame = 0
      let topHazard: string | null = null

      obstacleEntries.forEach((obj) => {
        const dist = hoverPoint.distanceTo(obj.center)
        const inRange = dist < obj.influenceRadius

        obj.detectionLevel += ((inRange ? 1 : 0) - obj.detectionLevel) * 0.1
        
        if (obj.detectionLevel > 0.01) {
          detectedThisFrame++
          const alertColor = COLOR_HAZARD.clone().lerp(COLOR_SCANNER, 1 - obj.detectionLevel)
          obj.material.emissive.copy(alertColor)
          obj.material.emissiveIntensity = obj.detectionLevel * 2
          obj.material.opacity = 0.4 + obj.detectionLevel * 0.6
          obj.mesh.position.y = obj.basePosition.y + Math.sin(t * 10 + obj.detectionLevel) * 0.05 * obj.detectionLevel
          if (obj.detectionLevel > 0.8) topHazard = obj.hazardType
        } else {
          obj.material.emissiveIntensity = 0
          obj.material.opacity = 0.4
          obj.mesh.position.y = obj.basePosition.y
        }
      })

      setScanStatus(detectedThisFrame > 0 ? 'WARNING: HAZARD DETECTED' : 'SYSTEM SCANNING')
      setHazardCount(detectedThisFrame)
      setActiveHazard(topHazard)

      modelGroup.rotation.y += 0.001
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      el.removeEventListener('mousemove', onPointerMove)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050508] font-mono">
      <div ref={mountRef} className="h-full w-full" />
      
      <div className="pointer-events-none absolute inset-0 border-[1px] border-white/5 p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${hazardCount > 0 ? 'animate-pulse bg-red-500' : 'bg-cyan-400'}`} />
            <span className="text-[10px] tracking-[0.3em] text-white/90">{scanStatus}</span>
          </div>
          <div className="h-[1px] w-32 bg-white/20" />
        </div>

        <div className="absolute bottom-10 left-10">
          <div className="text-[9px] leading-relaxed text-white/40 uppercase">
            <div>Sector: Istanbul_Fatih_Z3</div>
            <div>Detected_Objects: {hazardCount}</div>
            <div>Risk_Factor: {hazardCount > 0 ? 'CRITICAL' : 'MINIMAL'}</div>
          </div>
        </div>

        {activeHazard && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-2 text-[10px] tracking-[0.5em] text-red-500/80">IDENTIFIED</div>
            <div className="bg-red-500/10 px-4 py-1 text-xs tracking-widest text-red-500 backdrop-blur-md outline outline-1 outline-red-500/50">
              {activeHazard}
            </div>
          </div>
        )}

        <div className="absolute right-6 top-6 h-12 w-12 border-r border-t border-white/20" />
        <div className="absolute bottom-6 left-6 h-12 w-12 border-b border-l border-white/20" />
      </div>

      <div 
        className="pointer-events-none absolute inset-0 opacity-60" 
        style={{ background: 'radial-gradient(circle, transparent 20%, #000 100%)' }}
      />
    </div>
  )
}
