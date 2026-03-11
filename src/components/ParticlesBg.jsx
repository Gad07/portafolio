import { useEffect, useRef } from 'react'

export default function ParticlesBg() {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const state = {
      particles: [],
      mouse: { x: -9999, y: -9999 },
      w: 0,
      h: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    }

    const opts = {
      count: 80,
      speed: 0.25,
      maxLinkDist: 120,
      radius: [1, 2.2],
      lineColor: 'rgba(200,200,200,0.08)',
      dotColor: 'rgba(220,220,220,0.22)',
      mouseRadius: 90,
    }

    const rand = (min, max) => Math.random() * (max - min) + min

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
      state.particles = Array.from({ length: opts.count }, () => ({
        x: rand(0, state.w),
        y: rand(0, state.h),
        vx: rand(-opts.speed, opts.speed),
        vy: rand(-opts.speed, opts.speed),
        r: rand(opts.radius[0], opts.radius[1]),
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, state.w, state.h)

      // lines
      for (let i = 0; i < state.particles.length; i++) {
        const p = state.particles[i]
        for (let j = i + 1; j < state.particles.length; j++) {
          const q = state.particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const d = Math.hypot(dx, dy)
          if (d < opts.maxLinkDist) {
            const alpha = 1 - d / opts.maxLinkDist
            ctx.strokeStyle = opts.lineColor.replace(/0\.08|0\.1|0\.2/, (m) => String(Math.min(0.2, Math.max(0.06, alpha * 0.2))))
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
      }

      // dots
      for (const p of state.particles) {
        ctx.fillStyle = opts.dotColor
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function update() {
      const mx = state.mouse.x
      const my = state.mouse.y
      for (const p of state.particles) {
        // simple motion
        p.x += p.vx
        p.y += p.vy

        // gentle wrap
        if (p.x < -10) p.x = state.w + 10
        if (p.x > state.w + 10) p.x = -10
        if (p.y < -10) p.y = state.h + 10
        if (p.y > state.h + 10) p.y = -10

        // mouse repulsion
        const dx = p.x - mx
        const dy = p.y - my
        const d2 = dx * dx + dy * dy
        if (d2 < opts.mouseRadius * opts.mouseRadius) {
          const d = Math.sqrt(d2) || 1
          const ux = dx / d
          const uy = dy / d
          p.x += ux * 1.5
          p.y += uy * 1.5
        }
      }
    }

    function loop() {
      update()
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }

    function onMouseMove(e) {
      state.mouse.x = e.clientX
      state.mouse.y = e.clientY
    }
    function onMouseLeave() {
      state.mouse.x = -9999
      state.mouse.y = -9999
    }

    resize()
    initParticles()
    loop()

    window.addEventListener('resize', () => {
      resize()
      // keep density across sizes
      if (state.particles.length !== opts.count) initParticles()
    })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <div className="bg-particles" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}

