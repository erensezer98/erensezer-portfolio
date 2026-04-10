'use client'

import dynamic from 'next/dynamic'
import type { ProjectSceneComponent } from '@/lib/project-data'

const ArchitecturalWireframe = dynamic(
  () => import('@/components/three/ArchitecturalWireframe'),
  { ssr: false }
)

const ExplodedAxonometry = dynamic(
  () => import('@/components/three/ExplodedAxonometry'),
  { ssr: false }
)

const FoodTowerExplosion = dynamic(
  () => import('@/components/three/FoodTowerExplosion'),
  { ssr: false }
)

const InteractiveRelight = dynamic(
  () => import('@/components/three/InteractiveRelight'),
  { ssr: false }
)

const TheLogScene = dynamic(
  () => import('@/components/three/TheLogScene'),
  { ssr: false }
)

const ToorToorScene = dynamic(
  () => import('@/components/three/ToorToorScene'),
  { ssr: false }
)

const TheWallScene = dynamic(
  () => import('@/components/three/TheWallScene'),
  { ssr: false }
)

const IstanbulScene = dynamic(
  () => import('@/components/three/IstanbulScene'),
  { ssr: false }
)

const SCENE_COMPONENTS = {
  'architectural-wireframe': ArchitecturalWireframe,
  'exploded-axonometry': ExplodedAxonometry,
  'food-tower-explosion': FoodTowerExplosion,
  'interactive-relight': InteractiveRelight,
  'the-log-scene': TheLogScene,
  'toor-toor-scene': ToorToorScene,
  'the-wall-scene': TheWallScene,
  'istanbul-scene': IstanbulScene,
} as const

export default function ProjectScene({ component }: { component: ProjectSceneComponent }) {
  if (component === 'none') return null

  const SceneComponent = SCENE_COMPONENTS[component]
  if (!SceneComponent) return null

  return <SceneComponent />
}
