'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ─── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const w = el.clientWidth
    const h = el.clientHeight
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 5, 8)
    camera.lookAt(0, 0, 0)

    // ─── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0) // transparent background
    
    // Enable shadows for the dramatic relight effect
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    // ─── Lighting ─────────────────────────────────────────────────────────────
    // Very dim ambient light so shadows are almost completely dark
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05)
    scene.add(ambientLight)

    // The magical point light that follows the mouse
    const pointLight = new THREE.PointLight(0xffffff, 150, 50)
    pointLight.position.set(0, 2, 0)
    pointLight.castShadow = true
    pointLight.shadow.bias = -0.001
    pointLight.shadow.mapSize.width = 1024
    pointLight.shadow.mapSize.height = 1024
    scene.add(pointLight)

    // ─── Geometry: Abstract Architectural Grid / Topography ───────────────────
    const group = new THREE.Group()
    
    // Create a dark matte material
    const material = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2,
    })

    const size = 15
    const segments = 30
    const step = size / segments

    // Create a base plane that receives shadows
    const planeGeo = new THREE.PlaneGeometry(size, size)
    const planeMenu = new THREE.Mesh(planeGeo, material)
    planeMenu.rotation.x = -Math.PI / 2
    planeMenu.position.y = -0.5
    planeMenu.receiveShadow = true
    scene.add(planeMenu)

    // Create a grid of extruded blocks creating an abstract "cityscape"
    for (let x = -size/2; x < size/2; x += step) {
      for (let z = -size/2; z < size/2; z += step) {
        // Pseudo-random height based on position
        const noise = Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.5 + 
                      Math.sin(x * 0.5 + z * 0.5) * 0.8
        
        if (noise > 0.2) {
          const height = noise * 1.5
          const boxGeo = new THREE.BoxGeometry(step * 0.8, height, step * 0.8)
          const mesh = new THREE.Mesh(boxGeo, material)
          mesh.position.set(x + step/2, height/2 - 0.5, z + step/2)
          mesh.castShadow = true
          mesh.receiveShadow = true
          group.add(mesh)
        }
      }
    }
    
    scene.add(group)

    // ─── Interaction (Mouse tracking) ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    // An invisible plane exactly at y=2 to catch the mouse intersection for the light
    const catchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2)


    // To prevent the light from acting clunky if the mouse moves very fast,
    // we use a target object
    const targetLightPos = new THREE.Vector3(0, 2, 0)
    
    const onMouseMoveSmooth = (e: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      mouse.x = ((e.clientX - bounds.left) / w) * 2 - 1
      mouse.y = -((e.clientY - bounds.top) / h) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(catchPlane, targetLightPos)
    }

    window.addEventListener('mousemove', onMouseMoveSmooth)

    // ─── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return
      const nw = el.clientWidth
      const nh = el.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // ─── Animation loop ───────────────────────────────────────────────────────
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Very slow rotation of the entire group to keep it dynamic
      group.rotation.y = Math.sin(elapsed * 0.1) * 0.1

      // Smoothly move light towards target
      if (targetLightPos) {
        pointLight.position.lerp(targetLightPos, 0.1)
      }

      renderer.render(scene, camera)
    }
    animate()

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMoveSmooth)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}
