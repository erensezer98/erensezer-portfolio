'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

type TileEntry = {
  x: number
  z: number
}

type ObstacleEntry = {
  mesh: THREE.Mesh
  basePosition: THREE.Vector3
  center: THREE.Vector3
  influenceRadius: number
  material: THREE.MeshBasicMaterial
}

const TILE_GREEN = new THREE.Color(0x2f7a4f)
const TILE_HOT = new THREE.Color(0xd16a4b)
const OBJECT_IDLE = new THREE.Color(0xb9f0c5)
const OBJECT_HOT = new THREE.Color(0xffd0b2)

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [pressureLabel, setPressureLabel] = useState('waiting')
  const [nearbyLabel, setNearbyLabel] = useState('0 active objects')

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050505, 0.045)

    const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(0, 11.5, 16)
    camera.lookAt(0, 0.5, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    renderer.setClearColor(0x050505)
    el.appendChild(renderer.domElement)

    const modelGroup = new THREE.Group()
    scene.add(modelGroup)

    const tileGeometry = new THREE.BoxGeometry(0.95, 0.08, 0.95)
    const tileMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      vertexColors: true,
    })

    const tileEntries: TileEntry[] = []
    let tileMesh: THREE.InstancedMesh | null = null
    let modelBounds: THREE.Box3 | null = null
    let groundY = -0.5
    let modelLoaded = false

    const obstacleEntries: ObstacleEntry[] = []
    const materialsToDispose: THREE.Material[] = [tileMaterial]
    const geometriesToDispose: THREE.BufferGeometry[] = [tileGeometry]

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const targetMouse = new THREE.Vector2()
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5)
    const hoverPoint = new THREE.Vector3()
    const tempColor = new THREE.Color()
    const tempMatrix = new THREE.Matrix4()
    const tempQuaternion = new THREE.Quaternion()
    const tempScale = new THREE.Vector3()
    const activeObstacleCenters: Array<{ center: THREE.Vector3; strength: number }> = []

    loader.load(
      '/models/objects.glb',
      (gltf) => {
        const model = gltf.scene
        let roadMesh: THREE.Mesh | null = null
        let largestArea = 0

        model.traverse((child) => {
          const mesh = child as THREE.Mesh
          if (!mesh.isMesh) return
          mesh.geometry.computeBoundingBox()
          const box = mesh.geometry.boundingBox
          if (!box) return

          const sx = box.max.x - box.min.x
          const sy = box.max.y - box.min.y
          const sz = box.max.z - box.min.z
          const area = sx * sz

          if (area > largestArea && sy < Math.max(sx, sz) * 0.1) {
            largestArea = area
            roadMesh = mesh
          }
        })

        const overallBox = new THREE.Box3().setFromObject(model)
        const center = overallBox.getCenter(new THREE.Vector3())
        const size = overallBox.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 15 / maxDim

        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))

        const fittedBox = new THREE.Box3().setFromObject(model)
        model.position.y -= fittedBox.min.y + 0.5
        modelGroup.add(model)
        model.updateMatrixWorld(true)

        modelBounds = new THREE.Box3().setFromObject(model)
        groundY = modelBounds.min.y
        groundPlane.constant = -groundY

        model.traverse((child) => {
          const mesh = child as THREE.Mesh
          if (!mesh.isMesh) return

          geometriesToDispose.push(mesh.geometry)

          if (mesh === roadMesh) {
            mesh.visible = false
            return
          }

          const material = new THREE.MeshBasicMaterial({
            color: OBJECT_IDLE.clone(),
            wireframe: true,
            transparent: true,
            opacity: 0.8,
          })
          mesh.material = material
          materialsToDispose.push(material)

          const box = new THREE.Box3().setFromObject(mesh)
          const boxSize = box.getSize(new THREE.Vector3())
          if (boxSize.lengthSq() < 0.0001) return

          obstacleEntries.push({
            mesh,
            basePosition: mesh.position.clone(),
            center: box.getCenter(new THREE.Vector3()),
            influenceRadius: Math.max(boxSize.x, boxSize.z) * 0.4 + 0.28,
            material,
          })
        })

        if (modelBounds) {
          const tileSpacing = 0.95
          for (let x = modelBounds.min.x - 0.5; x <= modelBounds.max.x + 0.5; x += tileSpacing) {
            for (let z = modelBounds.min.z - 0.5; z <= modelBounds.max.z + 0.5; z += tileSpacing) {
              tileEntries.push({ x, z })
            }
          }

          tileMesh = new THREE.InstancedMesh(tileGeometry, tileMaterial, tileEntries.length)
          tileMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
          tileMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(tileEntries.length * 3), 3)

          tileEntries.forEach((tile, index) => {
            tempScale.set(0.92, 1, 0.92)
            tempMatrix.compose(
              new THREE.Vector3(tile.x, groundY + 0.04, tile.z),
              tempQuaternion,
              tempScale
            )
            tileMesh?.setMatrixAt(index, tempMatrix)
            tileMesh?.setColorAt(index, TILE_GREEN)
          })

          tileMesh.instanceMatrix.needsUpdate = true
          if (tileMesh.instanceColor) tileMesh.instanceColor.needsUpdate = true
          modelGroup.add(tileMesh)
        }

        modelLoaded = true
      },
      undefined,
      (error) => console.error('GLB load error:', error)
    )

    const onPointerMove = (event: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      targetMouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      targetMouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    }

    const onPointerLeave = () => {
      targetMouse.set(-100, -100)
    }

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }

    el.addEventListener('mousemove', onPointerMove)
    el.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('resize', onResize)

    let disposed = false
    let animationFrame = 0
    const clock = new THREE.Clock()
    let lastHudUpdate = performance.now()

    const animate = () => {
      if (disposed) return
      animationFrame = window.requestAnimationFrame(animate)

      const t = clock.getElapsedTime()
      mouse.lerp(targetMouse, 0.08)

      if (modelLoaded) {
        raycaster.setFromCamera(mouse, camera)
        const hit = new THREE.Vector3()
        if (raycaster.ray.intersectPlane(groundPlane, hit)) {
          if (modelBounds) {
            hoverPoint.x = THREE.MathUtils.clamp(hit.x, modelBounds.min.x, modelBounds.max.x)
            hoverPoint.z = THREE.MathUtils.clamp(hit.z, modelBounds.min.z, modelBounds.max.z)
          } else {
            hoverPoint.copy(hit)
          }
          hoverPoint.y = groundY
        }
      }

      activeObstacleCenters.length = 0
      let nearbyCount = 0
      let pressureSum = 0

      for (const obstacle of obstacleEntries) {
        const distance = Math.hypot(obstacle.center.x - hoverPoint.x, obstacle.center.z - hoverPoint.z)
        const rawInfluence = Math.max(0, 1 - distance / obstacle.influenceRadius)
        const influence = rawInfluence * rawInfluence * (3 - 2 * rawInfluence)

        if (influence > 0.02) {
          activeObstacleCenters.push({ center: obstacle.center, strength: influence })
          nearbyCount += 1
        }

        pressureSum += influence

        const lift = influence * 1.15
        obstacle.mesh.position.y = obstacle.basePosition.y + lift
        obstacle.material.color.copy(tempColor.copy(OBJECT_IDLE).lerp(OBJECT_HOT, influence))
        obstacle.material.opacity = 0.72 + influence * 0.22
      }

      if (tileMesh) {
        const currentTileMesh = tileMesh
        tileEntries.forEach((tile, index) => {
          let tileInfluence = 0

          for (const active of activeObstacleCenters) {
            const distance = Math.hypot(tile.x - active.center.x, tile.z - active.center.z)
            const spread = 1.2
            const raw = Math.max(0, 1 - distance / spread)
            tileInfluence = Math.max(tileInfluence, raw * active.strength)
          }

          const lift = tileInfluence * 0.8
          tempScale.set(0.92, 1 + tileInfluence * 7.5, 0.92)
          tempMatrix.compose(
            new THREE.Vector3(tile.x, groundY + 0.04 + lift * 0.5, tile.z),
            tempQuaternion,
            tempScale
          )
          currentTileMesh.setMatrixAt(index, tempMatrix)
          currentTileMesh.setColorAt(index, tempColor.copy(TILE_GREEN).lerp(TILE_HOT, tileInfluence))
        })

        currentTileMesh.instanceMatrix.needsUpdate = true
        if (currentTileMesh.instanceColor) currentTileMesh.instanceColor.needsUpdate = true
      }

      const normalizedPressure = THREE.MathUtils.clamp(pressureSum / 5.5, 0, 1)
      if (performance.now() - lastHudUpdate > 220) {
        if (normalizedPressure > 0.66) {
          setPressureLabel('high pressure')
        } else if (normalizedPressure > 0.28) {
          setPressureLabel('moderate pressure')
        } else {
          setPressureLabel('low pressure')
        }
        setNearbyLabel(`${nearbyCount} active objects`)
        lastHudUpdate = performance.now()
      }

      modelGroup.rotation.y = Math.sin(t * 0.05) * 0.15
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      el.removeEventListener('mousemove', onPointerMove)
      el.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('resize', onResize)

      dracoLoader.dispose()
      materialsToDispose.forEach((material) => material.dispose())
      geometriesToDispose.forEach((geometry) => geometry.dispose())
      renderer.dispose()

      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-4 top-4 z-10 bg-black/45 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
        <div>{pressureLabel}</div>
        <div className="mt-1 text-white/50">{nearbyLabel}</div>
      </div>
    </div>
  )
}
