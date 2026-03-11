import { Link } from 'react-router-dom'
import { GITHUB_USERNAME } from '../shared/config.js'

export default function Home() {
  return (
    <section className="section">
      <div className="hero">
        <div className="hero__kicker">Desarrollador Full-Stack & Ingeniero en Software</div>
        <h1 className="hero__title">Hola, soy <span className="focus">Gadiel Palma Ramos</span></h1>
        <p className="hero__subtitle">Como Ingeniero en Software graduado de la Universidad Autónoma del Estado de México, actualmente contribuyo como Desarrollador Jr en Link Education - LET, donde colaboro en el desarrollo de soluciones técnicas que optimizan procesos clave en la educación. Mi trabajo se centra en la implementación de tecnologías como PHP y Python, además de brindar soporte técnico especializado.</p>
      </div>
      <div className="hero__actions">
        <Link to="/proyectos" className="btn">Ver proyectos</Link>
        <Link to="/contacto" className="btn btn--ghost">Contáctame</Link>
      </div>
    </section>
  )
}

