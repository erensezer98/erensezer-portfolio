'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

/**
 * THE LOG INTERACTIVE SCENE
 * Features:
 * - Reeded translucent plane (Glass look)
 * - "The Log" text in a refined typography
 * - Woody triangular fragments floating behind the glass
 * - Interaction: Mouse movement creates "reflections" (fragments react)
 */
export default function TheLogScene() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const w = el.clientWidth
    const h = el.clientHeight

    // ─── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    
    // ─── Background Texture ───────────────────────────────────────────────────
    const texLoader = new THREE.TextureLoader()
    texLoader.load('/three/garden_bg.png', (tex) => {
        const bgPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 20),
            new THREE.MeshBasicMaterial({ map: tex }) // Opaque so it shows through transmission
        )
        bgPlane.position.z = -8
        bgPlane.renderOrder = -2 // Render first
        scene.add(bgPlane)
    })

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 0, 10)

    // ─── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // PHYSICAL LIGHTING
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    // ─── Environment & Lighting ───────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Sunlight from Top Left
    const sunLight = new THREE.DirectionalLight('#fff5e6', 5)
    sunLight.position.set(-10, 10, 5)
    scene.add(sunLight)
    
    const fillLight = new THREE.PointLight('#ff8c69', 15) // Salmon accent
    fillLight.position.set(5, -5, 5)
    scene.add(fillLight)

    // ─── Text Texture ─────────────────────────────────────────────────────────
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 1024
    canvas.height = 512
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.font = '300 120px "Inter", "Helvetica", sans-serif'
    ctx.fillStyle = '#4a3728' // Deep wood brown
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '12px'
    ctx.fillText('THE LOG', canvas.width / 2, canvas.height / 2)
    
    const textTex = new THREE.CanvasTexture(canvas)
    const textMat = new THREE.MeshBasicMaterial({ 
      map: textTex, 
      transparent: true,
      opacity: 0.8
    })
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), textMat)
    textPlane.position.z = 0.5 // In front of the reeded plane
    textPlane.renderOrder = 1 // Render AFTER the glass
    scene.add(textPlane)

    // ─── Reeded Translucent Plane ─────────────────────────────────────────────
    // Create a normal map for the "reeded" (ribbed) effect
    const normalCanvas = document.createElement('canvas')
    const nCtx = normalCanvas.getContext('2d')!
    normalCanvas.width = 128
    normalCanvas.height = 128
    for(let i=0; i<normalCanvas.width; i++) {
        // Vertical stripes for reeded look
        const val = Math.sin((i / normalCanvas.width) * Math.PI * 10) * 127 + 128
        nCtx.fillStyle = `rgb(${val}, 128, 255)`
        nCtx.fillRect(i, 0, 1, normalCanvas.height)
    }
    const normalTex = new THREE.CanvasTexture(normalCanvas)
    normalTex.wrapS = THREE.RepeatWrapping
    normalTex.repeat.set(10, 1)

    const glassMat = new THREE.MeshPhysicalMaterial({
      transmission: 1.0,      // Full transmission
      thickness: 0.5,         // Thinner glass for better clarity
      roughness: 0.1,
      ior: 1.5,
      attenuationDistance: 1,
      attenuationColor: new THREE.Color('#ffffff'),
      color: '#ffffff',
      metalness: 0,
      normalMap: normalTex,
      transparent: true,     // Physical transparency
      opacity: 1,
    })

    const glassPlane = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), glassMat)
    glassPlane.position.z = 0
    glassPlane.renderOrder = 0
    scene.add(glassPlane)

    // ─── Woody Triangular Fragments (Instanced) ────────────────────────────────
    const fragCount = 40
    const fragGeo = new THREE.ConeGeometry(0.15, 0.4, 3) // Triangular prism/cone
    const fragColors = ['#8b4513', '#a0522d', '#d2691e', '#ff8c69'] // Wood tones + Salmon
    
    const instancedMesh = new THREE.InstancedMesh(fragGeo, new THREE.MeshStandardMaterial({
        roughness: 0.7,
        metalness: 0.1,
    }), fragCount)

    const dummy = new THREE.Object3D()
    const fragData = Array.from({ length: fragCount }, () => ({
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8,
            -2 - Math.random() * 3 // Behind the glass
        ),
        rot: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI),
        speed: Math.random() * 0.01 + 0.005,
        color: new THREE.Color(fragColors[Math.floor(Math.random() * fragColors.length)])
    }))

    fragData.forEach((d, i) => instancedMesh.setColorAt(i, d.color))
    instancedMesh.renderOrder = -1 // Render before the glass
    scene.add(instancedMesh)

    // ─── Interaction ──────────────────────────────────────────────────────────
    const mouse = new THREE.Vector2(0, 0)
    const targetMouse = new THREE.Vector2(0, 0)

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      targetMouse.x = ((e.clientX - rect.left) / w) * 2 - 1
      targetMouse.y = -((e.clientY - rect.top) / h) * 2 + 1
    }
    el.addEventListener('mousemove', onMouseMove)

    // ─── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      const nw = el.clientWidth
      const nh = el.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    // ─── Animation ────────────────────────────────────────────────────────────
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      
      // Interpolate mouse for smoothness
      mouse.lerp(targetMouse, 0.05)

      // Update fragments
      fragData.forEach((d, i) => {
          // Subtle floating movement
          d.pos.y += Math.sin(Date.now() * 0.001 + i) * 0.002
          d.pos.x += Math.cos(Date.now() * 0.001 + i) * 0.002
          
          // React to mouse
          const dist = d.pos.clone().setZ(0).distanceTo(new THREE.Vector3(mouse.x * 6, mouse.y * 4, 0))
          if (dist < 3) {
              const dir = d.pos.clone().setZ(0).sub(new THREE.Vector3(mouse.x * 6, mouse.y * 4, 0)).normalize()
              d.pos.add(dir.multiplyScalar(0.02 * (1 - dist/3)))
              d.rot.x += 0.05
              d.rot.y += 0.05
          }

          d.rot.x += d.speed
          d.rot.y += d.speed

          dummy.position.copy(d.pos)
          dummy.rotation.copy(d.rot)
          dummy.updateMatrix()
          instancedMesh.setMatrixAt(i, dummy.matrix)
      })
      instancedMesh.instanceMatrix.needsUpdate = true

      // Subtle tilt of planes based on mouse
      glassPlane.rotation.y = -mouse.x * 0.05
      glassPlane.rotation.x = mouse.y * 0.05
      textPlane.rotation.y = -mouse.x * 0.08
      textPlane.rotation.x = mouse.y * 0.08

      renderer.render(scene, camera)
    }
    animate()

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      el.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}
