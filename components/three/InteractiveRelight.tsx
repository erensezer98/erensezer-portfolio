'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// --- Types ---
type NodeType = { x: number; z: number }

interface ObstacleData {
  x: number
  z: number
  type: 'car' | 'window' | 'furniture'
}

export default function InteractiveRelight() {
  const mountRef = useRef<HTMLDivElement>(null)
  
  // Simulation State
  const [neighborhood, setNeighborhood] = useState<'dolapdere' | 'goztepe'>('dolapdere')
  const [destination, setDestination] = useState<'north' | 'east' | 'south'>('north')
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showBoxes, setShowBoxes] = useState(true)
  const [status, setStatus] = useState('Initializing...')
  const [pathLength, setPathLength] = useState(0)

  // Constants
  const gridSize = 30
  const startNode = useMemo(() => ({ x: 15, z: 15 }), [])

  // Simulation Refs
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cityGroupRef = useRef<THREE.Group>(new THREE.Group())
  const obstacleGroupRef = useRef<THREE.Group>(new THREE.Group())
  const gridRef = useRef<number[][]>([])
  const riskMapRef = useRef<number[][]>([])
  const obstaclesRef = useRef<ObstacleData[]>([])
  const pathLineRef = useRef<THREE.Line | null>(null)

  const getRiskColor = useCallback((score: number, heatmapEnabled: boolean) => {
    if (!heatmapEnabled) return 0x223344
    if (score > 15) return 0xff0000 
    if (score > 8) return 0xcc4400  
    if (score > 4) return 0xccaa00  
    return 0x004433 
  }, [])

  const calculatePath = useCallback((type: string, end: NodeType) => {
    if (pathLineRef.current && sceneRef.current) {
      sceneRef.current.remove(pathLineRef.current)
      pathLineRef.current.geometry.dispose()
      if (Array.isArray(pathLineRef.current.material)) {
        pathLineRef.current.material.forEach(m => m.dispose())
      } else {
        pathLineRef.current.material.dispose()
      }
    }

    const queue = [startNode]
    const cameFrom = new Map<string, string | null>()
    cameFrom.set(`${startNode.x},${startNode.z}`, null)
    let targetNode: NodeType | null = null

    const isDolapdere = type === 'dolapdere'
    const riskTolerance = isDolapdere ? 15 : 5

    while (queue.length > 0) {
      const curr = queue.shift()!
      if (curr.x === end.x && curr.z === end.z) {
        targetNode = curr
        break
      }

      const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
      for (const [dx, dz] of dirs) {
        const nx = curr.x + dx
        const nz = curr.z + dz
        if (nx >= 0 && nx < gridSize && nz >= 0 && nz < gridSize) {
          if (gridRef.current[nx][nz] === 0 && riskMapRef.current[nx][nz] < riskTolerance) {
            const str = `${nx},${nz}`
            if (!cameFrom.has(str)) {
              cameFrom.set(str, `${curr.x},${curr.z}`)
              queue.push({ x: nx, z: nz })
            }
          }
        }
      }
    }

    if (targetNode && sceneRef.current) {
      const points: THREE.Vector3[] = []
      let currStr: string | null = `${end.x},${end.z}`
      while (currStr) {
        const [px, pz] = currStr.split(',').map(Number)
        points.push(new THREE.Vector3(px, 0.2, pz))
        currStr = cameFrom.get(currStr) || null
      }
      
      setPathLength(points.length)
      const geo = new THREE.BufferGeometry().setFromPoints(points.reverse())
      const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
      const line = new THREE.Line(geo, mat)
      pathLineRef.current = line
      sceneRef.current.add(line)
      setStatus(isDolapdere ? 'Route found (High Compromise)' : 'Safe Route Clear')
    } else {
      setPathLength(0)
      setStatus('FATAL: NO SAFE ROUTE FOUND!')
    }
  }, [startNode])

  const renderObstacles = useCallback((boxesEnabled: boolean) => {
    const group = obstacleGroupRef.current
    while (group.children.length > 0) {
      const obj = group.children[0]
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      } else if (obj instanceof THREE.BoxHelper) {
         obj.geometry.dispose()
         if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
         else obj.material.dispose()
      }
      group.remove(obj)
    }

    obstaclesRef.current.forEach(obs => {
      let geo: THREE.BufferGeometry, color: number, isElevated = false
      if (obs.type === 'car') {
        geo = new THREE.BoxGeometry(0.6, 0.4, 0.8)
        color = 0xff3333
      } else if (obs.type === 'window') {
        geo = new THREE.BoxGeometry(0.4, 0.4, 0.4)
        color = 0xffaa00
        isElevated = true
      } else {
        geo = new THREE.CylinderGeometry(0.1, 0.1, 0.6)
        color = 0xffff00
      }

      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
      const mesh = new THREE.Mesh(geo, mat)
      const yPos = isElevated ? 1.5 : (obs.type === 'car' ? 0.2 : 0.3)
      mesh.position.set(obs.x, yPos, obs.z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)

      if (boxesEnabled) {
        const box = new THREE.BoxHelper(mesh, color)
        group.add(box)
      }
    })
  }, [])

  const generateCity = useCallback(() => {
    if (!sceneRef.current) return

    const city = cityGroupRef.current
    while (city.children.length > 0) {
      const obj = city.children[0]
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
        else obj.material.dispose()
      }
      city.remove(obj)
    }

    const isDolapdere = neighborhood === 'dolapdere'
    gridRef.current = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0))
    riskMapRef.current = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0))
    
    const blockSize = isDolapdere ? 2 : 5
    const streetWidth = isDolapdere ? 1 : 3
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x151b22, roughness: 0.8 })

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        if (x % (blockSize + streetWidth) >= streetWidth && z % (blockSize + streetWidth) >= streetWidth) {
          gridRef.current[x][z] = 1
          const height = isDolapdere ? Math.random() * 6 + 2 : Math.random() * 3 + 1
          const bGeo = new THREE.BoxGeometry(0.95, height, 0.95)
          const bMesh = new THREE.Mesh(bGeo, buildingMat)
          bMesh.position.set(x, height / 2, z)
          bMesh.castShadow = true
          bMesh.receiveShadow = true
          city.add(bMesh)
        }
      }
    }

    let end = { x: 15, z: 0 }
    if (destination === 'east') end = { x: 29, z: 15 }
    if (destination === 'south') end = { x: 15, z: 29 }
    
    gridRef.current[startNode.x][startNode.z] = 0
    gridRef.current[end.x][end.z] = 0

    const obstacles: ObstacleData[] = []
    const count = isDolapdere ? 110 : 8
    for (let i = 0; i < count; i++) {
      let ox, oz, attempts = 0
      do {
        ox = Math.floor(Math.random() * gridSize)
        oz = Math.floor(Math.random() * gridSize)
        attempts++
      } while ((gridRef.current[ox][oz] === 1 || (ox === startNode.x && oz === startNode.z) || (ox === end.x && oz === end.z)) && attempts < 100)

      if (attempts < 100) {
        const r = Math.random()
        const obsType: 'furniture' | 'window' | 'car' = r > 0.8 ? 'furniture' : (r > 0.5 ? 'window' : 'car')
        obstacles.push({ x: ox, z: oz, type: obsType })
      }
    }
    obstaclesRef.current = obstacles

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        if (gridRef.current[x][z] === 0) {
          let score = isDolapdere ? 6 : 0
          obstacles.forEach(obs => {
            const dist = Math.abs(obs.x - x) + Math.abs(obs.z - z)
            if (dist === 0) {
              score += obs.type === 'car' ? 20 : (obs.type === 'window' ? 10 : 4)
            } else if (dist <= 2) {
              score += isDolapdere ? 4 : 1
            }
          })
          riskMapRef.current[x][z] = score
        }
      }
    }

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        if (gridRef.current[x][z] === 0) {
          const sGeo = new THREE.PlaneGeometry(0.95, 0.95)
          const sMat = new THREE.MeshStandardMaterial({ 
            color: getRiskColor(riskMapRef.current[x][z], showHeatmap),
            roughness: 0.9 
          })
          const sMesh = new THREE.Mesh(sGeo, sMat)
          sMesh.rotation.x = -Math.PI / 2
          sMesh.position.set(x, 0.01, z)
          sMesh.receiveShadow = true
          city.add(sMesh)
        }
      }
    }

    renderObstacles(showBoxes)
    calculatePath(neighborhood, end)
  }, [neighborhood, destination, showHeatmap, showBoxes, getRiskColor, renderObstacles, calculatePath, startNode])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const currentScene = new THREE.Scene()
    sceneRef.current = currentScene
    currentScene.background = new THREE.Color(0x020205)
    currentScene.fog = new THREE.FogExp2(0x020205, 0.02)

    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(15, 25, 30)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(15, 0, 15)
    controls.maxPolarAngle = Math.PI / 2 - 0.1
    controls.update()

    currentScene.add(new THREE.AmbientLight(0x111122, 0.5))
    
    const spotLight = new THREE.SpotLight(0xffffff, 2)
    spotLight.angle = Math.PI / 8
    spotLight.penumbra = 0.5
    spotLight.decay = 1.5
    spotLight.distance = 50
    spotLight.castShadow = true
    currentScene.add(spotLight)
    currentScene.add(spotLight.target)

    const groundGeo = new THREE.PlaneGeometry(200, 200)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 1 })
    const groundMesh = new THREE.Mesh(groundGeo, groundMat)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.receiveShadow = true
    currentScene.add(groundMesh)

    currentScene.add(cityGroupRef.current)
    currentScene.add(obstacleGroupRef.current)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(groundMesh)
      
      if (intersects.length > 0) {
        const p = intersects[0].point
        spotLight.position.set(p.x, 15, p.z + 5)
        spotLight.target.position.copy(p)
      }
    }
    el.addEventListener('mousemove', onMouseMove)

    // Manual initial call since deps aren't in this effect
    // But we use the reactive effect below for subsequent updates.

    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(currentScene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      el.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
    }
  }, []) // Initial mount

  // Proper reactive update
  useEffect(() => {
    generateCity()
  }, [neighborhood, destination, showHeatmap, showBoxes, generateCity])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#020205] font-sans">
      <div ref={mountRef} className="h-full w-full" />

      {/* UI Panel */}
      <div className="absolute top-5 left-5 w-80 bg-[#0f1419]/90 p-5 border border-[#334455] rounded-lg text-[#e0e0e0] shadow-2xl z-[100] backdrop-blur-md pointer-events-auto">
        <h1 className="m-0 mb-1 text-lg text-white uppercase tracking-wider font-bold">Command Center</h1>
        <p className="m-0 mb-5 text-[11px] text-[#8899aa]">Evacuation Risk Assessment Tool</p>

        <div className="mb-4">
          <label className="block text-[12px] mb-1 text-[#aabbcc]">Urban Topology Scenario:</label>
          <select 
            className="w-full bg-[#223344] text-white border border-[#445566] p-2 rounded cursor-pointer hover:border-[#00ffcc] outline-none"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value as 'dolapdere' | 'goztepe')}
          >
            <option value="dolapdere">Dolapdere (Dense / High Danger)</option>
            <option value="goztepe">Göztepe (Planned / Safe Route)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-[12px] mb-1 text-[#aabbcc]">Evacuation Destination (Safe Zone):</label>
          <select 
            className="w-full bg-[#223344] text-white border border-[#445566] p-2 rounded cursor-pointer hover:border-[#00ffcc] outline-none"
            value={destination}
            onChange={(e) => setDestination(e.target.value as 'north' | 'east' | 'south')}
          >
            <option value="north">North Highway Exit</option>
            <option value="east">East Bosphorus Pier</option>
            <option value="south">South Gathering Area</option>
          </select>
        </div>

        <div className="flex items-center mb-2 cursor-pointer group">
          <input 
            type="checkbox" 
            id="toggle-heatmap" 
            className="mr-2 cursor-pointer accent-[#00ffcc]"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          <label htmlFor="toggle-heatmap" className="text-[12px] text-[#aabbcc] cursor-pointer group-hover:text-white transition-colors">Show Total Risk Heatmap</label>
        </div>

        <div className="flex items-center mb-4 cursor-pointer group">
          <input 
            type="checkbox" 
            id="toggle-boxes" 
            className="mr-2 cursor-pointer accent-[#00ffcc]"
            checked={showBoxes}
            onChange={(e) => setShowBoxes(e.target.checked)}
          />
          <label htmlFor="toggle-boxes" className="text-[12px] text-[#aabbcc] cursor-pointer group-hover:text-white transition-colors">Highlight YOLO Detections</label>
        </div>

        <div className={`mt-5 pt-4 border-t border-[#334455] text-[12px] font-mono leading-tight ${status.includes('FATAL') ? 'text-red-500' : 'text-[#00ffcc]'}`}>
          {status}
          {pathLength > 0 && <span className="block mt-1 text-white/50">Path Length: {pathLength}m</span>}
        </div>

        <div className="mt-4 text-[11px] text-[#8899aa]">
          <div className="font-bold mb-2 text-white/20 uppercase tracking-tighter">YOLO Classifications:</div>
          <div className="flex items-center mb-1"><span className="w-3 h-3 mr-2 bg-[#ff3333] rounded-sm"></span> Parked Car (High Blockage Risk)</div>
          <div className="flex items-center mb-1"><span className="w-3 h-3 mr-2 bg-[#ffaa00] rounded-sm"></span> Bay Window (Falling Debris)</div>
          <div className="flex items-center mb-1"><span className="w-3 h-3 mr-2 bg-[#ffff00] rounded-sm"></span> Street Furniture (Minor)</div>
        </div>
      </div>
    </div>
  )
}
