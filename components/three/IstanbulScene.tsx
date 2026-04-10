'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Status = 'CLEAR' | 'CONSTRAINED' | 'BLOCKED'

interface SimParams {
  scenario: 'Pre-Earthquake' | 'Post-Earthquake'
  streetWidth: number
  obstacleDensity: number
  overhangSize: number
}

const DEFAULT_PARAMS: SimParams = {
  scenario: 'Post-Earthquake',
  streetWidth: 20,
  obstacleDensity: 20,
  overhangSize: 3,
}

export default function IstanbulScene() {
  const rootRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS)
  const [riskScore, setRiskScore] = useState(0)
  const [status, setStatus] = useState<Status>('CLEAR')

  // Measure outer aspect-ratio container height
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const outer = root.parentElement
    if (!outer) return
    const update = () => {
      const h = outer.getBoundingClientRect().height
      if (h > 0) setHeight(h)
    }
    const ro = new ResizeObserver(update)
    ro.observe(outer)
    update()
    return () => ro.disconnect()
  }, [])

  // Three.js scene
  useEffect(() => {
    if (height === 0) return
    const container = containerRef.current
    if (!container) return

    const W = container.clientWidth || window.innerWidth
    const H = height

    // Materials
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x111111 })
    const buildingMat = new THREE.MeshBasicMaterial({ color: 0x444455, wireframe: true, transparent: true, opacity: 0.6 })
    const obstacleMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true })
    const overhangMat = new THREE.MeshBasicMaterial({ color: 0xff3333, wireframe: true })
    const vehicleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050505, 0.012)

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setClearColor(0x050505)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Road + grid
    const road = new THREE.Mesh(new THREE.PlaneGeometry(100, 250), roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.y = -0.1
    scene.add(road)
    const grid = new THREE.GridHelper(200, 40, 0x222222, 0x111111)
    grid.position.y = -0.05
    scene.add(grid)

    // Vehicle
    const vehicle = new THREE.Group()
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 6), vehicleMat)
    body.position.y = 0.8
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 3), vehicleMat)
    cabin.position.set(0, 1.9, -0.5)
    vehicle.add(body, cabin)
    scene.add(vehicle)

    // Environment group
    const envGroup = new THREE.Group()
    scene.add(envGroup)

    // Helpers
    function makeObstacle() {
      const group = new THREE.Group()
      const type = Math.floor(Math.random() * 4)
      if (type === 0) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2, 4), obstacleMat)
        trunk.position.y = 1
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2, 4, 4), obstacleMat)
        leaves.position.y = 2.5
        group.add(trunk, leaves)
      } else if (type === 1) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 4), obstacleMat)
        pole.position.y = 2
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), obstacleMat)
        head.position.set(0, 4, 0.3)
        group.add(pole, head)
      } else if (type === 2) {
        const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 1, 6), obstacleMat)
        bin.position.y = 0.5
        group.add(bin)
      } else {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 0.8), obstacleMat)
        seat.position.y = 0.5
        const back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 0.2), obstacleMat)
        back.position.set(0, 0.9, -0.3)
        group.add(seat, back)
      }
      return group
    }

    function makeBuilding(x: number, z: number, bw: number, isPreEQ: boolean, ovSize: number) {
      const h = 15 + Math.random() * 20
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, h, 20), buildingMat)
      mesh.position.y = h / 2
      const grp = new THREE.Group()
      grp.position.set(x, 0, z)
      grp.add(mesh)
      if (ovSize > 0 && Math.random() > 0.3) {
        const ov = new THREE.Mesh(new THREE.BoxGeometry(ovSize, 5, 10), overhangMat)
        const dir = x > 0 ? -1 : 1
        if (isPreEQ) {
          ov.position.x = (bw / 2 * dir) + (ovSize / 2 * dir)
          ov.position.y = (h / 2) - 5
        } else {
          ov.position.x = (bw / 2 * dir) + (ovSize / 2 * dir) + (Math.random() * 2 * dir)
          ov.position.y = 2.5
          ov.rotation.z = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + Math.random() * 0.5)
          ov.rotation.x = (Math.random() - 0.5) * 0.5
        }
        grp.add(ov)
      }
      envGroup.add(grp)
    }

    function buildScene(p: SimParams) {
      while (envGroup.children.length > 0) envGroup.remove(envGroup.children[0])
      const bw = 20
      const roadLen = 200
      const sideOffset = p.streetWidth / 2 + bw / 2
      const isPreEQ = p.scenario === 'Pre-Earthquake'
      for (let z = -roadLen / 2; z < roadLen / 2; z += 22) {
        makeBuilding(-sideOffset, z, bw, isPreEQ, p.overhangSize)
        makeBuilding(sideOffset, z, bw, isPreEQ, p.overhangSize)
      }
      const widthRisk = Math.max(0, 40 - p.streetWidth) * 1.5
      const obstRisk = p.obstacleDensity * 2
      const ovRisk = p.overhangSize * 4
      const total = isPreEQ ? 0 : Math.min(100, Math.floor(widthRisk + obstRisk + ovRisk))
      const st: Status = total >= 80 ? 'BLOCKED' : total >= 40 ? 'CONSTRAINED' : 'CLEAR'
      setRiskScore(total)
      setStatus(st)
      for (let i = 0; i < p.obstacleDensity; i++) {
        const obs = makeObstacle()
        if (isPreEQ) {
          const edge = p.streetWidth / 2 - 1.5
          obs.position.x = i % 2 === 0 ? edge : -edge
          obs.position.z = (Math.random() * 2 - 1) * (roadLen / 2)
          obs.rotation.y = i % 2 === 0 ? 0 : Math.PI
        } else if (st === 'BLOCKED' && i < 15) {
          obs.position.x = (Math.random() - 0.5) * p.streetWidth
          obs.position.z = 15 + (Math.random() - 0.5) * 6
          obs.rotation.y = Math.random() * Math.PI
          obs.rotation.z = (Math.random() - 0.5) * 0.5
        } else {
          const spread = st === 'CLEAR' ? p.streetWidth / 2 - 1 : p.streetWidth / 2
          obs.position.x = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * spread)
          obs.position.z = (Math.random() * 2 - 1) * (roadLen / 2)
          obs.rotation.y = Math.random() * Math.PI
        }
        envGroup.add(obs)
      }
      return st
    }

    let currentStatus: Status = buildScene(params)
    let vehicleZ = -100
    let animId = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      let targetX = 0
      let targetRotY = 0
      let speed = 0

      if (currentStatus === 'CLEAR') {
        speed = 0.6
      } else if (currentStatus === 'CONSTRAINED') {
        const amp = Math.min(params.streetWidth / 3.5, 4)
        targetX = Math.sin(vehicleZ * 0.15) * amp
        targetRotY = Math.cos(vehicleZ * 0.15) * 0.2
        speed = 0.4
      } else {
        if (vehicleZ < 3) {
          targetX = Math.sin(vehicleZ * 0.1) * 1.5
          targetRotY = Math.cos(vehicleZ * 0.1) * 0.1
          speed = 0.3
        } else {
          targetX = vehicle.position.x
          speed = 0
          vehicle.position.x += (Math.random() - 0.5) * 0.05
        }
      }

      vehicle.position.x += (targetX - vehicle.position.x) * 0.1
      vehicle.rotation.y += (targetRotY - vehicle.rotation.y) * 0.1
      vehicleZ += speed
      if (vehicleZ > 100) vehicleZ = -100
      vehicle.position.z = vehicleZ

      camera.position.x = Math.sin(Date.now() * 0.001) * 10
      camera.position.y = 15
      camera.position.z = vehicleZ + 35
      camera.lookAt(0, 0, vehicleZ - 15)
      renderer.render(scene, camera)
    }
    animate()

    // Listen for param changes via a custom event
    const onParamChange = (e: Event) => {
      const p = (e as CustomEvent<SimParams>).detail
      currentStatus = buildScene(p)
    }
    container.addEventListener('sim-params', onParamChange)

    return () => {
      cancelAnimationFrame(animId)
      container.removeEventListener('sim-params', onParamChange)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [height]) // eslint-disable-line react-hooks/exhaustive-deps

  // Dispatch param changes to the Three.js effect
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const event = new CustomEvent<SimParams>('sim-params', { detail: params })
    container.dispatchEvent(event)
  }, [params])

  const statusColor = status === 'CLEAR' ? '#00ffcc' : status === 'CONSTRAINED' ? '#ffaa00' : '#ff3333'
  const statusLabel =
    params.scenario === 'Pre-Earthquake'
      ? 'Status: NORMAL ACTIVITY'
      : status === 'CLEAR'
      ? 'Status: CLEAR PATH'
      : status === 'CONSTRAINED'
      ? 'Status: CONSTRAINED'
      : 'Status: PATH BLOCKED!'

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        height: height > 0 ? height : undefined,
        minHeight: height > 0 ? height : undefined,
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Left info panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          width: 270,
          background: 'rgba(10,10,10,0.9)',
          padding: '20px',
          border: '1px solid #333',
          borderLeft: `4px solid ${statusColor}`,
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          fontFamily: "'Courier New', Courier, monospace",
          color: '#e0e0e0',
          transition: 'border-left-color 0.3s',
        }}
      >
        <div style={{ fontSize: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#fff' }}>
          AI Spatial Analysis
        </div>
        <div style={{ marginBottom: 10, fontSize: 14, color: '#888' }}>Total Risk Score:</div>
        <div style={{ fontSize: 38, fontWeight: 'bold', color: statusColor, transition: 'color 0.3s' }}>
          {params.scenario === 'Pre-Earthquake' ? '--' : riskScore}
        </div>
        <div
          style={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginTop: 5,
            letterSpacing: 1,
            color: statusColor,
            transition: 'color 0.3s',
          }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Right controls panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          width: 220,
          background: 'rgba(10,10,10,0.9)',
          padding: '14px',
          border: '1px solid #333',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          fontFamily: "'Courier New', Courier, monospace",
          color: '#e0e0e0',
          fontSize: 11,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Scenario</div>
          <select
            value={params.scenario}
            onChange={(e) =>
              setParams((p) => ({ ...p, scenario: e.target.value as SimParams['scenario'] }))
            }
            style={{
              width: '100%',
              background: '#222',
              color: '#fff',
              border: '1px solid #444',
              padding: '4px 6px',
              fontFamily: 'inherit',
              fontSize: 11,
            }}
          >
            <option>Pre-Earthquake</option>
            <option>Post-Earthquake</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Street Width <span style={{ color: '#fff' }}>{params.streetWidth}</span>
          </div>
          <input
            type="range"
            min={10}
            max={40}
            value={params.streetWidth}
            onChange={(e) => setParams((p) => ({ ...p, streetWidth: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: '#fff' }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Obstacles <span style={{ color: '#fff' }}>{params.obstacleDensity}</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={params.obstacleDensity}
            onChange={(e) => setParams((p) => ({ ...p, obstacleDensity: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: '#fff' }}
          />
        </div>
        <div>
          <div style={{ color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            Overhang Size <span style={{ color: '#fff' }}>{params.overhangSize}</span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={0.1}
            value={params.overhangSize}
            onChange={(e) => setParams((p) => ({ ...p, overhangSize: Number(e.target.value) }))}
            style={{ width: '100%', accentColor: '#fff' }}
          />
        </div>
      </div>
    </div>
  )
}
