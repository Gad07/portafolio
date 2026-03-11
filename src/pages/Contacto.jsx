import { useState } from 'react'

export default function Contacto() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const phone = '527223659263'
    const text = encodeURIComponent(
      [
        'Hola Gadiel, te contacto desde tu portafolio.',
        '',
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        `Mensaje: ${mensaje}`,
      ].join('\n')
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="section contact-page">
      <div className="contact-hero card">
        <p className="hero__kicker">Disponible para colaborar</p>
        <h2 className="section__title">Contáctame</h2>
        <p className="lead">
          ¿Tienes un proyecto, una vacante o una idea que quieras aterrizar? Escríbeme y te respondo lo antes posible.
        </p>
        <div className="contact-quicklinks" aria-label="Canales de contacto rápido">
          <a className="contact-link-card" href="mailto:gadpalma7@gmail.com">
            <span className="contact-link-card__label">Email</span>
            <span className="contact-link-card__value">gadpalma7@gmail.com</span>
          </a>
          <a className="contact-link-card" href="tel:+527223659263">
            <span className="contact-link-card__label">Teléfono</span>
            <span className="contact-link-card__value">(722) 365 9263</span>
          </a>
          <a
            className="contact-link-card"
            href="https://www.linkedin.com/in/gadiel-palma-ramos-08375817b/"
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-link-card__label">LinkedIn</span>
            <span className="contact-link-card__value">Ver perfil profesional</span>
          </a>
        </div>
      </div>

      <div className="contact-layout">
        <form className="form contact-form card" onSubmit={handleSubmit}>
          <h3>Envíame un mensaje</h3>
          <p className="muted">Cuéntame el objetivo, alcance y tiempos estimados.</p>

          <div className="form__row">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="form__row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form__row">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              rows={7}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Describe tu proyecto, necesidad o propuesta"
              required
            />
          </div>

          <div className="form__actions">
            <button type="submit" className="btn btn--accent">Enviar mensaje</button>
            <a className="btn btn--ghost" href="mailto:gadpalma7@gmail.com">Abrir correo</a>
          </div>
        </form>

        <aside className="contact-side card">
          <h3>¿Qué puedo ayudarte a construir?</h3>
          <ul>
            <li>Sitios y landing pages orientadas a conversión.</li>
            <li>Plataformas web con frontend + backend.</li>
            <li>Automatización de procesos internos.</li>
            <li>Optimización y mantenimiento de sistemas existentes.</li>
          </ul>
          <p className="muted">Horario de atención estimado: Lun-Vie, 9:00 a 18:00 (CDMX).</p>
        </aside>
      </div>
    </section>
  )
}
