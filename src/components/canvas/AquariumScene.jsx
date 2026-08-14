import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// ─── MOUSE GLOBAL REF (compartido entre componentes) ─────────────────────────
// Se actualiza desde window.mousemove para esquivar el pointerEvents:none del div
export const globalMouse = { x: 0, y: 0 }

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TEXTURAS PROCEDURALES HD AQUASCAPING
// ═══════════════════════════════════════════════════════════════════════════════

// Textura del cuerpo del Koi: base blanca con manchas naranja y negro
function createKoiBodyTexture() {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 512
  const ctx = c.getContext('2d')

  // Base blanca/crema
  ctx.fillStyle = '#F8F4EE'
  ctx.fillRect(0, 0, 1024, 512)

  // Manchas naranjas grandes irregulares (patrón Kohaku)
  const orangePatches = [
    { x: 320, y: 180, rx: 180, ry: 120 },
    { x: 680, y: 280, rx: 140, ry: 100 },
    { x: 820, y: 140, rx: 100, ry: 85 },
    { x: 150, y: 320, rx: 110, ry: 80 },
    { x: 500, y: 380, rx: 90,  ry: 70 },
  ]
  orangePatches.forEach(p => {
    const g = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, Math.max(p.rx, p.ry))
    g.addColorStop(0,   '#FF7A00')
    g.addColorStop(0.55,'#E85A00')
    g.addColorStop(1,   'rgba(230,80,0,0)')
    ctx.fillStyle = g
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.scale(1, p.ry / p.rx)
    ctx.beginPath()
    ctx.arc(0, 0, p.rx, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })

  // Manchas negras más pequeñas
  const blackPatches = [
    { x: 200, y: 120, r: 55 },
    { x: 750, y: 380, r: 45 },
    { x: 950, y: 260, r: 35 },
  ]
  blackPatches.forEach(p => {
    const g = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, p.r)
    g.addColorStop(0,   '#1A1A1A')
    g.addColorStop(0.6, '#0D0D0D')
    g.addColorStop(1,   'rgba(10,10,10,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  })

  // Escamas: cuadrícula hexagonal muy sutil sobre todo el cuerpo
  ctx.strokeStyle = 'rgba(180,160,140,0.25)'
  ctx.lineWidth = 0.9
  for (let row = 0; row < 52; row++) {
    const yPos = row * 10
    const xOff = row % 2 === 0 ? 0 : 7
    for (let col = 0; col < 78; col++) {
      const xPos = col * 14 + xOff
      ctx.beginPath()
      ctx.arc(xPos, yPos, 7, 0, Math.PI)
      ctx.stroke()
    }
  }

  // Brillo dorsal (lomo ligeramente más oscuro)
  const dorsalShade = ctx.createLinearGradient(0, 0, 0, 180)
  dorsalShade.addColorStop(0, 'rgba(50,30,10,0.3)')
  dorsalShade.addColorStop(1, 'rgba(50,30,10,0)')
  ctx.fillStyle = dorsalShade
  ctx.fillRect(0, 0, 1024, 180)

  // Vientre más claro
  const bellyShine = ctx.createLinearGradient(0, 360, 0, 512)
  bellyShine.addColorStop(0, 'rgba(255,255,255,0)')
  bellyShine.addColorStop(1, 'rgba(255,255,255,0.35)')
  ctx.fillStyle = bellyShine
  ctx.fillRect(0, 360, 1024, 152)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Textura de aletas del Koi: semitransparente naranja/blanco con rayos
function createKoiFinTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, 512, 512)

  // Base anaranjada translucida
  const grad = ctx.createRadialGradient(256, 480, 5, 256, 256, 300)
  grad.addColorStop(0.0, 'rgba(240,120,20,0.90)')
  grad.addColorStop(0.45,'rgba(220,90,10,0.65)')
  grad.addColorStop(0.8, 'rgba(200,70,5,0.35)')
  grad.addColorStop(1.0, 'rgba(180,60,0,0.05)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // Rayos de la aleta (fin rays) finos y paralelos
  const rays = 30
  for (let i = 0; i < rays; i++) {
    const t = i / (rays - 1)
    const startX = 150 + t * 212
    const startY = 470
    const endX   = 30 + t * 452
    const endY   = 30 + Math.sin(t * Math.PI) * 80
    const alpha = 0.25 + Math.sin(t * Math.PI) * 0.3
    ctx.strokeStyle = `rgba(180,80,10,${alpha})`
    ctx.lineWidth = 1.1
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.quadraticCurveTo(
      startX + (endX - startX) * 0.4 + (Math.random() - 0.5) * 20,
      startY + (endY - startY) * 0.5,
      endX, endY
    )
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(c)
  return tex
}

// Bump map de escamas para el Koi
function createBumpMap() {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 256, 256)
  for (let row = 0; row < 26; row++) {
    const yPos = row * 10
    const xOff = row % 2 === 0 ? 0 : 6
    for (let col = 0; col < 20; col++) {
      const xPos = col * 13 + xOff
      const g = ctx.createRadialGradient(xPos, yPos, 1, xPos, yPos, 6)
      g.addColorStop(0, '#FFFFFF')
      g.addColorStop(0.5, '#AAAAAA')
      g.addColorStop(1, '#404040')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(xPos, yPos, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

function createGravelTexture() {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 1024
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#D8D6CE'
  ctx.fillRect(0, 0, 1024, 1024)
  const cols = ['#FFFBF5', '#F5F2EA', '#EAE7DC', '#D8D3C5', '#C5C1B0', '#B8B4A8', '#F2EFE7']
  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * 1024, y = Math.random() * 1024
    const rx = 4 + Math.random() * 13, ry = rx * (0.45 + Math.random() * 0.5)
    const rot = Math.random() * Math.PI
    const col = cols[Math.floor(Math.random() * cols.length)]
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
    const g = ctx.createRadialGradient(rx * -0.25, ry * -0.35, 1, rx * 0.1, ry * 0.1, rx * 1.1)
    const r = parseInt(col.slice(1, 3), 16), gr = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16)
    g.addColorStop(0, `rgb(${Math.min(r + 30, 255)},${Math.min(gr + 30, 255)},${Math.min(b + 30, 255)})`)
    g.addColorStop(0.6, col)
    g.addColorStop(1, `rgb(${Math.max(r - 30, 0)},${Math.max(gr - 30, 0)},${Math.max(b - 30, 0)})`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(8, 8)
  return tex
}

// Textura de roca tipo PIZARRA/SLATE oscura (como la imagen de referencia)
function createRockTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')

  // Base gris-azulado oscuro (seiryu stone / pizarra)
  ctx.fillStyle = '#2E3238'
  ctx.fillRect(0, 0, 512, 512)

  // Vetas horizontales de estratificación (característica de la pizarra)
  for (let i = 0; i < 30; i++) {
    const y = Math.random() * 512
    const thickness = 0.6 + Math.random() * 2.5
    const alpha = 0.15 + Math.random() * 0.3
    // Línea clara (estrato claro)
    ctx.strokeStyle = `rgba(120,130,145,${alpha})`
    ctx.lineWidth = thickness
    ctx.beginPath()
    ctx.moveTo(0, y)
    // Veta ligeramente ondulada
    for (let x = 0; x <= 512; x += 32)
      ctx.lineTo(x, y + (Math.random() - 0.5) * 6)
    ctx.stroke()
  }

  // Textura granulada de grano fino
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 512, y = Math.random() * 512
    const r = 0.3 + Math.random() * 1.2
    const s = 28 + Math.floor(Math.random() * 30)
    ctx.fillStyle = `rgb(${s + 18},${s + 20},${s + 25})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Grietas superficiales finas (característica de la pizarra natural)
  for (let i = 0; i < 12; i++) {
    const x1 = Math.random() * 512, y1 = Math.random() * 512
    const len = 60 + Math.random() * 120
    const angle = Math.random() * Math.PI
    ctx.strokeStyle = `rgba(12,14,18,${0.5 + Math.random() * 0.4})`
    ctx.lineWidth = 0.5 + Math.random() * 1.2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

function createLeafTexture() {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 512
  const ctx = c.getContext('2d')
  const base = ctx.createLinearGradient(0, 0, 0, 512)
  base.addColorStop(0.0, '#45F000')
  base.addColorStop(0.3, '#2CC800')
  base.addColorStop(0.65, '#189500')
  base.addColorStop(1.0, '#0A5800')
  ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 512)
  // Sombras laterales
  const sh = ctx.createLinearGradient(0, 0, 256, 0)
  sh.addColorStop(0, 'rgba(0,30,0,0.55)'); sh.addColorStop(0.4, 'rgba(0,30,0,0)'); sh.addColorStop(0.6, 'rgba(0,30,0,0)'); sh.addColorStop(1, 'rgba(0,30,0,0.55)')
  ctx.fillStyle = sh; ctx.fillRect(0, 0, 256, 512)
  // Brillo central satinado
  const shine = ctx.createLinearGradient(70, 0, 190, 0)
  shine.addColorStop(0, 'rgba(255,255,255,0)'); shine.addColorStop(0.5, 'rgba(255,255,255,0.22)'); shine.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shine; ctx.fillRect(0, 0, 256, 512)
  // Nervio central
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(128, 512); ctx.stroke()
  // Nervios laterales
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1.1
  for (let y = 18; y < 490; y += 20) {
    ctx.beginPath(); ctx.moveTo(128, y)
    ctx.quadraticCurveTo(90, y - 14, 25, y - 22); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(128, y)
    ctx.quadraticCurveTo(166, y - 14, 231, y - 22); ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  return tex
}

function createMossTexture() {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#175800'; ctx.fillRect(0, 0, 256, 256)
  const shades = ['#2ECC11', '#1DA800', '#159000', '#0D6B00', '#3DFF15', '#28A800', '#12730A']
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, r = 0.3 + Math.random() * 2.0
    ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)]
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(5, 5)
  return tex
}

// Fondo acuario: agua cristalina verde-azul brillante (iluminación LED)
function createBackWallTexture() {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')

  // Fondo azul-verde cristalino con luz LED
  const bg = ctx.createLinearGradient(0, 0, 0, 512)
  bg.addColorStop(0.0,  '#A8E6FA')  // Azul cielo muy claro arriba (LED)
  bg.addColorStop(0.25, '#6ECFF5')  // Celeste brillante
  bg.addColorStop(0.60, '#3DB8D8')  // Azul agua medio
  bg.addColorStop(1.0,  '#1A8AAA')  // Más profundo abajo
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 512, 512)

  // Reflejo de luz LED en la superficie (destello brillante arriba)
  const ledGlow = ctx.createLinearGradient(0, 0, 0, 120)
  ledGlow.addColorStop(0, 'rgba(255,255,255,0.55)')
  ledGlow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = ledGlow
  ctx.fillRect(0, 0, 512, 120)

  // Niebla acuática difusa al centro
  const mist = ctx.createRadialGradient(256, 200, 20, 256, 200, 240)
  mist.addColorStop(0, 'rgba(200,240,255,0.45)')
  mist.addColorStop(1, 'rgba(200,240,255,0)')
  ctx.fillStyle = mist
  ctx.fillRect(0, 0, 512, 512)

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// Textura de arena blanca FINA (substrate del aquascape de referencia)
function createSandTexture() {
  const c = document.createElement('canvas')
  c.width = 1024; c.height = 1024
  const ctx = c.getContext('2d')

  // Base blanca crema uniforme
  ctx.fillStyle = '#F5F2EC'
  ctx.fillRect(0, 0, 1024, 1024)

  // Granos de arena muy finos (puntitos)
  for (let i = 0; i < 50000; i++) {
    const x = Math.random() * 1024, y = Math.random() * 1024
    const r = 0.2 + Math.random() * 0.9
    const v = 200 + Math.floor(Math.random() * 50)
    ctx.fillStyle = `rgb(${v},${v - 5},${v - 10})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Piedrecillas redondeadas pequeñas (como en la foto — guijarros de río)
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 1024, y = Math.random() * 1024
    const rx = 3 + Math.random() * 8, ry = rx * (0.5 + Math.random() * 0.5)
    const rot = Math.random() * Math.PI
    const lightness = 140 + Math.floor(Math.random() * 80)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    const g = ctx.createRadialGradient(-rx * 0.2, -ry * 0.3, 1, rx * 0.1, 0, rx)
    g.addColorStop(0, `rgb(${Math.min(lightness + 40, 255)},${Math.min(lightness + 38, 255)},${Math.min(lightness + 35, 255)})`)
    g.addColorStop(0.6, `rgb(${lightness},${lightness - 5},${lightness - 8})`)
    g.addColorStop(1, `rgb(${Math.max(lightness - 35, 80)},${Math.max(lightness - 38, 78)},${Math.max(lightness - 40, 75)})`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 6)
  return tex
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🐟 PEZ KOI MEJORADO — MOVIMIENTO ORGÁNICO Y KINEMATICS
// ═══════════════════════════════════════════════════════════════════════════════
function BettaFish() {
  const rootRef = useRef()
  const spineRef = useRef()
  const tailBaseRef = useRef()
  const tailFinRef = useRef()
  
  const dorsalRef = useRef()
  const analRef = useRef()
  const pec1Ref = useRef()
  const pec2Ref = useRef()

  // Ref para suavizar la velocidad de nado
  const currentSpeed = useRef(0)

  const bodyTex = useMemo(() => createKoiBodyTexture(), [])
  const bumpTex = useMemo(() => createBumpMap(), [])
  const finTex = useMemo(() => createKoiFinTexture(), [])

  // Geometrías (se mantienen iguales)
  const bodyGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 36, 26)
    geo.scale(1.05, 0.52, 0.45)
    return geo
  }, [])
  const snoutGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.18, 14, 12)
    geo.scale(1, 0.8, 0.7)
    return geo
  }, [])
  const pedGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.10, 0.18, 0.50, 12)
    geo.rotateZ(Math.PI / 2)
    return geo
  }, [])
  const tailGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(-0.15, 0.30, -0.45, 0.70, -0.55, 1.10)
    shape.bezierCurveTo(-0.65, 1.40, -0.80, 1.55, -1.10, 1.50)
    shape.bezierCurveTo(-1.40, 1.45, -1.60, 1.20, -1.65, 0.85)
    shape.bezierCurveTo(-1.70, 0.40, -1.55, 0.10, -1.30, 0.00)
    shape.bezierCurveTo(-1.55, -0.10, -1.70, -0.40, -1.65, -0.85)
    shape.bezierCurveTo(-1.60, -1.20, -1.40, -1.45, -1.10, -1.50)
    shape.bezierCurveTo(-0.80, -1.55, -0.65, -1.40, -0.55, -1.10)
    shape.bezierCurveTo(-0.45, -0.70, -0.15, -0.30, 0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.012, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2
    })
    geo.center()
    return geo
  }, [])
  const dorsalGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.05, 0.35, 0.02, 0.70, -0.08, 0.95)
    shape.bezierCurveTo(-0.20, 1.15, -0.50, 1.10, -0.75, 0.90)
    shape.bezierCurveTo(-1.00, 0.70, -1.15, 0.40, -1.20, 0.10)
    shape.bezierCurveTo(-1.10, 0.03, -0.60, 0.00, 0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.010, bevelEnabled: false })
    geo.center()
    return geo
  }, [])
  const analGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(-0.20, -0.10, -0.55, -0.20, -0.90, -0.28)
    shape.bezierCurveTo(-1.20, -0.35, -1.40, -0.38, -1.50, -0.30)
    shape.bezierCurveTo(-1.30, -0.15, -0.90, -0.04, -0.50, 0.02)
    shape.bezierCurveTo(-0.25, 0.08, -0.05, 0.06, 0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.010, bevelEnabled: false })
    geo.center()
    return geo
  }, [])
  const pectoralGeo = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.bezierCurveTo(0.1, 0.15, 0.3, 0.35, 0.55, 0.40)
    shape.bezierCurveTo(0.70, 0.38, 0.75, 0.20, 0.65, 0.05)
    shape.bezierCurveTo(0.50, -0.08, 0.20, -0.05, 0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false })
    geo.center()
    return geo
  }, [])

  // ── ANIMACIÓN ORGÁNICA + FÍSICAS FLUIDAS ──
  useFrame((state, delta) => {
    if (!rootRef.current) return
    const time = state.clock.elapsedTime

    // 1. Calcular objetivo del ratón
    const targetX = globalMouse.x * 5.0
    const targetY = globalMouse.y * 2.8
    const targetZ = 3.6 + Math.sin(time * 0.7) * 0.14
    const targetPos = new THREE.Vector3(targetX, targetY, targetZ)

    const pos = rootRef.current.position
    const distToTarget = pos.distanceTo(targetPos)

    // 2. Velocidad de nado dinámica (Si está lejos, nada más rápido y agita la cola)
    const targetSwimSpeed = THREE.MathUtils.clamp(distToTarget * 1.8, 0.5, 6.0)
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSwimSpeed, delta * 3)

    // Desplazamiento
    pos.lerp(targetPos, Math.min(2.5 * delta, 1.0))

    // 3. Rotación (Yaw = giro, Pitch = elevación, Roll = alabeo en curvas)
    const dx = targetX - pos.x
    const dy = targetY - pos.y
    const targetYaw = Math.atan2(dx, 5.0)
    const targetPitch = -Math.atan2(dy, 5.0) * 0.4
    const targetRoll = -dx * 0.12 // Efecto realista: el pez se inclina al girar rápido

    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetYaw, 4.0 * delta)
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetPitch, 4.0 * delta)
    rootRef.current.rotation.z = THREE.MathUtils.lerp(rootRef.current.rotation.z, targetRoll, 4.0 * delta)

    // 4. Cinemática del esqueleto (Ondulación en S que se propaga)
    // Usamos currentSpeed para que coleé rápido si acelera y lento si flota
    const wave = time * currentSpeed.current * 2.0

    if (spineRef.current) spineRef.current.rotation.y = Math.sin(wave) * 0.10
    if (tailBaseRef.current) tailBaseRef.current.rotation.y = Math.sin(wave - 0.8) * 0.22 // Retraso en la onda
    if (tailFinRef.current) {
      tailFinRef.current.rotation.y = Math.sin(wave - 1.6) * 0.35 // Mayor amplitud en la punta
      tailFinRef.current.rotation.z = Math.cos(wave - 1.6) * 0.15 // Ligera torsión fluida
    }

    // Aletas respiran y aletean orgánicamente
    if (dorsalRef.current) dorsalRef.current.rotation.z = Math.sin(wave * 0.5) * 0.08
    if (analRef.current) analRef.current.rotation.z = Math.cos(wave * 0.5) * 0.08
    
    // Aletas pectorales baten coordinadas si nada rápido, desincronizadas si nada lento
    if (pec1Ref.current && pec2Ref.current) {
      const pecWave = currentSpeed.current > 2.0 ? wave : time * 3.0
      pec1Ref.current.rotation.x = Math.sin(pecWave) * 0.35
      pec2Ref.current.rotation.x = currentSpeed.current > 2.0 
        ? Math.sin(pecWave) * 0.35 
        : Math.sin(pecWave + Math.PI) * 0.35
    }
  })

  // Material Mejorado: Se añade iridiscencia (reflejo de arcoíris sutil de escamas) y más clearcoat (aspecto húmedo)
  const bodyMat = (
    <meshPhysicalMaterial
      map={bodyTex}
      bumpMap={bumpTex}
      bumpScale={0.025}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
      roughness={0.35}
      metalness={0.05}
      iridescence={0.25} 
      iridescenceIOR={1.4}
    />
  )

  const finMat = (
    <meshPhysicalMaterial
      map={finTex}
      transmission={0.60}
      transparent
      opacity={0.9}
      roughness={0.1}
      metalness={0.0}
      emissive="#FF5500"
      emissiveIntensity={0.08}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  )

  return (
    <group ref={rootRef} position={[0, 0.1, 3.6]}>
      
      {/* ESPINA PRINCIPAL (Ondula suave) */}
      <group ref={spineRef}>
        <mesh geometry={bodyGeo}>{bodyMat}</mesh>
        <mesh geometry={snoutGeo} position={[1.00, 0.03, 0]}>{bodyMat}</mesh>

        {/* BARBAS (bigotes) */}
        {[[0.18, 0.15], [0.18, -0.15]].map(([zOff, rot], idx) => (
          <mesh key={idx} position={[1.0, -0.06, zOff]} rotation={[rot * 0.8, 0, 0.25]}>
            <cylinderGeometry args={[0.008, 0.002, 0.55, 5]} />
            <meshBasicMaterial color="#E8C070" />
          </mesh>
        ))}

        {/* ALETA DORSAL */}
        <mesh ref={dorsalRef} geometry={dorsalGeo} position={[-0.0, 0.52, 0]} rotation={[0, 0, 0.05]}>
          {finMat}
        </mesh>

        {/* ALETA ANAL */}
        <mesh ref={analRef} geometry={analGeo} position={[-0.10, -0.50, 0]} rotation={[0, 0, 0.05]}>
          {finMat}
        </mesh>

        {/* ALETAS PECTORALES */}
        <mesh ref={pec1Ref} geometry={pectoralGeo} position={[0.40, -0.05, 0.44]} rotation={[0, -0.5, 0.6]}>
          {finMat}
        </mesh>
        <mesh ref={pec2Ref} geometry={pectoralGeo} position={[0.40, -0.05, -0.44]} rotation={[0, 0.5, 0.6]}>
          {finMat}
        </mesh>

        {/* OJOS */}
        {[0.44, -0.44].map((zPos, idx) => (
          <group key={idx} position={[0.60, 0.10, zPos]}>
            <mesh scale={[0.085, 0.085, 0.085]}>
              <sphereGeometry args={[1, 18, 18]} />
              <meshStandardMaterial color="#F2EEE8" roughness={0.05} />
            </mesh>
            <mesh position={[0.015, 0, 0]} scale={[0.063, 0.063, 0.063]}>
              <sphereGeometry args={[1, 14, 14]} />
              <meshStandardMaterial color="#1A0800" roughness={0.0} />
            </mesh>
            <mesh position={[0.048, 0, 0]} scale={[0.028, 0.028, 0.028]}>
              <sphereGeometry args={[1, 10, 10]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0.062, 0.020, 0.014]} scale={[0.010, 0.010, 0.010]}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        ))}

        {/* ── ARTICULACIÓN 1: PEDÚNCULO (Ondula con retraso) ── */}
        <group ref={tailBaseRef} position={[-0.75, 0, 0]}>
          <mesh geometry={pedGeo} position={[-0.23, 0, 0]}>{bodyMat}</mesh>

          {/* ── ARTICULACIÓN 2: ALETA CAUDAL (Ondula fuerte al final) ── */}
          <group ref={tailFinRef} position={[-0.43, 0, 0]}>
            <mesh geometry={tailGeo} position={[0, 0, 0]}>
              {finMat}
            </mesh>
          </group>

        </group>
      </group>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🐟 ESTADO GLOBAL DE ALIMENTACIÓN POR DOBLE CLIC ("FEEDING SYSTEM")
// ═══════════════════════════════════════════════════════════════════════════════
export const feedingState = {
  active: false,
  x: 0,
  y: 0,
  z: 1.0,
  spawnTime: 0,
  pellets: []
}

if (typeof window !== 'undefined') {
  window.addEventListener('dblclick', (e) => {
    const ndcX = (e.clientX / window.innerWidth) * 2 - 1
    const ndcY = -(e.clientY / window.innerHeight) * 2 + 1

    const worldX = ndcX * 4.6
    const worldY = ndcY * 2.6
    const worldZ = 1.0

    feedingState.active = true
    feedingState.x = worldX
    feedingState.y = worldY
    feedingState.z = worldZ
    feedingState.spawnTime = performance.now() / 1000

    // Generar 5 hojuelas / bolitas de comida de pez que flotan y se hunden lentamente
    feedingState.pellets = Array.from({ length: 6 }, (_, i) => ({
      id: Math.random(),
      x: worldX + (Math.random() - 0.5) * 0.5,
      y: worldY + (Math.random() - 0.5) * 0.4,
      z: worldZ + (Math.random() - 0.5) * 0.4,
      vy: 0.12 + Math.random() * 0.08,
      size: 0.045 + Math.random() * 0.025,
      opacity: 1.0,
      eaten: false
    }))
  })
}

// Visualizador de la comida cayendo en el agua con rendimiento nativo 60 FPS (0 re-renders)
function FoodPellets() {
  const groupRef = useRef()

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const now = performance.now() / 1000
    const elapsed = now - feedingState.spawnTime

    const meshes = groupRef.current.children

    for (let i = 0; i < 6; i++) {
      const mesh = meshes[i]
      const pellet = feedingState.pellets[i]
      if (!mesh) continue

      if (feedingState.active && pellet && pellet.opacity > 0.01) {
        mesh.visible = true
        if (!pellet.eaten) {
          pellet.y -= pellet.vy * delta * 0.8
          pellet.x += Math.sin(t * 3.0 + pellet.id * 10) * 0.002
          if (elapsed > 3.5) pellet.opacity = Math.max(0, pellet.opacity - delta * 1.6)
        } else {
          pellet.opacity = Math.max(0, pellet.opacity - delta * 5.0)
        }
        mesh.position.set(pellet.x, pellet.y, pellet.z)
        if (mesh.children[0] && mesh.children[0].material) {
          mesh.children[0].material.opacity = pellet.opacity
        }
      } else {
        mesh.visible = false
      }
    }

    if (elapsed > 5.0) {
      feedingState.active = false
      feedingState.pellets = []
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} visible={false}>
          {/* Bolita de comida dorada / terracota */}
          <mesh>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial 
              color="#FF8822" 
              roughness={0.4} 
              transparent 
              opacity={1} 
              emissive="#FF4400"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Micro-burbuja de aire */}
          <mesh position={[0, 0.035, 0]} scale={0.5}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🐟 PEZ 3D ORANGE FISH — ORIENTACIÓN ANATÓMICA HORIZONTAL Y NADO FLUIDO
// ═══════════════════════════════════════════════════════════════════════════════
export function RealisticKoi({ modelPath = '/models/orange_fish.glb' }) {
  const group = useRef()
  const meshRef = useRef()
  const { scene } = useGLTF(modelPath)
  const dummyObj = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, delta) => {
    if (!group.current) return
    const time = state.clock.elapsedTime

    let targetX, targetY, targetZ
    let swimSpeed = 1.4
    let wiggleFreq = 4.5
    let wiggleAmp = 0.08

    // ── MODO ALIMENTACIÓN: El pez nada rápidamente hacia la comida ──
    if (feedingState.active && feedingState.pellets.some(p => !p.eaten)) {
      targetX = feedingState.x
      targetY = feedingState.y
      targetZ = feedingState.z

      swimSpeed = 3.8    // Aceleración viva
      wiggleFreq = 8.5   // Aleteo rápido
      wiggleAmp = 0.14

      // Comer pellets al acercarse
      feedingState.pellets.forEach(p => {
        if (!p.eaten && group.current.position.distanceTo(new THREE.Vector3(p.x, p.y, p.z)) < 0.9) {
          p.eaten = true
        }
      })
    } else {
      // ── MODO AUTÓNOMO NATURAL: Nado orgánico horizontal por el acuario ──
      targetX = Math.sin(time * 0.35) * 3.8 + Math.sin(time * 0.75) * 1.1
      targetY = Math.sin(time * 0.22) * 1.4 + Math.cos(time * 0.45) * 0.4
      targetZ = 1.0 + Math.sin(time * 0.4) * 0.5

      swimSpeed = 1.3
      wiggleFreq = 4.2
      wiggleAmp = 0.07
    }

    const targetPos = new THREE.Vector3(targetX, targetY, targetZ)

    // Interpolación suave de posición
    group.current.position.lerp(targetPos, swimSpeed * delta)

    // Vector de dirección de nado
    const moveDir = targetPos.clone().sub(group.current.position)
    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize()

      // Apuntar la cabeza del pez hacia el frente del vector de movimiento (nado hacia adelante)
      dummyObj.position.copy(group.current.position)
      dummyObj.lookAt(group.current.position.clone().add(moveDir))

      // Ondulación natural de nado en la aleta caudal
      const swimWiggle = Math.sin(time * wiggleFreq) * wiggleAmp
      dummyObj.rotateY(swimWiggle)

      // Rotación suave del pez usando slerp de cuaterniones
      group.current.quaternion.slerp(dummyObj.quaternion, 3.8 * delta)
    }

    // Micro-aleteo
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(time * wiggleFreq) * 0.03
    }
  })

  return (
    <>
      <FoodPellets />
      <group ref={group} position={[0, 0, 1.0]} scale={0.72}>
        {/* Centrado del centro de masa del pez: cabeza a -Z, lomo a +Y, vientre a -Y */}
        <group ref={meshRef} position={[0, -0.45, 1.1]}>
          <primitive object={scene} />
        </group>
      </group>
    </>
  )
}

useGLTF.preload('/models/orange_fish.glb')

// ═══════════════════════════════════════════════════════════════════════════════
// 🏖️ GRAVA / ARENA PBR REAL CON MAPAS FOTOGRÁFICOS
// ═══════════════════════════════════════════════════════════════════════════════
export function PBRGravel() {
  const sandProps = useTexture({
    map: '/textures/sand/sand_color.jpg',
    normalMap: '/textures/sand/sand_normal.jpg',
    roughnessMap: '/textures/sand/sand_roughness.jpg',
    displacementMap: '/textures/sand/sand_displacement.jpg'
  })

  Object.values(sandProps).forEach((tex) => {
    if (tex) {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(8, 8)
    }
  })

  return (
    <mesh position={[0, -4.75, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[34, 20, 128, 128]} />
      <meshStandardMaterial 
        {...sandProps} 
        displacementScale={0.2} 
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

// Componente de Pez Principal
function FishController() {
  return (
    <Suspense fallback={<BettaFish />}>
      <RealisticKoi />
    </Suspense>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 PLANTAS REALISTAS CON INSTANCED MESH (.GLB)
// Dibuja 150+ plantas en un solo draw call con variación de escala, rotación y ondulación
// ═══════════════════════════════════════════════════════════════════════════════
export function RealisticAquascape({ modelPath = '/models/plant.glb' }) {
  const { nodes, materials } = useGLTF(modelPath)
  const instanceRef = useRef()
  const plantCount = 150

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const plantData = useMemo(() => {
    return Array.from({ length: plantCount }, () => ({
      x: (Math.random() - 0.5) * 16,
      y: -4.8,
      z: -3.0 + (Math.random() - 0.5) * 4.0,
      scale: 0.6 + Math.random() * 0.8,
      rotY: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2
    }))
  }, [])

  useFrame((state) => {
    if (!instanceRef.current) return
    const t = state.clock.elapsedTime
    
    plantData.forEach((p, i) => {
      const sway = Math.sin(t * 1.5 + p.phase) * 0.08
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(0, p.rotY, sway)
      dummy.scale.set(p.scale, p.scale, p.scale)
      dummy.updateMatrix()
      instanceRef.current.setMatrixAt(i, dummy.matrix)
    })
    instanceRef.current.instanceMatrix.needsUpdate = true
  })

  const geo = nodes?.Plant?.geometry || nodes?.Scene?.children[0]?.geometry
  const mat = materials?.PlantMaterial || materials?.[Object.keys(materials)[0]]

  if (!geo || !mat) return null

  return (
    <instancedMesh 
      ref={instanceRef} 
      args={[geo, mat, plantCount]} 
      castShadow 
      receiveShadow 
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 FÁBRICA DE ESPECIES VEGETALES PROCEDURALES
// ═══════════════════════════════════════════════════════════════════════════════

// 1. VALLISNERIA SPIRALIS (Hojas largas que llegan a la superficie y se doblan)
const createVallisneriaGeo = () => {
  const geo = new THREE.PlaneGeometry(0.32, 7.5, 6, 28)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const normalizedY = (v.y + 3.75) / 7.5

    // Tapering: se afina suavemente en la punta
    const widthFactor = 1.0 - Math.pow(normalizedY, 1.8) * 0.82
    v.x *= widthFactor

    // Curvatura: cae naturalmente hacia adelante
    const forwardBend = Math.pow(normalizedY, 2.3) * 1.4
    const waveBend = Math.sin(normalizedY * Math.PI * 2.5) * 0.12
    v.z += forwardBend + waveBend

    pos.setXYZ(i, v.x, v.y, v.z)
  }

  geo.computeVertexNormals()
  geo.translate(0, 3.75, 0)
  return geo
}

// 2. ANUBIAS BARTERI (Hojas ovaladas y redondeadas)
const createAnubiasGeo = () => {
  const geo = new THREE.PlaneGeometry(0.7, 1.8, 6, 12)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const normalizedY = (v.y + 0.9) / 1.8

    // Forma ovalada/cuchara
    const ovalFactor = Math.sin(normalizedY * Math.PI) * 1.25 + 0.2
    v.x *= ovalFactor

    // Doblez longitudinal
    const cupBend = Math.pow(normalizedY, 1.8) * 0.45
    v.z += cupBend - Math.abs(v.x) * 0.2

    pos.setXYZ(i, v.x, v.y, v.z)
  }

  geo.computeVertexNormals()
  geo.translate(0, 0.9, 0)
  return geo
}

// 3. ELEOCHARIS / HAIRGRASS (Césped acuático fino en espiga)
const createHairgrassGeo = () => {
  const geo = new THREE.PlaneGeometry(0.06, 1.6, 2, 8)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const normalizedY = (v.y + 0.8) / 1.6

    // Punta afilada tipo aguja
    v.x *= (1.0 - normalizedY * 0.92)
    // Curva hacia afuera
    v.z += Math.pow(normalizedY, 2.0) * 0.35

    pos.setXYZ(i, v.x, v.y, v.z)
  }

  geo.computeVertexNormals()
  geo.translate(0, 0.8, 0)
  return geo
}

// Geometrías inicializadas una sola vez
const plantGeometries = {
  vallisneria: createVallisneriaGeo(),
  anubias: createAnubiasGeo(),
  hairgrass: createHairgrassGeo()
}

// Paletas de color botánicas vibrantes y luminosas
const plantColors = {
  vallisneria: ['#38E54D', '#2BD63F', '#4AED5F', '#1FB233'], // Verdes esmeralda vivos
  anubias: ['#16A34A', '#22C55E', '#15803D', '#4ADE80'],     // Verdes botánicos frescos
  hairgrass: ['#86EFAC', '#4ADE80', '#22C55E', '#34D399']    // Brotes tiernos brillantes
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🪨 FÁBRICA DE ROCAS REALISTAS (VOLUMEN SUAVE Y EROSIÓN NATURAL)
// ═══════════════════════════════════════════════════════════════════════════════
const createRealisticRockGeo = () => {
  const geo = new THREE.SphereGeometry(1, 64, 64)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const wave1 = Math.sin(v.x * 3.5) * Math.cos(v.y * 3.5) * Math.sin(v.z * 3.5) * 0.15
    const wave2 = Math.cos(v.x * 8 + v.y * 8) * 0.05
    
    v.x += v.x * (wave1 + wave2)
    v.y += v.y * (wave1 + wave2)
    v.z += v.z * (wave1 + wave2)
    
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  
  geo.computeVertexNormals()
  return geo
}

const realisticRockGeo = createRealisticRockGeo()

// ═══════════════════════════════════════════════════════════════════════════════
// ✨ EFECTO DE LUZ CÁUSTICA ACUÁTICA (WATER CAUSTICS)
// Proyecta ondas de luz danzantes en el fondo del acuario
// ═══════════════════════════════════════════════════════════════════════════════
function WaterCaustics() {
  const meshRef = useRef()
  
  const causticsTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 512, 512)
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.lineWidth = 2.5
    for (let i = 0; i < 40; i++) {
      ctx.beginPath()
      const startX = Math.random() * 512
      const startY = Math.random() * 512
      ctx.moveTo(startX, startY)
      ctx.bezierCurveTo(
        startX + (Math.random() - 0.5) * 120, startY + (Math.random() - 0.5) * 120,
        startX + (Math.random() - 0.5) * 200, startY + (Math.random() - 0.5) * 200,
        startX + (Math.random() - 0.5) * 300, startY + (Math.random() - 0.5) * 300
      )
      ctx.stroke()
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 4)
    return tex
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (causticsTex) {
      causticsTex.offset.x = Math.sin(t * 0.15) * 0.1
      causticsTex.offset.y = (t * 0.08) % 1
    }
  })

  return (
    <mesh position={[0, -4.72, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[36, 22]} />
      <meshBasicMaterial 
        map={causticsTex} 
        transparent 
        opacity={0.35} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌿 ENTORNO AQUASCAPING CON TEXTURAS PBR REALES Y AGUA CRISTALINA
// ═══════════════════════════════════════════════════════════════════════════════
function AquascapeEnvironment() {
  const mossTex   = useMemo(() => createMossTexture(), [])
  const plantsRef = useRef()

  // 1. CARGA DE MAPAS PBR REALES PARA ROCAS
  const rockPBR = useTexture({
    map: '/textures/rock/rock_color.jpg',
    normalMap: '/textures/rock/rock_normal.jpg',
    roughnessMap: '/textures/rock/rock_roughness.jpg',
  })

  // 2. CARGA DE MAPAS PBR REALES PARA ARENA / SUSTRATO
  const sandPBR = useTexture({
    map: '/textures/sand/sand_color.jpg',
    normalMap: '/textures/sand/sand_normal.jpg',
    roughnessMap: '/textures/sand/sand_roughness.jpg',
    displacementMap: '/textures/sand/sand_displacement.jpg',
  })

  // 3. CARGA DE MAPAS PBR REALES PARA HOJAS POR ESPECIE (NERVADURAS Y RELIEVE)
  const valLeafPBR = useTexture({
    map: '/textures/plants/vallisneria_leaf.jpg',
    normalMap: '/textures/plants/vallisneria_leaf_normal.jpg',
  })

  const anuLeafPBR = useTexture({
    map: '/textures/plants/anubias_leaf.jpg',
    normalMap: '/textures/plants/anubias_leaf_normal.jpg',
  })

  // 4. FONDO DE AGUA FOTOGRÁFICO CRISTALINO
  const waterBgTex = useTexture('/textures/water_bg.jpg')

  // 5. TILING Y REPETICIÓN
  useMemo(() => {
    Object.values(rockPBR).forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(2, 2)
      }
    })
    Object.values(sandPBR).forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(8, 6)
      }
    })
    if (valLeafPBR.map) {
      valLeafPBR.map.wrapS = valLeafPBR.map.wrapT = THREE.RepeatWrapping
      valLeafPBR.map.repeat.set(1, 1)
    }
  }, [rockPBR, sandPBR, valLeafPBR, anuLeafPBR])

  // ── FORMACIÓN ROCOSA IWAGUMI (ASIMÉTRICA Y ORGÁNICA) ──
  const rocks = useMemo(() => [
    // --- GRUPO IZQUIERDO (Roca principal "Oyaishi" y soportes) ---
    { x: -5.0, y: -4.0, z: -1.5, sX: 2.5, sY: 4.0, sZ: 2.2, ry: 0.5, rz: 0.2 },
    { x: -3.8, y: -4.5, z: -0.5, sX: 1.5, sY: 2.0, sZ: 1.8, ry: 1.2, rz: -0.3 },
    { x: -6.5, y: -4.5, z: 0.0,  sX: 1.2, sY: 1.5, sZ: 1.4, ry: 2.1, rz: 0.1 },
    
    // --- GRUPO DERECHO (Roca secundaria "Fukuishi" y base) ---
    { x: 4.5,  y: -4.2, z: -1.0, sX: 2.0, sY: 3.0, sZ: 1.8, ry: -0.8, rz: -0.2 },
    { x: 3.2,  y: -4.6, z: 0.5,  sX: 1.3, sY: 1.4, sZ: 1.5, ry: -1.0, rz: 0.3 },
    { x: 5.8,  y: -4.5, z: 0.2,  sX: 1.4, sY: 1.2, sZ: 1.6, ry: 0.4,  rz: -0.1 },
    
    // --- ROCAS DE ACENTO (Dispersas al frente) ---
    { x: -1.5, y: -4.7, z: 1.5,  sX: 0.6, sY: 0.5, sZ: 0.7, ry: 1.0,  rz: 0.0 },
    { x: 1.8,  y: -4.8, z: 1.2,  sX: 0.7, sY: 0.4, sZ: 0.6, ry: -0.5, rz: 0.1 },
    { x: -0.2, y: -4.8, z: -0.5, sX: 0.5, sY: 0.4, sZ: 0.5, ry: 0.2,  rz: 0.0 },
  ], [])

  // ── GENERADOR MIXTO DE BIODIVERSIDAD OPTIMIZADO (3 ESPECIES, ~200 HOJAS EN LUGAR DE 1,200) ──
  const plants = useMemo(() => {
    const mixedPlants = []

    // 1. VALLISNERIA (Fondo y laterales altos)
    for (let i = 0; i < 14; i++) {
      mixedPlants.push({
        id: `val_${i}`,
        type: 'vallisneria',
        x: (Math.random() - 0.5) * 13,
        y: -4.8,
        z: -2.0 - Math.random() * 2.5,
        scale: 0.9 + Math.random() * 0.6,
        rotY: Math.random() * Math.PI * 2,
        leaves: 4 + Math.floor(Math.random() * 3)
      })
    }

    // 2. ANUBIAS (Sobre rocas y plano medio)
    for (let i = 0; i < 10; i++) {
      mixedPlants.push({
        id: `anu_${i}`,
        type: 'anubias',
        x: (Math.random() - 0.5) * 9,
        y: -4.8,
        z: -1.0 + Math.random() * 1.8,
        scale: 0.55 + Math.random() * 0.4,
        rotY: Math.random() * Math.PI * 2,
        leaves: 4 + Math.floor(Math.random() * 3)
      })
    }

    // 3. HAIRGRASS (Frente denso y tapizante)
    for (let i = 0; i < 16; i++) {
      mixedPlants.push({
        id: `hair_${i}`,
        type: 'hairgrass',
        x: (Math.random() - 0.5) * 11,
        y: -4.8,
        z: 0.5 + Math.random() * 2.2,
        scale: 0.45 + Math.random() * 0.4,
        rotY: Math.random() * Math.PI * 2,
        leaves: 7 + Math.floor(Math.random() * 4)
      })
    }

    return mixedPlants
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (plantsRef.current) {
      const children = plantsRef.current.children
      for (let i = 0; i < children.length; i++) {
        children[i].rotation.z = Math.sin(t * 1.2 + i * 0.7) * 0.04
      }
    }
  })

  return (
    <group>
      {/* PARED TRASERA — Fondo cristalino submarino iluminado */}
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[32, 20]} />
        <meshBasicMaterial map={waterBgTex} />
      </mesh>

      {/* ARENA BLANCA FINA CON MAPAS PBR Y RELIEVE OPTIMIZADO */}
      <mesh position={[0, -4.78, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 22, 16, 16]} />
        <meshStandardMaterial 
          map={sandPBR.map}
          normalMap={sandPBR.normalMap}
          roughnessMap={sandPBR.roughnessMap}
          roughness={0.8}
          color="#F2EFE9"
        />
      </mesh>

      {/* LUZ CÁUSTICA DINÁMICA (WATER CAUSTICS) */}
      <WaterCaustics />

      {/* MUSGO JAVA sobre la arena central */}
      <mesh position={[0, -4.62, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial map={mossTex} roughness={0.7} transparent opacity={0.78} />
      </mesh>

      {/* ROCAS CON MAPAS PBR REALES (FOTOGRAMETRÍA Y RELIEVE) */}
      {rocks.map((r, i) => (
        <mesh 
          key={i} 
          position={[r.x, r.y, r.z]} 
          scale={[r.sX, r.sY, r.sZ]}
          rotation={[0.1, r.ry, r.rz]}
          geometry={realisticRockGeo}
        >
          <meshStandardMaterial 
            {...rockPBR}
            color="#9AA3AA"
          />
        </mesh>
      ))}

      {/* BIODIVERSIDAD VEGETAL MIXTA CON TEXTURAS BOTÁNICAS REALES (60 FPS) */}
      <group ref={plantsRef}>
        {plants.map((p) => {
          const plantTexture = p.type === 'vallisneria' ? valLeafPBR : (p.type === 'anubias' ? anuLeafPBR : valLeafPBR)

          return (
            <group key={p.id} position={[p.x, p.y, p.z]} rotation={[0, p.rotY, 0]}>
              {Array.from({ length: p.leaves }).map((_, lIdx) => {
                const angle = (lIdx / p.leaves) * Math.PI * 2
                const lean = p.type === 'hairgrass' ? 0.35 + Math.random() * 0.25 : 0.15 + Math.random() * 0.2
                const spread = p.type === 'hairgrass' ? 0.2 : 0.1

                return (
                  <mesh 
                    key={lIdx}
                    position={[Math.cos(angle) * spread, 0, Math.sin(angle) * spread]}
                    rotation={[lean, angle, 0]}
                    scale={[p.scale, p.scale, p.scale]}
                    geometry={plantGeometries[p.type]}
                  >
                    <meshStandardMaterial 
                      map={plantTexture.map}
                      normalMap={plantTexture.normalMap}
                      roughness={p.type === 'anubias' ? 0.25 : 0.35}
                      metalness={0.02}
                      side={THREE.DoubleSide} 
                    />
                  </mesh>
                )
              })}
            </group>
          )
        })}
      </group>
    </group>
  )
}

// ─── PECES SECUNDARIOS EN EL FONDO ───────────────────────────────────────────
function BackgroundFish({ count = 5 }) {
  const refs = useRef([])
  const data = useMemo(() => Array.from({ length: count }, (_, i) => ({
    y: -1.0 + Math.random() * 1.8,
    z: -3.5 - Math.random() * 2.5,
    speed: 0.5 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    radius: 3.8 + Math.random() * 2.8
  })), [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const ref = refs.current[i]
      if (!ref) continue
      const d = data[i]
      const angle = t * d.speed + d.phase
      ref.position.x = Math.sin(angle) * d.radius
      ref.position.y = d.y + Math.cos(angle * 1.5) * 0.35
      ref.rotation.y = Math.cos(angle) > 0 ? -Math.PI / 2 : Math.PI / 2
    }
  })

  return (
    <group>
      {data.map((d, i) => (
        <group key={i} ref={el => refs.current[i] = el} position={[0, d.y, d.z]} scale={[0.1, 0.08, 0.07]}>
          <mesh>
            <sphereGeometry args={[1, 10, 6]} />
            <meshStandardMaterial color="#CC001A" emissive="#880010" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0, 0, -1.1]} scale={[0.7, 0.7, 0.6]}>
            <coneGeometry args={[0.9, 1.0, 6]} />
            <meshStandardMaterial color="#AA0015" transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── BURBUJAS (OPTIMIZADAS 60 FPS) ───────────────────────────────────────────
function Bubbles({ count = 45 }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 14, y: -4.5 + Math.random() * 9,
    z: (Math.random() - 0.5) * 7,
    scale: 0.025 + Math.random() * 0.08,
    speed: 0.7 + Math.random() * 1.2,
    wobble: 1.5 + Math.random() * 2.0
  })), [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const b = data[i]
      b.y += delta * b.speed
      if (b.y > 5.5) b.y = -4.5
      dummy.position.set(b.x + Math.sin(t * b.wobble + i) * 0.06, b.y, b.z)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial 
        color="#E0F6FF" 
        roughness={0.05} 
        metalness={0.1}
        transparent 
        opacity={0.65} 
      />
    </instancedMesh>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌊 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function AquariumScene({ pathname }) {
  useEffect(() => {
    function onMouseMove(e) {
      globalMouse.x = (e.clientX / window.innerWidth) * 2 - 1
      globalMouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <group>
      {/* ILUMINACIÓN LED AQUASCAPING EQUILIBRADA */}
      <ambientLight intensity={1.1} color="#B8E8F4" />
      <directionalLight position={[0, 10, 2]} intensity={2.8} color="#F2FBFF" />
      <pointLight position={[0, 2, -3]} intensity={1.5} color="#5BC8E8" distance={16} decay={2} />

      <Suspense fallback={<BettaFish />}>
        <FishController />
      </Suspense>

      <AquascapeEnvironment />
      <BackgroundFish count={5} />
      <Bubbles count={45} />
    </group>
  )
}
