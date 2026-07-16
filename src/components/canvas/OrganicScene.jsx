import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ─── Route to Phase Mapping ─────────────────────────────────────────────────
const getTargetPhase = (pathname) => {
  if (pathname === '/proyectos') return 1 // Galaxy
  if (pathname === '/sobre-mi') return 2  // Particles form Music Notes
  if (pathname === '/contacto') return 3  // Dust fades
  return 0 // Home -> Solar System
}

const useScrollProgress = () => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
      setProgress(scrollY / maxScroll)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return progress
}

// ─── Mathematical 3D Shape Generators ───────────────────────────────────────
// ─── Reliable 2D Typography Generator for Particles ────────────────────────
function getShapePositionsFromText(char, particleCount, scale, yOffset = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.font = '240px "Noto Music", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Usamos el contorno (strokeText) y un leve relleno para formar una silueta láser hiper-nítida
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.strokeText(char, 256, 256 + yOffset);
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText(char, 256, 256 + yOffset);
  
  const imgData = ctx.getImageData(0, 0, 512, 512).data;
  const validPixels = [];
  
  for (let y = 0; y < 512; y += 2) { 
    for (let x = 0; x < 512; x += 2) {
      if (imgData[(y * 512 + x) * 4] > 30) { 
        validPixels.push({ x: (x - 256) / 256, y: -(y - 256) / 256 });
      }
    }
  }
  
  const positions = new Float32Array(particleCount * 3);
  if (validPixels.length === 0) return positions; 
  
  validPixels.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < particleCount; i++) {
    const pixel = validPixels[i % validPixels.length];
    
    // Dispersión suave y elegante para que no se vea tan comprimido ni rígido
    const noise = (Math.random() * 0.02) + (Math.random() * Math.random() * 0.04);
    const angle = Math.random() * Math.PI * 2;
    
    // Escala perfecta para que quepa en cualquier pantalla
    positions[i * 3] = (pixel.x + Math.cos(angle)*noise) * scale * 1.6;
    positions[i * 3 + 1] = (pixel.y + Math.sin(angle)*noise) * scale * 1.6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // Mayor volumen en profundidad 3D
  }
  
  return positions;
}

// ─── Procedural Texture Generator ──────────────────────────────────────────
const generatePlanetTexture = (type) => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  
  if (type === 'gas') {
    // Jupiter-like Gas Giant
    ctx.fillStyle = "#c59b6d"
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${120 + Math.random()*60}, ${70 + Math.random()*30}, 40, ${Math.random()*0.4 + 0.1})`
      ctx.fillRect(0, Math.random() * 512, 512, Math.random() * 30 + 5)
    }
    for (let i = 0; i < 15; i++) {
      ctx.beginPath()
      ctx.ellipse(Math.random()*512, Math.random()*512, Math.random()*60+20, Math.random()*20+10, 0, 0, Math.PI*2)
      ctx.fillStyle = `rgba(180, 100, 50, 0.3)`
      ctx.fill()
    }
  } else if (type === 'earth') {
    // Earth-like planet (Oceans)
    ctx.fillStyle = "#0c2c5c" 
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 60; i++) {
      ctx.beginPath()
      ctx.arc(Math.random()*512, Math.random()*512, Math.random()*60 + 10, 0, Math.PI*2)
      const rand = Math.random()
      ctx.fillStyle = rand > 0.8 ? "#e0e0e0" : (rand > 0.4 ? "#2e6b37" : "#8b5a2b")
      ctx.fill()
    }
  } else if (type === 'mars') {
    // Mars-like rocky planet
    ctx.fillStyle = "#8c3b22" 
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 100; i++) {
      ctx.beginPath()
      ctx.arc(Math.random()*512, Math.random()*512, Math.random()*20 + 5, 0, Math.PI*2)
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(100, 30, 10, 0.4)" : "rgba(180, 80, 40, 0.3)"
      ctx.fill()
    }
  } else if (type === 'sun') {
    // Boiling plasma texture for Sun
    ctx.fillStyle = "#ff8c00" 
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 300; i++) {
      ctx.beginPath()
      ctx.arc(Math.random()*512, Math.random()*512, Math.random()*20 + 5, 0, Math.PI*2)
      ctx.fillStyle = Math.random() > 0.6 ? "rgba(255, 40, 0, 0.5)" : "rgba(255, 255, 150, 0.4)"
      ctx.fill()
    }
  } else if (type === 'moon') {
    ctx.fillStyle = "#888888" 
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 300; i++) {
      ctx.beginPath()
      ctx.arc(Math.random()*512, Math.random()*512, Math.random()*15 + 2, 0, Math.PI*2)
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(80, 80, 80, 0.5)" : "rgba(150, 150, 150, 0.4)"
      ctx.fill()
    }
  } else if (type === 'ice') {
    ctx.fillStyle = "#4fa3c7"
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(180, 220, 255, ${Math.random()*0.3 + 0.1})`
      ctx.fillRect(0, Math.random() * 512, 512, Math.random() * 20 + 5)
    }
  } else if (type === 'toxic') {
    ctx.fillStyle = "#3e5225"
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 200; i++) {
      ctx.beginPath()
      ctx.arc(Math.random()*512, Math.random()*512, Math.random()*30 + 10, 0, Math.PI*2)
      ctx.fillStyle = "rgba(100, 200, 50, 0.2)"
      ctx.fill()
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 16
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// ─── Realistic Planet Component ─────────────────────────────────────────────
function RealisticPlanet({ radius, map, hasRing, hasAtmosphere, atmosphereColor, orbitSpeed = 0.5, ...props }) {
  const planetRef = useRef()
  
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * orbitSpeed
    }
  })

  return (
    <group {...props}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial 
          map={map}
          metalness={0.1} 
          roughness={0.8}
          transparent
        />
      </mesh>
      
      {hasAtmosphere && (
        <mesh scale={1.12}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial 
            color={atmosphereColor || "#ffffff"} 
            transparent 
            opacity={0.25} 
            blending={THREE.AdditiveBlending} 
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {hasRing && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[radius * 2.2, radius * 0.15, 16, 100]} />
          <meshStandardMaterial 
            color="#d2b48c" 
            transparent 
            opacity={0.8} 
            roughness={0.4} 
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

// ─── Main Scene Controller ──────────────────────────────────────────────────
export default function OrganicScene({ pathname }) {
  const scrollProgress = useScrollProgress()
  const targetPhase = getTargetPhase(pathname)
  
  const phaseRef = useRef(0)
  const { viewport } = useThree()
  
  const [fontLoaded, setFontLoaded] = useState(false)
  
  useEffect(() => {
    document.fonts.ready.then(() => {
      setFontLoaded(true)
    })
  }, [])
  
  // Refs
  const starRef = useRef()
  const planetsGroupRef = useRef()
  const galaxyRef = useRef()
  
  // Strict Palette: Black, White, Dark Blue
  const palette = {
    white: new THREE.Color("#ffffff"),
    darkBlue: new THREE.Color("#0a1525"),
    accentBlue: new THREE.Color("#1e4db7")
  }

  // Pre-generate procedural textures
  const textures = useMemo(() => ({
    sun: generatePlanetTexture('sun'),
    earth: generatePlanetTexture('earth'),
    gas: generatePlanetTexture('gas'),
    mars: generatePlanetTexture('mars'),
    moon: generatePlanetTexture('moon'),
    ice: generatePlanetTexture('ice'),
    toxic: generatePlanetTexture('toxic')
  }), [])

  // Generate a soft circular texture for the particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // ─── Particle System (Elegant Stardust morphing into a Note) ───
  const particleCount = 4000
  const particles = useMemo(() => {
    const isLoaded = fontLoaded;
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const galaxyPositions = new Float32Array(particleCount * 3)
    
    // Sub-phases for "Sobre Mi"
    const notePositions = new Float32Array(particleCount * 3)
    const fclefPositions = new Float32Array(particleCount * 3)
    const gclefPositions = new Float32Array(particleCount * 3)
    
    // Generate perfectly precise shapes from reliable canvas paths
    const rawNotePositions = getShapePositionsFromText('\u{266B}', particleCount, 1.2, 0) // Note
    const rawFclefPositions = getShapePositionsFromText('\u{1D122}', particleCount, 1.3, -30) // F-Clef (shifted up a bit)
    const rawGclefPositions = getShapePositionsFromText('\u{1D11E}', particleCount, 1.8, 30) // G-Clef (shifted down to fit the tall top hook)
    
    for (let i = 0; i < particleCount; i++) {
      // Phase 0: Solar System Orbits (Asteroid Belts)
      const orbitLayer = i % 6;
      const baseRadii = [2.2, 3.5, 4.8, 6.5, 8.5, 10.5];
      const baseRadius = baseRadii[orbitLayer];
      const radius = baseRadius + (Math.random() - 0.5) * (orbitLayer > 3 ? 0.8 : 0.4);
      const theta = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(theta) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1
      positions[i * 3 + 2] = Math.sin(theta) * radius
      
      // Phase 1: Swirling Galaxy
      const gRadius = Math.random() * 12
      const gTheta = Math.random() * Math.PI * 2
      const gPhi = Math.acos((Math.random() * 2) - 1)
      galaxyPositions[i * 3] = gRadius * Math.sin(gPhi) * Math.cos(gTheta)
      galaxyPositions[i * 3 + 1] = gRadius * Math.sin(gPhi) * Math.sin(gTheta)
      galaxyPositions[i * 3 + 2] = gRadius * Math.cos(gPhi)

      // Sub-phases: Perfectly mapped text positions
      notePositions[i * 3] = rawNotePositions[i * 3] || 0
      notePositions[i * 3 + 1] = rawNotePositions[i * 3 + 1] || 0
      notePositions[i * 3 + 2] = rawNotePositions[i * 3 + 2] || 0
      
      fclefPositions[i * 3] = rawFclefPositions[i * 3] || 0
      fclefPositions[i * 3 + 1] = rawFclefPositions[i * 3 + 1] || 0
      fclefPositions[i * 3 + 2] = rawFclefPositions[i * 3 + 2] || 0
      
      gclefPositions[i * 3] = rawGclefPositions[i * 3] || 0
      gclefPositions[i * 3 + 1] = rawGclefPositions[i * 3 + 1] || 0
      gclefPositions[i * 3 + 2] = rawGclefPositions[i * 3 + 2] || 0
      
      // Colors: Strictly White and Light/Dark Blue
      const mix = Math.random()
      const color = mix > 0.8 ? palette.accentBlue : (mix > 0.3 ? palette.white : new THREE.Color("#8faadc"))
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('galaxyPos', new THREE.BufferAttribute(galaxyPositions, 3))
    geometry.setAttribute('notePos', new THREE.BufferAttribute(notePositions, 3))
    geometry.setAttribute('fclefPos', new THREE.BufferAttribute(fclefPositions, 3))
    geometry.setAttribute('gclefPos', new THREE.BufferAttribute(gclefPositions, 3))
    
    return geometry
  }, [fontLoaded])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    
    phaseRef.current = THREE.MathUtils.lerp(phaseRef.current, targetPhase, delta * 2)
    const phase = phaseRef.current

    // --- PHASE 0: SOLAR SYSTEM (Star & Planets) ---
    if (starRef.current && planetsGroupRef.current) {
      const pOpacity = Math.max(0, 1 - phase)
      const pScale = 1 + Math.pow(phase, 2) * 8 // Zooms massively towards camera
      
      starRef.current.scale.set(pScale, pScale, pScale)
      planetsGroupRef.current.scale.set(pScale, pScale, pScale)
      
      starRef.current.rotation.y = t * 0.1
      
      // Orbiting planets rotation
      planetsGroupRef.current.children[0].position.x = Math.cos(t * 1.5) * 2.2
      planetsGroupRef.current.children[0].position.z = Math.sin(t * 1.5) * 2.2
      
      planetsGroupRef.current.children[1].position.x = Math.cos(t * 1.0 + 1) * 3.5
      planetsGroupRef.current.children[1].position.z = Math.sin(t * 1.0 + 1) * 3.5
      
      planetsGroupRef.current.children[2].position.x = Math.cos(t * 0.8 + 2) * 4.8
      planetsGroupRef.current.children[2].position.z = Math.sin(t * 0.8 + 2) * 4.8
      
      planetsGroupRef.current.children[3].position.x = Math.cos(t * 0.5 + 3) * 6.5
      planetsGroupRef.current.children[3].position.z = Math.sin(t * 0.5 + 3) * 6.5

      planetsGroupRef.current.children[4].position.x = Math.cos(t * 0.3 + 4) * 8.5
      planetsGroupRef.current.children[4].position.z = Math.sin(t * 0.3 + 4) * 8.5

      planetsGroupRef.current.children[5].position.x = Math.cos(t * 0.2 + 5) * 10.5
      planetsGroupRef.current.children[5].position.z = Math.sin(t * 0.2 + 5) * 10.5
      
      // Fade out star layers smoothly
      starRef.current.children.forEach((child, i) => {
        if (child.isMesh && child.material) {
          const baseOpacities = [1.0, 0.4, 0.15, 0.5] // Core, Inner, Outer, Aura
          child.material.opacity = pOpacity * (baseOpacities[i] || 1)
        }
      })
      
      // Fade out planets and atmospheres smoothly
      planetsGroupRef.current.children.forEach(planetGroup => {
        planetGroup.traverse(child => {
          if (child.isMesh && child.material) {
            const baseOpacity = child.material.blending === THREE.AdditiveBlending ? 0.15 : (child.material.opacity > 0.5 ? 0.8 : 0.6)
            child.material.opacity = pOpacity * baseOpacity
          }
        })
      })
      
      const isVisible = pOpacity > 0.01
      starRef.current.visible = isVisible
      planetsGroupRef.current.visible = isVisible
    }

    // --- PHASE 1 & 2 & 3: PARTICLES (Orbits -> Galaxy -> Notes -> Dust) ---
    if (galaxyRef.current) {
      const positions = galaxyRef.current.geometry.attributes.position.array
      const galaxyPos = galaxyRef.current.geometry.attributes.galaxyPos.array
      
      const notePos = galaxyRef.current.geometry.attributes.notePos.array
      const fclefPos = galaxyRef.current.geometry.attributes.fclefPos.array
      const gclefPos = galaxyRef.current.geometry.attributes.gclefPos.array
      
      const galaxyMix = THREE.MathUtils.clamp(phase, 0, 1) // 0 to 1
      const notesMix = THREE.MathUtils.clamp(phase - 1, 0, 1) // 0 to 1
      const dustMix = THREE.MathUtils.clamp(phase - 2, 0, 1) // 0 to 1 (Phase 3: Contacto)
      
      // Calculate scroll transitions for Phase 2 sub-morphing
      const mix1 = THREE.MathUtils.clamp((scrollProgress - 0.1) * 3, 0, 1) // Note -> F-Clef
      const mix2 = THREE.MathUtils.clamp((scrollProgress - 0.6) * 3, 0, 1) // F-Clef -> G-Clef
      
      const offsetSize = viewport.width > 6 ? 2.5 : viewport.width * 0.35;
      const currentOffset = THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(-offsetSize * 0.2, offsetSize * 0.7, mix1), // Note (slight left) -> F-Clef (right)
        -offsetSize * 0.7, // G-Clef (left)
        mix2
      );
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        
        // Target 0: Solar System Orbits
        const orbitLayer = i % 6;
        const baseRadii = [2.2, 3.5, 4.8, 6.5, 8.5, 10.5];
        const baseRadius = baseRadii[orbitLayer];
        const originalAngle = i * 0.1; 
        const currentTheta = originalAngle + t * (0.2 - orbitLayer * 0.03); 
        
        const ringX = Math.cos(currentTheta) * (baseRadius + Math.sin(i)*0.4)
        const ringY = Math.sin(t + i) * 0.02
        const ringZ = Math.sin(currentTheta) * (baseRadius + Math.sin(i)*0.4)
        
        // Target 1: Galaxy
        const gX = galaxyPos[i3] + Math.sin(t + i)*0.2
        const gY = galaxyPos[i3+1] + Math.cos(t + i)*0.2
        const gZ = galaxyPos[i3+2] + Math.sin(t + i)*0.2

        // Target 2a: Eighth Note
        const nX = notePos[i3] 
        const nY = notePos[i3+1]
        const nZ = notePos[i3+2]

        // Target 2b: F-Clef
        const fX = fclefPos[i3] 
        const fY = fclefPos[i3+1]
        const fZ = fclefPos[i3+2]
        
        // Target 2c: G-Clef
        const cX = gclefPos[i3] 
        const cY = gclefPos[i3+1]
        const cZ = gclefPos[i3+2]

        // Sub-morphing logic based on scroll (only visible if notesMix > 0)
        const shapeX = THREE.MathUtils.lerp(THREE.MathUtils.lerp(nX, fX, mix1), cX, mix2) + currentOffset
        const shapeY = THREE.MathUtils.lerp(THREE.MathUtils.lerp(nY, fY, mix1), cY, mix2)
        const shapeZ = THREE.MathUtils.lerp(THREE.MathUtils.lerp(nZ, fZ, mix1), cZ, mix2)

        // Target 3: Ambient Dust for Contacto (Massive expanded cinematic sphere)
        // Uses galaxy base but exploded outward significantly so it surrounds the camera
        const dX = gX * 3.5
        const dY = gY * 3.5 + Math.sin(t * 0.5 + i) * 1.5
        const dZ = gZ * 3.5

        // Interpolate Orbits -> Galaxy -> Active Shape
        const midX = THREE.MathUtils.lerp(ringX, gX, galaxyMix)
        const midY = THREE.MathUtils.lerp(ringY, gY, galaxyMix)
        const midZ = THREE.MathUtils.lerp(ringZ, gZ, galaxyMix)

        const preFinalX = THREE.MathUtils.lerp(midX, shapeX, notesMix)
        const preFinalY = THREE.MathUtils.lerp(midY, shapeY, notesMix)
        const preFinalZ = THREE.MathUtils.lerp(midZ, shapeZ, notesMix)
        
        // Final lerp to Dust Cloud for Phase 3
        positions[i3] = THREE.MathUtils.lerp(preFinalX, dX, dustMix)
        positions[i3 + 1] = THREE.MathUtils.lerp(preFinalY, dY, dustMix)
        positions[i3 + 2] = THREE.MathUtils.lerp(preFinalZ, dZ, dustMix)
      }
      
      galaxyRef.current.geometry.attributes.position.needsUpdate = true
      
      // Global Rotation of the particles
      const stableRotY = t * 0.05 + scrollProgress * Math.PI
      const noteRotY = Math.sin(t * 0.5) * 0.2 
      galaxyRef.current.rotation.y = THREE.MathUtils.lerp(stableRotY, noteRotY, notesMix)
      
      const stableRotX = (phase * Math.PI) / 6 
      galaxyRef.current.rotation.x = THREE.MathUtils.lerp(stableRotX, 0, notesMix)
      
      // Floating animation for shapes
      const floatY = Math.sin(t * 1.5) * 0.15;
      galaxyRef.current.position.y = THREE.MathUtils.lerp(0, floatY, notesMix);
      
      // Phase 3 (Contacto): Fade to a cinematic ambient dust level
      const dustFade = THREE.MathUtils.lerp(0.8, 0.4, dustMix)
      galaxyRef.current.material.opacity = dustFade
    }
  })

  return (
    <group rotation={[0.3, 0, -0.15]}>
      {/* Ambient light purely for the dark sides of planets */}
      <ambientLight intensity={0.2} color="#445588" />
      
      {/* ─── THE SOLAR SYSTEM (Phase 0) ─── */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Central Star (Hyper-Realistic Boiling Sun) */}
        <group ref={starRef}>
          <pointLight color="#ffccaa" intensity={30} distance={50} />
          
          <mesh>
            <sphereGeometry args={[1.2, 128, 128]} />
            <MeshDistortMaterial 
              map={textures.sun}
              emissiveMap={textures.sun}
              emissive="#ff6600"
              emissiveIntensity={1.2}
              distort={0.08} 
              speed={2} 
              roughness={0.4}
            />
          </mesh>
          
          <mesh scale={1.05}>
            <sphereGeometry args={[1.2, 64, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>

          <mesh scale={1.15}>
            <sphereGeometry args={[1.2, 64, 64]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>

          <mesh scale={1.5}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshBasicMaterial color="#ff4400" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
        
        {/* Orbiting Planets (Highly Realistic Textures) */}
        <group ref={planetsGroupRef}>
          <RealisticPlanet 
            radius={0.15} 
            map={textures.moon}
            orbitSpeed={2.0}
          />
          <RealisticPlanet 
            radius={0.25} 
            map={textures.earth}
            atmosphereColor="#8faadc"
            hasAtmosphere 
            orbitSpeed={1.0}
          />
          <RealisticPlanet 
            radius={0.22} 
            map={textures.mars}
            atmosphereColor="#8c3b22"
            hasAtmosphere 
            orbitSpeed={0.8}
          />
          <RealisticPlanet 
            radius={0.3} 
            map={textures.toxic}
            atmosphereColor="#77aa33"
            hasAtmosphere 
            orbitSpeed={0.6}
          />
          <RealisticPlanet 
            radius={0.5} 
            map={textures.gas}
            hasRing 
            atmosphereColor="#e0a96d"
            hasAtmosphere 
            orbitSpeed={0.3}
          />
          <RealisticPlanet 
            radius={0.4} 
            map={textures.ice}
            hasRing 
            atmosphereColor="#4fa3c7"
            hasAtmosphere 
            orbitSpeed={0.2}
          />
        </group>
      </Float>

      {/* ─── THE GALAXY / ORBITS / NOTES (All Phases) ─── */}
      <points ref={galaxyRef} geometry={particles}>
        <pointsMaterial 
          size={0.06} 
          vertexColors 
          map={particleTexture}
          transparent 
          opacity={0.8} 
          alphaTest={0.01}
          sizeAttenuation 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ─── ELEGANT LIGHTING ─── */}
      <group>
        <pointLight color="#ffffff" intensity={4} distance={20} position={[5, 3, 4]} />
        <pointLight color="#1e4db7" intensity={8} distance={20} position={[-5, -3, -2]} />
        <pointLight color="#0a1525" intensity={10} distance={15} position={[0, 0, -5]} />
      </group>
    </group>
  )
}
