import { motion } from 'framer-motion'
import { FiZap, FiLayers, FiTool, FiBookOpen, FiAward, FiCode, FiDatabase, FiCloud } from 'react-icons/fi'

const experience = [
  {
    company: 'Link Education and Travel (LET)',
    role: 'Desarrollador Jr',
    period: 'Marzo 2025 - Actualidad',
    achievements: [
      'Rediseño e implementación de sitio web corporativo con Next.js, lo que resultó en un aumento del 60% en tráfico orgánico así como generación de leads.',
      'Desarrollo de plataforma e-learning en Laravel para capacitar al personal interno y mejorar la experiencia de los usuarios.',
      'Despliegue de diversos sitios y aplicaciones en Netlify y Hostinger, optimizando tiempos de despliegue y reduciendo costos de hosting en 30%.',
      'Diseñé y desarrollé una plataforma para el seguimiento en campamentos en el extranjero (galería de fotos) que aumentó 25% la satisfacción del cliente.',
      'Integré y mejoré procesos de pagos en línea, reduciendo un 20% el tiempo de procesamiento.',
      'Diseño y desarrollo de sistema de inventario y mantenimiento, logrando una reducción del 40% en errores operativos de IT.',
      'Implementación de sistema de gestión de tickets para marketing y tecnologías, mejorando la eficiencia de resolución en 30%.',
    ],
  },
  {
    company: 'Allianz Patrimonial',
    role: 'Desarrollador Full Stack (Freelance)',
    period: 'Diciembre 2024 - Marzo 2025',
    achievements: [
      'Desarrollo de sitio web personalizado con React enfocado en captación de leads.',
      'Integración de agenda de citas y coordinación de sesiones por Zoom.',
      'Optimización del flujo de contacto comercial para acelerar la conversión de prospectos.',
    ],
  },
  {
    company: 'Yukapioca MX',
    role: 'Auxiliar IT',
    period: 'Noviembre 2024 - Marzo 2025',
    achievements: [
      'Desarrollo de sistema de inventarios con Laravel, reduciendo errores operativos en aproximadamente 40%.',
      'Pruebas funcionales, de integración y validación en la aplicación móvil de fidelización de clientes.',
      'Sistema semiautomatizado de horarios laborales con React, mejorando tiempos de operación en 35%.',
      'Apoyo en rediseño web desde propuesta en Figma hasta implementación final.',
      'Automatización de procesos de vacantes y recursos humanos, reduciendo en 25% tiempos administrativos.',
      'Desarrollo de sistema para gestión de combustible y optimización de rutas, reduciendo 15% los costos.',
      'Punto de venta para eventos especiales con reportes en tiempo real de ventas y stock.',
    ],
  },
  {
    company: 'Emerson',
    role: 'Desarrollador de Software',
    period: 'Febrero 2023 - Junio 2023',
    achievements: [
      'Desarrollo de sistema de tickets para soporte interno con mejora de eficiencia de 30%.',
      'Soporte técnico y mantenimiento preventivo/correctivo con reducción de inactividad del 25%.',
    ],
  },
]

const technicalSkills = [
  { name: 'JavaScript', level: 85, slug: 'javascript', hex: 'F7DF1E' },
  { name: 'PHP', level: 85, slug: 'php', hex: '777BB4' },
  { name: 'Laravel', level: 90, slug: 'laravel', hex: 'FF2D20' },
  { name: 'React', level: 80, slug: 'react', hex: '61DAFB' },
  { name: 'Node.js', level: 80, slug: 'nodedotjs', hex: '5FA04E' },
  { name: 'Python', level: 70, slug: 'python', hex: '3776AB' },
  { name: 'SQL', level: 78, slug: 'mysql', hex: '4479A1' },
  { name: 'Java', level: 75, slug: 'openjdk', hex: 'ED8B00' },
  { name: 'Vite', level: 82, slug: 'vite', hex: '646CFF' },
]

const tools = ['Git y GitHub', 'VS Code', 'Android Studio', 'Netlify', 'Hostinger', 'AWS', 'Power BI', 'Figma', 'WordPress y Elementor', 'Microsoft 365']
const softSkills = ['Comunicación efectiva', 'Trabajo en equipo', 'Adaptabilidad', 'Resolución de problemas', 'Orientación a resultados', 'Aprendizaje continuo']
const skillChart = [
  { label: 'Frontend', value: 85, icon: <FiCode size={16} /> },
  { label: 'Backend', value: 80, icon: <FiDatabase size={16} /> },
  { label: 'Bases de datos', value: 70, icon: <FiLayers size={16} /> },
  { label: 'Cloud y despliegue', value: 75, icon: <FiCloud size={16} /> },
  { label: 'QA y soporte', value: 80, icon: <FiTool size={16} /> },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function SobreMi() {
  return (
    <div className="about-page">

      {/* ── Hero: Dos columnas ── */}
      <section className="about-hero">
        <div className="about-hero__grid">
          <motion.div {...fadeUp(0.1)} className="about-hero__title-col">
            <h1 className="display-title" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', margin: 0, lineHeight: 1 }}>
              Sobre<br />
              <span className="accent-stroke">mí.</span>
            </h1>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="about-hero__text-col">
            <p className="display-sub" style={{ margin: 0 }}>
              Ingeniero en Software por la Universidad Autónoma del Estado de México, con enfoque en desarrollo web full stack, automatización de procesos y soporte técnico. Actualmente me desempeño como Desarrollador Jr en Link Education and Travel, construyendo soluciones para educación, gestión operativa y experiencia de usuario.
            </p>
            <p className="display-sub" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
              Me especializo en transformar necesidades de negocio en productos funcionales: desde arquitectura y desarrollo hasta despliegue y mejora continua. Trabajo con mentalidad de producto, priorizando calidad técnica, mantenibilidad y resultados medibles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── KPIs Section ── */}
      <section className="container" style={{ paddingBottom: '6rem', paddingTop: '4rem' }}>
        <motion.div {...fadeUp(0.2)}>
          <span className="section-eyebrow">En números</span>
          <h2 className="section-heading" style={{ marginBottom: '1rem' }}>Impacto y<br /><span className="accent-stroke">resultados.</span></h2>
        </motion.div>
        
        <motion.div className="kpi-row" {...fadeUp(0.3)}>
          {[
            { value: '2+', label: 'Años exp.', icon: <FiZap size={20} /> },
            { value: '20+', label: 'Proyectos', icon: <FiLayers size={20} /> },
            { value: '12+', label: 'Tecnologías', icon: <FiTool size={20} /> },
            { value: '4+', label: 'Certificaciones', icon: <FiAward size={20} /> },
          ].map(k => (
            <div key={k.label} className="kpi-item glass-card">
              <div className="kpi-item__icon">{k.icon}</div>
              <span className="kpi-item__value">{k.value}</span>
              <span className="kpi-item__label">{k.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Stack: logos en grid horizontal sobre panel semitransparente ── */}
      <section className="about-stack container">
        <motion.div {...fadeUp()}>
          <span className="section-eyebrow">Stack Tecnológico</span>
          <h2 className="section-heading">Herramientas<br /><span className="accent-stroke">que domino.</span></h2>
        </motion.div>
        <motion.div className="tech-bento" {...fadeUp(0.15)}>
          {technicalSkills.map((t, i) => (
            <motion.div
              key={t.name}
              className="tech-item glass-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <img
                src={`https://cdn.simpleicons.org/${t.slug}/${t.hex}`}
                alt={t.name}
                width={32}
                height={32}
                loading="lazy"
              />
              <span className="tech-item__name">{t.name}</span>
              <div className="tech-item__bar-track">
                <motion.div
                  className="tech-item__bar-fill"
                  style={{ background: `#${t.hex}` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${t.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.05 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Fortalezas: barras grandes con iconos ── */}
      <section className="about-strengths container">
        <motion.div {...fadeUp()}>
          <span className="section-eyebrow">Expertise Core</span>
          <h2 className="section-heading">Áreas de<br /><span className="accent-stroke">enfoque.</span></h2>
        </motion.div>
        <motion.div className="strengths-grid" {...fadeUp(0.15)}>
          {skillChart.map((s, i) => (
            <motion.div key={s.label} className="strength-card glass-card" {...fadeUp(i * 0.1)}>
              <div className="strength-card__header">
                <span className="strength-card__icon">{s.icon}</span>
                <span className="strength-card__label">{s.label}</span>
                <span className="strength-card__pct">{s.value}%</span>
              </div>
              <div className="strength-card__track">
                <motion.div
                  className="strength-card__fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Experiencia: lista editorial ── */}
      <section className="about-exp container">
        <motion.div {...fadeUp()}>
          <span className="section-eyebrow">Trayectoria</span>
          <h2 className="section-heading">Experiencia<br /><span className="accent-stroke">profesional.</span></h2>
        </motion.div>
        <div className="exp-list">
          {experience.map((job, i) => (
            <motion.article key={job.company} className="exp-item" {...fadeUp(i * 0.1)}>
              <div className="exp-item__meta">
                <span className="exp-item__period">{job.period}</span>
                <span className="exp-item__divider" />
              </div>
              <div className="exp-item__content glass-card">
                <div className="exp-item__head">
                  <h3 className="exp-item__company">{job.company}</h3>
                  <span className="exp-item__role">{job.role}</span>
                </div>
                <ul className="exp-item__list">
                  {job.achievements.map(a => <li key={a}>{a}</li>)}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Certificaciones, Skills y Herramientas ── */}
      <section className="about-extras container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Columna Izquierda: Certificaciones (Lista detallada) */}
        <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} {...fadeUp(0.1)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <FiAward size={24} style={{ color: 'var(--accent)' }} />
            <h3 className="soft-block__title" style={{ margin: 0, fontSize: '1.2rem' }}>Certificaciones y Formación</h3>
          </div>
          <ul className="exp-item__list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <li><strong style={{ color: '#fff' }}>SQL Associate</strong> — DataCamp</li>
            <li><strong style={{ color: '#fff' }}>Fundamentos de GitHub</strong> — DataCamp</li>
            <li><strong style={{ color: '#fff' }}>JavaScript Esencial</strong> — LinkedIn Learning</li>
            <li><strong style={{ color: '#fff' }}>Intro a contenedores con Docker</strong> — Microsoft Learn</li>
            <li><strong style={{ color: '#fff' }}>Fundamentos de C#</strong> — Microsoft</li>
            <li><strong style={{ color: '#fff' }}>Networking Academy Learn-A-Thon 2025</strong></li>
          </ul>
        </motion.div>

        {/* Columna Central: Habilidades Blandas e Idiomas */}
        <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} {...fadeUp(0.2)}>
          <div>
            <h3 className="soft-block__title" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#fff' }}>Habilidades Blandas</h3>
            <div className="pill-cloud">
              {softSkills.map(s => <span key={s} className="pill pill--accent" style={{ background: 'rgba(30,77,183,0.1)' }}>{s}</span>)}
            </div>
          </div>

          <div>
            <h3 className="soft-block__title" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#fff' }}>Idiomas</h3>
            <div className="pill-cloud">
              <span className="pill">Español <strong style={{ color: 'var(--muted)' }}>Nativo</strong></span>
              <span className="pill">Inglés <strong style={{ color: 'var(--muted)' }}>Intermedio</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Columna Derecha: Herramientas */}
        <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} {...fadeUp(0.3)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <FiTool size={22} style={{ color: 'var(--muted)' }} />
            <h3 className="soft-block__title" style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Herramientas & Plataformas</h3>
          </div>
          <div className="pill-cloud" style={{ marginTop: '0.5rem' }}>
            {tools.map(t => <span key={t} className="pill" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>{t}</span>)}
          </div>
        </motion.div>

      </section>

    </div>
  )
}
