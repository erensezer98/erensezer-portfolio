'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

const FLOORS = [
  { title: 'Public Market', desc: 'Entrance gallery and community market space serving the MIND district.' },
  { title: 'Hydroponic Farms', desc: 'Vertical farming layers utilizing aeroponic and nutrient film techniques.' },
  { title: 'Research Labs', desc: 'Controlled environments for seed optimization and climate testing.' },
  { title: 'Processing Center', desc: 'Packaging and logistics floor for zero-mile distribution.' },
  { title: 'Sky Garden', desc: 'Public viewing deck and solar energy harvesting roof.' },
]

export default function FoodTowerExplosion() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0) // 0 to 1

  // Handle Internal Scroll (Wheel Capture)
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
        // Only capture if mouse is over the component
        e.preventDefault()
        const delta = e.deltaY * 0.001
        setProgress(prev => Math.max(0, Math.min(1, prev + delta)))
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight

    // ─── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const aspect = w / h
    const frustumSize = 8
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2, frustumSize * aspect / 2,
      frustumSize / 2, frustumSize / -2,
      0.1, 1000
    )
    camera.position.set(10, 8, 10)
    camera.lookAt(0, 1.5, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(5, 10, 5)
    scene.add(dirLight)

    // ─── Building Parts ───────────────────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
    const farmMat = new THREE.MeshStandardMaterial({ color: '#dcedc1', roughness: 0.5 }) // Light green tint
    const glassMat = new THREE.MeshPhysicalMaterial({ 
        color: '#ffffff', transmission: 0.9, thickness: 0.05, transparent: true, opacity: 0.2 
    })
    const edgeMat = new THREE.LineBasicMaterial({ color: '#e0e0e0' })

    const createLevel = (geo: THREE.BufferGeometry, mat: THREE.Material, baseY: number) => {
        const group = new THREE.Group()
        const mesh = new THREE.Mesh(geo, mat)
        const edges = new THREE.EdgesGeometry(geo)
        const lines = new THREE.LineSegments(edges, edgeMat)
        group.add(mesh, lines)
        group.position.y = baseY
        return { group, baseY }
    }

    const levels = [
        createLevel(new THREE.BoxGeometry(4, 0.1, 4), wallMat, 0),        // Base
        createLevel(new THREE.BoxGeometry(3.6, 1, 3.6), glassMat, 0.5),   // Ground
        createLevel(new THREE.BoxGeometry(3.6, 1, 3.6), farmMat, 1.6),    // Farm 1
        createLevel(new THREE.BoxGeometry(3.6, 1, 3.6), farmMat, 2.7),    // Farm 2
        createLevel(new THREE.BoxGeometry(3.4, 0.4, 3.4), wallMat, 3.5),  // Roof
    ]

    levels.forEach(l => scene.add(l.group))

    // ─── Animation ────────────────────────────────────────────────────────────
    let animId: number
    const animate = () => {
        animId = requestAnimationFrame(animate)
        
        levels.forEach((l, i) => {
            const explosionGap = progress * 3.5
            l.group.position.y = l.baseY + (i * explosionGap)
        })

        // Slow rotation
        scene.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1

        renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
        const nw = el.clientWidth
        const nh = el.clientHeight
        const nAspect = nw / nh
        camera.left = frustumSize * nAspect / -2
        camera.right = frustumSize * nAspect / 2
        camera.top = frustumSize / 2
        camera.bottom = frustumSize / -2
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [progress])

  const activeIndex = Math.round(progress * (FLOORS.length - 1))

  return (
    <div className="flex flex-col md:flex-row w-full h-[600px] border border-rule/30 bg-white overflow-hidden text-ink">
      {/* Left Column: Floor Functions */}
      <div className="w-full md:w-1/3 p-10 flex flex-col justify-center border-r border-rule/10">
        <p className="text-[11px] text-muted tracking-widest uppercase mb-10">Program Breakdown</p>
        
        <div className="space-y-8">
            {FLOORS.map((floor, i) => (
                <div 
                    key={i} 
                    className={`transition-all duration-500 transform ${
                        i === activeIndex ? 'translate-x-2 opacity-100' : 'opacity-20 scale-95'
                    }`}
                >
                    <p className="text-[10px] text-muted mb-1">LEVEL 0{i}</p>
                    <h3 className="text-xl font-light mb-2">{floor.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{floor.desc}</p>
                </div>
            ))}
        </div>

        <div className="mt-12 pt-10 border-t border-rule/10">
            <p className="text-[10px] text-muted italic">Scroll your mouse over the model to explode →</p>
        </div>
      </div>

      {/* Right Column: Three.js */}
      <div ref={mountRef} className="w-full md:w-2/3 h-full cursor-ns-resize" />
    </div>
  )
}
