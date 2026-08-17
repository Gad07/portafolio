import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
//  SISTEMA SOLAR 3D CON TEXTURAS FOTOGRÁFICAS 2K DE LA NASA & VÍA LÁCTEA
// ═══════════════════════════════════════════════════════════════════════════════

const textureLoader = new THREE.TextureLoader()

const PLANET_MAP_PATHS = {
  Mercury: '/textures/planets/2k_mercury.jpg',
  Venus: '/textures/planets/2k_venus_atmosphere.jpg',
  Earth: '/textures/planets/2k_earth_daymap.jpg',
  EarthClouds: '/textures/planets/2k_earth_clouds.jpg',
  Moon: '/textures/planets/2k_moon.jpg',
  Mars: '/textures/planets/2k_mars.jpg',
  Jupiter: '/textures/planets/2k_jupiter.jpg',
  Saturn: '/textures/planets/2k_saturn.jpg',
  Uranus: '/textures/planets/2k_uranus.jpg',
  Neptune: '/textures/planets/2k_neptune.jpg',
  Sun: '/textures/planets/2k_sun.jpg',
  MilkyWay: '/textures/planets/2k_stars_milky_way.jpg',
  SaturnRing: '/textures/planets/2k_saturn_ring_alpha.png'
}

const loadedPlanetTextures = {}
if (typeof window !== 'undefined') {
  Object.entries(PLANET_MAP_PATHS).forEach(([key, path]) => {
    const tex = textureLoader.load(path)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    loadedPlanetTextures[key] = tex
  })
}

const globalParticleTex = (() => {
  if (typeof window === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  // Soft core glow with diffraction spikes
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0,   'rgba(255, 255, 255, 1.0)')
  grad.addColorStop(0.15,'rgba(255, 240, 200, 0.95)')
  grad.addColorStop(0.35,'rgba(200, 220, 255, 0.7)')
  grad.addColorStop(0.6, 'rgba(120, 180, 255, 0.3)')
  grad.addColorStop(1,   'rgba(0,   0,   0,   0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
})()

// Particle texture specifically for supernova plasma debris
const supernovaParticleTex = (() => {
  if (typeof window === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  // Inner hot core + diffuse outer glow
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0,    'rgba(255, 255, 255, 1.0)')
  g.addColorStop(0.08, 'rgba(180, 240, 255, 1.0)')
  g.addColorStop(0.25, 'rgba(0,   180, 255, 0.85)')
  g.addColorStop(0.5,  'rgba(0,   80,  200, 0.4)')
  g.addColorStop(0.75, 'rgba(40,  0,   120, 0.15)')
  g.addColorStop(1,    'rgba(0,   0,   0,   0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
})()

const PLANET_DATA = [
  {
    name: 'Mercury', radius: 0.21, distance: 3.2,
    orbitSpeed: 4.15, rotationSpeed: 0.5,
    eccentricity: 0.15, inclination: 0.12,
    type: 'rocky', color: '#B5A698',
    hasAtmosphere: false, moons: []
  },
  {
    name: 'Venus', radius: 0.33, distance: 4.6,
    orbitSpeed: 1.62, rotationSpeed: -0.2,
    eccentricity: 0.05, inclination: 0.06,
    type: 'venus', color: '#E6C280',
    hasAtmosphere: true, atmosphereColor: '#FFB86C', moons: []
  },
  {
    name: 'Earth', radius: 0.39, distance: 6.2,
    orbitSpeed: 1.0, rotationSpeed: 1.0,
    eccentricity: 0.02, inclination: 0.0,
    type: 'earth', color: '#4A90D9',
    hasAtmosphere: true, atmosphereColor: '#00D2FF',
    hasClouds: true,
    moons: [{ name: 'Moon', radius: 0.09, distance: 0.7, speed: 3.0 }]
  },
  {
    name: 'Mars', radius: 0.27, distance: 8.2,
    orbitSpeed: 0.53, rotationSpeed: 0.97,
    eccentricity: 0.09, inclination: 0.03,
    type: 'mars', color: '#E05326',
    hasAtmosphere: true, atmosphereColor: '#FF7A59',
    moons: [
      { name: 'Phobos', radius: 0.045, distance: 0.45, speed: 8.0 },
      { name: 'Deimos', radius: 0.036, distance: 0.60, speed: 4.0 }
    ]
  },
  {
    name: 'Jupiter', radius: 0.75, distance: 12.0,
    orbitSpeed: 0.084, rotationSpeed: 2.4,
    eccentricity: 0.048, inclination: 0.02,
    type: 'gas', color: '#E3A857',
    hasAtmosphere: false, hasRing: false,
    moons: [
      { name: 'Io', radius: 0.08, distance: 1.2, speed: 5.0, color: '#FFFF99' },
      { name: 'Europa', radius: 0.065, distance: 1.5, speed: 3.5, color: '#E0E0E0' },
      { name: 'Ganymede', radius: 0.09, distance: 1.9, speed: 2.0, color: '#C0C0C0' },
      { name: 'Callisto', radius: 0.08, distance: 2.4, speed: 1.2, color: '#808080' }
    ]
  },
  {
    name: 'Saturn', radius: 0.78, distance: 16.2,
    orbitSpeed: 0.034, rotationSpeed: 2.2,
    eccentricity: 0.056, inclination: 0.04,
    type: 'gas', color: '#E5C483',
    hasAtmosphere: true, atmosphereColor: '#FFE090', hasRing: true,
    ringColor: '#E8D4A8', ringInner: 1.35, ringOuter: 2.85,
    moons: [
      { name: 'Titan', radius: 0.09, distance: 3.2, speed: 2.0, color: '#E0A030' },
      { name: 'Enceladus', radius: 0.05, distance: 2.2, speed: 6.0, color: '#FFFFFF' }
    ]
  },
  {
    name: 'Uranus', radius: 0.45, distance: 20.2,
    orbitSpeed: 0.012, rotationSpeed: -1.4,
    eccentricity: 0.046, inclination: 0.01,
    type: 'ice', color: '#7DE3F4',
    hasAtmosphere: false, hasRing: true,
    ringColor: '#A0D0E0', ringInner: 1.3, ringOuter: 2.0,
    moons: [{ name: 'Miranda', radius: 0.04, distance: 0.9, speed: 4.0 }]
  },
  {
    name: 'Neptune', radius: 0.42, distance: 24.2,
    orbitSpeed: 0.006, rotationSpeed: 1.5,
    eccentricity: 0.009, inclination: 0.03,
    type: 'ice', color: '#3B5FCC',
    hasAtmosphere: true, atmosphereColor: '#4A7AFF',
    moons: [{ name: 'Triton', radius: 0.06, distance: 1.0, speed: 3.0, color: '#E0E0E0' }]
  }
]

// ═══════════════════════════════════════════════════════════════════════════════
//  SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const particleVertexShader = `
  attribute vec3 galaxyPos;
  attribute vec3 notePos;
  attribute vec3 fclefPos;
  attribute vec3 gclefPos;
  attribute float size;

  uniform float uGalaxyMix;
  uniform float uNotesMix;
  uniform float uDustMix;
  uniform float uMix1;
  uniform float uMix2;
  uniform float uTime;
  uniform float uOffset;
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;

    vec3 ringPos = position;

    vec3 gPos = galaxyPos + vec3(
      sin(uTime * 0.5 + position.x * 2.0) * 0.15,
      cos(uTime * 0.3 + position.y * 2.0) * 0.15,
      sin(uTime * 0.4 + position.z * 2.0) * 0.15
    );

    vec3 noteMorph = mix(
      mix(notePos, fclefPos, uMix1),
      gclefPos,
      uMix2
    );
    noteMorph.x += uOffset;

    vec3 dustPos = gPos * 4.0 + vec3(
      sin(uTime * 0.2 + position.x) * 0.5,
      sin(uTime * 0.5 + position.x) * 1.5,
      cos(uTime * 0.3 + position.z) * 0.5
    );

    vec3 midPos = mix(ringPos, gPos, uGalaxyMix);
    vec3 preFinal = mix(midPos, noteMorph, uNotesMix);
    vec3 finalPos = mix(preFinal, dustPos, uDustMix);

    float rotY = uNotesMix > 0.3 ? sin(uTime * 0.5) * 0.15 : uTime * 0.03;
    float c = cos(rotY);
    float s = sin(rotY);
    finalPos.xz = mat2(c, -s, s, c) * finalPos.xz;

    finalPos.y += sin(uTime * 1.2 + finalPos.x) * 0.12 * uNotesMix;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = -mvPosition.z;
    gl_PointSize = size * (200.0 / dist) * (1.0 + uNotesMix * 0.5);

    vAlpha = smoothstep(50.0, 5.0, dist) * uOpacity;
  }
`

const particleFragmentShader = `
  uniform sampler2D uTexture;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uTexture, gl_PointCoord);
    if (tex.a < 0.01) discard;

    float glow = 1.0 - length(gl_PointCoord - 0.5) * 2.0;
    glow = max(0.0, glow);
    glow = pow(glow, 1.5);

    vec3 finalColor = vColor * (1.0 + glow * 0.5);
    gl_FragColor = vec4(finalColor, vAlpha * tex.a * glow);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
//  HOOKS Y UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════

const getTargetPhase = (pathname) => {
  if (pathname === '/proyectos') return 1
  if (pathname === '/sobre-mi') return 2
  if (pathname === '/contacto') return 3
  return 0
}

const useScrollProgress = () => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight)
      setProgress(Math.min(1, scrollY / maxScroll))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return progress
}

// Generador de texturas de alta resolución (1024x512) para planetas realistas
const generateTexture = (type, seed = 0) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  const random = (() => {
    let s = seed + 12345
    return () => {
      s = (s * 16807 + 0) % 2147483647
      return (s - 1) / 2147483646
    }
  })()

  // Smooth multi-octave perlin-style noise
  const noise = (u, v) => {
    return (Math.sin(u * 6.28) * Math.cos(v * 3.14) +
      Math.sin(u * 12.56 + 1.2) * Math.cos(v * 6.28 + 0.8) * 0.5 +
      Math.sin(u * 25.12 - 2.1) * Math.sin(v * 12.56 + 1.5) * 0.25) * 0.5 + 0.5
  }

  const fbm = (u, v, octaves = 4) => {
    let val = 0, amp = 0.5, freq = 1.0
    for (let i = 0; i < octaves; i++) {
      val += noise(u * freq, v * freq) * amp
      freq *= 2.1
      amp *= 0.5
    }
    return val
  }

  switch (type) {
    case 'mercury': {
      // Regolito gris cráter y llanuras basálticas oscuras
      ctx.fillStyle = '#6E6E6E'
      ctx.fillRect(0, 0, w, h)

      const imgData = ctx.getImageData(0, 0, w, h)
      const data = imgData.data
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h
          const n = fbm(u * 8, v * 8, 4)
          const idx = (y * w + x) * 4
          const shade = Math.floor(90 + n * 80)
          data[idx] = shade
          data[idx + 1] = shade
          data[idx + 2] = shade + 5
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)

      // Cráteres detallados con bordes claros y sombras
      for (let i = 0; i < 140; i++) {
        const cx = random() * w
        const cy = random() * h
        const cr = random() * 25 + 4

        ctx.beginPath()
        ctx.arc(cx, cy, cr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(35, 35, 35, ${random() * 0.4 + 0.2})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(cx - cr * 0.15, cy - cr * 0.15, cr * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 180, 185, ${random() * 0.35 + 0.15})`
        ctx.fill()
      }
      break
    }

    case 'venus': {
      // Atmósfera denso-sulfúrica dorada con nubes en bandas en espiral
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h
          const swirl = Math.sin(v * 20 + u * 10) * 0.05
          const n = fbm((u + swirl) * 6, v * 6, 4)
          const idx = (y * w + x) * 4

          const r = Math.floor(225 + n * 30)
          const g = Math.floor(180 + n * 45)
          const b = Math.floor(110 + n * 50)

          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)
      break
    }

    case 'earth': {
      // Océanos azul profundo, costas turquesas, continentes verdes/marrones y polos de hielo
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data
      for (let y = 0; y < h; y++) {
        const v = y / h
        const isPole = v < 0.14 || v > 0.86
        for (let x = 0; x < w; x++) {
          const u = x / w
          const nContinent = fbm(u * 3.5, v * 3.5, 5)
          const nDetail = fbm(u * 12, v * 12, 3)
          const idx = (y * w + x) * 4

          if (isPole && fbm(u * 6, v * 6, 3) > 0.35) {
            // Hielo polar puro blanco
            data[idx] = 245
            data[idx + 1] = 250
            data[idx + 2] = 255
          } else if (nContinent > 0.48) {
            // Continente: verde bosque, desierto o montaña
            const elev = nContinent + nDetail * 0.2
            if (elev > 0.68) {
              // Montañas rocosas
              data[idx] = 120
              data[idx + 1] = 100
              data[idx + 2] = 80
            } else if (elev > 0.58) {
              // Bosque verde
              data[idx] = 40 + Math.floor(nDetail * 40)
              data[idx + 1] = 120 + Math.floor(nDetail * 60)
              data[idx + 2] = 50
            } else {
              // Sabana / Desierto
              data[idx] = 180 + Math.floor(nDetail * 40)
              data[idx + 1] = 150 + Math.floor(nDetail * 30)
              data[idx + 2] = 80
            }
          } else {
            // Océano: azul profundo o costas azur
            const distCoast = 0.48 - nContinent
            if (distCoast < 0.04) {
              // Costa turquesa
              data[idx] = 20
              data[idx + 1] = 120
              data[idx + 2] = 170
            } else {
              // Océano profundo
              data[idx] = 10
              data[idx + 1] = 40 + Math.floor(nDetail * 30)
              data[idx + 2] = 110 + Math.floor(nDetail * 40)
            }
          }
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)
      break
    }

    case 'earth_clouds': {
      // Nubes reales atmosféricas con vórtices en espiral y transparencia
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h
          const swirl = Math.sin(u * 12 + v * 8) * 0.04
          const n = fbm((u + swirl) * 5, v * 5, 4)
          const idx = (y * w + x) * 4

          if (n > 0.52) {
            const alpha = Math.floor((n - 0.52) * 450)
            data[idx] = 255
            data[idx + 1] = 255
            data[idx + 2] = 255
            data[idx + 3] = Math.min(220, alpha)
          } else {
            data[idx + 3] = 0
          }
        }
      }
      ctx.putImageData(imgData, 0, 0)
      break
    }

    case 'mars': {
      // Suelo de óxido de hierro rojo, cañones y casquetes polares blancos
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data
      for (let y = 0; y < h; y++) {
        const v = y / h
        const isPole = v < 0.12 || v > 0.88
        for (let x = 0; x < w; x++) {
          const u = x / w
          const n = fbm(u * 5, v * 5, 4)
          const idx = (y * w + x) * 4

          if (isPole && fbm(u * 8, v * 8, 2) > 0.4) {
            data[idx] = 240
            data[idx + 1] = 245
            data[idx + 2] = 250
          } else {
            const r = Math.floor(190 + n * 40)
            const g = Math.floor(65 + n * 30)
            const b = Math.floor(20 + n * 15)
            data[idx] = r
            data[idx + 1] = g
            data[idx + 2] = b
          }
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)

      // Cañones oscuros (Valles Marineris)
      for (let i = 0; i < 60; i++) {
        const cx = random() * w
        const cy = random() * h
        const cr = random() * 40 + 10
        ctx.beginPath()
        ctx.arc(cx, cy, cr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(70, 15, 5, ${random() * 0.35 + 0.1})`
        ctx.fill()
      }
      break
    }

    case 'gas': {
      // Bandas atmosféricas de gas (Júpiter/Saturno) con chorros de turbulencia
      const isJupiter = seed === 1
      const bands = isJupiter ? 18 : 12

      const imgData = ctx.createImageData(w, h)
      const data = imgData.data

      for (let y = 0; y < h; y++) {
        const v = y / h
        const bandIndex = Math.floor(v * bands)
        const wave = Math.sin(v * Math.PI * bands + Math.sin(y * 0.05) * 2) * 0.03

        for (let x = 0; x < w; x++) {
          const u = x / w
          const n = fbm((u + wave) * (isJupiter ? 10 : 8), v * 12, 4)
          const idx = (y * w + x) * 4

          let r, g, b
          if (isJupiter) {
            // Júpiter: cobre, ambar, crema y terracota
            if (bandIndex % 3 === 0) {
              r = 210 + Math.floor(n * 35); g = 140 + Math.floor(n * 30); b = 80;
            } else if (bandIndex % 3 === 1) {
              r = 240 + Math.floor(n * 15); g = 220 + Math.floor(n * 20); b = 180;
            } else {
              r = 160 + Math.floor(n * 40); g = 80 + Math.floor(n * 30); b = 35;
            }
          } else {
            // Saturno: bandas fotorrealistas de gas ambar, miel, crema y ocre siena
            const saturnBands = [
              [235, 205, 145], // Dorado miel pálido
              [215, 175, 110], // Ocre siena cálido
              [245, 225, 175], // Crema marfil brillante
              [195, 155, 90],  // Banda ecuatorial
              [225, 190, 130]  // Ambar suave
            ]
            const bandColor = saturnBands[bandIndex % saturnBands.length]
            r = bandColor[0] + Math.floor(n * 25 - 12)
            g = bandColor[1] + Math.floor(n * 20 - 10)
            b = bandColor[2] + Math.floor(n * 15 - 7)
          }

          data[idx] = Math.min(255, r)
          data[idx + 1] = Math.min(255, g)
          data[idx + 2] = Math.min(255, b)
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)

      // Gran Mancha Roja de Júpiter
      if (isJupiter) {
        ctx.save()
        ctx.beginPath()
        ctx.ellipse(w * 0.72, h * 0.62, 55, 32, 0, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(w * 0.72, h * 0.62, 5, w * 0.72, h * 0.62, 55)
        grad.addColorStop(0, '#D9401C')
        grad.addColorStop(0.5, '#A82B0E')
        grad.addColorStop(1, 'rgba(180, 70, 30, 0)')
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
      }
      break
    }

    case 'ice': {
      // Gigante de hielo (Urano / Neptuno)
      const isNeptune = seed === 2
      const imgData = ctx.createImageData(w, h)
      const data = imgData.data

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u = x / w, v = y / h
          const n = fbm(u * 6, v * 6, 3)
          const idx = (y * w + x) * 4

          if (isNeptune) {
            // Neptuno: azul profundo zafiro con bandas cirros
            data[idx] = 30 + Math.floor(n * 30)
            data[idx + 1] = 80 + Math.floor(n * 40)
            data[idx + 2] = 190 + Math.floor(n * 50)
          } else {
            // Urano: turquesa cian pálido glaciar
            data[idx] = 115 + Math.floor(n * 30)
            data[idx + 1] = 215 + Math.floor(n * 35)
            data[idx + 2] = 235 + Math.floor(n * 20)
          }
          data[idx + 3] = 255
        }
      }
      ctx.putImageData(imgData, 0, 0)
      break
    }

    case 'moon': {
      // Luna / Lunas rocosas craterizadas con mares de basalto oscuro
      ctx.fillStyle = '#ADADAD'
      ctx.fillRect(0, 0, w, h)

      for (let i = 0; i < 90; i++) {
        const cx = random() * w
        const cy = random() * h
        const cr = random() * 30 + 5
        ctx.beginPath()
        ctx.arc(cx, cy, cr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(50, 50, 50, ${random() * 0.35 + 0.15})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(cx, cy, cr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(180, 180, 180, ${random() * 0.4})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      break
    }

    default:
      ctx.fillStyle = '#888888'
      ctx.fillRect(0, 0, w, h)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 16
  return texture
}

const sunVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const sunFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  uniform float uTime;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // 6-octave fBm for rich surface detail
  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for(int i = 0; i < 6; i++) {
      value += amp * snoise(p * freq);
      freq *= 2.07;
      amp *= 0.48;
    }
    return value;
  }

  // Domain-warped turbulence for plasma look
  float turbulence(vec3 p) {
    vec3 q = vec3(fbm(p + vec3(0.0, 0.0, 0.0)),
                  fbm(p + vec3(5.2, 1.3, 0.8)),
                  fbm(p + vec3(1.7, 9.2, 3.1)));
    return fbm(p + 2.5 * q);
  }

  void main() {
    // === GRANULACIÓN SOLAR (Bénard Cells) ===
    vec3 p = vPosition * 2.2 + vec3(uTime * 0.06, uTime * 0.09, uTime * 0.04);
    float n1 = turbulence(p);
    float n2 = fbm(p * 2.8 + vec3(uTime * 0.12, -uTime * 0.08, uTime * 0.1));
    // Fine granulation at higher frequency
    float grain = snoise(vPosition * 18.0 + vec3(uTime * 0.25)) * 0.08;
    float grain2 = snoise(vPosition * 35.0 + vec3(-uTime * 0.18, uTime * 0.22, 0.0)) * 0.04;
    float noiseVal = n1 * 0.5 + n2 * 0.35 + grain + grain2;

    // === PALETA SOLAR FOTORREALISTA ===
    vec3 umbra       = vec3(0.55, 0.10, 0.01); // interior oscuro gránulo
    vec3 darkGranule = vec3(0.90, 0.22, 0.02); // borde gránulo
    vec3 brightCell  = vec3(1.0,  0.62, 0.04); // célula brillante
    vec3 solarGold   = vec3(1.0,  0.88, 0.18); // crestas doradas
    vec3 hotspot     = vec3(1.0,  0.98, 0.88); // puntos calientes blancos

    vec3 col = mix(umbra,       darkGranule, smoothstep(-0.55, -0.15, noiseVal));
    col = mix(col, brightCell,  smoothstep(-0.2,  0.15, noiseVal));
    col = mix(col, solarGold,   smoothstep( 0.05, 0.40, noiseVal));
    col = mix(col, hotspot,     smoothstep( 0.35, 0.65, noiseVal));

    // === LIMB DARKENING FÍSICO (Ecuación de Minnaert) ===
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float NdotV = max(0.0, dot(normal, viewDir));
    float limbDarken = pow(NdotV, 0.45); // exponente físico real ~0.4-0.6
    col *= (0.3 + 0.7 * limbDarken);

    // === PROMINENCIAS / ARCOS MAGNÉTICOS en el limbo ===
    float limb = 1.0 - NdotV;
    float prominenceNoise = snoise(vPosition * 8.0 + vec3(uTime * 0.15)) * 0.5 + 0.5;
    float prominence = pow(limb, 3.5) * prominenceNoise;
    col += vec3(1.0, 0.35, 0.05) * prominence * 1.8;

    // === FACULAR REGIONS (manchas brillantes en el limbo) ===
    float facular = snoise(vPosition * 22.0 + vec3(uTime * 0.08)) * 0.5 + 0.5;
    float facularMask = pow(limb, 1.5) * smoothstep(0.6, 0.9, facular);
    col += vec3(1.0, 0.95, 0.7) * facularMask * 0.9;

    // === FRESNEL RIM GLOW ===
    float fresnel = pow(1.0 - NdotV, 2.2);
    col += vec3(1.0, 0.75, 0.3) * fresnel * 3.0;

    // === CENTRO CALIENTE (núcleo) ===
    col += vec3(0.35, 0.18, 0.08) * pow(NdotV, 2.0) * 0.6;

    gl_FragColor = vec4(col, 1.0);
  }
`

const coronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const coronaFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uPower;
  uniform float uOpacity;
  uniform float uTime;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float vDot = max(0.0, dot(normal, viewDir));
    
    float fresnel = pow(1.0 - vDot, uPower);
    float edgeFade = smoothstep(0.0, 0.4, vDot);

    // Subtle color variation along corona
    float colorShift = sin(vDot * 8.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 col = mix(uColor, uColor2, colorShift * 0.35);

    // Streamer brightness flicker
    float flicker = 0.85 + 0.15 * sin(uTime * 3.7 + vDot * 12.0);
    
    gl_FragColor = vec4(col * flicker, fresnel * edgeFade * uOpacity);
  }
`

const haloVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const haloFragmentShader = `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uOpacity;
  uniform float uTime;

  void main() {
    vec2 uv = vUv - vec2(0.5);
    float dist = length(uv) * 2.0;
    if (dist > 1.0) discard;

    // Soft double-exponential glow profile (more physically accurate)
    float innerGlow = exp(-dist * 4.0);
    float outerGlow = exp(-dist * 1.5) * (1.0 - innerGlow * 0.7);
    float glow = innerGlow * 0.6 + outerGlow * 0.7;

    // Angular flare variation (solar wind rays)
    float angle = atan(uv.y, uv.x);
    float rays = (sin(angle * 6.0 + uTime * 0.8) * 0.5 + 0.5) * 0.15;
    glow += rays * smoothstep(0.6, 0.2, dist);

    vec3 col = mix(uColor, uColor2, smoothstep(0.1, 0.7, dist));
    gl_FragColor = vec4(col, glow * uOpacity);
  }
`

function SupernovaExplosion({ active }) {
  const pointsRef   = useRef()   // debris cloud
  const ring1Ref    = useRef()   // inner particle ring
  const ring2Ref    = useRef()   // middle particle ring
  const ring3Ref    = useRef()   // outer particle ring

  // ── Debris cloud (900 particles) ──────────────────────────────────────────
  const { positions, velocities, colors, sizes, count } = useMemo(() => {
    const pCount = 900
    const pos = new Float32Array(pCount * 3)
    const vel = new Float32Array(pCount * 3)
    const col = new Float32Array(pCount * 3)
    const siz = new Float32Array(pCount)

    const palette = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#B0E8FF'),
      new THREE.Color('#00D4FF'),
      new THREE.Color('#0088FF'),
      new THREE.Color('#4400FF'),
      new THREE.Color('#7C3FFF'),
    ]
    const weights = [0.05, 0.20, 0.30, 0.25, 0.15, 0.05]
    const pickColor = () => {
      let r = Math.random(), cum = 0
      for (let i = 0; i < palette.length; i++) { cum += weights[i]; if (r < cum) return palette[i] }
      return palette[2]
    }

    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI
      const isFast = Math.random() < 0.25
      const speed = isFast ? Math.random() * 6.0 + 10.0 : Math.random() * 5.0 + 2.0
      const spiralAngle = theta + phi * 0.5
      const spiralStrength = Math.random() * 0.4
      vel[i * 3]     = Math.cos(theta) * Math.cos(phi) * speed + Math.cos(spiralAngle + Math.PI * 0.5) * spiralStrength
      vel[i * 3 + 1] = Math.sin(phi) * speed
      vel[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * speed + Math.sin(spiralAngle + Math.PI * 0.5) * spiralStrength
      const c = pickColor()
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      siz[i] = isFast ? Math.random() * 0.15 + 0.08 : Math.random() * 0.35 + 0.12
    }
    return { positions: pos, velocities: vel, colors: col, sizes: siz, count: pCount }
  }, [active])

  // ── 3 Particle ring belts (like asteroid belt) ────────────────────────────
  const makeRingParticles = (pCount, innerR, outerR, spreadY, colorFn, sizeFn) => {
    const pos = new Float32Array(pCount * 3)
    const col = new Float32Array(pCount * 3)
    const siz = new Float32Array(pCount)
    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = innerR + Math.random() * (outerR - innerR)
      pos[i * 3]     = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * spreadY
      pos[i * 3 + 2] = Math.sin(angle) * radius
      const c = colorFn(i, pCount)
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
      siz[i] = sizeFn()
    }
    return { pos, col, siz, count: pCount }
  }

  // Ring 1 — Inner belt (bright cyan-white, tight, fast orbit)
  const ring1Data = useMemo(() => makeRingParticles(
    1800, 0.82, 1.05, 0.08,
    () => { const t = Math.random(); return t > 0.6 ? new THREE.Color('#FFFFFF') : t > 0.3 ? new THREE.Color('#AAEEFF') : new THREE.Color('#00EEFF') },
    () => Math.random() * 0.18 + 0.06
  ), [active])

  // Ring 2 — Middle belt (blue-violet, wider, medium orbit)
  const ring2Data = useMemo(() => makeRingParticles(
    1400, 1.15, 1.55, 0.12,
    () => { const t = Math.random(); return t > 0.5 ? new THREE.Color('#4488FF') : t > 0.25 ? new THREE.Color('#6644FF') : new THREE.Color('#0055DD') },
    () => Math.random() * 0.22 + 0.07
  ), [active])

  // Ring 3 — Outer nebula shell (violet-magenta, diffuse, slow orbit)
  const ring3Data = useMemo(() => makeRingParticles(
    1000, 1.7, 2.4, 0.20,
    () => { const t = Math.random(); return t > 0.5 ? new THREE.Color('#8833FF') : t > 0.25 ? new THREE.Color('#CC33FF') : new THREE.Color('#5500CC') },
    () => Math.random() * 0.30 + 0.10
  ), [active])

  const progressRef = useRef(0)

  // Shared shader for all particle systems
  const makeParticleMat = (opacity) => new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: supernovaParticleTex },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      attribute float particleSize;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uOpacity;
      varying float vOpacity;
      void main() {
        vColor = color;
        vOpacity = uOpacity;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = particleSize * (320.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        if (tex.a < 0.02) discard;
        vec3 col = vColor * (1.0 + tex.r * 1.8);
        gl_FragColor = vec4(col, tex.a * vOpacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const debrisMat  = useMemo(() => makeParticleMat(0.95), [active])
  const ring1Mat   = useMemo(() => makeParticleMat(0.90), [active])
  const ring2Mat   = useMemo(() => makeParticleMat(0.75), [active])
  const ring3Mat   = useMemo(() => makeParticleMat(0.55), [active])

  useFrame((state, delta) => {
    if (!active) { progressRef.current = 0; return }
    progressRef.current += delta
    const t = progressRef.current

    // Debris cloud — drag physics
    if (pointsRef.current) {
      const posArr = pointsRef.current.geometry.attributes.position.array
      const drag = Math.max(0.0, 1.0 - t * 0.06)
      for (let i = 0; i < count; i++) {
        velocities[i * 3]     *= drag
        velocities[i * 3 + 1] *= drag
        velocities[i * 3 + 2] *= drag
        posArr[i * 3]     += velocities[i * 3]     * delta
        posArr[i * 3 + 1] += velocities[i * 3 + 1] * delta
        posArr[i * 3 + 2] += velocities[i * 3 + 2] * delta
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Particle rings expand outward like the asteroid belt orbiting a supernova
    const ring1Scale = Math.min(t * 8.5, 52.0)
    const ring2Scale = Math.min(Math.max(0, (t - 0.25) * 6.0), 40.0)
    const ring3Scale = Math.min(Math.max(0, (t - 0.7)  * 4.0), 28.0)
    if (ring1Ref.current) {
      ring1Ref.current.scale.set(ring1Scale, ring1Scale, ring1Scale)
      ring1Ref.current.rotation.y += delta * 0.22  // slow orbital rotation
    }
    if (ring2Ref.current) {
      ring2Ref.current.scale.set(ring2Scale, ring2Scale, ring2Scale)
      ring2Ref.current.rotation.y -= delta * 0.14  // opposite direction
    }
    if (ring3Ref.current) {
      ring3Ref.current.scale.set(ring3Scale, ring3Scale, ring3Scale)
      ring3Ref.current.rotation.y += delta * 0.08
      ring3Ref.current.rotation.x += delta * 0.04  // slight tilt drift
    }

    // Fade sequence
    const debrisOpacity = t < 2.5 ? 0.95 : Math.max(0, 0.95 * (1.0 - (t - 2.5) / 4.0))
    const r1Opacity     = t < 1.5 ? 0.90 : Math.max(0, 0.90 * (1.0 - (t - 1.5) / 4.0))
    const r2Opacity     = t < 2.0 ? 0.75 : Math.max(0, 0.75 * (1.0 - (t - 2.0) / 4.5))
    const r3Opacity     = t < 2.5 ? 0.55 : Math.max(0, 0.55 * (1.0 - (t - 2.5) / 5.0))

    if (debrisMat)  debrisMat.uniforms.uOpacity.value  = debrisOpacity
    if (ring1Mat)   ring1Mat.uniforms.uOpacity.value   = r1Opacity
    if (ring2Mat)   ring2Mat.uniforms.uOpacity.value   = r2Opacity
    if (ring3Mat)   ring3Mat.uniforms.uOpacity.value   = r3Opacity
  })

  if (!active) return null

  return (
    <group>
      {/* Debris cloud — 900 plasma fragments */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position"     args={[positions, 3]} />
          <bufferAttribute attach="attributes-color"        args={[colors, 3]} />
          <bufferAttribute attach="attributes-particleSize" args={[sizes, 1]} />
        </bufferGeometry>
        <primitive object={debrisMat} attach="material" />
      </points>

      {/* Ring 1 — Inner plasma belt (cyan-white, 1800 particles) */}
      <points ref={ring1Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position"     args={[ring1Data.pos, 3]} />
          <bufferAttribute attach="attributes-color"        args={[ring1Data.col, 3]} />
          <bufferAttribute attach="attributes-particleSize" args={[ring1Data.siz, 1]} />
        </bufferGeometry>
        <primitive object={ring1Mat} attach="material" />
      </points>

      {/* Ring 2 — Middle plasma belt (blue-violet, 1400 particles) */}
      <points ref={ring2Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position"     args={[ring2Data.pos, 3]} />
          <bufferAttribute attach="attributes-color"        args={[ring2Data.col, 3]} />
          <bufferAttribute attach="attributes-particleSize" args={[ring2Data.siz, 1]} />
        </bufferGeometry>
        <primitive object={ring2Mat} attach="material" />
      </points>

      {/* Ring 3 — Outer nebula shell (violet-magenta, 1000 particles) */}
      <points ref={ring3Ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position"     args={[ring3Data.pos, 3]} />
          <bufferAttribute attach="attributes-color"        args={[ring3Data.col, 3]} />
          <bufferAttribute attach="attributes-particleSize" args={[ring3Data.siz, 1]} />
        </bufferGeometry>
        <primitive object={ring3Mat} attach="material" />
      </points>
    </group>
  )
}


function Sun({ isHyperdrive, isSupernova, sunClickCount = 0, onSunClick }) {
  const sunMeshRef = useRef()
  const lightRef = useRef()

  // ═══════════════════════════════════════════════════════════════════
  //  TEXTURA ENANA AZUL — Misma textura NASA 2K del Sol transformada a Plasma Azul
  // ═══════════════════════════════════════════════════════════════════
  const blueDwarfTexture = useMemo(() => {
    if (typeof document === 'undefined') return null
    const W = 2048, H = 1024
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 16
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/textures/planets/2k_sun.jpg'

    const processSunToBlue = () => {
      ctx.drawImage(img, 0, 0, W, H)
      const imgData = ctx.getImageData(0, 0, W, H)
      const d = imgData.data

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]

        // Luminosidad física precisa de la foto original del Sol de la NASA
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0

        // Realce de contraste para acentuar granulación, erupciones y manchas solares
        const t = Math.pow(lum, 1.08)

        // Mapeo espectral a estrella azul de alta temperatura (Clase O/B NASA)
        let nR, nG, nB
        if (t < 0.22) {
          // Manchas solares / zonas magnéticas oscuras
          const k = t / 0.22
          nR = Math.floor(2   + k * 10)
          nG = Math.floor(8   + k * 45)
          nB = Math.floor(55  + k * 110)
        } else if (t < 0.58) {
          // Plasma de la fotosfera: Azul real / Cobalto vibrante
          const k = (t - 0.22) / 0.36
          nR = Math.floor(12  + k * 38)
          nG = Math.floor(53  + k * 127)
          nB = Math.floor(165 + k * 85)
        } else if (t < 0.84) {
          // Granulación brillante y fáculas: Cyan eléctrico / Blanco-azul
          const k = (t - 0.58) / 0.26
          nR = Math.floor(50  + k * 145)
          nG = Math.floor(180 + k * 65)
          nB = Math.floor(250 + k * 5)
        } else {
          // Erupciones solares y núcleos incandescentes: Blanco puro UV
          const k = (t - 0.84) / 0.16
          nR = Math.floor(195 + k * 60)
          nG = Math.floor(245 + k * 10)
          nB = 255
        }

        d[i]     = Math.min(255, Math.max(0, nR))
        d[i + 1] = Math.min(255, Math.max(0, nG))
        d[i + 2] = Math.min(255, Math.max(0, nB))
      }

      ctx.putImageData(imgData, 0, 0)
      tex.needsUpdate = true
    }

    if (img.complete) {
      processSunToBlue()
    } else {
      img.onload = processSunToBlue
    }

    return tex
  }, [])



  const coronaInnerMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uColor:  { value: new THREE.Color(isSupernova ? '#00E5FF' : '#FFD070') },
        uColor2: { value: new THREE.Color(isSupernova ? '#88DDFF' : '#FFAA33') },
        uPower:  { value: isSupernova ? 1.4 : 1.8 },
        uOpacity:{ value: isSupernova ? 0.95 : 1.0 },
        uTime:   { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [isSupernova])

  const coronaMidMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uColor:  { value: new THREE.Color(isSupernova ? '#0066FF' : '#FF5500') },
        uColor2: { value: new THREE.Color(isSupernova ? '#00AAFF' : '#FF8800') },
        uPower:  { value: isSupernova ? 1.2 : 1.4 },
        uOpacity:{ value: isSupernova ? 0.75 : 0.80 },
        uTime:   { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [isSupernova])

  const coronaOuterMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uColor:  { value: new THREE.Color(isSupernova ? '#003399' : '#CC2200') },
        uColor2: { value: new THREE.Color(isSupernova ? '#0044DD' : '#FF4400') },
        uPower:  { value: isSupernova ? 1.0 : 1.2 },
        uOpacity:{ value: isSupernova ? 0.55 : 0.60 },
        uTime:   { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [isSupernova])

  const haloMat1 = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: {
        uColor:  { value: new THREE.Color(isSupernova ? '#00E5FF' : '#FF9900') },
        uColor2: { value: new THREE.Color(isSupernova ? '#0044FF' : '#FF4400') },
        uOpacity:{ value: isSupernova ? 0.85 : 0.75 },
        uTime:   { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [isSupernova])

  const haloMat2 = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: {
        uColor:  { value: new THREE.Color(isSupernova ? '#001166' : '#440000') },
        uColor2: { value: new THREE.Color(isSupernova ? '#003399' : '#662200') },
        uOpacity:{ value: isSupernova ? 0.45 : 0.35 },
        uTime:   { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [isSupernova])

  const shockwaveMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          float dist = length(vUv - vec2(0.5)) * 2.0;
          float ring = smoothstep(0.2, 0.45, dist) * smoothstep(0.95, 0.7, dist);
          vec3 col = mix(vec3(0.0, 0.9, 1.0), vec3(0.0, 0.3, 1.0), sin(uTime * 8.0) * 0.5 + 0.5);
          gl_FragColor = vec4(col, ring * 0.85);
        }
      `,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  }, [])

  // heat: 0.0 = normal sol, 1.0 = incandescente rojo previo a supernova (clicks 1-4)
  const heatLevel = isSupernova ? 0 : Math.min(1, sunClickCount / 4)

  // Color del sol interpolado: dorado normal → naranja → rojo incandescente
  const sunColor = useMemo(() => {
    if (isSupernova) return new THREE.Color('#FFFFFF')
    // Interpolación: #FFF8D5 (dorado suave) → #FF8800 (naranja) → #FF1100 (rojo vivo)
    const warm = new THREE.Color('#FFF8D5')
    const orange = new THREE.Color('#FF6600')
    const deepRed = new THREE.Color('#FF0800')
    if (heatLevel < 0.5) return warm.lerp(orange, heatLevel * 2)
    return orange.clone().lerp(deepRed, (heatLevel - 0.5) * 2)
  }, [heatLevel, isSupernova])

  // Intensidad de luz calentada por clicks
  const sunLightIntensity = isSupernova ? 500 : 140 + heatLevel * 120
  const sunLightColor = isSupernova ? '#00E5FF' : (heatLevel > 0.6 ? '#FF3300' : heatLevel > 0.3 ? '#FF7700' : '#FFF5E0')

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += delta * (isHyperdrive ? 0.35 : 0.04)
      // Pulso de escala por calor — el sol "late" más rápido con cada click
      if (!isSupernova && heatLevel > 0) {
        const pulse = 1.0 + Math.sin(t * (4 + heatLevel * 8)) * 0.012 * heatLevel
        sunMeshRef.current.scale.setScalar(pulse)
      }
    }

    // Animate corona uTime uniforms for streamer flickering
    const coronaMats = [coronaInnerMat, coronaMidMat]
    coronaMats.forEach(mat => { if (mat?.uniforms?.uTime) mat.uniforms.uTime.value = t })
    if (haloMat1?.uniforms?.uTime) haloMat1.uniforms.uTime.value = t

    if (isSupernova && lightRef.current) {
      // Energetic pulsing with slow decay
      const pulse = Math.sin(t * 18.0) * 150 + Math.sin(t * 7.0) * 80
      lightRef.current.intensity = 600 + pulse
    }
  })

  // Al convertirse en Enana Azul, la estrella se contrae a un tamaño compacto e hiperdenso (0.85)
  const sunRadius = isSupernova ? 0.85 : 1.35

  const handleSunPointerDown = (e) => {
    e.stopPropagation()
    onSunClick && onSunClick()
  }

  return (
    <group>
      {/* Luz Azul Neón / Cálida del Sol */}
      <pointLight ref={lightRef} color={sunLightColor} intensity={sunLightIntensity} distance={isSupernova ? 240 : 100} decay={1.1} />
      <pointLight color={isSupernova ? "#0055FF" : (heatLevel > 0.5 ? '#FF2200' : '#FF7700')} intensity={isSupernova ? 280 : 70 + heatLevel * 60} distance={isSupernova ? 160 : 70} decay={1.3} />

      {/* Sol: textura NASA + tinte de calor progresivo por click */}
      <mesh
        ref={sunMeshRef}
        onPointerDown={handleSunPointerDown}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[sunRadius, 64, 64]} />
        <meshBasicMaterial
          map={isSupernova ? blueDwarfTexture : loadedPlanetTextures.Sun}
          color={sunColor}
        />
      </mesh>

      {/* Corona interna (zona de transición) */}
      <mesh scale={isSupernova ? 1.20 : 1.18}>
        <sphereGeometry args={[sunRadius, 64, 64]} />
        <primitive object={coronaInnerMat} attach="material" />
      </mesh>

      {/* Corona media (streamers) */}
      <mesh scale={isSupernova ? 1.50 : 1.42}>
        <sphereGeometry args={[sunRadius, 48, 48]} />
        <primitive object={coronaMidMat} attach="material" />
      </mesh>


      {/* EFX EXPLOSIÓN EN 3D DE LA ENANA AZUL */}
      <SupernovaExplosion active={isSupernova} />
    </group>
  )
}

function SecretUFO() {
  const ufoRef = useRef()
  const [abducting, setAbducting] = useState(false)
  const angleRef = useRef(1.8)

  useFrame((state, delta) => {
    angleRef.current += delta * 0.18
    const angle = angleRef.current
    const r = 7.4
    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    const y = Math.sin(angle * 2.0) * 0.6

    if (ufoRef.current) {
      ufoRef.current.position.set(x, y, z)
      ufoRef.current.rotation.y += delta * 3.5
    }
  })

  const handleUFOPointerDown = (e) => {
    e.stopPropagation()
    setAbducting(true)
    triggerEasterEggToast('🛸 ABDUCCIÓN ALIENÍGENA ACTIVADA', '¡Has descubierto el OVNI secreto navegando en el cinturón de asteroides!', '🛸')
    setTimeout(() => setAbducting(false), 4500)
  }

  return (
    <group ref={ufoRef}>
      {/* Hitbox invisible cómodo para hacer clic */}
      <mesh
        onPointerDown={handleUFOPointerDown}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Cúpula de Cristal Neón Sutil y Pequeña */}
      <mesh position={[0, 0.025, 0]}>
        <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#00E5FF" roughness={0.1} metalness={0.9} emissive="#00E5FF" emissiveIntensity={0.9} />
      </mesh>

      {/* Disco del Platillo Volador Compacto */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 32]} />
        <meshStandardMaterial color="#E0E0E0" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* Luz puntual alienígena */}
      <pointLight color="#00E5FF" intensity={15} distance={3} decay={1.3} />

      {/* Rayo Abductor Neón */}
      {abducting && (
        <mesh position={[0, -1.0, 0]}>
          <coneGeometry args={[0.45, 2.0, 32, 1, true]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.7} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}


function Atmosphere({ radius, color, opacity = 0.35 }) {
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
          float intensity = pow(fresnel, 3.5);
          gl_FragColor = vec4(uColor, intensity * uOpacity * 1.5);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    })
  }, [color, opacity])

  return (
    <mesh scale={1.05}>
      <sphereGeometry args={[radius, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

function PlanetRings({ innerRadius, outerRadius, color, opacity = 0.98 }) {
  const ringRef = useRef()

  const ringGeometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128, 8)
    const pos = geo.attributes.position
    const uvs = geo.attributes.uv
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const r = Math.sqrt(x * x + y * y)
      const u = Math.min(1.0, Math.max(0.0, (r - innerRadius) / (outerRadius - innerRadius)))
      uvs.setXY(i, u, 0.5)
    }
    uvs.needsUpdate = true
    return geo
  }, [innerRadius, outerRadius])

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.015
    }
  })

  return (
    <group rotation={[Math.PI * 0.38, -Math.PI * 0.06, -Math.PI * 0.12]}>
      <mesh ref={ringRef} geometry={ringGeometry}>
        <meshStandardMaterial
          map={loadedPlanetTextures.SaturnRing}
          transparent={true}
          opacity={opacity}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.02}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Moon({ name, radius, distance, speed, color = '#C0C0C0' }) {
  const moonRef = useRef()
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame((state, delta) => {
    angle.current += delta * speed
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(angle.current) * distance
      moonRef.current.position.z = Math.sin(angle.current) * distance
    }
  })

  return (
    <group ref={moonRef} position={[Math.cos(angle.current) * distance, 0, Math.sin(angle.current) * distance]}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          map={loadedPlanetTextures.Moon} 
          color={color} 
          roughness={0.92} 
          metalness={0.02} 
        />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TON 618 — GARGANTUA PHOTOREALISTIC GR BLACK HOLE
// ═══════════════════════════════════════════════════════════════════════════════

const ton618RelativisticVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ton618RelativisticFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uOpacity;

  // ─── Simplex Noise 2D ───────────────────────────────────────────────────────
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));
    vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz;
    x12.xy-=i1;
    i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m=m*m;m=m*m;
    vec3 x2=2.0*fract(p*C.www)-1.0;
    vec3 h=abs(x2)-0.5;
    vec3 ox=floor(x2+0.5);
    vec3 a0=x2-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x=a0.x*x0.x+h.x*x0.y;
    g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.0*dot(m,g);
  }
  float fbm(vec2 p){
    float v=0.0,a=0.5;
    mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
    for(int i=0;i<5;i++){v+=a*snoise(p);p=rot*p*2.02;a*=0.5;}
    return v;
  }
  // ────────────────────────────────────────────────────────────────────────────

  void main() {
    vec2 p = (vUv - vec2(0.5)) * 2.0;

    // Cinematic tilt angle (-12 degrees)
    float tilt = -0.21;
    mat2 rot = mat2(cos(tilt), sin(tilt), -sin(tilt), cos(tilt));
    p = rot * p;

    float r = length(p);
    float angle = atan(p.y, p.x);
    float Rs = 0.32; // Radius of pitch-black Event Horizon

    // 1. Pure Pitch Black Event Horizon Shadow
    if (r <= Rs) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity);
      return;
    }

    // 2. Razor-Thin Einstein Photon Ring (Bright white-gold edge right at Rs)
    float dEdge = r - Rs;
    float photonRing = exp(-dEdge * 80.0) * 4.0;
    vec3 photonCol = vec3(1.00, 0.96, 0.85) * photonRing;

    // 3. Gravitational Lensing Bending Calculation (Interstellar Formula)
    float sinA = sin(angle);
    float cosA = cos(angle);
    
    // Warped vertical distance to disk plane
    float diskPlaneDist = abs(p.y);
    float lensingBending = pow(Rs / r, 1.8) * pow(abs(sinA), 1.6);
    float effectiveDiskY = diskPlaneDist - lensingBending * Rs * 1.35;

    // Disk bounds
    float innerR = Rs * 1.05;
    float outerR = 0.78; // Bounded inner quad size so it NEVER reaches quad borders!

    // Alpha mask for horizontal disk + gravitational lensing arches
    float mainBandMask = smoothstep(0.07, 0.0, abs(p.y)) * smoothstep(innerR, innerR + 0.08, r) * smoothstep(outerR, outerR - 0.25, r);
    float lensingArchMask = smoothstep(0.04, 0.0, abs(effectiveDiskY)) * smoothstep(innerR, innerR + 0.06, r) * smoothstep(outerR * 0.9, outerR * 0.65, r);
    
    float diskMask = max(mainBandMask, lensingArchMask);

    // Smooth outer boundary falloff (Guarantees zero sharp edges or screen clipping!)
    float edgeFalloff = smoothstep(outerR, outerR - 0.20, r);
    diskMask *= edgeFalloff;

    if (diskMask <= 0.001 && photonRing <= 0.001) {
      float halo = exp(-dEdge * 5.5) * 0.16;
      gl_FragColor = vec4(vec3(1.0, 0.40, 0.02) * halo, halo * uOpacity);
      return;
    }

    // 4. Plasma Flow & Turbulence along disk
    float normR = clamp((r - innerR) / (outerR - innerR), 0.0, 1.0);
    float speed = 3.5 / (normR + 0.15);
    vec2 noiseUv1 = vec2(normR * 14.0, angle * 4.0 - uTime * speed * 0.45);
    vec2 noiseUv2 = vec2(normR * 32.0, angle * 7.0 - uTime * 2.2);

    float plasma = fbm(noiseUv1) * 0.5 + 0.5;
    float fineFilaments = snoise(noiseUv2) * 0.25;
    float density = clamp(plasma + fineFilaments, 0.0, 1.0);

    // 5. Rich Interstellar Gargantua Color Palette:
    // Core (White Thermal) -> Solar Gold -> Deep Fiery Orange -> Dark Crimson
    vec3 cCore   = vec3(1.00, 0.98, 0.92);
    vec3 cGold   = vec3(1.00, 0.70, 0.05);
    vec3 cOrange = vec3(1.00, 0.26, 0.00);
    vec3 cRed    = vec3(0.48, 0.02, 0.00);

    vec3 col = mix(cCore, cGold, smoothstep(0.0, 0.20, normR));
    col = mix(col, cOrange, smoothstep(0.20, 0.60, normR));
    col = mix(col, cRed, smoothstep(0.60, 1.00, normR));

    col += vec3(0.40, 0.20, 0.04) * pow(density, 1.3);

    // Relativistic Doppler Beaming (approaching side is brighter)
    float doppler = 1.0 + 0.60 * (-cosA * 0.5 + 0.5);
    col *= doppler;

    // ISCO Core Thermal Heat Glow
    float iscoGlow = pow(clamp(1.0 - normR, 0.0, 1.0), 10.0) * 2.5;
    col += vec3(1.0, 0.94, 0.75) * iscoGlow;

    vec3 finalColor = col * diskMask + photonCol;
    float finalAlpha = clamp(diskMask * (0.88 + 0.12 * density) + photonRing * 0.5, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`

function AccretionVortexParticles({ opacity, count = 800 }) {
  const pointsRef = useRef()
  const particleCount = count
  const [positions, radii, angles, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const rad = new Float32Array(particleCount)
    const ang = new Float32Array(particleCount)
    const spd = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      rad[i] = 1.4 + Math.random() * 3.8
      ang[i] = Math.random() * Math.PI * 2
      spd[i] = 0.5 + Math.random() * 1.7
      pos[i * 3] = Math.cos(ang[i]) * rad[i]
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.16
      pos[i * 3 + 2] = Math.sin(ang[i]) * rad[i]
    }
    return [pos, rad, ang, spd]
  }, [count])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    for (let i = 0; i < particleCount; i++) {
      angles[i] += delta * speeds[i] * (3.8 / radii[i])
      radii[i] -= delta * 0.16 * speeds[i]
      if (radii[i] < 1.35) radii[i] = 4.8 + Math.random() * 0.7
      posAttr.array[i * 3] = Math.cos(angles[i]) * radii[i]
      posAttr.array[i * 3 + 1] = Math.sin(angles[i] * 2.5) * 0.08
      posAttr.array[i * 3 + 2] = Math.sin(angles[i]) * radii[i]
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FFB400"
        transparent
        opacity={opacity * 0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function Ton618({ opacity }) {
  const groupRef = useRef()
  const matRef = useRef()

  const relativisticMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: ton618RelativisticVertexShader,
    fragmentShader: ton618RelativisticFragmentShader,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
      matRef.current.uniforms.uOpacity.value = opacity
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.12) * 0.025
    }
  })

  if (opacity <= 0.01) return null

  return (
    <group ref={groupRef} position={[2.4, 0.1, 0]}>
      {/* 1. Malla Quad Rendering Fotorrealista Interstellar Gargantua */}
      <mesh scale={6.8}>
        <planeGeometry args={[1, 1, 96, 96]} />
        <primitive object={relativisticMat} ref={matRef} attach="material" />
      </mesh>

      {/* 2. Vórtice Denso de Partículas y Brasas Doradas */}
      <AccretionVortexParticles opacity={opacity} count={800} />

      {/* 3. Iluminación Cálida del Quásar */}
      <pointLight color="#FFB800" intensity={280 * opacity} distance={90} decay={1.1} />
      <pointLight color="#FF3800" intensity={150 * opacity} distance={60} decay={1.2} />
    </group>
  )
}





function CometOrbitLine({ orbitRadius = 9.0, inclination = 0.3, color = '#00E5FF', opacity = 0.10 }) {
  const lineGeo = useMemo(() => {
    const points = []
    const segments = 128
    const a = orbitRadius
    const e = 0.55
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const r = a * (1 - e * e) / (1 + e * Math.cos(angle))
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      const y = Math.sin(angle * 1.4) * inclination * r * 0.35
      points.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [orbitRadius, inclination])

  return (
    <line geometry={lineGeo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </line>
  )
}

function PhotorealisticComet({ orbitRadius = 9.0, speed = 0.22, color = '#00E5FF', dustColor = '#FFE090', inclination = 0.3, initialAngle = 0.4 }) {
  const groupRef = useRef()
  const ionTailRef = useRef()
  const dustTailRef = useRef()
  const angleRef = useRef(initialAngle)
  const prevPosRef = useRef(new THREE.Vector3())

  // 1. Estela de Seda Plasma Cyan (320 micro-partículas superpuestas de flujo continuo)
  const { geo: ionGeo, pos: ionPos } = useMemo(() => {
    const pCount = 320
    const pos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const t = i / pCount
      const dist = t * 4.2 + 0.05
      const spread = Math.pow(t, 0.6) * 0.14
      const ang = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(ang) * spread * (Math.random() * 0.7 + 0.3)
      pos[i * 3 + 1] = Math.sin(ang) * spread * (Math.random() * 0.7 + 0.3)
      pos[i * 3 + 2] = dist
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo, pos }
  }, [])

  // 2. Estela de Polvo Estelar Dorado (220 micro-partículas curvadas)
  const { geo: dustGeo, pos: dustPos } = useMemo(() => {
    const pCount = 220
    const pos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const t = i / pCount
      const dist = t * 4.6 + 0.05
      const spread = Math.pow(t, 0.7) * 0.22
      const ang = Math.random() * Math.PI * 2
      const curveX = dist * dist * 0.018
      pos[i * 3] = Math.cos(ang) * spread + curveX
      pos[i * 3 + 1] = Math.sin(ang) * spread
      pos[i * 3 + 2] = dist
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geo, pos }
  }, [])

  useFrame((state, delta) => {
    angleRef.current += delta * speed
    const angle = angleRef.current

    const a = orbitRadius
    const e = 0.55
    const r = a * (1 - e * e) / (1 + e * Math.cos(angle))

    const x = Math.cos(angle) * r
    const z = Math.sin(angle) * r
    const y = Math.sin(angle * 1.4) * inclination * r * 0.35

    const cometPos = new THREE.Vector3(x, y, z)

    // Vector tangente de velocidad analítica exacta (Derivada d/d(angle) de la trayectoria orbital)
    const dr_dangle = (a * (1 - e * e) * e * Math.sin(angle)) / Math.pow(1 + e * Math.cos(angle), 2)
    const dx = -Math.sin(angle) * r + Math.cos(angle) * dr_dangle
    const dz = Math.cos(angle) * r + Math.sin(angle) * dr_dangle
    const dy = Math.cos(angle * 1.4) * 1.4 * inclination * r * 0.35
    const vel = new THREE.Vector3(dx, dy, dz).normalize()

    if (groupRef.current) {
      groupRef.current.position.copy(cometPos)

      // Matriz de orientación exacta: el núcleo avanza al frente (+vel) y la cola (Z+) se extiende atrás (-vel)
      const matrix = new THREE.Matrix4()
      const targetLook = cometPos.clone().add(vel)
      matrix.lookAt(cometPos, targetLook, new THREE.Vector3(0, 1, 0))
      groupRef.current.quaternion.setFromRotationMatrix(matrix)
    }

    if (ionTailRef.current) {
      const pArr = ionTailRef.current.geometry.attributes.position.array
      for (let i = 0; i < ionPos.length / 3; i++) {
        pArr[i * 3 + 2] += delta * 4.8
        if (pArr[i * 3 + 2] > 4.25) {
          pArr[i * 3 + 2] = 0.05
        }
      }
      ionTailRef.current.geometry.attributes.position.needsUpdate = true
    }

    if (dustTailRef.current) {
      const pArr = dustTailRef.current.geometry.attributes.position.array
      for (let i = 0; i < dustPos.length / 3; i++) {
        pArr[i * 3 + 2] += delta * 3.4
        if (pArr[i * 3 + 2] > 4.65) {
          pArr[i * 3 + 2] = 0.05
        }
      }
      dustTailRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* 1. Núcleo brillante e helado de roca estelar */}
      <mesh>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Luz puntual solar brillante de alta intensidad */}
      <pointLight color={color} intensity={40} distance={10} decay={1.2} />

      {/* 2. Estela de Plasma Ionizado Cyan (Micro-partículas superpuestas continuas) */}
      <points ref={ionTailRef} geometry={ionGeo}>
        <pointsMaterial
          size={0.06}
          map={globalParticleTex}
          color={color}
          transparent
          opacity={0.92}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* 3. Estela de Polvo Estelar Dorado */}
      <points ref={dustTailRef} geometry={dustGeo}>
        <pointsMaterial
          size={0.05}
          map={globalParticleTex}
          color={dustColor}
          transparent
          opacity={0.72}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function EarthPlanet({ data, isSupernova }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const cloudsRef = useRef()
  const orbitAngle = useRef(Math.random() * Math.PI * 2)

  const { radius, distance, orbitSpeed, rotationSpeed, eccentricity, inclination, moons } = data

  // Mapa dinámico de rugosidad para océanos especulares reflectantes vs continentes mate
  const specularRoughnessMap = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/textures/planets/2k_earth_daymap.jpg'

    ctx.fillStyle = '#C0C0C0'
    ctx.fillRect(0, 0, 512, 256)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, 512, 256)
      const imgData = ctx.getImageData(0, 0, 512, 256)
      const d = imgData.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2]
        const isOcean = (b > r * 1.05 && b > g * 0.95)
        const val = isOcean ? 30 : 225
        d[i] = val
        d[i+1] = val
        d[i+2] = val
      }
      ctx.putImageData(imgData, 0, 0)
      if (textureRef.current) textureRef.current.needsUpdate = true
    }
    const textureRef = { current: new THREE.CanvasTexture(canvas) }
    return textureRef.current
  }, [])

  // Material Shader de Resplandor Atmosférico Fresnel Rayleigh en el horizonte de la Tierra
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        uniform float uPower;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
          float intensity = pow(fresnel, uPower);
          gl_FragColor = vec4(uColor, intensity * 0.92);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(isSupernova ? '#00FFFF' : '#14A6FF') },
        uPower: { value: isSupernova ? 1.8 : 2.5 }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    })
  }, [isSupernova])

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return

    const speedBoost = isSupernova ? 1.6 : 1.0
    orbitAngle.current += delta * orbitSpeed * 0.08 * speedBoost
    const a = distance
    const e = eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(orbitAngle.current))

    const wobbleY = isSupernova ? Math.sin(state.clock.elapsedTime * 11.0 + distance * 1.5) * 0.05 : 0
    groupRef.current.position.x = Math.cos(orbitAngle.current) * r
    groupRef.current.position.z = Math.sin(orbitAngle.current) * r
    groupRef.current.position.y = Math.sin(orbitAngle.current) * Math.sin(inclination) * r * 0.2 + wobbleY

    meshRef.current.rotation.y += delta * rotationSpeed * (isSupernova ? 2.0 : 1.0)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * rotationSpeed * 1.25 * (isSupernova ? 2.2 : 1.0)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {/* 1. Tierra con Textura 2K NASA + Mapas de Océano Reflectante */}
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={loadedPlanetTextures.Earth}
            roughnessMap={specularRoughnessMap}
            roughness={0.65}
            metalness={0.10}
          />
        </mesh>

        {/* 2. Capa Atmosférica de Nubes Fotorrealistas 2K NASA */}
        <mesh ref={cloudsRef} scale={1.025}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={loadedPlanetTextures.EarthClouds}
            transparent
            opacity={0.78}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 3. Halo Atmosférico de Dispersión Rayleigh con Aurora de Supernova */}
        <mesh scale={isSupernova ? 1.18 : 1.12}>
          <sphereGeometry args={[radius, 64, 64]} />
          <primitive object={atmosphereMaterial} attach="material" />
        </mesh>
      </group>

      {/* 4. Sistema Lunar */}
      {moons && moons.map((moon) => (
        <Moon key={moon.name} {...moon} />
      ))}
    </group>
  )
}

function JupiterPlanet({ data, isSupernova }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const orbitAngle = useRef(Math.random() * Math.PI * 2)

  const { radius, distance, orbitSpeed, rotationSpeed, eccentricity, inclination, moons } = data

  // Shader para la Gran Mancha Roja de Júpiter (Great Red Spot Storm Vortex)
  const redSpotMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float uTime;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }

        void main() {
          // La Gran Mancha Roja en la latitud -22° (vUv.y ~ 0.36)
          vec2 spotCenter = vec2(0.62, 0.36);
          vec2 uvOffset = (vUv - spotCenter);
          
          float dist = length(vec2(uvOffset.x * 1.6, uvOffset.y * 2.5));
          float stormMask = smoothstep(0.12, 0.01, dist);
          
          float angle = atan(uvOffset.y, uvOffset.x);
          float swirl = noise(vec2(dist * 22.0 - uTime * 0.8, angle * 3.0 + uTime * 0.6));
          
          vec3 redSpotColor = mix(vec3(0.85, 0.22, 0.10), vec3(0.96, 0.45, 0.16), swirl);
          vec3 rimColor = vec3(0.92, 0.78, 0.55);
          vec3 finalColor = mix(rimColor, redSpotColor, smoothstep(0.12, 0.04, dist));
          
          float alpha = stormMask * 0.92;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    })
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return

    const speedBoost = isSupernova ? 1.5 : 1.0
    orbitAngle.current += delta * orbitSpeed * 0.08 * speedBoost
    const a = distance
    const e = eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(orbitAngle.current))

    const wobbleY = isSupernova ? Math.sin(state.clock.elapsedTime * 9.0 + distance * 1.2) * 0.06 : 0
    groupRef.current.position.x = Math.cos(orbitAngle.current) * r
    groupRef.current.position.z = Math.sin(orbitAngle.current) * r
    groupRef.current.position.y = Math.sin(orbitAngle.current) * Math.sin(inclination) * r * 0.2 + wobbleY

    meshRef.current.rotation.y += delta * rotationSpeed * (isSupernova ? 2.2 : 1.0)
    if (redSpotMaterial) {
      redSpotMaterial.uniforms.uTime.value = state.clock.elapsedTime * (isSupernova ? 2.5 : 1.0)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        {/* 1. Júpiter con Textura 2K NASA */}
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={loadedPlanetTextures.Jupiter}
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>

        {/* 2. Capa Dinámica de la Gran Mancha Roja de Júpiter */}
        <mesh scale={1.003}>
          <sphereGeometry args={[radius, 64, 64]} />
          <primitive object={redSpotMaterial} attach="material" />
        </mesh>

        {/* 3. Escudo Auroral de Radiación de Supernova en Júpiter */}
        {isSupernova && (
          <mesh scale={1.06}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* 4. Sistema de Lunas Galileanas (Io, Europa, Ganimedes, Calisto) */}
      {moons && moons.map((moon) => (
        <Moon key={moon.name} {...moon} />
      ))}
    </group>
  )
}

function UranusPlanet({ data, isSupernova }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const orbitAngle = useRef(Math.random() * Math.PI * 2)

  const { radius, distance, orbitSpeed, rotationSpeed, eccentricity, inclination, moons } = data

  // Shader Atmosférico de Dispersión de Metano Rayleigh (Cyan-Aqua Glow)
  const uranusAtmosphereMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform vec3 uColor;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
          float intensity = pow(fresnel, 2.4);
          gl_FragColor = vec4(uColor, intensity * 0.88);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(isSupernova ? '#00FFFF' : '#60E8F5') }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    })
  }, [isSupernova])

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return

    const speedBoost = isSupernova ? 1.5 : 1.0
    orbitAngle.current += delta * orbitSpeed * 0.08 * speedBoost
    const a = distance
    const e = eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(orbitAngle.current))

    const wobbleY = isSupernova ? Math.sin(state.clock.elapsedTime * 8.0 + distance) * 0.06 : 0
    groupRef.current.position.x = Math.cos(orbitAngle.current) * r
    groupRef.current.position.z = Math.sin(orbitAngle.current) * r
    groupRef.current.position.y = Math.sin(orbitAngle.current) * Math.sin(inclination) * r * 0.2 + wobbleY

    // Rotación sobre su propio eje inclinado
    meshRef.current.rotation.y += delta * rotationSpeed * (isSupernova ? 2.0 : 1.0)
  })

  return (
    <group ref={groupRef}>
      {/* Grupo inclinado a 97.8° (Inclinación axial extrema única de Urano) */}
      <group rotation={[Math.PI * 0.48, 0, Math.PI * 0.1]}>
        <group ref={meshRef}>
          {/* 1. Urano con Textura 2K NASA */}
          <mesh>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial
              map={loadedPlanetTextures.Uranus}
              roughness={0.28}
              metalness={0.02}
            />
          </mesh>

          {/* 2. Capa Atmosférica de Dispersión de Metano */}
          <mesh scale={isSupernova ? 1.09 : 1.05}>
            <sphereGeometry args={[radius, 64, 64]} />
            <primitive object={uranusAtmosphereMat} attach="material" />
          </mesh>
        </group>

        {/* 3. Sistema de Anillos de Hielo Verticales de Urano */}
        <PlanetRings
          innerRadius={radius * 1.35}
          outerRadius={radius * 1.85}
          color={isSupernova ? "#80FFFF" : "#A8E6F0"}
          opacity={isSupernova ? 0.85 : 0.65}
        />
      </group>

      {/* Lunas de Urano (Miranda) */}
      {moons && moons.map((moon) => (
        <Moon key={moon.name} {...moon} />
      ))}
    </group>
  )
}

function Planet({ data, isSupernova }) {
  if (data.name === 'Earth') {
    return <EarthPlanet data={data} isSupernova={isSupernova} />
  }
  if (data.name === 'Jupiter') {
    return <JupiterPlanet data={data} isSupernova={isSupernova} />
  }
  if (data.name === 'Uranus') {
    return <UranusPlanet data={data} isSupernova={isSupernova} />
  }
  const groupRef = useRef()
  const meshRef = useRef()
  const cloudsRef = useRef()
  const orbitAngle = useRef(Math.random() * Math.PI * 2)

  const { radius, distance, orbitSpeed, rotationSpeed, eccentricity, inclination, type, color, hasAtmosphere, atmosphereColor, hasRing, ringColor, ringInner, ringOuter, hasClouds, moons } = data

  const textures = useMemo(() => {
    const tex = {}
    tex.surface = loadedPlanetTextures[data.name] || generateTexture(type, type === 'gas' ? (data.name === 'Jupiter' ? 1 : 2) : 0)
    if (hasClouds) {
      tex.clouds = loadedPlanetTextures.EarthClouds || generateTexture('earth_clouds', 0)
    }
    return tex
  }, [type, hasClouds, data.name])

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return

    const speedBoost = isSupernova ? 1.6 : 1.0
    orbitAngle.current += delta * orbitSpeed * 0.08 * speedBoost
    const a = distance
    const e = eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(orbitAngle.current))

    const wobbleY = isSupernova ? Math.sin(state.clock.elapsedTime * 10.0 + distance * 1.5) * 0.05 : 0
    groupRef.current.position.x = Math.cos(orbitAngle.current) * r
    groupRef.current.position.z = Math.sin(orbitAngle.current) * r
    groupRef.current.position.y = Math.sin(orbitAngle.current) * Math.sin(inclination) * r * 0.2 + wobbleY

    meshRef.current.rotation.y += delta * rotationSpeed * (isSupernova ? 2.0 : 1.0)
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * rotationSpeed * 1.3 * (isSupernova ? 2.0 : 1.0)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={textures.surface}
            roughness={type === 'gas' ? 0.45 : (type === 'ice' ? 0.35 : 0.82)}
            metalness={type === 'gas' ? 0.05 : 0.02}
          />
        </mesh>

        {hasClouds && (
          <mesh ref={cloudsRef} scale={1.025}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial
              map={textures.clouds}
              transparent
              opacity={0.78}
              depthWrite={false}
            />
          </mesh>
        )}

        {hasAtmosphere && <Atmosphere radius={radius} color={isSupernova ? "#00E5FF" : atmosphereColor} opacity={isSupernova ? 0.65 : 0.32} />}

        {isSupernova && (
          <mesh scale={1.08}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        )}

        {hasRing && (
          <PlanetRings
            innerRadius={radius * (ringInner || 0.6)}
            outerRadius={radius * (ringOuter || 1.3)}
            color={isSupernova ? '#99DDFF' : (ringColor || '#C0B090')}
            opacity={isSupernova ? 0.95 : 0.85}
          />
        )}
      </group>

      {moons.map((moon) => (
        <Moon key={moon.name} {...moon} />
      ))}
    </group>
  )
}

function AsteroidBelt({ innerRadius = 6.6, outerRadius = 8.2, count = 5850, isSupernova = false }) {
  const meshRef = useRef()
  const ceresRef = useRef()
  const vestaRef = useRef()
  const pallasRef = useRef()

  // Geometría 3D rocosa e irregular a escala delicada y elegante
  const asteroidGeo = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.018, 0)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i)
      const vy = pos.getY(i)
      const vz = pos.getZ(i)
      const noise = 1 + (Math.random() - 0.5) * 0.4 // Irregularidad rocosa natural
      pos.setXYZ(i, vx * noise, vy * noise, vz * noise)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  // Posicionamiento 3D con dispersión amplia y proporciones irregulares
  const { dummy, asteroidData } = useMemo(() => {
    const d = new THREE.Object3D()
    const data = []
    const colors = ['#C2B29F', '#7A7062', '#D9CBB7', '#4A4337', '#9E8F7F', '#B5A593', '#6A5F52']

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const spreadY = (Math.random() - 0.5) * 0.55

      const posX = Math.cos(angle) * radius
      const posY = spreadY
      const posZ = Math.sin(angle) * radius

      // Variación de escalas irregulares elegantes
      const isRareMedium = Math.random() > 0.94
      const baseScale = isRareMedium ? (1.2 + Math.random() * 0.8) : (0.4 + Math.random() * 0.7)
      const scaleX = baseScale * (0.7 + Math.random() * 0.8)
      const scaleY = baseScale * (0.7 + Math.random() * 0.8)
      const scaleZ = baseScale * (0.7 + Math.random() * 0.8)

      const rotX = Math.random() * Math.PI * 2
      const rotY = Math.random() * Math.PI * 2
      const rotZ = Math.random() * Math.PI * 2

      data.push({
        posX, posY, posZ,
        scaleX, scaleY, scaleZ,
        rotX, rotY, rotZ,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    return { dummy: d, asteroidData: data }
  }, [innerRadius, outerRadius, count])

  useEffect(() => {
    if (!meshRef.current) return
    const tempColor = new THREE.Color()
    asteroidData.forEach((item, i) => {
      dummy.position.set(item.posX, item.posY, item.posZ)
      dummy.rotation.set(item.rotX, item.rotY, item.rotZ)
      dummy.scale.set(item.scaleX, item.scaleY, item.scaleZ)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      tempColor.set(item.color)
      meshRef.current.setColorAt(i, tempColor)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [asteroidData, dummy])

  useFrame((state, delta) => {
    const beltSpeed = isSupernova ? 0.055 : 0.016
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * beltSpeed
    }
    if (ceresRef.current) ceresRef.current.rotation.y += delta * (isSupernova ? 0.15 : 0.05)
    if (vestaRef.current) vestaRef.current.rotation.y += delta * (isSupernova ? 0.12 : 0.04)
    if (pallasRef.current) pallasRef.current.rotation.y += delta * (isSupernova ? 0.18 : 0.06)
  })

  return (
    <group>
      {/* Cinturón de 650 asteroides 3D irregulares a escala astronómica precisa */}
      <instancedMesh
        ref={meshRef}
        args={[asteroidGeo, null, count]}
      >
        <meshStandardMaterial
          roughness={0.85}
          metalness={0.15}
          flatShading
        />
      </instancedMesh>

      {/* Asteroide Mayor 1: Ceres */}
      <group position={[7.15, 0.05, 0]}>
        <mesh ref={ceresRef}>
          <dodecahedronGeometry args={[0.05, 1]} />
          <meshStandardMaterial color="#B0A090" roughness={0.88} metalness={0.12} flatShading />
        </mesh>
      </group>

      {/* Asteroide Mayor 2: Vesta */}
      <group position={[-7.35, -0.08, 0.3]}>
        <mesh ref={vestaRef} scale={[1.3, 0.8, 1.1]}>
          <icosahedronGeometry args={[0.04, 0]} />
          <meshStandardMaterial color="#8C8070" roughness={0.85} metalness={0.15} flatShading />
        </mesh>
      </group>

      {/* Asteroide Mayor 3: Pallas */}
      <group position={[0.4, 0.12, -7.4]}>
        <mesh ref={pallasRef} scale={[1.1, 1.4, 0.8]}>
          <dodecahedronGeometry args={[0.038, 0]} />
          <meshStandardMaterial color="#A59585" roughness={0.88} metalness={0.12} flatShading />
        </mesh>
      </group>
    </group>
  )
}

function OrbitLine({ radius, eccentricity = 0, inclination = 0, opacity = 0.08 }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 160; i++) {
      const angle = (i / 160) * Math.PI * 2
      const a = radius
      const e = eccentricity
      const r = a * (1 - e * e) / (1 + e * Math.cos(angle))
      pts.push(new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(angle) * Math.sin(inclination) * r * 0.2,
        Math.sin(angle) * r
      ))
    }
    return pts
  }, [radius, eccentricity, inclination])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#38bdf8" transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </line>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SISTEMA NATIVO THREE.JS DE COLISIÓN Y EXPLOSIONES (0 RE-RENDERS, 60 FPS)
// ═══════════════════════════════════════════════════════════════════════════════

function ShootingStars({ count = 25, isSupernova = false }) {
  const groupRef = useRef()
  const explosionsGroupRef = useRef()

  // Pre-crear estallidos, esferas de fuego y luces de impacto fijos con MATERIALES ÚNICOS
  const explosionPool = useMemo(() => {
    const pool = []

    for (let i = 0; i < 18; i++) {
      const pCount = 65
      const pos = new Float32Array(pCount * 3)
      const vel = new Float32Array(pCount * 3)

      for (let j = 0; j < pCount; j++) {
        pos[j * 3] = 0; pos[j * 3 + 1] = 0; pos[j * 3 + 2] = 0;
        const theta = Math.random() * Math.PI * 2
        const phi = (Math.random() - 0.5) * Math.PI
        const spd = Math.random() * 12.0 + 5.0
        vel[j * 3]     = Math.cos(theta) * Math.cos(phi) * spd
        vel[j * 3 + 1] = Math.sin(phi) * spd
        vel[j * 3 + 2] = Math.sin(theta) * Math.cos(phi) * spd
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

      const pointsMat = new THREE.PointsMaterial({
        size: 0.38,
        map: globalParticleTex,
        color: '#00E5FF',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      })

      const sphereGeo = new THREE.SphereGeometry(0.38, 16, 16)
      const sphereMat = new THREE.MeshBasicMaterial({
        color: '#00E5FF',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })

      const ringGeo = new THREE.RingGeometry(0.1, 0.55, 32)
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#00E5FF',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      })

      pool.push({
        active: false,
        life: 0,
        maxLife: 0.85,
        position: new THREE.Vector3(),
        colorHex: '#00E5FF',
        geo,
        pointsMat,
        sphereGeo,
        sphereMat,
        ringGeo,
        ringMat,
        velocities: vel
      })
    }
    return pool
  }, [])

  const triggerExplosion = (pos, hexColor) => {
    const exp = explosionPool.find(e => !e.active) || explosionPool[0]
    exp.active = true
    exp.life = 0
    exp.position.copy(pos)
    const activeColor = isSupernova ? '#00FFFF' : hexColor
    exp.colorHex = activeColor

    exp.pointsMat.color.set(activeColor)
    exp.sphereMat.color.set(activeColor)
    exp.ringMat.color.set(activeColor)

    exp.pointsMat.opacity = 1.0
    exp.sphereMat.opacity = 0.95
    exp.ringMat.opacity = 0.98

    const pArray = exp.geo.attributes.position.array
    for (let i = 0; i < pArray.length; i++) {
      pArray[i] = 0
    }
    exp.geo.attributes.position.needsUpdate = true
  }

  const _tempTarget = useMemo(() => ({
    pos: new THREE.Vector3(),
    color: '#FF4500',
    radius: 1.0
  }), [])
  const _dir = useMemo(() => new THREE.Vector3(), [])
  const _ray = useMemo(() => new THREE.Vector3(), [])

  const getLiveTarget = (targetType, clockTime) => {
    if (targetType === 'sun') {
      _tempTarget.pos.set(0, 0, 0)
      _tempTarget.color = isSupernova ? '#00E5FF' : '#FF4500'
      _tempTarget.radius = 1.75
    } else if (targetType === 'earth') {
      const angle = clockTime * 0.08 * 0.08 + 1.2
      _tempTarget.pos.set(Math.cos(angle) * 6.2, 0, Math.sin(angle) * 6.2)
      _tempTarget.color = '#38BDF8'
      _tempTarget.radius = 0.65
    } else if (targetType === 'mars') {
      const angle = clockTime * 0.053 * 0.08 + 2.5
      _tempTarget.pos.set(Math.cos(angle) * 8.2, 0, Math.sin(angle) * 8.2)
      _tempTarget.color = '#FF5500'
      _tempTarget.radius = 0.55
    } else if (targetType === 'jupiter') {
      const angle = clockTime * 0.043 * 0.08 + 0.5
      _tempTarget.pos.set(Math.cos(angle) * 12.0, 0, Math.sin(angle) * 12.0)
      _tempTarget.color = isSupernova ? '#00E5FF' : '#FFAA00'
      _tempTarget.radius = 1.15
    } else if (targetType === 'saturn') {
      const angle = clockTime * 0.034 * 0.08 + 4.1
      _tempTarget.pos.set(Math.cos(angle) * 16.2, 0, Math.sin(angle) * 16.2)
      _tempTarget.color = '#FFE090'
      _tempTarget.radius = 1.35
    } else {
      // Cinturón de Asteroides
      const angle = clockTime * 0.016 + 1.5
      _tempTarget.pos.set(Math.cos(angle) * 7.25, 0.05, Math.sin(angle) * 7.25)
      _tempTarget.color = isSupernova ? '#80E5FF' : '#FFCC00'
      _tempTarget.radius = 0.75
    }
    return _tempTarget
  }

  const initStar = (star, clockTime = 0) => {
    const types = ['sun', 'earth', 'mars', 'jupiter', 'saturn', 'belt']
    const targetType = types[Math.floor(Math.random() * types.length)]
    const target = getLiveTarget(targetType, clockTime)

    const theta = Math.random() * Math.PI * 2
    const phi = (Math.random() * 0.35 + 0.1) * Math.PI
    const travelDist = Math.random() * 8 + 16

    _ray.set(
      Math.cos(theta) * Math.cos(phi),
      Math.sin(phi),
      Math.sin(theta) * Math.cos(phi)
    ).normalize()

    star.position.copy(target.pos).addScaledVector(_ray, travelDist)
    star.userData.targetType = targetType
    star.userData.impactColor = isSupernova ? '#00FFFF' : target.color
    star.userData.hitRadius = target.radius
    star.userData.speed = (Math.random() * 14 + 22.0) * (isSupernova ? 1.6 : 1.0)
    star.userData.life = 0
    star.userData.maxLife = travelDist / star.userData.speed + 0.5
    star.userData.delay = Math.random() * (isSupernova ? 0.15 : 0.4)
    star.visible = false
  }

  useFrame((state, delta) => {
    const clockTime = state.clock.elapsedTime

    // 1. Animar Estrellas Fugaces con cero asignaciones de memoria
    if (groupRef.current) {
      const stars = groupRef.current.children
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        if (!star.userData.speed) {
          star.visible = false
          initStar(star, clockTime)
          continue
        }

        if (star.userData.delay > 0) {
          star.userData.delay -= delta
          continue
        }

        if (!star.visible) {
          star.visible = true
          initStar(star, clockTime)
          star.userData.life = 0
        }

        star.userData.life += delta
        if (star.userData.life > star.userData.maxLife) {
          initStar(star, clockTime)
          continue
        }

        const progress = star.userData.life / star.userData.maxLife
        const fadeIn = Math.min(progress * 6, 1)
        const fadeOut = Math.max(0, 1 - (progress - 0.7) / 0.3)
        star.material.opacity = fadeIn * fadeOut * 0.98

        // Obtener la posición viva del objetivo reutilizando vector
        const liveTarget = getLiveTarget(star.userData.targetType, clockTime)

        // Vector de dirección de persecución
        _dir.copy(liveTarget.pos).sub(star.position).normalize()
        const speed = star.userData.speed || 22.0
        star.position.addScaledVector(_dir, speed * delta)

        star.scale.set(1.8, 1.8, speed * 0.18)
        star.lookAt(liveTarget.pos)

        // Detección instantánea de impacto físico
        const currentDist = star.position.distanceTo(liveTarget.pos)
        if (currentDist <= liveTarget.radius + 0.3) {
          triggerExplosion(liveTarget.pos, liveTarget.color)
          initStar(star, clockTime)
        }
      }
    }

    // 2. Animar Explosiones en Tiempo Real
    if (explosionsGroupRef.current) {
      explosionPool.forEach((exp, idx) => {
        const groupMesh = explosionsGroupRef.current.children[idx]
        if (!groupMesh) return

        if (!exp.active) {
          groupMesh.visible = false
          return
        }

        groupMesh.visible = true
        groupMesh.position.copy(exp.position)
        exp.life += delta

        if (exp.life >= exp.maxLife) {
          exp.active = false
          groupMesh.visible = false
          return
        }

        const p = exp.life / exp.maxLife
        const alpha = Math.max(0, 1.0 - p)

        // Mover partículas
        const pArray = exp.geo.attributes.position.array
        const vArray = exp.velocities
        for (let i = 0; i < vArray.length / 3; i++) {
          pArray[i * 3]     += vArray[i * 3] * delta
          pArray[i * 3 + 1] += vArray[i * 3 + 1] * delta
          pArray[i * 3 + 2] += vArray[i * 3 + 2] * delta
        }
        exp.geo.attributes.position.needsUpdate = true
        exp.pointsMat.opacity = alpha * 0.98

        // Esfera de fuego expansiva
        const s1 = p * 5.0 + 0.3
        groupMesh.children[1].scale.set(s1, s1, s1)
        exp.sphereMat.opacity = alpha * 0.85

        // Anillo de choque expansivo
        const s2 = p * 6.5 + 0.3
        groupMesh.children[2].scale.set(s2, s2, s2)
        exp.ringMat.opacity = alpha * 0.95

        // Luz puntual de la explosión
        const light = groupMesh.children[3]
        if (light) {
          light.intensity = alpha * 300
        }
      })
    }
  })

  return (
    <>
      {/* Estrellas fugaces en vuelo */}
      <group ref={groupRef}>
        {Array.from({ length: count }).map((_, i) => (
          <mesh key={i}>
            <coneGeometry args={[0.045, 1.6, 8]} />
            <meshBasicMaterial
              color={i % 4 === 0 ? '#ff6600' : i % 4 === 1 ? '#ffd700' : i % 4 === 2 ? '#00e5ff' : '#ffffff'}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Pool NATIVO Three.js de 14 Explosiones con Materiales Únicos por Instancia */}
      <group ref={explosionsGroupRef}>
        {explosionPool.map((exp, i) => (
          <group key={i} visible={false}>
            {/* 1. Chispas de la explosión */}
            <points geometry={exp.geo} material={exp.pointsMat} />
            {/* 2. Esfera de fuego expansiva */}
            <mesh geometry={exp.sphereGeo} material={exp.sphereMat} />
            {/* 3. Anillo de onda de choque */}
            <mesh rotation={[Math.PI * 0.5, 0, 0]} geometry={exp.ringGeo} material={exp.ringMat} />
            {/* 4. Luz brillante de impacto */}
            <pointLight color={exp.colorHex} intensity={0} distance={25} decay={1.2} />
          </group>
        ))}
      </group>
    </>
  )
}



// ═══════════════════════════════════════════════════════════════════════════════
//  SHAPE GENERATOR PARA PARTÍCULAS (MÚSICA)
// ═══════════════════════════════════════════════════════════════════════════════

function getShapePositionsFromText(char, particleCount, scale, yOffset = 0) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 512, 512)

  ctx.font = '240px "Noto Music", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.lineWidth = 4
  ctx.strokeStyle = "white"
  ctx.strokeText(char, 256, 256 + yOffset)
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
  ctx.fillText(char, 256, 256 + yOffset)

  const imgData = ctx.getImageData(0, 0, 512, 512).data
  const validPixels = []

  for (let y = 0; y < 512; y += 2) {
    for (let x = 0; x < 512; x += 2) {
      if (imgData[(y * 512 + x) * 4] > 40) {
        validPixels.push({ x: (x - 256) / 256, y: -(y - 256) / 256 })
      }
    }
  }

  const positions = new Float32Array(particleCount * 3)
  if (validPixels.length === 0) return positions

  validPixels.sort(() => Math.random() - 0.5)

  for (let i = 0; i < particleCount; i++) {
    const pixel = validPixels[i % validPixels.length]
    const noise = (Math.random() * 0.02) + (Math.random() * Math.random() * 0.04)
    const angle = Math.random() * Math.PI * 2

    positions[i * 3] = (pixel.x + Math.cos(angle) * noise) * scale * 1.6
    positions[i * 3 + 1] = (pixel.y + Math.sin(angle) * noise) * scale * 1.6
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }

  return positions
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ESCENA PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function OrganicScene({ pathname }) {
  const scrollProgress = useScrollProgress()
  const targetPhase = getTargetPhase(pathname)
  const phaseRef = useRef(0)
  const { viewport } = useThree()
  const [fontLoaded, setFontLoaded] = useState(false)
  const [isHyperdrive, setIsHyperdrive] = useState(false)
  const [isSupernova, setIsSupernova] = useState(false)
  const [sunClickCount, setSunClickCount] = useState(0)
  const solarSystemRef = useRef()
  const galaxyRef = useRef()
  const solarOpacityRef = useRef(1)

  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true))
  }, [])

  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let konamiIndex = 0

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      const expectedKey = konamiSequence[konamiIndex].toLowerCase()

      if (key === expectedKey) {
        konamiIndex++
        if (konamiIndex === konamiSequence.length) {
          setIsHyperdrive(prev => !prev)
          triggerEasterEggToast('🚀 MODO HYPERDRIVE ACTIVADO', '¡Has ejecutado el Código Konami! Sistema Solar en hipervelocidad.', '🚀')
          konamiIndex = 0
        }
      } else {
        konamiIndex = 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.solarsystem = {
        help: () => {
          console.log('%c🌌 SISTEMA SOLAR 3D - COMANDOS SECRETOS:', 'color: #00E5FF; font-weight: bold; font-size: 14px;')
          console.log('🛸 solarsystem.ufo() -> Activar el OVNI alienígena')
          console.log('🚀 solarsystem.hyperdrive() -> Alternar Modo Hipervelocidad')
          console.log('☀️ solarsystem.supernova() -> Desatar Fusión Solar')
        },
        hyperdrive: () => {
          setIsHyperdrive(prev => !prev)
          triggerEasterEggToast('🚀 MODO HYPERDRIVE', 'Activado vía consola DevTools.', '🚀')
        },
        supernova: () => {
          setIsSupernova(prev => !prev)
          triggerEasterEggToast('☀️ FUSIÓN SUPERNOVA', 'Activado vía consola DevTools.', '☀️')
        },
        ufo: () => {
          triggerEasterEggToast('🛸 NAVE ALIENÍGENA DETECTADA', 'Un OVNI navega por el cinturón de asteroides.', '🛸')
        }
      }
    }
  }, [])

  const handleSunClick = () => {
    const nextCount = sunClickCount + 1
    setSunClickCount(nextCount)
    if (nextCount >= 5 && !isSupernova) {
      setIsSupernova(true)
      triggerEasterEggToast('☀️ FUSIÓN DE SUPERNOVA DESATADA', '¡Has hecho fusionar el núcleo del Sol haciendo clic 5 veces!', '☀️')
    }
  }

  const palette = useMemo(() => ({
    white: new THREE.Color("#ffffff"),
    darkBlue: new THREE.Color("#0a1525"),
    accentBlue: new THREE.Color("#1e4db7"),
    warmWhite: new THREE.Color("#f0f4ff")
  }), [])

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])

  const { geometry, shaderMaterial } = useMemo(() => {
    if (!fontLoaded) return { geometry: null, shaderMaterial: null }

    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const galaxyPositions = new Float32Array(particleCount * 3)
    const notePositions = new Float32Array(particleCount * 3)
    const fclefPositions = new Float32Array(particleCount * 3)
    const gclefPositions = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const rawNote = getShapePositionsFromText('\u{266B}', particleCount, 1.2, 0)
    const rawFclef = getShapePositionsFromText('\u{1D122}', particleCount, 1.3, -30)
    const rawGclef = getShapePositionsFromText('\u{1D11E}', particleCount, 1.8, 30)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const orbitLayer = i % 8
      const baseRadii = [2.8, 4.0, 5.5, 7.5, 12.0, 16.0, 20.0, 24.0]
      const baseRadius = baseRadii[orbitLayer] || 10
      const radius = baseRadius + (Math.random() - 0.5) * (orbitLayer > 3 ? 0.8 : 0.4)
      const theta = Math.random() * Math.PI * 2

      positions[i3] = Math.cos(theta) * radius
      positions[i3 + 1] = (Math.random() - 0.5) * 0.1
      positions[i3 + 2] = Math.sin(theta) * radius

      const gRadius = Math.random() * 15
      const gTheta = Math.random() * Math.PI * 2
      const gPhi = Math.acos((Math.random() * 2) - 1)
      galaxyPositions[i3] = gRadius * Math.sin(gPhi) * Math.cos(gTheta)
      galaxyPositions[i3 + 1] = gRadius * Math.sin(gPhi) * Math.sin(gTheta)
      galaxyPositions[i3 + 2] = gRadius * Math.cos(gPhi)

      notePositions[i3] = rawNote[i3] || 0
      notePositions[i3 + 1] = rawNote[i3 + 1] || 0
      notePositions[i3 + 2] = rawNote[i3 + 2] || 0

      fclefPositions[i3] = rawFclef[i3] || 0
      fclefPositions[i3 + 1] = rawFclef[i3 + 1] || 0
      fclefPositions[i3 + 2] = rawFclef[i3 + 2] || 0

      gclefPositions[i3] = rawGclef[i3] || 0
      gclefPositions[i3 + 1] = rawGclef[i3 + 1] || 0
      gclefPositions[i3 + 2] = rawGclef[i3 + 2] || 0

      const mix = Math.random()
      let color
      if (mix > 0.85) {
        color = palette.accentBlue
      } else if (mix > 0.6) {
        color = palette.warmWhite
      } else if (mix > 0.3) {
        color = palette.white
      } else {
        color = new THREE.Color("#8faadc")
      }
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      sizes[i] = Math.random() * 0.04 + 0.02
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('galaxyPos', new THREE.BufferAttribute(galaxyPositions, 3))
    geo.setAttribute('notePos', new THREE.BufferAttribute(notePositions, 3))
    geo.setAttribute('fclefPos', new THREE.BufferAttribute(fclefPositions, 3))
    geo.setAttribute('gclefPos', new THREE.BufferAttribute(gclefPositions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTexture: { value: particleTexture },
        uGalaxyMix: { value: 0 },
        uNotesMix: { value: 0 },
        uDustMix: { value: 0 },
        uMix1: { value: 0 },
        uMix2: { value: 0 },
        uTime: { value: 0 },
        uOffset: { value: 0 },
        uOpacity: { value: 0.8 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })

    return { geometry: geo, shaderMaterial: mat }
  }, [fontLoaded, palette, particleTexture])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    phaseRef.current = THREE.MathUtils.lerp(phaseRef.current, targetPhase, delta * 1.5)
    const phase = phaseRef.current

    const galaxyMix = THREE.MathUtils.clamp(phase, 0, 1)
    const notesMix = THREE.MathUtils.clamp(phase - 1, 0, 1)
    const dustMix = THREE.MathUtils.clamp(phase - 2, 0, 1)
    const mix1 = THREE.MathUtils.clamp((scrollProgress - 0.1) * 3, 0, 1)
    const mix2 = THREE.MathUtils.clamp((scrollProgress - 0.6) * 3, 0, 1)

    const offsetSize = viewport.width > 6 ? 2.5 : viewport.width * 0.35
    const currentOffset = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(-offsetSize * 0.2, offsetSize * 0.7, mix1),
      -offsetSize * 0.7,
      mix2
    )

    if (shaderMaterial) {
      shaderMaterial.uniforms.uGalaxyMix.value = galaxyMix
      shaderMaterial.uniforms.uNotesMix.value = notesMix
      shaderMaterial.uniforms.uDustMix.value = dustMix
      shaderMaterial.uniforms.uMix1.value = mix1
      shaderMaterial.uniforms.uMix2.value = mix2
      shaderMaterial.uniforms.uTime.value = t
      shaderMaterial.uniforms.uOffset.value = currentOffset
      shaderMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(0.8, 0.35, dustMix)
    }

    const solarOpacity = 1.0
    solarOpacityRef.current = 1.0

    if (solarSystemRef.current) {
      solarSystemRef.current.visible = true
    }
  })

  return (
    <>
      {/* Cámara controlada por props del Canvas padre */}

      {/* Fondo Panorámico de la Vía Láctea en 2K */}
      {loadedPlanetTextures.MilkyWay && (
        <mesh rotation={[0.2, 0.5, 0.1]}>
          <sphereGeometry args={[95, 48, 48]} />
          <meshBasicMaterial
            map={loadedPlanetTextures.MilkyWay}
            side={THREE.BackSide}
            transparent
            opacity={0.48}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Campo de estrellas */}
      <Stars
        radius={80}
        depth={60}
        count={isHyperdrive ? 15000 : 8000}
        factor={isHyperdrive ? 12 : 5}
        saturation={0}
        fade
        speed={isHyperdrive ? 4.5 : 0.3}
      />

      {/* Iluminación */}
      <ambientLight intensity={0.2} color="#1a1a3e" />
      <pointLight color="#ffddaa" intensity={60} distance={70} position={[0, 0, 0]} decay={1.4} />

      {/* Sistema Solar Trazado e Inclinado */}
      <group ref={solarSystemRef} visible={true}>
        <group rotation={[Math.PI * 0.26, -Math.PI * 0.08, Math.PI * 0.14]} position={[0.2, 0, 0]}>
          <Float speed={isHyperdrive ? 3.5 : 0.4} rotationIntensity={isHyperdrive ? 0.1 : 0.015} floatIntensity={isHyperdrive ? 0.2 : 0.03}>
            {/* Sol Interactivo con Fusión Supernova */}
            <Sun isHyperdrive={isHyperdrive} isSupernova={isSupernova} sunClickCount={sunClickCount} onSunClick={handleSunClick} />

            {PLANET_DATA.map((planet) => (
              <OrbitLine
                key={`orbit-${planet.name}`}
                radius={planet.distance}
                eccentricity={planet.eccentricity}
                inclination={planet.inclination}
              />
            ))}

            {PLANET_DATA.map((planet) => (
              <Planet key={planet.name} data={{ ...planet, orbitSpeed: planet.orbitSpeed * (isHyperdrive ? 5 : 1) }} isSupernova={isSupernova} />
            ))}

            <OrbitLine radius={7.25} eccentricity={0.05} inclination={0.02} opacity={isSupernova ? 0.22 : 0.08} />
            <AsteroidBelt innerRadius={6.6} outerRadius={8.2} count={5850} isSupernova={isSupernova} />

            {/* OVNI Secreto Alienígena Interactivo (Easter Egg #1) */}
            <SecretUFO />

            {/* Estrellas fugaces en vivo con impactos y colisiones reactivas */}
            <ShootingStars count={isHyperdrive ? 90 : (isSupernova ? 75 : 25)} isSupernova={isSupernova} />

            {/* Líneas de Órbita Guía de los Cometas */}
            <CometOrbitLine orbitRadius={13.5} inclination={0.35} color="#00E5FF" opacity={0.10} />
            <CometOrbitLine orbitRadius={17.5} inclination={-0.45} color="#FFB800" opacity={0.10} />

            {/* Cometas 3D Fotorrealistas en Órbitas Cósmicas Orgánicas */}
            <PhotorealisticComet orbitRadius={13.5} speed={isHyperdrive ? 0.45 : 0.09} color="#00E5FF" dustColor="#E0F7FF" inclination={0.35} initialAngle={0.8} />
            <PhotorealisticComet orbitRadius={17.5} speed={isHyperdrive ? 0.35 : 0.06} color="#FFB800" dustColor="#FFE090" inclination={-0.45} initialAngle={2.4} />
          </Float>
        </group>
      </group>

      {/* Partículas morphing */}
      {geometry && shaderMaterial && pathname !== '/contacto' && (
        <points ref={galaxyRef} geometry={geometry} material={shaderMaterial} />
      )}

      {/* Luces decorativas sutiles */}
      <pointLight color="#ffffff" intensity={0.8} distance={30} position={[15, 8, 10]} />
      <pointLight color="#1e4db7" intensity={1.5} distance={30} position={[-15, -8, -8]} />
    </>
  )
}