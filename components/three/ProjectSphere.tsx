'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'

interface ProjectSphereProps {
  projects: Project[]
}

const SPHERE_RADIUS = 3.5
const DOT_COUNT = 300

export default function ProjectSphere({ projects }: ProjectSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // Scene setup
    const scene = new THREE.Scene()
    const w = el.clientWidth
    const h = el.clientHeight
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.set(0, 0, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xffffff, 0)
    el.appendChild(renderer.domElement)

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-9999, -9999)

    // Generate points on a sphere (Fibonacci lattice)
    const points: THREE.Vector3[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < DOT_COUNT; i++) {
        const y = 1 - (i / (DOT_COUNT - 1)) * 2
        const radius = Math.sqrt(1 - y * y)
        const theta = phi * i
        const x = Math.cos(theta) * radius
        const z = Math.sin(theta) * radius
        points.push(new THREE.Vector3(x, y, z).multiplyScalar(SPHERE_RADIUS))
    }

    // Material for dots
    const dotMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x9e8e7a, // Soft taupe
        transparent: true,
        opacity: 0.6
    })
    const dotGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.04)
    
    const instancedDots = new THREE.InstancedMesh(dotGeometry, dotMaterial, DOT_COUNT - projects.length)
    const dummy = new THREE.Object3D()

    // Store original targets for animation
    const targets = new Float32Array(DOT_COUNT * 3)
    // Expanded targets (scattered)
    const expandedTargets = new Float32Array(DOT_COUNT * 3)

    let instanceIdx = 0
    for (let i = projects.length; i < DOT_COUNT; i++) {
        const pt = points[i]
        
        targets[i * 3] = pt.x
        targets[i * 3 + 1] = pt.y
        targets[i * 3 + 2] = pt.z

        // Expanded outward target
        const exp = pt.clone().multiplyScalar(3 + Math.random() * 2)
        expandedTargets[i * 3] = exp.x
        expandedTargets[i * 3 + 1] = exp.y
        expandedTargets[i * 3 + 2] = exp.z

        dummy.position.copy(pt)
        dummy.lookAt(0,0,0)
        dummy.updateMatrix()
        instancedDots.setMatrixAt(instanceIdx, dummy.matrix)
        instanceIdx++
    }
    
    scene.add(instancedDots)

    // Project panels
    const textureLoader = new THREE.TextureLoader()
    const projectMeshes: THREE.Mesh[] = []
    
    const projectGroup = new THREE.Group()
    scene.add(projectGroup)

    const panelSize = 2.5
    const baseScale = 0.05 // when part of the sphere
    
    projects.forEach((proj, i) => {
        const pt = points[i]
        const geometry = new THREE.PlaneGeometry(panelSize, panelSize)
        
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        })

        if (proj.cover_image) {
            textureLoader.load(proj.cover_image, (tex) => {
                material.map = tex
                material.color.setHex(0xffffff)
                material.needsUpdate = true
            })
        } else {
            material.color.setHex(0xdddddd)
        }

        const mesh = new THREE.Mesh(geometry, material)
        
        mesh.userData = {
            id: proj.slug,
            title: proj.title,
            origPos: pt.clone(),
            origScale: baseScale,
            expPos: new THREE.Vector3(
                (i % 2 === 0 ? -1 : 1) * 3, 
                Math.floor(i / 2) * -3 + 1.5, 
                2
            ),
            expScale: 1.0,
            isProject: true,
            slug: proj.slug
        }

        mesh.position.copy(pt)
        mesh.scale.setScalar(baseScale)
        mesh.lookAt(0,0,0)
        
        projectGroup.add(mesh)
        projectMeshes.push(mesh)
    })

    // Animation state
    let isExpanded = false
    let transitionProgress = 0
    let targetX = 0
    let targetY = 0

    // Interaction
    const onMouseMove = (e: MouseEvent) => {
        const bounds = el.getBoundingClientRect()
        mouse.x = ((e.clientX - bounds.left) / w) * 2 - 1
        mouse.y = -((e.clientY - bounds.top) / h) * 2 + 1

        if (!isExpanded) {
            targetX = mouse.x * 0.5
            targetY = mouse.y * 0.5
        } else {
            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(projectMeshes)
            if (intersects.length > 0) {
                document.body.style.cursor = 'pointer'
                setHoveredProject(intersects[0].object.userData.title)
            } else {
                document.body.style.cursor = 'default'
                setHoveredProject(null)
            }
        }
    }

    const onClick = () => {
        if (!isExpanded) {
            isExpanded = true
            setExpanded(true)
            document.body.style.cursor = 'default'
        } else {
            // Check if clicked on a project
            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(projectMeshes)
            if (intersects.length > 0) {
                const slug = intersects[0].object.userData.slug
                router.push(`/projects/${slug}`)
            } else {
                // Clicked outside, collapse back
                isExpanded = false
                setExpanded(false)
                setHoveredProject(null)
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
        const delta = clock.getDelta()

        // Transition progress
        if (isExpanded && transitionProgress < 1) {
            transitionProgress += delta * 1.5
            if (transitionProgress > 1) transitionProgress = 1
        } else if (!isExpanded && transitionProgress > 0) {
            transitionProgress -= delta * 1.5
            if (transitionProgress < 0) transitionProgress = 0
        }

        const ease = 1 - Math.pow(1 - transitionProgress, 3)

        // Animate Instanced Dots
        let instIdx = 0
        for (let i = projects.length; i < DOT_COUNT; i++) {
            const origX = targets[i * 3]
            const origY = targets[i * 3 + 1]
            const origZ = targets[i * 3 + 2]
            
            const expX = expandedTargets[i * 3]
            const expY = expandedTargets[i * 3 + 1]
            const expZ = expandedTargets[i * 3 + 2]

            dummy.position.set(
                THREE.MathUtils.lerp(origX, expX, ease),
                THREE.MathUtils.lerp(origY, expY, ease),
                THREE.MathUtils.lerp(origZ, expZ, ease)
            )
            
            // Fade out effect by scaling down
            const scale = THREE.MathUtils.lerp(1, 0.01, ease)
            dummy.scale.setScalar(scale)
            
            if (!isExpanded) {
                dummy.lookAt(0,0,0)
            }
            
            dummy.updateMatrix()
            instancedDots.setMatrixAt(instIdx, dummy.matrix)
            instIdx++
        }
        instancedDots.instanceMatrix.needsUpdate = true

        // Animate Project Panels
        projectMeshes.forEach(mesh => {
            const ud = mesh.userData
            
            mesh.position.lerpVectors(ud.origPos, ud.expPos, ease)
            
            const scale = THREE.MathUtils.lerp(ud.origScale, ud.expScale, ease)
            mesh.scale.setScalar(scale)

            // Rotation transition
            const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))
            const origQuat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(ud.origPos, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0)))
            
            mesh.quaternion.slerpQuaternions(origQuat, targetQuat, ease)
            
            // Hover effect in expanded mode
            if (isExpanded && transitionProgress === 1) {
                if (hoveredProject === ud.title) {
                    mesh.scale.setScalar(ud.expScale * 1.05)
                } else {
                    mesh.scale.setScalar(ud.expScale)
                }
            }
        })

        // Base rotation
        if (!isExpanded) {
            scene.rotation.y += delta * 0.1
            scene.rotation.x += (targetY - scene.rotation.x) * 0.05
            scene.rotation.y += (targetX - scene.rotation.y) * 0.05
        } else {
            // Return to center
            scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, 0, 0.05)
            scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, Math.PI * 0.0, 0.05) // Keep a specific angle if desired, or 0
        }

        renderer.render(scene, camera)
    }

    animate()

    return () => {
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('click', onClick)
        renderer.dispose()
        el.removeChild(renderer.domElement)
    }
  }, [projects, router, hoveredProject])

  return (
    <>
      <div ref={mountRef} className="w-full h-screen absolute inset-0 z-0 bg-[#F9F9F8]" />
      
      {/* Central Overlay */}
      <div 
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000 ${expanded ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className={`pointer-events-auto flex flex-col items-center gap-6 p-8 bg-white/70 backdrop-blur-md border border-[#eee] rounded-xl shadow-sm transition-transform duration-1000 ${expanded ? 'translate-y-0' : 'translate-y-10'}`}>
            <h1 className="font-serif text-3xl text-carbon tracking-tight mb-2">EREN SEZER</h1>
            <div className="flex gap-6">
                <button onClick={() => router.push('/about')} className="text-xs uppercase tracking-widest text-[#7a7a7a] hover:text-carbon transition-colors">About</button>
                <button onClick={() => router.push('/awards')} className="text-xs uppercase tracking-widest text-[#7a7a7a] hover:text-carbon transition-colors">Awards</button>
                <button onClick={() => router.push('/publications')} className="text-xs uppercase tracking-widest text-[#7a7a7a] hover:text-carbon transition-colors">Publications</button>
                <button onClick={() => router.push('/contact')} className="text-xs uppercase tracking-widest text-[#7a7a7a] hover:text-carbon transition-colors">Contact</button>
            </div>
            
            {hoveredProject && (
                <div className="mt-8 text-center animate-fade-in">
                    <p className="text-[10px] uppercase tracking-widest text-[#a39171] mb-1">View Project</p>
                    <p className="text-xl font-medium text-carbon">{hoveredProject}</p>
                </div>
            )}
            
            {!hoveredProject && (
                <div className="mt-8 text-center opacity-50">
                    <p className="text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Explore</p>
                    <p className="text-sm font-medium text-transparent">Select a project</p>
                </div>
            )}
        </div>
      </div>
      
      {/* Initial Instruction */}
      {!expanded && (
          <div className="absolute bottom-12 left-0 right-0 z-10 flex justify-center pointer-events-none animate-fade-in">
              <p className="text-xs uppercase tracking-widest text-[#a39171] bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-[#eee]">
                  Click sphere to explore
              </p>
          </div>
      )}
    </>
  )
}
