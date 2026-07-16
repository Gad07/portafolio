import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiLinkedin, FiArrowRight, FiSend } from 'react-icons/fi'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
})

const channels = [
  { label: 'Email', value: 'gadpalma7@gmail.com', href: 'mailto:gadpalma7@gmail.com', icon: <FiMail size={22} />, glow: '#1e4db7' },
  { label: 'Teléfono', value: '(722) 365-9263', href: 'tel:+527223659263', icon: <FiPhone size={22} />, glow: '#1e4db7' },
  { label: 'LinkedIn', value: 'Gadiel Palma', href: 'https://www.linkedin.com/in/gadiel-palma-ramos-08375817b/', icon: <FiLinkedin size={22} />, glow: '#0077b5' },
]

const services = [
  'Landing pages y sitios corporativos',
  'Plataformas web full-stack',
  'Automatización de procesos internos',
  'ERPs y dashboards a medida',
  'Consultoría técnica de software',
]

export default function Contacto() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const phone = '527223659263'
    const text = encodeURIComponent(
      ['Hola Gadiel, te contacto desde tu portafolio.', '',
        `Nombre: ${nombre}`, `Email: ${email}`, `Mensaje: ${mensaje}`].join('\n')
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <div className="contact-page">
      {/* ── Hero: texto a la izquierda, 3D de polvo/espacio detrás ── */}
      <div className="contact-hero">

        <motion.div {...fadeUp(0.1)}>
          <h1 className="display-title" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}>
            Disponible <br />
            <span className="accent-stroke">para colaborar.</span>
          </h1>
          <p className="display-sub" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            ¿Tienes un proyecto, vacante o idea?<br />
            Escríbeme y te respondo rápido.
          </p>
        </motion.div>

        {/* Canales de contacto como tarjetas grandes */}
        <motion.div className="channels-grid" {...fadeUp(0.3)}>
          {channels.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="channel-big glass-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              whileHover={{ x: 6, boxShadow: `0 0 40px ${c.glow}40` }}
            >
              <div className="channel-big__icon" style={{ color: c.glow }}>{c.icon}</div>
              <div className="channel-big__info">
                <span className="channel-big__label">{c.label}</span>
                <span className="channel-big__value">{c.value}</span>
              </div>
              <FiArrowRight className="channel-big__arrow" />
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* ── Cuerpo: Formulario izquierda + servicios derecha ── */}
      <div className="contact-body container">
        {/* Form */}
        <motion.form
          className="contact-form glass-card"
          onSubmit={handleSubmit}
          {...fadeUp(0.1)}
        >
          <h2 className="contact-form__title">Envíame un mensaje</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Cuéntame el objetivo, alcance y tiempos estimados.
          </p>

          <div className="form-field">
            <label htmlFor="c-nombre">Nombre</label>
            <input id="c-nombre" type="text" value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre completo" required />
          </div>

          <div className="form-field">
            <label htmlFor="c-email">Email</label>
            <input id="c-email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required />
          </div>

          <div className="form-field">
            <label htmlFor="c-mensaje">Mensaje</label>
            <textarea id="c-mensaje" rows={5} value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              placeholder="Describe tu proyecto o propuesta…" required />
          </div>

          <div className="contact-form__actions">
            <motion.button
              type="submit"
              className="cta-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {sent ? '✓ Enviado — revisa WhatsApp' : <><FiSend style={{ marginRight: 8 }} />Enviar por WhatsApp</>}
            </motion.button>
            <a href="mailto:gadpalma7@gmail.com" className="ghost-btn">
              Correo directo
            </a>
          </div>
        </motion.form>

        {/* Servicios */}
        <motion.div className="contact-services glass-card" {...fadeUp(0.2)}>
          <h3 className="contact-services__title">¿En qué puedo ayudarte?</h3>
          <ul className="services-list">
            {services.map(s => (
              <li key={s}>
                <span className="services-list__dot" />{s}
              </li>
            ))}
          </ul>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Horario de Atención
          </p>
          <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.5rem' }}>
            Lunes – Viernes<br />9:00 AM – 6:00 PM (CDMX)
          </p>
        </motion.div>
      </div>

    </div >
  )
}
