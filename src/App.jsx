import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import SobreMi from './pages/SobreMi.jsx'
import Proyectos from './pages/Proyectos.jsx'
import Contacto from './pages/Contacto.jsx'
import Footer from './components/Footer.jsx'
import ParticlesBg from './components/ParticlesBg.jsx'

function Nav() {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <NavLink to="/" className="brand" aria-label="Inicio" style={{ fontSize: '34px' }}>
          <span>[G]</span>
        </NavLink>
        <nav className="nav__links" aria-label="Navegación principal">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Inicio</NavLink>
          <NavLink to="/sobre-mi" className={({isActive}) => isActive ? 'active' : ''}>Sobre mí</NavLink>
          <NavLink to="/proyectos" className={({isActive}) => isActive ? 'active' : ''}>Proyectos</NavLink>
          <NavLink to="/contacto" className={({isActive}) => isActive ? 'active' : ''}>Contáctame</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="app">
      <ParticlesBg />
      <Nav />
      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre-mi" element={<SobreMi />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
