import React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import OrganicScene from './OrganicScene.jsx'

// ─── Camera Controller (Cinematic Route Transitions) ────────────────────────
function CameraController({ pathname }) {
  useFrame((state, delta) => {
    // We add a subtle constant sway to the camera
    const t = state.clock.elapsedTime
    
    // Determine base position by route
    let targetZ = 8
    let targetX = 0
    let targetY = 0
    
    if (pathname === '/sobre-mi') { targetZ = 6; targetX = 2; }
    if (pathname === '/proyectos') { targetZ = 7; targetX = -2; targetY = 1; }
    if (pathname === '/contacto') { targetZ = 5; } // Closer to the blob
    
    // Add sway
    targetX += Math.sin(t * 0.3) * 0.5
    targetY += Math.cos(t * 0.2) * 0.5
    
    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 1.5 * delta)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── Main Global Canvas ─────────────────────────────────────────────────────
export default function GlobalCanvas() {
  const { pathname } = useLocation()

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        
        {/* Environment map for realistic reflections on the fluid */}
        <Environment preset="night" />
        
        <CameraController pathname={pathname} />
        
        {/* The main scrollytelling organic scene */}
        <OrganicScene pathname={pathname} />
      </Canvas>
    </div>
  )
}

