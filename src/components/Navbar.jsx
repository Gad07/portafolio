import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiFolder,
  FiDollarSign,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiArrowRight
} from 'react-icons/fi'
import SceneSwitch from './SceneSwitch.jsx'

const navItems = [
  { to: '/', label: 'Inicio', end: true, icon: <FiHome /> },
  { to: '/sobre-mi', label: 'Sobre mí', icon: <FiUser /> },
  { to: '/proyectos', label: 'Proyectos', icon: <FiFolder /> },
  { to: '/costos', label: 'Costos', icon: <FiDollarSign /> },
  { to: '/contacto', label: 'Contáctame', icon: <FiMail /> },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Prevenir scroll en body al abrir drawer en móvil
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

  return (
    <>
      <header className="nav">
        <div className="nav__inner">
          {/* Brand Monogram & Full Name */}
          <NavLink to="/" className="brand" aria-label="Gadiel Palma - Inicio">
            <span className="brand__badge">[G]</span>
            <span className="brand__name">Gadiel Palma</span>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="nav__links desktop-nav" aria-label="Navegación principal">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span>{label}</span>
              </NavLink>
            ))}

            <SceneSwitch />
          </nav>

          {/* Mobile Right Controls: SceneSwitch & Hamburguesa */}
          <div className="mobile-nav-controls">
            <SceneSwitch />
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-menu-backdrop" onClick={() => setMobileOpen(false)} />

            <div className="mobile-menu-drawer">
              {/* Header */}
              <div className="mobile-menu-header">
                <div className="mobile-brand">
                  <span className="brand__badge">[G]</span>
                  <div className="mobile-brand-info">
                    <span className="mobile-brand-title">Gadiel Palma</span>
                    <span className="mobile-brand-sub">Software Engineer</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mobile-close-btn"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mobile-menu-links">
                {navItems.map(({ to, label, end, icon }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <NavLink
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `mobile-nav-item ${isActive ? 'active' : ''}`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="mobile-nav-icon">{icon}</span>
                      <span className="mobile-nav-label">{label}</span>
                      <FiArrowRight className="mobile-nav-arrow" />
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* Footer */}
              <div className="mobile-menu-footer">
                <span className="mobile-footer-text">gadpalma7@gmail.com</span>
                <div className="mobile-socials">
                  <a
                    href="https://github.com/Gad07"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                  >
                    <FiGithub size={20} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/gadiel-palma-ramos-08375817b/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                  >
                    <FiLinkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
