import React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import OrganicScene from './OrganicScene.jsx'

// ─── Camera Controller (Cinematic Route Transitions & Mouse Parallax) ─────────
function CameraController({ pathname }) {
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    
    // Base camera positions per route
    let targetX = 0.2
    let targetY = 0
    let targetZ = 8.0

    let lookX = 0.2
    let lookY = 0
    let lookZ = 0
    
    if (pathname === '/sobre-mi') {
      targetX = 2.4
      targetY = 0.6
      targetZ = 6.8
      lookX = 0.5
    } else if (pathname === '/proyectos') {
      targetX = -2.2
      targetY = 1.2
      targetZ = 7.2
      lookX = -0.5
      lookY = 0.2
    } else if (pathname === '/contacto') {
      targetX = 0.5
      targetY = 0
      targetZ = 7.5
      lookX = 0.5
      lookY = 0
    }
    
    // Continuous subtle orbital sway
    const swayX = Math.sin(t * 0.4) * 0.35
    const swayY = Math.cos(t * 0.3) * 0.25
    
    // Interactive mouse parallax depth
    const mouseX = state.pointer.x * 0.7
    const mouseY = state.pointer.y * 0.5
    
    const finalTargetPos = new THREE.Vector3(
      targetX + swayX + mouseX,
      targetY + swayY + mouseY,
      targetZ
    )

    // Smooth lerp (fluid camera damping)
    state.camera.position.lerp(finalTargetPos, 3.0 * delta)
    
    // Smooth lookAt target lerp
    const currentLookAt = new THREE.Vector3()
    state.camera.getWorldDirection(currentLookAt)
    state.camera.lookAt(lookX + mouseX * 0.2, lookY + mouseY * 0.2, lookZ)
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

