'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'

interface ProjectSphereProps {
  projects: Project[]
}

const DOT_COUNT = 500
const SPHERE_RADIUS = 3.2

export default function ProjectSphere({ projects }: ProjectSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const [hoveredText, setHoveredText] = useState<string | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const w = el.clientWidth
    const h = el.clientHeight
    const scene = new THREE.Scene()
    
    // Camera
    const cameraGroup = new THREE.Group()
    scene.add(cameraGroup)
    
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 0, 15) // Initial distance
    cameraGroup.add(camera)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a0a0a, 1) // Black background
    el.appendChild(renderer.domElement)

    // Interaction Raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-9999, -9999)

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Sphere of Dots
    // ─────────────────────────────────────────────────────────────────────────
    const points: THREE.Vector3[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < DOT_COUNT; i++) {
        const y = 1 - (i / (DOT_COUNT - 1)) * 2
        const radius = Math.sqrt(1 - y * y)
        const theta = phi * i
        const pt = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius).multiplyScalar(SPHERE_RADIUS)
        points.push(pt)
    }

    const dotGeo = new THREE.BoxGeometry(0.03, 0.03, 0.03)
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
    const instancedDots = new THREE.InstancedMesh(dotGeo, dotMat, DOT_COUNT)
    
    const dummy = new THREE.Object3D()
    const explodedTargets = new Float32Array(DOT_COUNT * 3)

    for (let i = 0; i < DOT_COUNT; i++) {
        const pt = points[i]
        
        // Target position when sphere "explodes" in Phase 1
        // Send them very far out to act as stardust
        const exp = pt.clone().normalize().multiplyScalar(10 + Math.random() * 20)
        explodedTargets[i * 3] = exp.x
        explodedTargets[i * 3 + 1] = exp.y
        explodedTargets[i * 3 + 2] = exp.z

        dummy.position.copy(pt)
        dummy.updateMatrix()
        instancedDots.setMatrixAt(i, dummy.matrix)
    }
    scene.add(instancedDots)

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Flying Frames (Phase 1) & Gallery (Phase 2)
    // ─────────────────────────────────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader()
    const flyingMeshes: THREE.Mesh[] = []
    const galleryMeshes: THREE.Mesh[] = []
    
    // Some random orbit parameters for the flying frames
    const flyingData: { speed: number; angleY: number; angleX: number; radius: number }[] = []

    projects.forEach((proj, i) => {
        // Shared material holding the project image
        const imgMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
        if (proj.cover_image) {
            textureLoader.load(proj.cover_image, (tex) => {
                imgMat.map = tex
                imgMat.needsUpdate = true
            })
        } else {
            imgMat.color.setHex(0x333333)
        }

        // --- FLYING FRAME (Phase 1) ---
        // A black plane with a white border containing the image
        const frameGroup = new THREE.Group()
        // Border: Slightly larger white plane behind
        const borderGeo = new THREE.PlaneGeometry(2.1, 2.1)
        const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const borderMesh = new THREE.Mesh(borderGeo, borderMat)
        borderMesh.position.z = -0.01

        const imgGeo = new THREE.PlaneGeometry(2, 2)
        const imgMesh = new THREE.Mesh(imgGeo, imgMat)
        
        frameGroup.add(borderMesh)
        frameGroup.add(imgMesh)

        // Wrapper mesh for raycasting
        const hitGeo = new THREE.BoxGeometry(2.1, 2.1, 0.1)
        const hitMat = new THREE.MeshBasicMaterial({ visible: false })
        const hitMesh = new THREE.Mesh(hitGeo, hitMat)
        hitMesh.userData = { isFlying: true, title: proj.title }
        frameGroup.add(hitMesh)

        // Initial invisible scale
        frameGroup.scale.setScalar(0.001)
        scene.add(frameGroup)
        
        flyingMeshes.push(hitMesh)
        flyingData.push({
            speed: 0.1 + Math.random() * 0.2,
            angleY: Math.random() * Math.PI * 2,
            angleX: (Math.random() - 0.5) * 1.5,
            radius: 5 + Math.random() * 4
        })

        hitMesh.userData.parentGroup = frameGroup

        // --- GALLERY FRAME (Phase 2) ---
        // Aligned perfectly on the opposite side of the scene (Z = -10)
        // Camera will look at them when it rotates by Math.PI (180 deg)
        // Camera rotated by Math.PI means it looks down the +Z axis.
        // Wait, if camera group rotates Math.PI, the camera (at +Z) swings to -Z. 
        // It points towards the origin (so it looks at +Z).
        // Therefore the gallery must be placed at +Z for camera to see it after 180 rotation?
        // Let's think:
        // cameraGroup at 0,0,0. Camera at 0,0,15. Looks at 0,0,0 (down -Z axis).
        // If cameraGroup.rotation.y = PI, camera is now at 0, 0, -15.
        // It looks towards 0,0,0 (down +Z axis).
        // A gallery placed at Z = +5 will be visible in front of the camera.
        const galGroup = new THREE.Group()
        const gBorderMesh = new THREE.Mesh(borderGeo, borderMat)
        gBorderMesh.position.z = -0.01
        const gImgMesh = new THREE.Mesh(imgGeo, imgMat)
        
        galGroup.add(gBorderMesh)
        galGroup.add(gImgMesh)

        const gHitMesh = new THREE.Mesh(hitGeo, hitMat)
        gHitMesh.userData = { isGallery: true, title: proj.title, slug: proj.slug }
        galGroup.add(gHitMesh)

        // Grid layout for gallery
        const cols = 4
        const row = Math.floor(i / cols)
        const col = i % cols
        const spacing = 2.8
        const offsetX = (cols * spacing) / 2 - (spacing / 2)
        
        // Position at +Z so when camera swings around 180 degrees it sees them
        galGroup.position.set(col * spacing - offsetX, -row * spacing + 2, 7)
        // They need to face the camera. Since camera looks down +Z axis, the planes should face -Z.
        // By default planes face +Z. So we rotate them 180 to face -Z.
        galGroup.rotation.y = Math.PI
        
        galGroup.scale.setScalar(0.001) // Invisible initially
        scene.add(galGroup)
        
        galleryMeshes.push(gHitMesh)
        gHitMesh.userData.parentGroup = galGroup
    })

    // Local mutable state for animation loop
    let currentPhase = 0
    let transitionProgress = 0
    let rotTransitionProgress = 0
    let cameraZ = 15

    const onMouseMove = (e: MouseEvent) => {
        const bounds = el.getBoundingClientRect()
        mouse.x = ((e.clientX - bounds.left) / w) * 2 - 1
        mouse.y = -((e.clientY - bounds.top) / h) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        
        let foundHover = false
        if (currentPhase === 1) {
            const hits = raycaster.intersectObjects(flyingMeshes)
            if (hits.length > 0) {
                document.body.style.cursor = 'pointer'
                setHoveredText(hits[0].object.userData.title)
                foundHover = true
            }
        } else if (currentPhase === 2) {
            const hits = raycaster.intersectObjects(galleryMeshes)
            if (hits.length > 0) {
                document.body.style.cursor = 'pointer'
                setHoveredText(hits[0].object.userData.title)
                foundHover = true
                // Hover effect scale
                hits[0].object.userData.parentGroup.scale.setScalar(1.05)
            }
        }

        if (!foundHover) {
            document.body.style.cursor = 'default'
            setHoveredText(null)
            
            // Reset gallery scale
            if (currentPhase === 2) {
                galleryMeshes.forEach(gm => {
                    gm.userData.parentGroup.scale.lerp(new THREE.Vector3(1,1,1), 0.1)
                })
            }
        }
    }

    const onClick = () => {
        raycaster.setFromCamera(mouse, camera)

        if (currentPhase === 0) {
            // Click to expand phase 1
            currentPhase = 1
            setPhase(1)
        } else if (currentPhase === 1) {
            const hits = raycaster.intersectObjects(flyingMeshes)
            if (hits.length > 0) {
                // Clicked a flying picture -> Rotate to phase 2
                currentPhase = 2
                setPhase(2)
            } else {
                // Click empty space -> Back to phase 0
                // Wait, the UI prompt implies phase 1 has the white rectangle in the middle.
                // We shouldn't necessarily go back unless desired, but why not.
                currentPhase = 0
                setPhase(0)
            }
        } else if (currentPhase === 2) {
            const hits = raycaster.intersectObjects(galleryMeshes)
            if (hits.length > 0) {
                // Clicked a gallery picture -> navigate
                router.push(`/projects/${hits[0].object.userData.slug}`)
            } else {
                // Click empty space -> back to phase 1
                currentPhase = 1
                setPhase(1)
            }
        }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)
    window.addEventListener('resize', () => {
        camera.aspect = el.clientWidth / el.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(el.clientWidth, el.clientHeight)
    })

    const clock = new THREE.Clock()

    const animate = () => {
        requestAnimationFrame(animate)
        const time = clock.getElapsedTime()
        const delta = Math.min(clock.getDelta(), 0.1) // limit delta

        // Phase 1 Transition (0 <-> 1)
        const targetTP = currentPhase >= 1 ? 1 : 0
        transitionProgress += (targetTP - transitionProgress) * 0.02 // Very slow zoom/expansion

        // Phase 2 Transition (1 <-> 2)
        const targetRotP = currentPhase === 2 ? 1 : 0
        rotTransitionProgress += (targetRotP - rotTransitionProgress) * 0.03

        // Animate Instanced Dots (Explode)
        let instIdx = 0
        for (let i = 0; i < DOT_COUNT; i++) {
            const origPt = points[i]
            
            const expX = explodedTargets[i * 3]
            const expY = explodedTargets[i * 3 + 1]
            const expZ = explodedTargets[i * 3 + 2]

            // When rotTransitionProgress > 0 (Phase 2), we also let them scatter further or stay.
            
            dummy.position.set(
                THREE.MathUtils.lerp(origPt.x, expX, transitionProgress),
                THREE.MathUtils.lerp(origPt.y, expY, transitionProgress),
                THREE.MathUtils.lerp(origPt.z, expZ, transitionProgress)
            )
            
            // Fade out effect by scaling down as they explode, giving a stardust look
            const scale = THREE.MathUtils.lerp(1, 0.2, transitionProgress)
            dummy.scale.setScalar(scale)
            
            if (currentPhase === 0) {
                dummy.lookAt(0,0,0) // Face center to look like a solid sphere
            }
            
            dummy.updateMatrix()
            instancedDots.setMatrixAt(instIdx, dummy.matrix)
            instIdx++
        }
        instancedDots.instanceMatrix.needsUpdate = true

        // Rotate the sphere slowly when in Phase 0
        if (currentPhase === 0) {
            instancedDots.rotation.y = time * 0.1
            instancedDots.rotation.x = time * 0.05
        } else {
            // Slow down the chaotic spin
            instancedDots.rotation.y += delta * 0.01 * (1 - transitionProgress)
        }

        // Parallax for camera mouse movement in Phase 0 & 1
        if (currentPhase === 0 || currentPhase === 1) {
            const targetCamX = mouse.x * 0.5
            const targetCamY = mouse.y * 0.5
            cameraGroup.position.x += (targetCamX - cameraGroup.position.x) * 0.05
            cameraGroup.position.y += (targetCamY - cameraGroup.position.y) * 0.05
        }

        // Camera Zoom & Rotate
        const targetZ = currentPhase === 0 ? 15 : 7
        cameraZ += (targetZ - cameraZ) * 0.02
        camera.position.z = cameraZ

        // 180 Rotation for Phase 2
        const currentRot = cameraGroup.rotation.y
        const targetRot = rotTransitionProgress * Math.PI
        cameraGroup.rotation.y += (targetRot - currentRot) * 0.05

        // Animate Flying Frames (Phase 1)
        flyingMeshes.forEach((mesh, idx) => {
            const group = mesh.userData.parentGroup
            const data = flyingData[idx]
            
            // Orbiting math
            data.angleY += delta * data.speed
            data.angleX += delta * data.speed * 0.5
            
            const r = data.radius
            const cx = Math.cos(data.angleY) * r
            const cz = Math.sin(data.angleY) * r
            const cy = Math.sin(data.angleX) * (r * 0.5)

            group.position.set(cx, cy, cz)
            group.lookAt(cameraGroup.position) // Always face the general camera area

            // Scale logic: scale up in Phase 1, shrink in Phase 0 or 2
            const targetScale = currentPhase === 1 ? 0.8 : 0.001
            group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
        })

        // Animate Gallery Frames (Phase 2)
        galleryMeshes.forEach(mesh => {
            const group = mesh.userData.parentGroup
            const targetScale = currentPhase === 2 ? 1.0 : 0.001
            
            // We use lerp inside mouse handler for hover, so here only enforce base scale if not hovered.
            if (hoveredText !== mesh.userData.title) {
                group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
            }
        })

        // Return to perfectly framed view for Phase 2
        if (currentPhase === 2) {
            cameraGroup.position.lerp(new THREE.Vector3(0, 0, 0), 0.05)
        }

        renderer.render(scene, camera)
    }

    animate()

    return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('click', onClick)
        renderer.dispose()
        if (el.contains(renderer.domElement)) {
            el.removeChild(renderer.domElement)
        }
    }
  }, [projects, router, hoveredText]) // include deps but carefully

  return (
    <>
      <div ref={mountRef} className="w-full h-screen absolute inset-0 z-0 bg-[#0A0A0A]" />
      
      {/* ───────────────────────────────────────────────────────────────────────
          PHASE 0: Hovering Hint (Click sphere to zoom)
      ──────────────────────────────────────────────────────────────────────── */}
      <div 
        className={`absolute bottom-12 left-0 right-0 z-10 flex justify-center pointer-events-none transition-opacity duration-1000 delay-500
        ${phase === 0 ? 'opacity-100' : 'opacity-0'}`}
      >
          <div className="flex flex-col items-center gap-3">
              <div className="w-px h-8 bg-white/30 animate-pulse" />
              <p className="text-[10px] lowercase tracking-[0.3em] font-mono text-white/50 bg-black/50 px-4 py-2 rounded-full border border-white/10">
                  click the sphere to enter
              </p>
          </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          PHASE 1: Slow white rectangle overlay with main contact/about links
      ──────────────────────────────────────────────────────────────────────── */}
      <div 
        className={`fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-all duration-[2000ms] ease-out
        ${phase === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div 
          className={`pointer-events-auto flex flex-col items-center bg-white w-full max-w-[400px] py-16 px-8 rounded border border-white/20 shadow-2xl transition-transform duration-[2000ms] ease-out
          ${phase === 1 ? 'translate-y-0' : 'translate-y-12'}`}
        >
            <div className="w-12 h-12 border border-carbon flex items-center justify-center mb-6">
                <span className="text-[14px] font-bold tracking-wider text-carbon">ES</span>
            </div>
            
            <h1 className="font-sans font-semibold text-3xl text-carbon tracking-tight mb-2">Eren Sezer</h1>
            <p className="text-xs text-slate font-mono mb-12">Architecture · Space · Technology</p>

            <div className="flex flex-col gap-6 w-full text-center">
                <button onClick={() => router.push('/about')} className="text-xs tracking-[0.2em] uppercase text-carbon hover:text-[#00C2FF] transition-colors">About Me</button>
                <div className="w-full h-px bg-[#eee]" />
                <button onClick={() => router.push('/awards')} className="text-xs tracking-[0.2em] uppercase text-carbon hover:text-[#00C2FF] transition-colors">Awards</button>
                <div className="w-full h-px bg-[#eee]" />
                <button onClick={() => router.push('/publications')} className="text-xs tracking-[0.2em] uppercase text-carbon hover:text-[#00C2FF] transition-colors">Publications</button>
                <div className="w-full h-px bg-[#eee]" />
                <button onClick={() => router.push('/contact')} className="text-xs tracking-[0.2em] uppercase text-carbon hover:text-[#00C2FF] transition-colors">Contact</button>
            </div>
        </div>

        {/* Floating tooltip for the hovering pictures in Phase 1 */}
        {phase === 1 && hoveredText && (
            <div className="absolute top-[20%] text-center animate-fade-in pointer-events-none z-20 mix-blend-difference">
                <p className="text-white text-3xl font-light tracking-tight">{hoveredText}</p>
                <p className="text-white/50 text-xs font-mono uppercase tracking-[0.2em] mt-2">Click to enter gallery</p>
            </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          PHASE 2: Gallery Overlay Hint (Back button / hover title)
      ──────────────────────────────────────────────────────────────────────── */}
      {phase === 2 && (
          <>
            <button 
                onClick={() => setPhase(1)} 
                className="absolute top-8 left-8 z-20 text-[10px] font-mono tracking-widest uppercase text-white/50 hover:text-white transition-colors py-2 px-4 border border-white/20 rounded-full hover:bg-white/10"
            >
                ← Back to Main
            </button>

            {hoveredText && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none animate-fade-in z-20">
                    <p className="text-white text-lg font-medium bg-black/60 backdrop-blur px-6 py-2 border border-white/10 shadow-xl rounded-full">
                        {hoveredText} — <span className="text-white/50 text-sm font-light">View Project</span>
                    </p>
                </div>
            )}
          </>
      )}
    </>
  )
}
