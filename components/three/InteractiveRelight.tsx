'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ─── Scene & Camera ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const w = el.clientWidth
    const h = el.clientHeight
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 1000)
    camera.position.set(0, 4, 6)
    camera.lookAt(0, 1, 0)

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
    const pointLight = new THREE.PointLight(0xffffff, 60, 50)
    pointLight.position.set(0, 2, 0)
    pointLight.castShadow = true
    pointLight.shadow.bias = -0.001
    pointLight.shadow.mapSize.width = 1024
    pointLight.shadow.mapSize.height = 1024
    scene.add(pointLight)

    // ─── Dark matte material (same as original) ───────────────────────────────
    const material = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2,
    })

    // ─── Road material — low emissive glow ───────────────────────────────────
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.0,
      emissive: new THREE.Color(0x333333),
      emissiveIntensity: 0.25,
    })

    // ─── Base plane that receives shadows ─────────────────────────────────────
    const planeGeo = new THREE.PlaneGeometry(30, 30)
    const planeMenu = new THREE.Mesh(planeGeo, material)
    planeMenu.rotation.x = -Math.PI / 2
    planeMenu.position.y = -0.5
    planeMenu.receiveShadow = true
    scene.add(planeMenu)

    // ─── Group (for slow rotation animation) ──────────────────────────────────
    const group = new THREE.Group()
    scene.add(group)

    // ─── Catch plane for mouse → light position ───────────────────────────────
    // Will be updated after model loads; default at y=2
    const catchPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2)

    // ─── Load GLB ─────────────────────────────────────────────────────────────
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    loader.load(
      '/models/awayout.glb',
      (gltf) => {
        const model = gltf.scene

        // First pass: find the largest flat mesh (the road)
        let largestArea = 0
        let roadMesh: THREE.Mesh | null = null
        model.traverse((child) => {
          const asMesh = child as THREE.Mesh
          if (asMesh.isMesh) {
            asMesh.geometry.computeBoundingBox()
            const box = asMesh.geometry.boundingBox!
            const sx = box.max.x - box.min.x
            const sz = box.max.z - box.min.z
            const sy = box.max.y - box.min.y
            // Road is large in XZ and flat in Y
            const area = sx * sz
            if (area > largestArea && sy < Math.max(sx, sz) * 0.1) {
              largestArea = area
              roadMesh = asMesh
            }
          }
        })

        // Second pass: apply materials + shadows
        model.traverse((child) => {
          const asMesh = child as THREE.Mesh
          if (asMesh.isMesh) {
            const origMat = asMesh.material as THREE.MeshStandardMaterial
            const emissiveSum = (origMat?.emissive?.r ?? 0) + (origMat?.emissive?.g ?? 0) + (origMat?.emissive?.b ?? 0)
            const hasEmissive = emissiveSum > 0.3 && (origMat?.emissiveIntensity ?? 0) > 0.1
            if (hasEmissive) {
              origMat.roughness = Math.max(origMat.roughness ?? 0.9, 0.5)
              origMat.needsUpdate = true
            } else {
              asMesh.material = asMesh === roadMesh ? roadMaterial : material

            }
            if (!asMesh.geometry.boundingSphere) {
              asMesh.geometry.computeBoundingSphere()
            }
            asMesh.castShadow = true
            asMesh.receiveShadow = true
          }
        })

        // Auto-fit: center + scale to view
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 15 / maxDim

        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))

        // Sit flush on ground at y=-0.5 (matching base plane)
        const box2 = new THREE.Box3().setFromObject(model)
        model.position.y -= box2.min.y + 0.5

        group.add(model)

        // Set catch plane to mid-height of the fitted model
        const box3 = new THREE.Box3().setFromObject(model)
        const midY = (box3.min.y + box3.max.y) / 2
        catchPlane.constant = -midY
      },
      undefined,
      (err) => console.error('GLB load error:', err)
    )

    // ─── Interaction (Mouse tracking) ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

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
    const frustum = new THREE.Frustum()
    const projScreenMatrix = new THREE.Matrix4()
    const cullingSphere = new THREE.Sphere()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Very slow rotation of the entire group to keep it dynamic
      group.rotation.y = Math.sin(elapsed * 0.1) * 0.1

      // Smoothly move light towards target
      if (targetLightPos) {
        pointLight.position.lerp(targetLightPos, 0.1)
      }

      projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
      frustum.setFromProjectionMatrix(projScreenMatrix)
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh
          if (mesh.geometry.boundingSphere) {
            cullingSphere.copy(mesh.geometry.boundingSphere)
            cullingSphere.applyMatrix4(mesh.matrixWorld)
            mesh.visible = frustum.intersectsSphere(cullingSphere)
          }
        }
      })
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
