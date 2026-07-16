import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiGithub, FiLinkedin } from 'react-icons/fi'

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: [0.16, 1, 0.3, 1] }
})

export default function Home() {
  return (
    <section className="home-page">
      {/* ── Hero: texto anclado a la izquierda inferior, 3D llena el resto ── */}
      <div className="hero-layout">
        <motion.div className="hero-left" {...fadeIn(0.2)}>
          <h1 className="display-title">
            Gadiel<br />
            <span className="accent-stroke">Palma.</span>
          </h1>
          <p className="display-sub">
            Construyo interfaces que combinan<br />
            rendimiento, diseño y resultados reales.
          </p>
          <div className="hero-actions">
            <Link to="/proyectos" className="cta-btn">
              Ver Proyectos <FiArrowRight />
            </Link>
            <Link to="/sobre-mi" className="ghost-btn">
              Sobre mí
            </Link>
          </div>
        </motion.div>

        {/* Stats en esquina inferior derecha */}
        <motion.div className="hero-stats" {...fadeIn(0.6)}>
          {[
            { v: '2+', l: 'Años' },
            { v: '20+', l: 'Proyectos' },
            { v: '12+', l: 'Stacks' },
          ].map(s => (
            <div key={s.l} className="stat-item">
              <span className="stat-item__v">{s.v}</span>
              <span className="stat-item__l">{s.l}</span>
            </div>
          ))}
        </motion.div>

        {/* Línea social en esquina izquierda inferior */}
        <motion.div className="hero-socials" {...fadeIn(0.8)}>
          <a href="https://github.com/Gad07" target="_blank" rel="noreferrer" aria-label="GitHub">
            <FiGithub size={20} />
          </a>
          <a href="https://www.linkedin.com/in/gadiel-palma-ramos-08375817b/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FiLinkedin size={20} />
          </a>
          <span className="hero-socials__line" />
          <span className="hero-socials__label">gadpalma7@gmail.com</span>
        </motion.div>
      </div>
    </section >
  )
}
