import { useEffect, useRef } from 'react'

export default function ParticlesBg() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true }) // alpha para performance

    const state = {
      particles: [],
      mouse: { x: -9999, y: -9999, vx: 0, vy: 0 }, // velocidad del mouse para inercia
      w: 0,
      h: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    }

    const opts = {
      count: 100,           // ↑ más partículas
      speed: 0.3,
      maxLinkDist: 140,     // ↑ distancia de conexión
      radius: [1, 2.5],
      lineColor: 'rgba(200,200,200,0.08)', // base, se calculará por alpha
      dotColor: 'rgba(220,220,220,0.22)',
      mouseRadius: 100,
      mouseEase: 0.15,      // ← NUEVO: suavizado del mouse
      connectionOpacity: 0.15, // ← NUEVO: opacidad máxima de líneas
    }

    const rand = (min, max) => Math.random() * (max - min) + min

    // ─── POOL de objetos para evitar GC ───
    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = rand(0, state.w)
        this.y = rand(0, state.h)
        this.vx = rand(-opts.speed, opts.speed)
        this.vy = rand(-opts.speed, opts.speed)
        this.r = rand(opts.radius[0], opts.radius[1])
        this.baseVx = this.vx
        this.baseVy = this.vy
      }
      update() {
        // Movimiento base
        this.x += this.vx
        this.y += this.vy

        // Wrap suave
        const margin = 20
        if (this.x < -margin) this.x = state.w + margin
        if (this.x > state.w + margin) this.x = -margin
        if (this.y < -margin) this.y = state.h + margin
        if (this.y > state.h + margin) this.y = -margin

        // Repulsión del mouse con easing
        const dx = this.x - state.mouse.x
        const dy = this.y - state.mouse.y
        const d2 = dx * dx + dy * dy
        const r2 = opts.mouseRadius * opts.mouseRadius

        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1
          const force = (1 - d / opts.mouseRadius) * 2 // fuerza proporcional
          const ux = dx / d
          const uy = dy / d
          
          // Aplicar fuerza gradualmente (easing)
          this.vx += (ux * force - this.vx + this.baseVx) * 0.1
          this.vy += (uy * force - this.vy + this.baseVy) * 0.1
        } else {
          // Regresar a velocidad base suavemente
          this.vx += (this.baseVx - this.vx) * 0.02
          this.vy += (this.baseVy - this.vy) * 0.02
        }
      }
    }

    function resize() {
      state.w = window.innerWidth
      state.h = window.innerHeight
      canvas.width = Math.floor(state.w * state.dpr)
      canvas.height = Math.floor(state.h * state.dpr)
      canvas.style.width = state.w + 'px'
      canvas.style.height = state.h + 'px'
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
    }

    function initParticles() {
      state.particles = Array.from({ length: opts.count }, () => new Particle())
    }

    // ─── DIBUJO OPTIMIZADO ───
    function draw() {
      // Fade trail en lugar de clear completo (efecto "cola")
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)' // color de fondo con alpha
      ctx.fillRect(0, 0, state.w, state.h)

      const particles = state.particles
      const len = particles.length

      // Líneas: solo verificar j > i (triángulo superior)
      for (let i = 0; i < len; i++) {
        const p = particles[i]
        
        for (let j = i + 1; j < len; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d = dx * dx + dy * dy // sin sqrt, comparar con d2
          const maxD2 = opts.maxLinkDist * opts.maxLinkDist

          if (d < maxD2) {
            const dist = Math.sqrt(d)
            const alpha = (1 - dist / opts.maxLinkDist) * opts.connectionOpacity
            ctx.strokeStyle = `rgba(200, 200, 220, ${alpha.toFixed(3)})`
            ctx.lineWidth = alpha * 1.5
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }

        // Dibujar partícula
        ctx.fillStyle = opts.dotColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        
        // Brillo sutil
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function loop() {
      // Actualizar todas las partículas
      for (const p of state.particles) p.update()
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }

    // ─── MOUSE CON EASING ───
    let targetMouse = { x: -9999, y: -9999 }
    
    function onMouseMove(e) {
      targetMouse.x = e.clientX
      targetMouse.y = e.clientY
    }
    
    function onMouseLeave() {
      targetMouse.x = -9999
      targetMouse.y = -9999
    }

    // Suavizar posición del mouse en cada frame
    function updateMouse() {
      state.mouse.x += (targetMouse.x - state.mouse.x) * opts.mouseEase
      state.mouse.y += (targetMouse.y - state.mouse.y) * opts.mouseEase
    }

    // Reemplazar loop para incluir updateMouse
    function gameLoop() {
      updateMouse()
      for (const p of state.particles) p.update()
      draw()
      rafRef.current = requestAnimationFrame(gameLoop)
    }

    resize()
    initParticles()
    gameLoop()

    const onResize = () => {
      resize()
      initParticles()
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}