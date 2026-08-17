import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home.jsx'
import SobreMi from './pages/SobreMi.jsx'
import Proyectos from './pages/Proyectos.jsx'
import Contacto from './pages/Contacto.jsx'
import Footer from './components/Footer.jsx'
import GlobalCanvas from './components/canvas/GlobalCanvas.jsx'
import SceneSwitch from './components/SceneSwitch.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
const navItems = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/sobre-mi', label: 'Sobre mí' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/contacto', label: 'Contáctame' },
]

function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="brand" aria-label="Inicio">
          <span style={{ fontSize: '1.2rem' }}>[G]</span>
        </NavLink>
        <nav className="nav__links" aria-label="Navegación principal">
          {navItems.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          ))}
          <SceneSwitch />
        </nav>
      </div>
    </header>
  )
}

function EasterEggToast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail)
      const timer = setTimeout(() => setToast(null), 4500)
      return () => clearTimeout(timer)
    }
    window.addEventListener('portfolio-easter-egg', handleToast)
    return () => window.removeEventListener('portfolio-easter-egg', handleToast)
  }, [])

  if (!toast) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        style={{
          position: 'fixed',
          bottom: '2.5rem',
          right: '2.5rem',
          zIndex: 99999,
          background: 'rgba(10, 20, 40, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 229, 255, 0.45)',
          borderRadius: '16px',
          padding: '1.1rem 1.5rem',
          boxShadow: '0 12px 35px rgba(0, 229, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#fff',
          maxWidth: '380px'
        }}
      >
        <span style={{ fontSize: '2.2rem' }}>{toast.icon || '🛸'}</span>
        <div>
          <h4 style={{ margin: 0, color: 'var(--accent, #00E5FF)', fontSize: '0.95rem', fontWeight: '700' }}>{toast.title}</h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.83rem', color: 'rgba(255, 255, 255, 0.88)', lineHeight: '1.3' }}>{toast.message}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const location = useLocation()
  return (
    <div className="app">
      {/* 3D Global Canvas background */}
      <GlobalCanvas />

      {/* HTML Overlay Content */}
      <Nav />
      <main className="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre-mi" element={<SobreMi />} />
              <Route path="/proyectos" element={<Proyectos />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Home />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Easter Egg Toast Notification System */}
      <EasterEggToast />
    </div>
  )
}

