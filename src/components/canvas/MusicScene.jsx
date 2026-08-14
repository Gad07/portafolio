import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎙️ ESTUDIO DE GRABACIÓN MUSICAL PROFESIONAL 3D ULTRA DETALLADO
// Con Bajo Rojo, Guitarra, Amplificador Vox, Batería Acústica, Teclados/Sintetizadores,
// Violín con Estuche, Monitores de Estudio y Luces Verdes/Cálidas
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. BAJO ELÉCTRICO FENDER JAZZ BASS ROJO SOBRE SOPORTE TUBULAR ────────────
function RedJazzBassOnStand({ position = [-3.2, -2.4, -0.3], rotation = [0.1, 0.45, -0.04] }) {
  // Geometría del cuerpo Jazz Bass
  const bodyGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.45, -0.75)
    shape.bezierCurveTo(-0.65, -0.4, -0.65, 0.2, -0.3, 0.5)
    shape.bezierCurveTo(-0.45, 0.75, -0.35, 0.95, -0.12, 0.8) // Cuerno superior largo
    shape.bezierCurveTo(-0.06, 0.55, 0.08, 0.55, 0.12, 0.7)
    shape.bezierCurveTo(0.3, 0.85, 0.42, 0.65, 0.3, 0.45)
    shape.bezierCurveTo(0.65, 0.15, 0.65, -0.45, 0.45, -0.75)
    shape.bezierCurveTo(0.2, -0.95, -0.2, -0.95, -0.45, -0.75)

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025
    })
    geo.center()
    return geo
  }, [])

  return (
    <group position={position} rotation={rotation}>
      {/* SOPORTE TUBULAR DE GUITARRA (STAND NEGRO) */}
      <group position={[0, 0, 0]}>
        {/* Base de trípode en el suelo */}
        {[-0.3, 0, 0.3].map((angle, i) => (
          <mesh key={i} position={[Math.sin(angle * 3) * 0.25, 0.05, Math.cos(angle * 3) * 0.25]} rotation={[0, angle * 3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
            <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Tubo vertical central */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 1.2, 12]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Cuna inferior de soporte del cuerpo */}
        <mesh position={[0, 0.35, 0.08]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>
      </group>

      {/* CUERPO DEL BAJO FIESTA RED LACADO */}
      <group position={[0, 0.85, 0.06]}>
        <mesh geometry={bodyGeo}>
          <meshPhysicalMaterial
            color="#E11D48"
            roughness={0.12}
            metalness={0.35}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Golpeador Blanco Perlado 3-Ply */}
        <mesh position={[0.02, 0.02, 0.052]} scale={[0.55, 0.55, 0.01]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>

        {/* Mástil de Madera Arce */}
        <mesh position={[0, 0.85, 0.02]}>
          <boxGeometry args={[0.11, 1.1, 0.05]} />
          <meshStandardMaterial color="#FDE68A" roughness={0.4} />
        </mesh>

        {/* Diapasón de Palisandro con Trastes de Níquel */}
        <mesh position={[0, 0.85, 0.05]}>
          <boxGeometry args={[0.1, 1.08, 0.012]} />
          <meshStandardMaterial color="#3E2723" roughness={0.6} />
        </mesh>

        {/* Clavijero Fender con 4 Clavijas Metálicas */}
        <mesh position={[0, 1.48, 0.015]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.16, 0.25, 0.04]} />
          <meshPhysicalMaterial color="#E11D48" roughness={0.2} clearcoat={0.8} />
        </mesh>
        {[-0.07, -0.02, 0.03, 0.08].map((yOff, i) => (
          <mesh key={i} position={[-0.09, 1.4 + yOff, 0.015]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 8]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* Pastillas Split Jazz Bass & Placa de Control */}
        <mesh position={[-0.03, 0.08, 0.06]}>
          <boxGeometry args={[0.08, 0.055, 0.025]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.03, 0.0, 0.06]}>
          <boxGeometry args={[0.08, 0.055, 0.025]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Placa de control cromada con perillas */}
        <mesh position={[0.16, -0.22, 0.055]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.08, 0.28, 0.015]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* 4 Cuerdas Plateadas de Bajo */}
        {[-0.03, -0.01, 0.01, 0.03].map((xOff, i) => (
          <mesh key={i} position={[xOff, 0.6, 0.065]}>
            <cylinderGeometry args={[0.0035, 0.0035, 1.8, 6]} />
            <meshBasicMaterial color="#F1F5F9" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ─── 2. AMPLIFICADOR DE VÁLVULAS ESTILO VOX AC30 ─────────────────────────────
function VoxTubeAmplifier({ position = [-1.9, -2.4, -2.1], rotation = [0, 0.22, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Gabinete de Madera Tolex Azul/Negro */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.25, 0.9, 0.52]} />
        <meshStandardMaterial color="#1E1B4B" roughness={0.55} />
      </mesh>

      {/* Ribete Dorado / Gold Piping */}
      <mesh position={[0, 0.45, 0.262]}>
        <ringGeometry args={[0.55, 0.56, 4]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Rejilla de Tela con Patrón de Rombos Diamante Vintage */}
      <mesh position={[0, 0.38, 0.264]}>
        <planeGeometry args={[1.15, 0.64]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.85} />
      </mesh>

      {/* Placa con Logo Dorado "VOX" */}
      <mesh position={[-0.32, 0.6, 0.27]}>
        <boxGeometry args={[0.24, 0.08, 0.02]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Panel de Control Superior Cromado */}
      <group position={[0, 0.82, 0.16]} rotation={[-Math.PI * 0.08, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.15, 0.16, 0.08]} />
          <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Perillas Chicken-Head Pointer Knobs */}
        {[-0.45, -0.3, -0.15, 0.0, 0.15, 0.3, 0.45].map((x, i) => (
          <mesh key={i} position={[x, 0.01, 0.045]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 10]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
          </mesh>
        ))}
        {/* Luz Piloto Roja Encendida (Jewel Light) */}
        <mesh position={[0.52, 0.01, 0.045]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <pointLight position={[0.52, 0.05, 0.1]} intensity={0.9} color="#EF4444" distance={0.8} />
      </group>

      {/* Asa de Cuero Superior */}
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.06]} />
        <meshStandardMaterial color="#3E2723" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ─── 3. FLIGHT CASE CON MESA DE MEZCLAS / MULTITRACK (IZQUIERDA) ─────────────
function FlightCaseMixerStation({ position = [-2.5, -2.4, -0.8], rotation = [0, 0.38, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Soporte de Tijera Negro / Stand */}
      <group position={[0, 0.42, 0]}>
        <mesh rotation={[0, 0, 0.35]}>
          <cylinderGeometry args={[0.02, 0.02, 0.95, 8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.02, 0.02, 0.95, 8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>
      </group>

      {/* Maleta de Vuelo Vintage Abierta (Flight Case Tweed) */}
      <group position={[0, 0.88, 0]}>
        <mesh>
          <boxGeometry args={[1.05, 0.16, 0.68]} />
          <meshStandardMaterial color="#A16207" roughness={0.6} />
        </mesh>
        {/* Esquinas y Cierres Metálicos Plateados */}
        {[-0.52, 0.52].map((x, i) =>
          [-0.33, 0.33].map((z, j) => (
            <mesh key={`${i}-${j}`} position={[x, 0, z]}>
              <boxGeometry args={[0.06, 0.18, 0.06]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.1} />
            </mesh>
          ))
        )}

        {/* Consola de Mezclas / Grabadora Multitrack con Faders y Pantalla */}
        <group position={[0, 0.09, 0]} rotation={[-0.12, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.92, 0.08, 0.58]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Pantalla LCD / Medidores VU */}
          <mesh position={[0, 0.045, -0.15]}>
            <planeGeometry args={[0.45, 0.14]} />
            <meshBasicMaterial color="#0284C7" />
          </mesh>
          {/* Faders y potenciómetros */}
          {[-0.32, -0.22, -0.12, -0.02, 0.08, 0.18, 0.28].map((fx, k) => (
            <mesh key={k} position={[fx, 0.045, 0.1]}>
              <boxGeometry args={[0.02, 0.02, 0.22]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

// ─── 4. ESTACIÓN DE TECLADOS Y SINTETIZADORES (DERECHA) ──────────────────────
function SynthesizerStation({ position = [2.4, -2.4, -0.8], rotation = [0, -0.65, 0] }) {
  // Generador de 49/61 teclas de teclado
  const keys = useMemo(() => {
    const list = []
    const whiteWidth = 0.04
    for (let i = 0; i < 28; i++) {
      const isBlack = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22, 25, 27].includes(i)
      list.push({
        id: i,
        isBlack,
        x: (i - 14) * whiteWidth
      })
    }
    return list
  }, [])

  return (
    <group position={position} rotation={rotation}>
      {/* SOPORTE DE DOBLE PISO (DOUBLE-TIER X-STAND) */}
      <group position={[0, 0.45, 0]}>
        <mesh rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.022, 0.022, 1.0, 8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>
        <mesh rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.022, 0.022, 1.0, 8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>
      </group>

      {/* TECLADO 1 (PISO INFERIOR: SINTETIZADOR TIPO ROLAND JUNO / YAMAHA DX7) */}
      <group position={[0, 0.88, 0]}>
        <mesh>
          <boxGeometry args={[1.35, 0.12, 0.48]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Panel de control superior con display y botones iluminados */}
        <mesh position={[0, 0.065, -0.11]} rotation={[-0.15, 0, 0]}>
          <planeGeometry args={[1.25, 0.2]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        {/* Pantalla LED verde */}
        <mesh position={[-0.1, 0.075, -0.11]}>
          <planeGeometry args={[0.22, 0.08]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
        {/* Rueda de Pitch Bend y Modulación */}
        <mesh position={[-0.58, 0.065, 0.08]}>
          <boxGeometry args={[0.04, 0.06, 0.08]} />
          <meshStandardMaterial color="#020617" roughness={0.3} />
        </mesh>
        {/* Teclas Blancas y Negras */}
        <group position={[0.05, 0.06, 0.1]}>
          {keys.map((k) => (
            <mesh key={k.id} position={[k.x, k.isBlack ? 0.03 : 0, k.isBlack ? -0.04 : 0]}>
              <boxGeometry args={[k.isBlack ? 0.024 : 0.036, k.isBlack ? 0.03 : 0.025, k.isBlack ? 0.14 : 0.22]} />
              <meshStandardMaterial color={k.isBlack ? '#020617' : '#F8FAFC'} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* TECLADO 2 (PISO SUPERIOR INCLINADO HACIA EL MÚSICO) */}
      <group position={[0, 1.25, -0.15]} rotation={[0.28, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.15, 0.1, 0.42]} />
          <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Pantalla y Controles */}
        <mesh position={[0, 0.055, -0.09]}>
          <planeGeometry args={[1.05, 0.16]} />
          <meshStandardMaterial color="#1E1B4B" roughness={0.5} />
        </mesh>
        {/* Teclas del Sintetizador Superior */}
        <group position={[0.02, 0.055, 0.08]}>
          {keys.slice(4, 24).map((k) => (
            <mesh key={k.id} position={[k.x, k.isBlack ? 0.025 : 0, k.isBlack ? -0.03 : 0]}>
              <boxGeometry args={[k.isBlack ? 0.024 : 0.036, k.isBlack ? 0.025 : 0.02, k.isBlack ? 0.12 : 0.18]} />
              <meshStandardMaterial color={k.isBlack ? '#020617' : '#F8FAFC'} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* TECLADO 3 (PRIMER PLANO DERECHO, ORIENTADO AL CENTRO) */}
      <group position={[-0.2, 0.65, 0.9]} rotation={[0.12, 0.4, -0.05]}>
        <mesh>
          <boxGeometry args={[1.25, 0.1, 0.44]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Teclas frontales */}
        <group position={[0, 0.055, 0.06]}>
          {keys.slice(2, 26).map((k) => (
            <mesh key={k.id} position={[k.x, k.isBlack ? 0.025 : 0, k.isBlack ? -0.03 : 0]}>
              <boxGeometry args={[k.isBlack ? 0.024 : 0.036, k.isBlack ? 0.025 : 0.02, k.isBlack ? 0.12 : 0.19]} />
              <meshStandardMaterial color={k.isBlack ? '#020617' : '#F8FAFC'} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  )
}

// ─── 5. BATERÍA ACÚSTICA COMPLETA DE ESTUDIO ─────────────────────────────────
function AcousticDrumKit({ position = [0.1, -2.4, -3.2], rotation = [0, -0.15, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* 1. BOMBO 22" (BASS DRUM) */}
      <group position={[0, 0.6, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.58, 0.58, 0.55, 32]} />
          <meshPhysicalMaterial color="#4C1D95" roughness={0.2} metalness={0.4} clearcoat={0.9} />
        </mesh>
        {/* Aros de madera y parches blanco y negro */}
        <mesh position={[0, 0, 0.28]}>
          <circleGeometry args={[0.56, 32]} />
          <meshStandardMaterial color="#020617" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.28]}>
          <circleGeometry args={[0.56, 32]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        {/* Patas cromadas del bombo */}
        {[-0.55, 0.55].map((x, i) => (
          <mesh key={i} position={[x, -0.3, 0.1]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 2. CAJA / TAROLA 14" CON SOPORTE (SNARE DRUM) */}
      <group position={[-0.65, 0.72, 0.35]} rotation={[0.1, 0, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.092, 0]}>
          <circleGeometry args={[0.27, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
        </mesh>
        {/* Trípode de la caja */}
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.6, 8]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} />
        </mesh>
      </group>

      {/* 3. TOMS SUSPENDIDOS DE 10" Y 12" */}
      <group position={[-0.28, 1.25, 0.08]} rotation={[0.25, 0.15, -0.15]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.24, 24]} />
          <meshPhysicalMaterial color="#4C1D95" roughness={0.2} metalness={0.4} clearcoat={0.9} />
        </mesh>
        <mesh position={[0, 0.122, 0]}>
          <circleGeometry args={[0.21, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
      </group>
      <group position={[0.28, 1.25, 0.08]} rotation={[0.25, -0.15, 0.15]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.26, 24]} />
          <meshPhysicalMaterial color="#4C1D95" roughness={0.2} metalness={0.4} clearcoat={0.9} />
        </mesh>
        <mesh position={[0, 0.132, 0]}>
          <circleGeometry args={[0.23, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
      </group>

      {/* 4. TOM DE PISO 16" (FLOOR TOM) */}
      <group position={[0.7, 0.58, 0.25]}>
        <mesh>
          <cylinderGeometry args={[0.34, 0.34, 0.38, 24]} />
          <meshPhysicalMaterial color="#4C1D95" roughness={0.2} metalness={0.4} clearcoat={0.9} />
        </mesh>
        <mesh position={[0, 0.192, 0]}>
          <circleGeometry args={[0.33, 24]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
        </mesh>
        {/* 3 Patas cromadas del Floor Tom */}
        {[0, 2.1, 4.2].map((ang, i) => (
          <mesh key={i} position={[Math.cos(ang) * 0.35, -0.28, Math.sin(ang) * 0.35]}>
            <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.95} />
          </mesh>
        ))}
      </group>

      {/* 5. PLATILLOS DORADOS DE BRONCE Y HI-HAT */}
      <group>
        {/* Hi-Hat con soporte de pedal (Izquierda) */}
        <group position={[-0.95, 0.95, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.012, 24]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.015, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.012, 24]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.95, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
          </mesh>
        </group>

        {/* Platillo Crash 16" (Izquierda) */}
        <group position={[-0.8, 1.55, -0.05]} rotation={[0.2, 0, -0.15]}>
          <mesh>
            <cylinderGeometry args={[0.42, 0.42, 0.01, 32]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 1.5, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
          </mesh>
        </group>

        {/* Platillo Ride 20" (Derecha) */}
        <group position={[0.85, 1.45, -0.1]} rotation={[0.15, 0, 0.2]}>
          <mesh>
            <cylinderGeometry args={[0.48, 0.48, 0.01, 32]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 1.4, 8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ─── 6. VIOLÍN CLÁSICO CON ARCO EN ESTUCHE DE TERCIOPELO ─────────────────────
function ClassicViolinInCase({ position = [-1.3, -1.35, -4.2], rotation = [0.15, 0.35, -0.1] }) {
  const violinBody = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, -0.38)
    shape.bezierCurveTo(-0.25, -0.35, -0.25, -0.15, -0.12, 0.0)
    shape.bezierCurveTo(-0.08, 0.06, -0.08, 0.1, -0.16, 0.15)
    shape.bezierCurveTo(-0.22, 0.25, -0.18, 0.36, 0, 0.38)
    shape.bezierCurveTo(0.18, 0.36, 0.22, 0.25, 0.16, 0.15)
    shape.bezierCurveTo(0.08, 0.1, 0.08, 0.06, 0.12, 0.0)
    shape.bezierCurveTo(0.25, -0.15, 0.25, -0.35, 0, -0.38)

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015
    })
    geo.center()
    return geo
  }, [])

  return (
    <group position={position} rotation={rotation}>
      {/* ESTUCHE DE VIOLÍN ABIERTO FORRADO EN TERCIOPELO AZUL MARINO */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.55]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <boxGeometry args={[0.85, 0.02, 0.5]} />
        <meshStandardMaterial color="#1E1B4B" roughness={0.9} />
      </mesh>

      {/* VIOLÍN CLÁSICO DE MADERA BARNIZADA */}
      <group position={[0, 0.06, 0]}>
        <mesh geometry={violinBody}>
          <meshPhysicalMaterial
            color="#9A3412"
            roughness={0.2}
            metalness={0.1}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Agujeros en 'f' tallados */}
        <mesh position={[-0.06, 0.02, 0.045]}>
          <planeGeometry args={[0.025, 0.14]} />
          <meshBasicMaterial color="#1C1917" />
        </mesh>
        <mesh position={[0.06, 0.02, 0.045]}>
          <planeGeometry args={[0.025, 0.14]} />
          <meshBasicMaterial color="#1C1917" />
        </mesh>

        {/* Mástil y Diapasón de Ébano */}
        <mesh position={[0, 0.36, 0.025]}>
          <boxGeometry args={[0.045, 0.38, 0.025]} />
          <meshStandardMaterial color="#020617" roughness={0.3} />
        </mesh>

        {/* Voluta / Clavijero */}
        <mesh position={[0, 0.58, 0.025]}>
          <cylinderGeometry args={[0.025, 0.025, 0.09, 12]} />
          <meshStandardMaterial color="#7C2D12" roughness={0.3} />
        </mesh>

        {/* Puente de Madera */}
        <mesh position={[0, 0.02, 0.06]}>
          <boxGeometry args={[0.08, 0.015, 0.035]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.6} />
        </mesh>

        {/* 4 Cuerdas Finas Plateadas */}
        {[-0.012, -0.004, 0.004, 0.012].map((x, i) => (
          <mesh key={i} position={[x, 0.22, 0.068]}>
            <cylinderGeometry args={[0.001, 0.001, 0.68, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}

        {/* Arco de Violín Flotante al Lado del Estuche */}
        <group position={[0.28, 0.02, 0]} rotation={[0, 0, Math.PI * 0.48]}>
          <mesh>
            <cylinderGeometry args={[0.006, 0.006, 0.82, 8]} />
            <meshStandardMaterial color="#451A03" roughness={0.4} />
          </mesh>
          <mesh position={[0.01, 0, 0]}>
            <cylinderGeometry args={[0.0015, 0.0015, 0.8, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ─── 7. MESA DE PRODUCCIÓN CON LAPTOP DAW, MPC Y LÁMPARA DE LAVA ─────────────
function ProductionDeskStation({ position = [0, -2.4, -4.6] }) {
  return (
    <group position={position}>
      {/* Tablero de Madera Caoba */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[3.2, 0.08, 1.3]} />
        <meshStandardMaterial color="#451A03" roughness={0.35} />
      </mesh>
      {/* Patas de la Mesa */}
      {[-1.4, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0]}>
          <boxGeometry args={[0.1, 0.9, 1.1]} />
          <meshStandardMaterial color="#1C1917" roughness={0.4} />
        </mesh>
      ))}

      {/* Laptop de Producción Abierta con Pantalla de DAW */}
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

      {/* Sampler MPC de Pads de Batería */}
      <group position={[-0.85, 1.03, 0.05]} rotation={[-0.15, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.48, 0.05, 0.42]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* 16 Pads de Goma Iluminados */}
        {[-0.12, -0.04, 0.04, 0.12].map((px, r) =>
          [-0.1, -0.02, 0.06, 0.14].map((pz, c) => (
            <mesh key={`${r}-${c}`} position={[px, 0.03, pz]}>
              <boxGeometry args={[0.06, 0.015, 0.06]} />
              <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
            </mesh>
          ))
        )}
      </group>

      {/* Lámpara de Lava Cálida de Acento */}
      <group position={[0.95, 1.35, -0.2]}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.09, 0.55, 16]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.9} />
        </mesh>
        <pointLight intensity={2.0} color="#F59E0B" distance={3.0} />
      </group>

      {/* Silla de Estudio Frente a la Mesa */}
      <group position={[-0.15, 0, 1.4]} rotation={[0, -0.1, 0]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.55, 0.08, 0.5]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.9, -0.22]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.5, 0.55, 0.06]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// ─── 8. MONITORES DE ESTUDIO SOBRE PEDESTALES ────────────────────────────────
function StudioMonitors() {
  return (
    <group>
      {/* Monitor Izquierdo */}
      <group position={[-2.9, -2.4, -4.6]}>
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

// ─── 9. ARQUITECTURA DEL ESTUDIO (PAREDES, PANTALLA, DIFUSORES, VENTANA) ─────
function StudioArchitecture() {
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
      {/* Pared Trasera Central (Pizarra / Piedra Acústica) */}
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

      {/* Pared Izquierda con Paneles Acústicos Negros */}
      <mesh position={[-6.8, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.95} />
      </mesh>

      {/* Difusores Acústicos de Madera en Esquinas */}
      <mesh position={[-4.6, 1.2, -6.38]} scale={[2.4, 7.2, 0.15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={diffuserTex} roughness={0.7} />
      </mesh>
      <mesh position={[4.6, 1.2, -6.38]} scale={[2.4, 7.2, 0.15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={diffuserTex} roughness={0.7} />
      </mesh>

      {/* Ventana Angular de la Cabina de Control a la Derecha */}
      <group position={[6.0, 1.2, -0.6]} rotation={[0, -Math.PI * 0.4, 0]}>
        <mesh>
          <boxGeometry args={[4.8, 5.2, 0.22]} />
          <meshStandardMaterial color="#A16207" roughness={0.4} />
        </mesh>
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

// ─── 10. SUELO DE MADERA Y ALFOMBRA PATRONADA ────────────────────────────────
function StudioFloor() {
  const rugTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#E4DFD3'
    ctx.fillRect(0, 0, 512, 512)

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[28, 24]} />
        <meshStandardMaterial color="#1E1C1F" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.12]} position={[-0.1, 0.015, -0.4]}>
        <planeGeometry args={[7.2, 5.4]} />
        <meshStandardMaterial map={rugTexture} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── 11. ILUMINACIÓN VERDE ESMERALDA Y CÁLIDA DEL ESTUDIO ────────────────────
function StudioLighting() {
  return (
    <group>
      {/* 🟢 LUCES NEÓN VERDE ESMERALDA DESDE EL SUELO (IGUAL QUE EN LA FOTO) */}
      <pointLight position={[-4.5, -2.1, -2.5]} intensity={5.0} color="#10B981" distance={9} />
      <pointLight position={[4.5, -2.1, -2.5]} intensity={5.0} color="#10B981" distance={9} />
      <pointLight position={[0, -2.2, -4.6]} intensity={4.0} color="#059669" distance={7} />
      <pointLight position={[-2.5, -2.2, 0.5]} intensity={4.5} color="#10B981" distance={8} />
      <pointLight position={[4.2, -2.2, 0.8]} intensity={4.5} color="#10B981" distance={8} />

      {/* 🟠 LUZ CÁLIDA SUPERIOR Y DE CABINA */}
      <directionalLight position={[0, 6, 4]} intensity={1.8} color="#FEF3C7" />
      <ambientLight intensity={0.75} color="#0F172A" />

      {/* Resplandor de la ventana de la cabina de control */}
      <pointLight position={[5.2, 1.2, -0.6]} intensity={2.5} color="#F59E0B" distance={7} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 ESCENA PRINCIPAL: ESTUDIO DE GRABACIÓN MUSICAL PROFESIONAL COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════
export default function MusicScene() {
  return (
    <group>
      {/* Iluminación Atmosférica */}
      <StudioLighting />

      {/* Arquitectura, Paredes Acústicas, Difusores y Ventana */}
      <StudioArchitecture />

      {/* Suelo de Madera y Alfombra */}
      <StudioFloor />

      {/* Monitores de Estudio sobre Pedestales */}
      <StudioMonitors />

      {/* Mesa de Producción con Laptop DAW, MPC Sampler y Lámpara de Lava */}
      <ProductionDeskStation />

      {/* 1. BAJO ELÉCTRICO FENDER ROJO EN SOPORTE VERTICAL (FRENTE IZQUIERDA) */}
      <RedJazzBassOnStand position={[-3.3, -2.4, -0.3]} rotation={[0.1, 0.45, -0.04]} />

      {/* 2. AMPLIFICADOR VOX AC30 EN EL SUELO CON REJILLA DE TELA Y PILOTO */}
      <VoxTubeAmplifier position={[-1.9, -2.4, -2.1]} rotation={[0, 0.22, 0]} />

      {/* 3. FLIGHT CASE CON MESA DE MEZCLAS MULTITRACK (IZQUIERDA) */}
      <FlightCaseMixerStation position={[-2.5, -2.4, -0.8]} rotation={[0, 0.38, 0]} />

      {/* 4. ESTACIÓN DE TECLADOS Y SINTETIZADORES EN STAND X (DERECHA) */}
      <SynthesizerStation position={[2.4, -2.4, -0.8]} rotation={[0, -0.65, 0]} />

      {/* 5. BATERÍA ACÚSTICA COMPLETA (ZONA CENTRAL DE GRABACIÓN) */}
      <AcousticDrumKit position={[0.1, -2.4, -3.2]} rotation={[0, -0.15, 0]} />

      {/* 6. VIOLÍN CLÁSICO CON ARCO EN ESTUCHE DE TERCIOPELO */}
      <ClassicViolinInCase position={[-1.3, -1.35, -4.2]} rotation={[0.15, 0.35, -0.1]} />
    </group>
  )
}
