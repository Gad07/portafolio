import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home.jsx'
import SobreMi from './pages/SobreMi.jsx'
import Proyectos from './pages/Proyectos.jsx'
import Contacto from './pages/Contacto.jsx'
import Footer from './components/Footer.jsx'
import GlobalCanvas from './components/canvas/GlobalCanvas.jsx'
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
        </nav>
      </div>
    </header >
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
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
    </div>
  )
}

