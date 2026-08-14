import React, { useMemo, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎙️ ESTUDIO DE GRABACIÓN PROFESIONAL 3D (RECREACIÓN EXACTA DE LA IMAGEN)
// Con Bajo, Guitarra, Batería, Violín, Teclados/Sintetizadores, Amplificador Vox,
// Monitores de Estudio, Difusores y Luces Verdes/Cálidas
// ═══════════════════════════════════════════════════════════════════════════════

// ─── COMPONENTE UNIVERSAL PARA NORMALIZAR, ESCALAR Y APOYAR MODELOS GLB ──────
function AutoGLTFModel({ url, targetHeight = 1.0, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url)

  const normalizedGroup = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)

    // Escala proporcional exacta
    const maxDim = Math.max(size.x, size.y, size.z)
    const currentHeight = size.y > 0.05 ? size.y : maxDim
    const s = targetHeight / (currentHeight || 1.0)
    clone.scale.setScalar(s)

    // Alinear la base del modelo exactamente en Y = 0 y centrado en X/Z
    clone.position.x = -center.x * s
    clone.position.y = -box.min.y * s
    clone.position.z = -center.z * s

    // Habilitar doble cara y sombras
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.side = THREE.DoubleSide
        child.material.needsUpdate = true
      }
    })

    const root = new THREE.Group()
    root.add(clone)
    return root
  }, [scene, targetHeight])

  return (
    <primitive
      object={normalizedGroup}
      position={position}
      rotation={rotation}
    />
  )
}

// ─── 1. SUELO DE MADERA Y ALFOMBRA PATRONADA DEL ESTUDIO ─────────────────────
function StudioFloorAndRug() {
  const rugTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    // Base crema/beige del tapete
    ctx.fillStyle = '#E4DFD3'
    ctx.fillRect(0, 0, 512, 512)

    // Patrón geométrico ondulado café y ocre (como el de la foto)
    ctx.strokeStyle = '#5A4A3A'
    ctx.lineWidth = 5
    for (let y = -20; y < 540; y += 24) {
      ctx.beginPath()
      for (let x = 0; x <= 512; x += 12) {
        const wave = Math.sin(x * 0.04 + y * 0.15) * 9
        if (x === 0) ctx.moveTo(x, y + wave)
        else ctx.lineTo(x, y + wave)
      }
      ctx.stroke()
    }

    ctx.strokeStyle = '#C9933E'
    ctx.lineWidth = 3
    for (let y = -8; y < 540; y += 24) {
      ctx.beginPath()
      for (let x = 0; x <= 512; x += 12) {
        const wave = Math.sin(x * 0.04 + y * 0.15 + 1.2) * 8
        if (x === 0) ctx.moveTo(x, y + wave)
        else ctx.lineTo(x, y + wave)
      }
      ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2.5, 2.5)
    return tex
  }, [])

  return (
    <group position={[0, -2.4, 0]}>
      {/* Suelo de Parquet de Madera */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[28, 24]} />
        <meshStandardMaterial color="#1E1C1F" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Alfombra del Estudio (exactamente angulada como en la foto) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.12]} position={[-0.1, 0.015, -0.4]}>
        <planeGeometry args={[7.2, 5.4]} />
        <meshStandardMaterial map={rugTexture} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── 2. ARQUITECTURA: PAREDES ACÚSTICAS, DIFUSORES Y CABINA DE CONTROL ──────
function StudioWalls() {
  const diffuserTex = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1A1412'
    ctx.fillRect(0, 0, 256, 256)

    const blockSize = 32
    for (let x = 0; x < 256; x += blockSize) {
      for (let y = 0; y < 256; y += blockSize) {
        const tone = Math.floor(25 + Math.random() * 45)
        ctx.fillStyle = `rgb(${tone + 12}, ${tone + 2}, ${tone - 4})`
        ctx.fillRect(x + 1, y + 1, blockSize - 2, blockSize - 2)
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 5)
    return tex
  }, [])

  return (
    <group>
      {/* Pared Trasera Central (Pizarra / Piedra de Estudio) */}
      <mesh position={[0, 1.2, -6.5]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* Pantalla Plana Central Montada en la Pared */}
      <mesh position={[0, 1.8, -6.42]}>
        <boxGeometry args={[3.2, 1.8, 0.08]} />
        <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, -6.37]}>
        <planeGeometry args={[3.05, 1.65]} />
        <meshBasicMaterial color="#0B132B" />
      </mesh>

      {/* Pared Izquierda con Tratamiento Acústico Negro */}
      <mesh position={[-6.8, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>

      {/* Bloques Difusores de Madera en Esquinas */}
      <mesh position={[-4.6, 1.2, -6.38]} scale={[2.4, 7.2, 0.15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={diffuserTex} roughness={0.7} />
      </mesh>
      <mesh position={[4.6, 1.2, -6.38]} scale={[2.4, 7.2, 0.15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={diffuserTex} roughness={0.7} />
      </mesh>

      {/* Ventana Angular de la Cabina de Grabación (Derecha) */}
      <group position={[6.0, 1.2, -0.6]} rotation={[0, -Math.PI * 0.4, 0]}>
        {/* Marco de madera de la ventana */}
        <mesh>
          <boxGeometry args={[4.8, 5.2, 0.22]} />
          <meshStandardMaterial color="#A16207" roughness={0.4} />
        </mesh>
        {/* Cristal iluminado hacia la cabina */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[4.0, 4.4]} />
          <meshPhysicalMaterial
            color="#FEF3C7"
            roughness={0.1}
            transmission={0.65}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
    </group>
  )
}

// ─── 3. MONITORES DE ESTUDIO SOBRE PEDESTALES ────────────────────────────────
function StudioMonitors() {
  return (
    <group>
      {/* Monitor Izquierdo */}
      <group position={[-2.9, -2.4, -4.6]}>
        {/* Pedestal Blanco */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.75, 2.0, 0.75]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
        </mesh>
        {/* Bafle de Madera */}
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[0.95, 1.25, 0.65]} />
          <meshStandardMaterial color="#3E2723" roughness={0.4} />
        </mesh>
        {/* Cono Blanco */}
        <mesh position={[0, 2.7, 0.33]}>
          <circleGeometry args={[0.32, 32]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.3, 0.33]}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.5} />
        </mesh>
      </group>

      {/* Monitor Derecho */}
      <group position={[2.9, -2.4, -4.6]}>
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.75, 2.0, 0.75]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
        </mesh>
        <mesh position={[0, 2.6, 0]}>
          <boxGeometry args={[0.95, 1.25, 0.65]} />
          <meshStandardMaterial color="#3E2723" roughness={0.4} />
        </mesh>
        <mesh position={[0, 2.7, 0.33]}>
          <circleGeometry args={[0.32, 32]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.3, 0.33]}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── 4. MESA DE PRODUCCIÓN, AMPLIFICADOR VOX Y RACKS ─────────────────────────
function StudioFurniture() {
  return (
    <group>
      {/* Amplificador de Guitarra/Bajo Estilo VOX (Suelo Izquierda) */}
      <group position={[-1.8, -2.4, -2.2]} rotation={[0, 0.22, 0]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[1.5, 1.1, 0.6]} />
          <meshStandardMaterial color="#1E1B4B" roughness={0.5} />
        </mesh>
        {/* Rejilla de tela plateada vintage con rombos */}
        <mesh position={[0, 0.45, 0.31]}>
          <planeGeometry args={[1.35, 0.75]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.8} />
        </mesh>
        {/* Panel de control superior */}
        <mesh position={[0, 0.95, 0.25]} rotation={[-Math.PI * 0.08, 0, 0]}>
          <boxGeometry args={[1.35, 0.18, 0.1]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
        </mesh>
        <pointLight position={[0.5, 0.95, 0.35]} intensity={0.8} color="#EF4444" distance={1.0} />
      </group>

      {/* Flight Case con Mesa de Mezclas / Multitrack (Izquierda) */}
      <group position={[-2.4, -2.4, -0.9]} rotation={[0, 0.4, 0]}>
        {/* Soporte de tijera negro */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.9, 12]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>
        {/* Maleta de transporte abierta (Flight Case) */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[1.2, 0.2, 0.8]} />
          <meshStandardMaterial color="#78350F" roughness={0.6} />
        </mesh>
        {/* Consola de Mezclas / Mixer con Faders y Knobs */}
        <mesh position={[0, 1.05, 0]} rotation={[-0.15, 0, 0]}>
          <boxGeometry args={[1.05, 0.1, 0.7]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Mesa de Producción de Madera en el Centro Posterior */}
      <group position={[0, -2.4, -4.6]}>
        {/* Tablero de madera caoba */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[3.2, 0.08, 1.3]} />
          <meshStandardMaterial color="#451A03" roughness={0.35} />
        </mesh>
        {/* Patas de la mesa */}
        {[-1.4, 1.4].map((x, i) => (
          <mesh key={i} position={[x, 0.45, 0]}>
            <boxGeometry args={[0.1, 0.9, 1.1]} />
            <meshStandardMaterial color="#1C1917" roughness={0.4} />
          </mesh>
        ))}

        {/* Laptop de Producción Abierta */}
        <group position={[-0.1, 1.02, 0.1]}>
          <mesh>
            <boxGeometry args={[0.65, 0.02, 0.45]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.22, -0.22]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[0.65, 0.42, 0.02]} />
            <meshBasicMaterial color="#0284C7" />
          </mesh>
        </group>

        {/* Lámpara de Lava Cálida (como en la foto) */}
        <group position={[0.9, 1.35, -0.2]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.09, 0.55, 16]} />
            <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.9} />
          </mesh>
          <pointLight intensity={2.0} color="#F59E0B" distance={3.0} />
        </group>
      </group>

      {/* Silla de Estudio Frente a la Mesa */}
      <group position={[-0.15, -2.4, -3.2]} rotation={[0, -0.1, 0]}>
        {/* Asiento negro moderno */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.55, 0.08, 0.5]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        {/* Respaldo */}
        <mesh position={[0, 0.9, -0.22]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.5, 0.55, 0.06]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        {/* Patas de madera estilo nórdico */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── 5. ILUMINACIÓN VERDE ESMERALDA Y CÁLIDA (IDÉNTICA A LA IMAGEN) ──────────
function StudioLighting() {
  return (
    <group>
      {/* 🟢 LUCES NEÓN VERDE ESMERALDA DESDE EL SUELO (EL ALMA DEL ESTUDIO) */}
      <pointLight position={[-4.5, -2.1, -2.5]} intensity={5.0} color="#10B981" distance={9} />
      <pointLight position={[4.5, -2.1, -2.5]} intensity={5.0} color="#10B981" distance={9} />
      <pointLight position={[0, -2.2, -4.6]} intensity={4.0} color="#059669" distance={7} />
      <pointLight position={[-2.5, -2.2, 0.5]} intensity={4.5} color="#10B981" distance={8} />
      <pointLight position={[4.2, -2.2, 0.8]} intensity={4.5} color="#10B981" distance={8} />

      {/* 🟠 LUZ CÁLIDA SUPERIOR Y DE CABINA */}
      <directionalLight position={[0, 6, 4]} intensity={1.6} color="#FEF3C7" />
      <ambientLight intensity={0.7} color="#0F172A" />

      {/* Resplandor de la ventana de la cabina de control */}
      <pointLight position={[5.2, 1.2, -0.6]} intensity={2.5} color="#F59E0B" distance={7} />
    </group>
  )
}

// Pre-cargar todos los modelos GLB
useGLTF.preload('/models/drums.glb')
useGLTF.preload('/models/guitar.glb')
useGLTF.preload('/models/bass.glb')
useGLTF.preload('/models/violin.glb')
useGLTF.preload('/models/piano.glb')

// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 ESCENA PRINCIPAL: ESTUDIO DE PRODUCCIÓN MUSICAL 3D
// ═══════════════════════════════════════════════════════════════════════════════
export default function MusicScene() {
  return (
    <group>
      {/* Iluminación Atmosférica */}
      <StudioLighting />

      {/* Paredes, Pantalla, Difusores y Ventana de Cabina */}
      <StudioWalls />

      {/* Suelo de Madera y Alfombra */}
      <StudioFloorAndRug />

      {/* Monitores de Estudio sobre Pedestales */}
      <StudioMonitors />

      {/* Mobiliario, Amplificador Vox, Mesa y Silla */}
      <StudioFurniture />

      {/* 🎸 INSTRUMENTOS 3D (MODELOS GLB UBICADOS EN SU POSICIÓN REAL) */}
      <Suspense fallback={null}>
        {/* 1. BAJO ELÉCTRICO ROJO (EN SOPORTE VERTICAL, FRENTE IZQUIERDA) */}
        <AutoGLTFModel
          url="/models/bass.glb"
          targetHeight={1.45}
          position={[-3.3, -2.4, -0.4]}
          rotation={[0.1, 0.45, -0.05]}
        />

        {/* 2. GUITARRA ELÉCTRICA (LATERAL IZQUIERDO, JUNTO AL AMPLIFICADOR) */}
        <AutoGLTFModel
          url="/models/guitar.glb"
          targetHeight={1.35}
          position={[-2.4, -2.4, -2.0]}
          rotation={[0.12, 0.55, -0.08]}
        />

        {/* 3. BATERÍA ACÚSTICA COMPLETA (ÁREA DE GRABACIÓN, FONDO CENTRO) */}
        <AutoGLTFModel
          url="/models/drums.glb"
          targetHeight={1.5}
          position={[0.2, -2.4, -3.2]}
          rotation={[0, -0.15, 0]}
        />

        {/* 4. VIOLÍN CLÁSICO CON ARCO (EN LA SALA DE GRABACIÓN) */}
        <AutoGLTFModel
          url="/models/violin.glb"
          targetHeight={0.85}
          position={[-1.2, -1.45, -4.2]}
          rotation={[0.15, 0.35, -0.1]}
        />

        {/* 5. SINTETIZADOR / PIANO PRINCIPAL (SOPORTE DERECHO, FRENTE DERECHA) */}
        <AutoGLTFModel
          url="/models/piano.glb"
          targetHeight={0.95}
          position={[2.5, -2.4, -0.6]}
          rotation={[0, -0.75, 0]}
        />
      </Suspense>
    </group>
  )
}
