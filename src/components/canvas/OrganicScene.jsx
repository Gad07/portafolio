import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DEL SISTEMA SOLAR
// ═══════════════════════════════════════════════════════════════════════════════

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
    name: 'Saturn', radius: 0.65, distance: 16.2,
    orbitSpeed: 0.034, rotationSpeed: 2.2,
    eccentricity: 0.056, inclination: 0.04,
    type: 'gas', color: '#F4D03F',
    hasAtmosphere: false, hasRing: true,
    ringColor: '#D4C090', ringInner: 1.3, ringOuter: 2.5,
    moons: [
      { name: 'Titan', radius: 0.08, distance: 1.8, speed: 2.0, color: '#D4A020' },
      { name: 'Enceladus', radius: 0.045, distance: 1.1, speed: 6.0, color: '#F0F0F0' }
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
            // Saturno: mantequilla dorada y mantequilla de maní
            r = 230 + Math.floor(n * 20)
            g = 200 + Math.floor(n * 25)
            b = 130 + Math.floor(n * 30)
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

  void main() {
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

  uniform float uTime;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for(int i = 0; i < 4; i++) {
      value += amp * snoise(p);
      p *= 2.05;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 p = vPosition * 1.5 + vec3(uTime * 0.08, uTime * 0.12, uTime * 0.06);
    float n1 = fbm(p);
    float n2 = fbm(p * 2.5 + vec3(uTime * 0.15));
    float granulation = snoise(vPosition * 12.0 + vec3(uTime * 0.2)) * 0.12;
    
    float noiseVal = n1 * 0.55 + n2 * 0.3 + granulation;

    // Radiant Sun Color Palette
    vec3 darkGranule  = vec3(0.88, 0.25, 0.03);
    vec3 brightPlasma = vec3(1.0,  0.58, 0.02);
    vec3 solarGold    = vec3(1.0,  0.85, 0.15);
    vec3 coreWhite    = vec3(1.0,  0.98, 0.85);

    vec3 col = mix(darkGranule, brightPlasma, smoothstep(-0.4, 0.0, noiseVal));
    col = mix(col, solarGold, smoothstep(-0.1, 0.3, noiseVal));
    col = mix(col, coreWhite, smoothstep(0.2, 0.6, noiseVal));

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float NdotV = max(0.0, dot(normal, viewDir));
    
    // Intense golden rim glow
    float fresnel = pow(1.0 - NdotV, 2.0);
    col += vec3(1.0, 0.8, 0.4) * fresnel * 2.5;
    
    // Core center heat boost
    col += vec3(0.4, 0.25, 0.1) * pow(NdotV, 1.5);

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
  uniform float uPower;
  uniform float uOpacity;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float vDot = max(0.0, dot(normal, viewDir));
    
    float fresnel = pow(1.0 - vDot, uPower);
    float edgeFade = smoothstep(0.0, 0.35, vDot);
    
    gl_FragColor = vec4(uColor, fresnel * edgeFade * uOpacity);
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
  uniform float uOpacity;

  void main() {
    float dist = length(vUv - vec2(0.5)) * 2.0;
    if (dist > 1.0) discard;
    float glow = pow(1.0 - dist, 2.5);
    gl_FragColor = vec4(uColor, glow * uOpacity);
  }
`

function Sun() {
  const sunMeshRef = useRef()
  const matRef = useRef()

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      }
    })
  }, [])

  const coronaInnerMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#FFCA55') },
        uPower: { value: 2.0 },
        uOpacity: { value: 0.9 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [])

  const coronaOuterMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#FF4400') },
        uPower: { value: 1.5 },
        uOpacity: { value: 0.6 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    })
  }, [])

  const haloMat1 = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#FF9900') },
        uOpacity: { value: 0.6 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [])

  const haloMat2 = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#FF3300') },
        uOpacity: { value: 0.3 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t
    }
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += delta * 0.05
    }
  })

  const sunRadius = 1.35

  return (
    <group>
      {/* Luz intensa y cálida del sol */}
      <pointLight color="#FFF5E0" intensity={140} distance={100} decay={1.3} />
      <pointLight color="#FF7700" intensity={70} distance={70} decay={1.6} />

      {/* Núcleo del sol con plasma hirviendo */}
      <mesh ref={sunMeshRef}>
        <sphereGeometry args={[sunRadius, 64, 64]} />
        <primitive object={sunMaterial} ref={matRef} attach="material" />
      </mesh>

      {/* Glow de la atmósfera interna (sin bordes duros) */}
      <mesh scale={1.22}>
        <sphereGeometry args={[sunRadius, 32, 32]} />
        <primitive object={coronaInnerMat} attach="material" />
      </mesh>

      {/* Glow de la atmósfera externa (sin bordes duros) */}
      <mesh scale={1.55}>
        <sphereGeometry args={[sunRadius, 32, 32]} />
        <primitive object={coronaOuterMat} attach="material" />
      </mesh>

      {/* Halo plano continuo radial (Volumetric Flare Aura) */}
      <mesh scale={sunRadius * 2.8}>
        <planeGeometry args={[1, 1]} />
        <primitive object={haloMat1} attach="material" />
      </mesh>

    </group>
  )
}

function Atmosphere({ radius, color, opacity = 0.3 }) {
  return (
    <mesh scale={1.12}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function PlanetRings({ innerRadius, outerRadius, color, opacity = 0.7 }) {
  const ringTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    for (let i = 0; i < 512; i++) {
      const t = i / 512
      const alpha = Math.sin(t * Math.PI) * 0.8
      const gap = Math.sin(t * 40) * 0.3 + 0.7
      ctx.fillStyle = `rgba(200, 190, 170, ${alpha * gap})`
      ctx.fillRect(i, 0, 1, 64)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    return tex
  }, [])

  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]}>
      <ringGeometry args={[innerRadius, outerRadius, 128]} />
      <meshStandardMaterial
        map={ringTexture}
        color={color}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

function Moon({ radius, distance, speed, color = '#C0C0C0' }) {
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
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
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
      pos[i * 3]     = Math.cos(ang[i]) * rad[i]
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
      posAttr.array[i * 3]     = Math.cos(angles[i]) * radii[i]
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
  const matRef   = useRef()

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
      matRef.current.uniforms.uTime.value    = t
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



function Planet({ data }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const orbitAngle = useRef(Math.random() * Math.PI * 2)

  const { radius, distance, orbitSpeed, rotationSpeed, eccentricity, inclination, type, color, hasAtmosphere, atmosphereColor, hasRing, ringColor, ringInner, ringOuter, hasClouds, moons } = data

  const textures = useMemo(() => {
    const tex = {}
    const texType = type === 'earth' ? 'earth' : type === 'mars' ? 'mars' : type === 'gas' ? 'gas' : type === 'ice' ? 'ice' : type === 'mercury' ? 'mercury' : type === 'venus' ? 'venus' : 'moon'
    tex.surface = generateTexture(texType, type === 'gas' ? (data.name === 'Jupiter' ? 1 : 2) : 0)
    if (hasClouds) tex.clouds = generateTexture('earth_clouds', 0)
    return tex
  }, [type, hasClouds, data.name])

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return

    orbitAngle.current += delta * orbitSpeed * 0.08
    const a = distance
    const e = eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(orbitAngle.current))

    groupRef.current.position.x = Math.cos(orbitAngle.current) * r
    groupRef.current.position.z = Math.sin(orbitAngle.current) * r
    groupRef.current.position.y = Math.sin(orbitAngle.current) * Math.sin(inclination) * r * 0.2

    meshRef.current.rotation.y += delta * rotationSpeed
  })

  return (
    <group ref={groupRef}>
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial
            map={textures.surface}
            roughness={type === 'gas' ? 0.6 : 0.85}
            metalness={type === 'gas' ? 0.1 : 0.05}
          />
        </mesh>

        {hasClouds && (
          <mesh scale={1.02}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
              map={textures.clouds}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
        )}

        {hasAtmosphere && <Atmosphere radius={radius} color={atmosphereColor} opacity={0.2} />}

        {hasRing && (
          <PlanetRings
            innerRadius={radius * (ringInner || 0.6)}
            outerRadius={radius * (ringOuter || 1.3)}
            color={ringColor || '#C0B090'}
          />
        )}
      </group>

      {moons.map((moon) => (
        <Moon key={moon.name} {...moon} />
      ))}
    </group>
  )
}

function AsteroidBelt({ innerRadius = 7.5, outerRadius = 9.0, count = 200 }) {
  const pointsRef = useRef()

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      const spread = (Math.random() - 0.5) * 0.2

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = spread
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [innerRadius, outerRadius, count])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.015} color="#887766" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function OrbitLine({ radius, eccentricity = 0, inclination = 0, opacity = 0.22 }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
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
      <lineBasicMaterial color="#5599ff" transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </line>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ESTRELLAS FUGACES (SHOOTING STARS)
// ═══════════════════════════════════════════════════════════════════════════════

function ShootingStars({ count = 3 }) {
  const groupRef = useRef()
  const starsRef = useRef([])

  const initStar = (star) => {
    star.position.set(
      (Math.random() - 0.5) * 80,
      Math.random() * 30 + 10,
      (Math.random() - 0.5) * 40 - 20
    )
    star.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.3) * 15,
      -Math.random() * 10 - 5,
      (Math.random() - 0.5) * 5
    )
    star.userData.life = 0
    star.userData.maxLife = Math.random() * 1.5 + 0.5
    star.userData.delay = Math.random() * 5
    star.visible = false
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((star) => {
      if (!star.userData.velocity) {
        star.visible = false
        initStar(star)
        return
      }

      if (star.userData.delay > 0) {
        star.userData.delay -= delta
        return
      }

      if (!star.visible) {
        star.visible = true
        initStar(star)
        star.userData.life = 0
      }

      star.userData.life += delta

      if (star.userData.life > star.userData.maxLife) {
        initStar(star)
        return
      }

      const progress = star.userData.life / star.userData.maxLife
      const fadeIn = Math.min(progress * 5, 1)
      const fadeOut = Math.max(0, 1 - (progress - 0.7) / 0.3)
      star.material.opacity = fadeIn * fadeOut

      star.position.add(star.userData.velocity.clone().multiplyScalar(delta))

      // Cola de la estrella fugaz
      const tailLength = star.userData.velocity.length() * 0.15
      star.scale.set(1, 1, tailLength)
      star.lookAt(star.position.clone().add(star.userData.velocity))
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i}>
          <coneGeometry args={[0.008, 0.4, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NEBULOSA DE FONDO
// ═══════════════════════════════════════════════════════════════════════════════

function Nebula() {
  const meshRef = useRef()

  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    grad.addColorStop(0, 'rgba(20, 30, 60, 0.15)')
    grad.addColorStop(0.3, 'rgba(15, 25, 50, 0.1)')
    grad.addColorStop(0.6, 'rgba(10, 15, 35, 0.05)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 512)

    // Nubes de gas
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const r = Math.random() * 100 + 50
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${30 + Math.random() * 40}, ${40 + Math.random() * 60}, ${80 + Math.random() * 100}, ${Math.random() * 0.08})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 512, 512)
    }

    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.005
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -50]} scale={[3, 3, 1]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial map={nebulaTexture} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
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

  useEffect(() => {
    document.fonts.ready.then(() => setFontLoaded(true))
  }, [])

  const solarSystemRef = useRef()
  const galaxyRef = useRef()
  const solarOpacityRef = useRef(1)

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

    const solarOpacity = Math.max(0, 1 - phase * 1.2)
    solarOpacityRef.current = solarOpacity

    const tonOpacity = THREE.MathUtils.clamp((phase - 2.0) * 1.0, 0, 1)
    solarOpacityRef.current = solarOpacity

    if (solarSystemRef.current) {
      solarSystemRef.current.traverse((child) => {
        if (!child.isMesh || !child.material) return
        if (child.material.isShaderMaterial) return
        if (child.material.transparent && child.userData && child.userData.baseOpacity !== undefined) {
          child.material.opacity = solarOpacity * child.userData.baseOpacity
        }
      })

      solarSystemRef.current.traverse((child) => {
        if (child.isPoints && child.material && child.material.opacity !== undefined) {
          child.material.opacity = solarOpacity * 0.5
        }
      })

      solarSystemRef.current.visible = solarOpacity > 0.01
    }
  })

  const tonOpacity = THREE.MathUtils.clamp((phaseRef.current - 2.0) * 1.0, 0, 1)

  return (
    <>
      {/* Cámara controlada por props del Canvas padre */}

      {/* Nebulosa de fondo */}
      <Nebula />

      {/* Campo de estrellas */}
      <Stars
        radius={80}
        depth={60}
        count={8000}
        factor={5}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Estrellas fugaces */}
      <ShootingStars count={4} />

      {/* Iluminación */}
      <ambientLight intensity={0.1} color="#1a1a3e" />
      <pointLight color="#ffddaa" intensity={40} distance={60} position={[0, 0, 0]} decay={1.5} />

      {/* Agujero Negro Supermasivo TON 618 (Desactivado temporalmente) */}
      {/* <Ton618 opacity={0} /> */}

      {/* Sistema Solar Trazado e Inclinado */}
      <group ref={solarSystemRef} visible={solarOpacityRef.current > 0.01}>
        <group rotation={[Math.PI * 0.26, -Math.PI * 0.08, Math.PI * 0.14]} position={[0.2, 0, 0]}>
          <Float speed={0.4} rotationIntensity={0.015} floatIntensity={0.03}>
            <Sun />

            {PLANET_DATA.map((planet) => (
              <OrbitLine
                key={`orbit-${planet.name}`}
                radius={planet.distance}
                eccentricity={planet.eccentricity}
                inclination={planet.inclination}
              />
            ))}

            {PLANET_DATA.map((planet) => (
              <Planet key={planet.name} data={planet} />
            ))}

            <AsteroidBelt innerRadius={9.5} outerRadius={11.0} count={250} />
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