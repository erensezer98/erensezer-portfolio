'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

type ObstacleEntry = {
  mesh: THREE.Mesh
  center: THREE.Vector3
  hazardType: string
  detectionLevel: number
}

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loadStatus, setLoadStatus] = useState('Initializing...')
  const [hazardCount, setHazardCount] = useState(0)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a10)

    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 2000)
    camera.position.set(0, 30, 40)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Vibrant lights to see EVERYTHING
    scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const dLight = new THREE.DirectionalLight(0xffffff, 2)
    dLight.position.set(10, 50, 10)
    scene.add(dLight)

    // Visual anchor: Big blue sphere at origin
    const debugSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial({ color: 0x0066ff, wireframe: true })
    )
    scene.add(debugSphere)

    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    const grid = new THREE.GridHelper(100, 50, 0x333333, 0x1a1a1a)
    scene.add(grid)

    const obstacleEntries: ObstacleEntry[] = []
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-10, -10)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hoverPoint = new THREE.Vector3()

    setLoadStatus('Loading GLB...')

    loader.load(
      '/models/objects.glb',
      (gltf) => {
        setLoadStatus('Processing Model...')
        const model = gltf.scene
        
        // Remove sphere if model loads
        scene.remove(debugSphere)

        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const maxD = Math.max(size.x, size.y, size.z)
        const scale = maxD > 0 ? 30 / maxD : 1
        model.scale.setScalar(scale)
        
        const centeredBox = new THREE.Box3().setFromObject(model)
        const center = centeredBox.getCenter(new THREE.Vector3())
        model.position.x = -center.x
        model.position.z = -center.z
        model.position.y = -centeredBox.min.y
        modelGroup.add(model)

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            // Ensure visibility with a basic material initially
            mesh.material = new THREE.MeshPhongMaterial({
              color: 0x00ccff,
              emissive: 0x111111,
              wireframe: true,
              transparent: true,
              opacity: 0.8
            })

            const b = new THREE.Box3().setFromObject(mesh)
            obstacleEntries.push({
              mesh,
              center: b.getCenter(new THREE.Vector3()),
              hazardType: 'DETECTED_OBJECT',
              detectionLevel: 0
            })
          }
        })
        setLoadStatus('Scan Ready')
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100)
          setLoadStatus(`Loading: ${percent}%`)
        }
      },
      (err) => {
        console.error('FAILED TO LOAD MODEL:', err)
        setLoadStatus('LOAD ERROR')
      }
    )

    const onPointerMove = (e: MouseEvent) => {
      const b = el.getBoundingClientRect()
      mouse.x = ((e.clientX - b.left) / b.width) * 2 - 1
      mouse.y = -((e.clientY - b.top) / b.height) * 2 + 1
    }
    el.addEventListener('mousemove', onPointerMove)

    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(groundPlane, hoverPoint)

      let activeCount = 0
      obstacleEntries.forEach((obj) => {
        const dist = hoverPoint.distanceTo(obj.center)
        if (dist < 5) {
          activeCount++
          obj.detectionLevel += (1 - obj.detectionLevel) * 0.1
          const mat = obj.mesh.material as THREE.MeshPhongMaterial
          mat.color.setHex(0xff3300)
          mat.emissive.setHex(0xff0000)
          mat.emissiveIntensity = obj.detectionLevel * 2
        } else {
          obj.detectionLevel += (0 - obj.detectionLevel) * 0.05
          const mat = obj.mesh.material as THREE.MeshPhongMaterial
          mat.color.setHex(0x00ccff)
          mat.emissive.setHex(0x000000)
        }
      })
      setHazardCount(activeCount)

      modelGroup.rotation.y += 0.003
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
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative h-screen min-h-[600px] w-full bg-black font-mono overflow-hidden">
      <div ref={mountRef} className="h-full w-full" />
      
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-10">
        <div className="flex flex-col gap-2">
          <div className="h-0.5 w-40 bg-cyan-500/50" />
          <div className="text-cyan-400 text-xs tracking-[0.5em] font-bold">HAZARD ANALYZER V3.0</div>
          <div className="text-white/40 text-[10px]">STATUS: {loadStatus}</div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <div className="text-white/20 text-[9px] uppercase tracking-widest">Active detections</div>
            <div className="text-2xl text-white font-light">{hazardCount}</div>
          </div>
          <div className="h-24 w-[1px] bg-gradient-to-t from-cyan-500/50 to-transparent" />
        </div>
      </div>
    </div>
  )
}
