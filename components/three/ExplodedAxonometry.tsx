'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * EXPLODED AXONOMETRY COMPONENT
 * Elements explode upward based on the scroll position of the page.
 */
export default function ExplodedAxonomy() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!mountRef.current) return
      
      const rect = mountRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate how much of the component is visible/scrolled
      // 0 = just entered from bottom, 1 = scrolled past
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const w = el.clientWidth
    const h = el.clientHeight

    // ─── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = null // Transparent

    // Orthographic camera for Axonometric look
    const frustumSize = 10
    const aspect = w / h
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    )
    
    // Classic 45 degree axo view
    camera.position.set(10, 10, 10)
    camera.lookAt(0, 0, 0)

    // ─── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // ─── Lighting ─────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 15, 8)
    scene.add(dirLight)

    // ─── Architectural Elements ───────────────────────────────────────────────
    const group = new THREE.Group()
    
    // Materials
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: '#ffffff', 
      roughness: 0.8,
    })
    const glassMat = new THREE.MeshPhysicalMaterial({ 
      color: '#e0f7fa', 
      transmission: 0.9, 
      thickness: 0.1, 
      transparent: true,
      opacity: 0.3
    })
    const edgeMat = new THREE.LineBasicMaterial({ color: '#cfcbc8' })

    const createPart = (geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => {
      const mesh = new THREE.Mesh(geo, mat)
      
      // Wireframe overlay
      const edges = new THREE.EdgesGeometry(geo)
      const line = new THREE.LineSegments(edges, edgeMat)
      mesh.add(line)
      
      return { mesh, baseY: y }
    }

    // Components (Base, Floor 1, Floor 2, Roof)
    const parts = [
      createPart(new THREE.BoxGeometry(4, 0.2, 4), wallMat, 0),        // Table/Base
      createPart(new THREE.BoxGeometry(3.5, 1, 3.5), glassMat, 1.2),   // Ground Floor Glass
      createPart(new THREE.BoxGeometry(3.8, 0.3, 3.8), wallMat, 2),    // Floor Slab
      createPart(new THREE.BoxGeometry(3.5, 1.2, 2), wallMat, 3),      // Upper Volume
      createPart(new THREE.BoxGeometry(3.8, 0.1, 3.8), wallMat, 4.2),  // Roof Slab
    ]

    parts.forEach(p => {
      p.mesh.position.y = p.baseY
      group.add(p.mesh)
    })
    
    scene.add(group)

    // ─── Resize ───────────────────────────────────────────────────────────────
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

    // ─── Animation ────────────────────────────────────────────────────────────
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Apply the explosion based on scroll progress
      // We multiply the baseY by the progress to create the expansion
      parts.forEach((p, i) => {
        const explosionFactor = 2.5 * scrollProgress
        p.mesh.position.y = p.baseY + (i * explosionFactor)
      })

      // Slow rotation for dynamism
      group.rotation.y += 0.002

      renderer.render(scene, camera)
    }
    animate()

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [scrollProgress])

  return <div ref={mountRef} className="w-full h-full" />
}
