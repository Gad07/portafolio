import React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import OrganicScene from './OrganicScene.jsx'

// ─── Camera Controller (Cinematic Route Flybys & Dynamic Zoom Flight) ─────────
function CameraController({ pathname }) {
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    
    // Posición y zoom dramático según la ruta activa
    let targetX = 0.0
    let targetY = 0.4
    let targetZ = 8.5 // Zoom panorámico general para Inicio

    let lookX = 0.0
    let lookY = 0.0
    let lookZ = 0.0

    if (pathname === '/sobre-mi') {
      // 🌍 Vuelo y Zoom inmersivo hacia la Tierra y Júpiter
      targetX = 2.8
      targetY = 0.5
      targetZ = 5.8
      lookX = 3.6
      lookY = 0.2
      lookZ = 0.0
    } else if (pathname === '/proyectos') {
      // 🪐 Vuelo y Zoom inmersivo hacia Saturno y Marte
      targetX = -2.8
      targetY = 0.6
      targetZ = 6.2
      lookX = -3.6
      lookY = 0.2
      lookZ = 0.0
    } else if (pathname === '/contacto') {
      // 📡 Zoom out de espacio profundo panorámico
      targetX = 0.0
      targetY = -0.2
      targetZ = 9.8
      lookX = 0.0
      lookY = 0.0
      lookZ = 0.0
    }
    
    // Suave oscilación orbital continua
    const swayX = Math.sin(t * 0.35) * 0.25
    const swayY = Math.cos(t * 0.25) * 0.18
    
    // Parallax suave de ratón en 3D
    const mouseX = state.pointer.x * 0.5
    const mouseY = state.pointer.y * 0.3
    
    const finalTargetPos = new THREE.Vector3(
      targetX + swayX + mouseX,
      targetY + swayY + mouseY,
      targetZ
    )

    // Fluid damp lerp para viajes cinematográficos de cámara
    state.camera.position.lerp(finalTargetPos, 2.8 * delta)
    
    const targetLook = new THREE.Vector3(lookX + mouseX * 0.1, lookY + mouseY * 0.1, lookZ)
    state.camera.lookAt(targetLook)
  })
  return null
}

// ─── Main Global Canvas (Z-Index: -1 Background) ─────────────────────────
export default function GlobalCanvas() {
  const { pathname } = useLocation()

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: -1, 
        pointerEvents: 'none' 
      }}
    >
      <Canvas camera={{ position: [0, 0.5, 9.0], fov: 45 }}>
        <color attach="background" args={['#030712']} />
        
        {/* Mapa de entorno para reflexiones fotorrealistas */}
        <Environment preset="night" />
        
        <CameraController pathname={pathname} />
        
        {/* Escena inmersiva del Sistema Solar */}
        <OrganicScene pathname={pathname} />
      </Canvas>
    </div>
  )
}


