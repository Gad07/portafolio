import { motion } from 'framer-motion'
import { FiZap, FiLayers, FiTool, FiAward, FiCode, FiDatabase, FiCloud, FiShield, FiSliders } from 'react-icons/fi'

const experience = [
  {
    company: 'SELOASA',
    role: 'Desarrollador de Aplicativos',
    period: 'Abril 2026 - Actualidad',
    achievements: [
      'Desarrollo e implementación presencial de aplicativos empresariales en Toluca, México.',
      'Optimización de flujos operativos y arquitecturas de información para gestión y soporte interno.',
    ],
  },
  {
    company: 'Link Education - LET (Grupo LET)',
    role: 'Desarrollador de Software',
    period: 'Mayo 2025 - Mayo 2026',
    achievements: [
      'Rediseño e implementación del sitio web corporativo de Grupo LET con Next.js, aumentando un 60% el tráfico orgánico y la captación de leads.',
      'Desarrollo de plataforma e-learning en Laravel para capacitación del personal interno y mejora de la experiencia de usuario.',
      'Despliegue y optimización de hosting en Netlify y Hostinger, reduciendo costos operativos en un 30%.',
      'Plataforma para seguimiento de campamentos en el extranjero (galería de fotos) que aumentó un 25% la satisfacción del cliente.',
      'Desarrollo e integración de sistemas de inventario, mantenimiento preventivo y pasarelas de pago online.',
    ],
  },
  {
    company: 'Yukapioca MX',
    role: 'Auxiliar IT / Analista de TI',
    period: 'Noviembre 2024 - Marzo 2025',
    achievements: [
      'Desarrollo de sistema de inventarios con Laravel, reduciendo errores operativos en aproximadamente 40%.',
      'Pruebas funcionales y QA en la app móvil de fidelización, automatización de horarios laborales con React y gestión de logística.',
    ],
  },
  {
    company: 'Emerson',
    role: 'Desarrollador de Software',
    period: 'Febrero 2023 - Julio 2023',
    achievements: [
      'Desarrollo e implementación de sistema de tickets para soporte interno, logrando mejorar la eficiencia en la resolución de incidencias en un 30%.',
      'Corrección de errores críticos en sistema heredado y desarrollo de 3 módulos adicionales para ampliar la funcionalidad y optimizar el rendimiento.',
      'Soporte técnico y mantenimiento preventivo/correctivo reduciendo tiempos de inactividad en 25%.',
    ],
  },
]

const freelanceExperience = [
  {
    company: 'Trébol Digital | IA Centrada en el Humano',
    role: 'Project Lead & Full-Stack Developer',
    period: 'Julio 2026 - Actualidad',
    achievements: [
      'Dirección del diseño y despliegue de la plataforma corporativa de alta conversión estructurada en 5 secciones estratégicas.',
      'Implementación de una arquitectura visual modular tipo Bento Box combinada con principios de glassmorfismo e interacciones de alta respuesta táctil.',
      'Flujo de trabajo ágil intensivo de 4 semanas, revisiones de avance semanales y 2 semanas estratégicas para QA exhaustivo.',
      'Construido sobre Next.js y Supabase, garantizando tiempos de carga casi instantáneos, SEO técnico impecable y base de datos escalable.',
    ],
  },
  {
    company: 'Expo México Mujer 2027 (Toronto, Canadá)',
    role: 'Project Lead & Full-Stack Developer',
    period: 'Junio 2026 - Julio 2026',
    achievements: [
      'Diseño y desarrollo de arquitectura escalable para ecosistema digital de alto tráfico en evento internacional.',
      'Desarrollo de Panel de Administración (CMS) 100% a la medida para gestión autónoma de contenido multimedia y documentos en tiempo real.',
      'Construcción de módulos de gestión operativa (ticketing, tableros Kanban con SLAs) y motor de agendamiento B2B.',
      'Implementación de estrictos protocolos de seguridad (TOTP 2FA, Middleware) y almacenamiento multimedia persistente en servidor aislado de producción.',
      'Stack tecnológico: Next.js (App Router), TypeScript, PostgreSQL, Netlify.',
    ],
  },
  {
    company: 'Allianz Patrimonial Inversiones',
    role: 'Programador Full Stack',
    period: 'Diciembre 2024 - Agosto 2025',
    achievements: [
      'Desarrollo de sitio web personalizado en React enfocado en la conversión comercial de prospectos.',
      'Integración de agendamiento de citas y coordinación automatizada de sesiones por Zoom.',
    ],
  },
]

const technicalSkills = [
  { name: 'TypeScript', level: 90, slug: 'typescript', hex: '3178C6' },
  { name: 'Next.js', level: 92, slug: 'nextdotjs', hex: 'FFFFFF' },
  { name: 'React', level: 88, slug: 'react', hex: '61DAFB' },
  { name: 'PHP / Laravel', level: 90, slug: 'laravel', hex: 'FF2D20' },
  { name: 'PostgreSQL', level: 86, slug: 'postgresql', hex: '4169E1' },
  { name: 'Supabase', level: 85, slug: 'supabase', hex: '3ECF8E' },
  { name: 'Node.js', level: 82, slug: 'nodedotjs', hex: '5FA04E' },
  { name: 'Python', level: 80, slug: 'python', hex: '3776AB' },
  { name: 'C# / .NET', level: 75, slug: 'dotnet', hex: '512BD4' },
  { name: 'Java', level: 75, slug: 'openjdk', hex: 'ED8B00' },
]

const tools = ['Git y GitHub', 'Supabase', 'PostgreSQL', 'Netlify', 'Hostinger', 'Figma', 'Docker', 'VS Code', 'Microsoft 365', 'HubSpot', 'Replit']
const softSkills = ['Liderazgo de Proyectos', 'Diseño de Arquitectura', 'Comunicación Efectiva', 'Trabajo en Equipo Ágil', 'Resolución de Problemas', 'Orientación a Resultados']
const skillChart = [
  {
    label: 'Liderazgo & Arquitectura Full-Stack',
    value: 92,
    icon: <FiZap size={18} style={{ color: 'var(--accent, #3b82f6)' }} />,
    description: 'Dirección técnica de proyectos, selección de stack óptimo y entregas bajo metodologías ágiles.',
  },
  {
    label: 'Desarrollo Frontend & Experiencia UX',
    value: 90,
    icon: <FiCode size={18} style={{ color: '#61DAFB' }} />,
    description: 'Interfaces Bento Box y Glassmorphism de alto rendimiento en Next.js y React con interacciones fluidas.',
  },
  {
    label: 'Backend, APIs & Servidores',
    value: 88,
    icon: <FiDatabase size={18} style={{ color: '#FF2D20' }} />,
    description: 'Construcción de microservicios y REST APIs escalables en Laravel, Node.js y Supabase.',
  },
  {
    label: 'CMS a Medida & Autonomía Digital',
    value: 90,
    icon: <FiSliders size={18} style={{ color: '#3ECF8E' }} />,
    description: 'Paneles de administración 100% personalizados que otorgan autonomía total de contenido al cliente sin código.',
  },
  {
    label: 'Bases de Datos & Modelo Relacional',
    value: 85,
    icon: <FiLayers size={18} style={{ color: '#4169E1' }} />,
    description: 'Diseño de esquemas, optimización de consultas y almacenamiento persistente aislado en PostgreSQL y MySQL.',
  },
  {
    label: 'Seguridad de Software & Middleware',
    value: 88,
    icon: <FiShield size={18} style={{ color: '#F7DF1E' }} />,
    description: 'Implementación de protocolos de autenticación (TOTP 2FA, JWT), middlewares de protección y auditoría.',
  },
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
            <h1 className="display-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', margin: 0, lineHeight: 1 }}>
              Sobre<br />
              <span className="accent-stroke">mí.</span>
            </h1>
          </motion.div>
          <motion.div {...fadeUp(0.2)} className="about-hero__text-col">
            <p className="display-sub" style={{ margin: 0 }}>
              Ingeniero en Software por la Universidad Autónoma del Estado de México, especializado en desarrollo web full stack, automatización de procesos operativos y diseño de arquitecturas digitales de alto rendimiento.
            </p>
            <p className="display-sub" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
              Diseño e implemento plataformas web escalables, paneles de administración autónomos (CMS a la medida), motores de agendamiento B2B y sistemas de gestión interna utilizando Next.js, TypeScript, Laravel y PostgreSQL. Transformo requerimientos complejos en herramientas ágiles, seguras y de alta conversión que optimizan tiempos, reducen costos operacionales y empoderan al usuario final.
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
            { value: '25+', label: 'Proyectos', icon: <FiLayers size={20} /> },
            { value: '10+', label: 'Tecnologías core', icon: <FiTool size={20} /> },
            { value: '8+', label: 'Certificaciones', icon: <FiAward size={20} /> },
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
          <h2 className="section-heading">Tecnologías<br /><span className="accent-stroke">principales.</span></h2>
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

      {/* ── Fortalezas: Tarjetas de Expertise Core con descripciones y nivel ── */}
      <section className="about-strengths container">
        <motion.div {...fadeUp()}>
          <span className="section-eyebrow">Expertise Core</span>
          <h2 className="section-heading">Áreas de<br /><span className="accent-stroke">enfoque.</span></h2>
        </motion.div>
        <motion.div className="strengths-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }} {...fadeUp(0.15)}>
          {skillChart.map((s, i) => (
            <motion.div key={s.label} className="strength-card glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }} {...fadeUp(i * 0.08)}>
              <div className="strength-card__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  <span className="strength-card__icon" style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
                  <span className="strength-card__label" style={{ fontWeight: 600, fontSize: '1.02rem', color: '#fff' }}>{s.label}</span>
                </div>
                <span className="strength-card__pct" style={{ fontSize: '0.82rem', fontWeight: 700, opacity: 0.85, background: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{s.value}%</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                {s.description}
              </p>
              <div className="strength-card__track" style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginTop: 'auto' }}>
                <motion.div
                  className="strength-card__fill"
                  style={{ height: '100%', background: 'var(--accent, #3b82f6)', borderRadius: '3px' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Experiencia Profesional ── */}
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

      {/* ── Proyectos Freelance & Consultoría ── */}
      <section className="about-exp container" style={{ paddingTop: '4rem' }}>
        <motion.div {...fadeUp()}>
          <span className="section-eyebrow">Desarrollo Independiente</span>
          <h2 className="section-heading">Proyectos Freelance<br /><span className="accent-stroke">& consultoría.</span></h2>
        </motion.div>
        <div className="exp-list">
          {freelanceExperience.map((job, i) => (
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

      {/* ── Certificaciones: 3 Tarjetas Dedicadas en Grid ── */}
      <section className="about-certs container" style={{ paddingTop: '5rem' }}>
        <motion.div {...fadeUp()}>
          <span className="section-eyebrow">Acreditaciones</span>
          <h2 className="section-heading">Certificaciones &<br /><span className="accent-stroke">formación.</span></h2>
        </motion.div>

        <div className="certs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
          
          {/* Card 1: Profesionales */}
          <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }} {...fadeUp(0.1)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <FiAward size={22} style={{ color: 'var(--accent)' }} />
              <h3 className="soft-block__title" style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Profesionales</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Certificado Profesional de Fundamentos de Seguridad</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>Microsoft & LinkedIn</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Gestión de Proyectos con Microsoft 365</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>Microsoft & LinkedIn Learning</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Fundamentos del Desarrollo Web: Full Stack o Front-end</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>LinkedIn Learning</span>
              </li>
            </ul>
          </motion.div>

          {/* Card 2: Lenguajes y Herramientas */}
          <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }} {...fadeUp(0.2)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <FiCode size={22} style={{ color: 'var(--accent)' }} />
              <h3 className="soft-block__title" style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Lenguajes y Herramientas</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Fundamentos de GitHub</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>DataCamp</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Foundational C#</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>Microsoft & FreeCodeCamp</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>SQL Associate</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>DataCamp</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>JavaScript Esencial</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>LinkedIn Learning</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Programación con Python</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>Santander Open Academy</span>
              </li>
            </ul>
          </motion.div>

          {/* Card 3: IA y Datos */}
          <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }} {...fadeUp(0.3)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <FiDatabase size={22} style={{ color: 'var(--accent)' }} />
              <h3 className="soft-block__title" style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>IA y Datos</h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Inteligencia Artificial para Startups</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>LinkedIn Learning</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Certificado en IA Generativa</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>Santander Open Academy</span>
              </li>
              <li style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>Introducción a Ciencia de Datos & Big Data</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.85 }}>Santander Open Academy</span>
              </li>
            </ul>
          </motion.div>

        </div>
      </section>

      {/* ── Skills Core, Idiomas y Herramientas ── */}
      <section className="about-extras container" style={{ paddingTop: '4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Columna Izquierda: Habilidades Core e Idiomas */}
        <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} {...fadeUp(0.1)}>
          <div>
            <h3 className="soft-block__title" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#fff' }}>Habilidades Core</h3>
            <div className="pill-cloud">
              {softSkills.map(s => <span key={s} className="pill pill--accent" style={{ background: 'rgba(30,77,183,0.1)' }}>{s}</span>)}
            </div>
          </div>

          <div>
            <h3 className="soft-block__title" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#fff' }}>Idiomas</h3>
            <div className="pill-cloud">
              <span className="pill">Español <strong style={{ color: 'var(--muted)' }}>Nativo</strong></span>
              <span className="pill">Inglés <strong style={{ color: 'var(--muted)' }}>Competencia técnica / profesional</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Columna Derecha: Herramientas */}
        <motion.div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} {...fadeUp(0.2)}>
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

