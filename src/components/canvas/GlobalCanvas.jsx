import React from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import AquariumScene from './AquariumScene.jsx'
import OrganicScene from './OrganicScene.jsx'
import { useScene } from '../../context/SceneContext.jsx'

// ─── Aquarium Camera Controller (Zoom Fijo 100%) ───────────────────────────────
function AquariumCameraController({ pathname }) {
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    let targetX = 0.0
    let targetY = 0.0
    let targetZ = 8.0 // 100% Zoom fijo

    let lookX = 0.0
    let lookY = -0.5
    let lookZ = 0.0

    if (pathname === '/sobre-mi') {
      targetX = 1.5
      targetY = -0.3
      targetZ = 7.5
      lookX = 0.8
      lookY = -0.5
    } else if (pathname === '/proyectos') {
      targetX = -1.5
      targetY = 0.2
      targetZ = 7.8
      lookX = -0.8
      lookY = -0.3
    } else if (pathname === '/contacto') {
      targetX = 0.0
      targetY = -0.8
      targetZ = 7.8
      lookX = 0.0
      lookY = 0.5
    }

    const swayX = Math.sin(t * 0.28) * 0.08
    const swayY = Math.cos(t * 0.22) * 0.05

    const finalTarget = new THREE.Vector3(targetX + swayX, targetY + swayY, targetZ)
    state.camera.position.lerp(finalTarget, 2.5 * delta)
    state.camera.lookAt(lookX, lookY, lookZ)
  })
  return null
}

// ─── Space / Solar System Camera Controller (Zoom Fijo 250%) ──────────────────
function SpaceCameraController({ pathname }) {
  const zoomFactor = 2.5

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    let targetX = 0.1
    let targetY = 0.8
    let baseZ = 17.5

    let lookX = 0.0
    let lookY = 0.0
    let lookZ = 0.0

    if (pathname === '/sobre-mi') {
      targetX = 2.2
      targetY = 0.6
      baseZ = 16.0
      lookX = 1.0
      lookY = 0.0
    } else if (pathname === '/proyectos') {
      targetX = -2.2
      targetY = 0.7
      baseZ = 16.5
      lookX = -1.0
      lookY = 0.0
    } else if (pathname === '/contacto') {
      targetX = 0.0
      targetY = -1.2
      baseZ = 16.0
      lookX = 0.0
      lookY = 0.4
    }

    const floatX = Math.sin(t * 0.2) * 0.1
    const floatY = Math.cos(t * 0.15) * 0.08
    const targetZ = (baseZ / zoomFactor)

    const finalTarget = new THREE.Vector3(targetX + floatX, targetY + floatY, targetZ)
    state.camera.position.lerp(finalTarget, 2.5 * delta)
    state.camera.lookAt(lookX, lookY, lookZ)
  })
  return null
}

// ─── Global Canvas ──────────────────────────────────────────────────────────
export default function GlobalCanvas() {
  const { pathname } = useLocation()
  const { sceneMode } = useScene()

  const isAquarium = sceneMode === 'aquarium'
  const isSpace = sceneMode === 'space'

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'auto',
        transition: 'opacity 0.6s ease'
      }}
    >
      <Canvas
        eventSource={typeof document !== 'undefined' ? document.body : undefined}
        eventPrefix="client"
        style={{ pointerEvents: 'auto' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{
          position: isAquarium ? [0, 0, 8.0] : [0, 2.0, 18.0],
          fov: isAquarium ? 50 : 45
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          precision: 'mediump'
        }}
      >
        {isAquarium && (
          <>
            {/* Fondo del acuario cristalino en Ocean Cyan de alto contraste */}
            <color attach="background" args={['#0A4D6E']} />
            <fog attach="fog" args={['#0A4D6E', 6, 24]} />
            <Environment preset="apartment" />
            <AquariumCameraController pathname={pathname} />
            <AquariumScene pathname={pathname} />
          </>
        )}

        {isSpace && (
          <>
            {/* Fondo del Cosmos / Espacio profundo */}
            <color attach="background" args={['#050813']} />
            <fog attach="fog" args={['#050813', 35, 140]} />
            <SpaceCameraController pathname={pathname} />
            <OrganicScene pathname={pathname} />
          </>
        )}
      </Canvas>
    </div>
  )
}
