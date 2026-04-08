import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';

// This sub-component loads and renders your specific GLB model
function SafeRouteModel() {
  // Make sure testawayout.glb is in your public/ folder
  const { scene } = useGLTF('/testawayout.glb');
  
  return (
    <primitive 
      object={scene} 
      scale={1} // Adjust scale if your model is too big/small
      position={[0, -1, 0]} 
    />
  );
}

export default function EarthquakeProjectViewer() {
  return (
    <div style={{ 
      height: '600px', 
      width: '100%', 
      borderRadius: '16px', 
      overflow: 'hidden', 
      backgroundColor: '#0f1115', // Dark background for a "disaster tech" vibe
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      <Canvas camera={{ position: [5, 5, 10], fov: 45 }}>
        {/* Thematic Lighting: Red/Orange for hazard, Cool Blue for tech/safety */}
        <ambientLight intensity={0.3} />
        <directionalLight color="#ffccaa" position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight color="#00e5ff" position={[-5, 5, -5]} intensity={2} />

        <Suspense fallback={<FallbackLoader />}>
          <SafeRouteModel />
          
          {/* Adds a nice grounded shadow beneath your city/route model */}
          <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
          
          {/* Adds realistic reflections (optional, great if your GLB has metallic materials) */}
          <Environment preset="night" />
        </Suspense>

        {/* Allows the user to look around, pans automatically for a nice portfolio effect */}
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0.8} 
          enableDamping 
          dampingFactor={0.05} 
          minPolarAngle={Math.PI / 4} // Restricts camera from going under the map
          maxPolarAngle={Math.PI / 2.1} 
        />
      </Canvas>
    </div>
  );
}

// A simple loading indicator while your GLB fetches
function FallbackLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  );
}

// Preload the model for faster rendering
useGLTF.preload('/testawayout.glb');