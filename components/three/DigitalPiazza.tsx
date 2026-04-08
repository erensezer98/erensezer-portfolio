'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface TallyDb {
  box_id: string
  total_tally: number
}

interface DigitalPiazzaProps {
  onMaxTallyChange?: (max: number) => void
}

export default function DigitalPiazza({ onMaxTallyChange }: DigitalPiazzaProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // Setup basic Three scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0xffffff, 0.012)

    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(0, 45, 60)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Colors
    const colorEmpty = new THREE.Color(0xeeeeee)
    const colorCold = new THREE.Color(0x0044aa)
    const colorHot = new THREE.Color(0xaa0044)
    const colorTrace = new THREE.Color(0x00ffff)

    let maxGlobalTally = 1

    // Text Generator
    function createTextSprite() {
      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 128
      const context = canvas.getContext('2d')!
      
      context.font = "Bold 38px 'Helvetica Neue', Helvetica, Arial, sans-serif"
      context.textAlign = "center"
      context.textBaseline = "middle"
      
      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ 
          map: texture, 
          depthTest: false,
          transparent: true
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(2.8, 2.8, 1) 
      
      return { sprite, canvas, context, texture }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function updateTextSprite(spriteData: any, text: string, ghostTraceLevel: number) {
      const { canvas, context, texture } = spriteData
      context.clearRect(0, 0, canvas.width, canvas.height)
      
      context.shadowBlur = 0
      if (parseInt(text) > 0) {
          context.fillStyle = "rgba(0, 0, 0, 0.85)" 
      } else {
          context.fillStyle = "rgba(180, 180, 180, 0.3)" 
      }
      context.fillText(text, canvas.width / 2, canvas.height / 2)

      if (ghostTraceLevel > 0.01) {
          context.save()
          context.globalAlpha = ghostTraceLevel
          context.shadowColor = 'rgba(0, 255, 255, 1)'
          context.shadowBlur = 20
          context.fillStyle = "rgba(0, 255, 255, 1)"
          context.fillText(text, canvas.width / 2, canvas.height / 2)
          context.restore()
      }

      texture.needsUpdate = true
    }

    // Geometry Group
    const cityscape = new THREE.Group()
    const boxSize = 1.0
    const boxGeometry = new THREE.BoxGeometry(0.8, boxSize, boxSize)

    const totalRings = 28
    const ringSpacing = 1.2
    const boxesPerCircumference = 1.4

    // To hold all building logic
    const buildings: THREE.Mesh[] = []

    // Map r_s -> building
    const buildingMap = new Map<string, THREE.Mesh>()

    function getSimulatedTally(r: number, theta: number) {
      const desirePathAngle = Math.PI / 4
      const angerDelta = Math.abs(theta - desirePathAngle)
      if (angerDelta < 0.2) return Math.floor(Math.random() * 60 * (1 - r/totalRings))
      return Math.random() > 0.96 ? Math.floor(Math.random() * 20) : 0
    }

    for (let r = 2; r < totalRings; r++) {
      const currentRadius = r * ringSpacing
      const circumference = 2 * Math.PI * currentRadius
      const numSegments = Math.floor(circumference / boxesPerCircumference)

      for (let s = 0; s < numSegments; s++) {
          const theta = s * (2 * Math.PI / numSegments)
          const x = currentRadius * Math.cos(theta)
          const z = currentRadius * Math.sin(theta)

          const uniqueMaterial = new THREE.MeshBasicMaterial({ 
              color: 0xeeeeee, 
              wireframe: true, 
              transparent: true, 
              opacity: 0.8 
          })

          const building = new THREE.Mesh(boxGeometry, uniqueMaterial)
          building.position.set(x, boxSize / 2, z)
          building.rotation.y = -theta

          const initialCount = getSimulatedTally(r, theta)
          if (initialCount > maxGlobalTally) maxGlobalTally = initialCount

          const spriteData = createTextSprite()
          spriteData.sprite.position.y = (boxSize / 2) + 0.8
          building.add(spriteData.sprite)
          
          updateTextSprite(spriteData, initialCount.toString(), 0)

          building.userData = {
              boxId: `stone_${r}_${s}`,
              r,
              s,
              originalY: building.position.y,
              targetY: building.position.y,
              tallyCount: initialCount,
              ghostTraceLevel: 0.0,
              boxGlowLevel: 0.0,
              jumpLevel: 0.0,
              spriteData: spriteData
          }

          cityscape.add(building)
          buildings.push(building)
          buildingMap.set(`stone_${r}_${s}`, building)
      }
    }
    scene.add(cityscape)
    if (onMaxTallyChange) onMaxTallyChange(maxGlobalTally)

    // Local Buffering System
    const incrementBuffer = new Map<string, number>()

    function recordHover(boxId: string) {
       incrementBuffer.set(boxId, (incrementBuffer.get(boxId) || 0) + 1)
    }

    // Reliable Exit Listener
    const handleExit = () => {
       if (incrementBuffer.size === 0) return
       
       const increments = Array.from(incrementBuffer.entries()).map(([box_id, inc_count]) => ({
          box_id,
          increments: inc_count
       }))
       
       // Send the payload
       const payload = JSON.stringify({ increments })
       
       // Try sendBeacon, fallback to fetch with keepalive
       if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/piazza', payload)
       } else {
          fetch('/api/piazza', {
             method: 'POST',
             body: payload,
             headers: { 'Content-Type': 'application/json' },
             keepalive: true
          }).catch(() => {})
       }
       
       incrementBuffer.clear()
    }

    const onVisibilityChange = () => {
       if (document.visibilityState === 'hidden') handleExit()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', handleExit)
    window.addEventListener('beforeunload', handleExit)

    // Fetch DB tallies
    fetch('/api/piazza')
      .then(res => res.json())
      .then((tallies: TallyDb[]) => {
          if (Array.isArray(tallies)) {
             tallies.forEach(t => {
                 const b = buildingMap.get(t.box_id)
                 if (b) {
                     b.userData.tallyCount += t.total_tally
                     if (b.userData.tallyCount > maxGlobalTally) {
                         maxGlobalTally = b.userData.tallyCount
                         if (onMaxTallyChange) onMaxTallyChange(maxGlobalTally)
                     }
                     updateTextSprite(b.userData.spriteData, b.userData.tallyCount.toString(), b.userData.ghostTraceLevel)
                 }
             })
          }
      })
      .catch(console.error)

    // Interaction & Waves
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-10, -10)
    
    let targetX = 0
    let targetY = 45
    let currentlyHoveredObject: THREE.Object3D | null = null

    const activeWaves: { path: THREE.Object3D[], lastStepTime: number }[] = []
    let currentRecording: THREE.Object3D[] = []
    let lastHoverTime = 0

    const ROUTE_SPEED_MS = 100
    const RECORD_PAUSE_THRESHOLD = 300
    const MAX_WAVES = 3

    const onMouseMove = (event: MouseEvent) => {
      const bounds = el.getBoundingClientRect()
      
      const mouseX = event.clientX - bounds.left
      const mouseY = event.clientY - bounds.top

      mouse.x = (mouseX / bounds.width) * 2 - 1
      mouse.y = -(mouseY / bounds.height) * 2 + 1
      
      targetX = (mouseX - bounds.width / 2) * 0.02
      targetY = 45 - ((mouseY - bounds.height / 2) * 0.02)
    }
    
    window.addEventListener('mousemove', onMouseMove)

    // Animation Loop
    let animationFrame = 0

    function animate() {
      animationFrame = requestAnimationFrame(animate)
      const currentTime = performance.now()

      cityscape.rotation.y += 0.0003

      camera.position.x += (targetX - camera.position.x) * 0.02
      camera.position.y += (targetY - camera.position.y) * 0.02
      camera.lookAt(0, 0, 0)

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(cityscape.children, false)

      if (intersects.length > 0) {
          const objectUnderMouse = intersects[0].object

          if (objectUnderMouse !== currentlyHoveredObject) {
              currentlyHoveredObject = objectUnderMouse
              currentlyHoveredObject.userData.tallyCount++

              // Record in local buffer
              recordHover(currentlyHoveredObject.userData.boxId)

              if (currentlyHoveredObject.userData.tallyCount > maxGlobalTally) {
                  maxGlobalTally = currentlyHoveredObject.userData.tallyCount
                  if (onMaxTallyChange) onMaxTallyChange(maxGlobalTally)
              }

              currentlyHoveredObject.userData.boxGlowLevel = 1.0

              updateTextSprite(currentlyHoveredObject.userData.spriteData, currentlyHoveredObject.userData.tallyCount.toString(), currentlyHoveredObject.userData.ghostTraceLevel)

              if (currentRecording.length === 0 || currentRecording[currentRecording.length - 1] !== currentlyHoveredObject) {
                  currentRecording.push(currentlyHoveredObject)
                  lastHoverTime = currentTime
              }
          }
      } else {
          currentlyHoveredObject = null
      }

      if (currentRecording.length > 0 && (currentTime - lastHoverTime > RECORD_PAUSE_THRESHOLD)) {
          if (activeWaves.length >= MAX_WAVES) {
              activeWaves.shift()
          }
          activeWaves.push({ path: currentRecording, lastStepTime: 0 })
          currentRecording = []
      }

      for (let i = activeWaves.length - 1; i >= 0; i--) {
          const wave = activeWaves[i]
          if (currentTime - wave.lastStepTime > ROUTE_SPEED_MS) {
              if (wave.path.length > 0) {
                  const ghostBox = wave.path.shift()
                  if (ghostBox) {
                    ghostBox.userData.ghostTraceLevel = 1.0
                    ghostBox.userData.jumpLevel = 1.0
                  }
                  wave.lastStepTime = currentTime
              } else {
                  activeWaves.splice(i, 1)
              }
          }
      }

      buildings.forEach(building => {
          const data = building.userData
          
          if (data.ghostTraceLevel > 0) {
              data.ghostTraceLevel = Math.max(0, data.ghostTraceLevel - 0.015)
              updateTextSprite(data.spriteData, data.tallyCount.toString(), data.ghostTraceLevel)
              if (data.ghostTraceLevel === 0) {
                  updateTextSprite(data.spriteData, data.tallyCount.toString(), 0)
              }
          }

          if (data.boxGlowLevel > 0) {
              data.boxGlowLevel = Math.max(0, data.boxGlowLevel - 0.025)
          }

          if (data.jumpLevel > 0) {
              data.jumpLevel = Math.max(0, data.jumpLevel - 0.08)
          }

          const heatRatio = data.tallyCount > 0 ? Math.pow(data.tallyCount / maxGlobalTally, 0.65) : 0
          const baseRestingHeight = data.originalY + (heatRatio * 4.0)
          
          if (building === currentlyHoveredObject) {
              data.targetY = baseRestingHeight + 2.0
          } else {
              data.targetY = baseRestingHeight + (data.jumpLevel * 0.8)
          }

          let baseTargetColor = colorEmpty.clone()
          if (data.tallyCount > 0) {
              baseTargetColor = colorCold.clone().lerp(colorHot, heatRatio)
          }
          if (data.boxGlowLevel > 0) {
              baseTargetColor.lerp(colorTrace, data.boxGlowLevel * 0.7)
          }

          const mat = building.material as THREE.MeshBasicMaterial
          mat.color.copy(baseTargetColor)
          building.position.y += (data.targetY - building.position.y) * 0.15
      })

      renderer.render(scene, camera)
    }

    const onResize = () => {
      if (!el) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }

    window.addEventListener('resize', onResize)
    animate()

    return () => {
      handleExit()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', handleExit)
      window.removeEventListener('beforeunload', handleExit)

      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      
      boxGeometry.dispose()
      
      buildings.forEach(b => {
          (b.material as THREE.Material).dispose()
      })
      
      renderer.dispose()
      if (el.contains(renderer.domElement)) {
          el.removeChild(renderer.domElement)
      }
    }
  }, [onMaxTallyChange])

  return <div ref={mountRef} className="absolute inset-0 z-[-1] min-h-screen" />
}
