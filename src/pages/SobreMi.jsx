const experience = [
  {
    company: 'Link Education and Travel (LET)',
    role: 'Desarrollador Jr',
    period: 'Marzo 2025 - Actualidad',
    achievements: [
      'Rediseño e implementación de sitio web corporativo con Next.js, lo que resulto en un aumento del 60% en tráfico orgánico asi como la generación de leads.',
      'Desarrollo de plataforma e-learning en Laravel lo que permitio capacitar al personal interno y mejorar la experiencia de aprendizaje de los usuarios.',
      'Desplegue diversos sitios y aplicaciones en Netlify y Hostinger, optimizando tiempos de despliegue y reduciendo costos de hosting en un 30%.',
      'Diseñe y desarrolle una plataforma para el seguimiento en campamentos en el extranejro el cual permitio a los padres vivir una experiencia conjunta con sus hijos mediante una galeria de fotos lo que resulto en un aumento del 25% en la satisfacción del cliente.',
      'Integre y mejore procesos para realizar pagos en línea, lo que resulto en una reducción del 20% en el tiempo de procesamiento y una mejora significativa en la experiencia del usuario.',
      'Diseñe y desarrolle un sistema de inventario y mantenimiento para la gestión de recursos en computacionales, lo que resulto en una reducción del 40% en errores operativos y una mejora en la eficiencia del equipo de IT.',
      'Desarrolle e implemente un sistema de gestion de tickes para el area de marketing y tecnologias, lo que resulto en una mejora del 30% en la eficiencia de resolución de incidencias y una mejor integración con los procesos internos.'
    ]
  },
  {
    company: 'Allianz Patrimonial',
    role: 'Desarrollador Full Stack (Freelance)',
    period: 'Diciembre 2024 - Marzo 2025',
    achievements: [
      'Desarrollo de sitio web personalizado con React enfocado en captación de leads.',
      'Integración de agenda de citas y coordinación de sesiones por Zoom.',
      'Optimización del flujo de contacto comercial para acelerar la conversión de prospectos.'
    ]
  },
  {
    company: 'Yukapioca MX',
    role: 'Auxiliar IT',
    period: 'Noviembre 2024 - Marzo 2025',
    achievements: [
      'Desarrolle e implemente un sistema de inventarios con Laravel, reduciendo errores operativos en aproximadamente 40%.',
      'Realice pruebas funcionales, de integración y validación en la aplicación móvil de fidelización de clientes.',
      'Desarrollo de sistema semiautomatizado de horarios laborales y de comuda con React, mejorando tiempos de operación en 35% y reduciendo errores en la gestión de turnos.',
      'Apoyo en rediseño web desde propuesta en Figma hasta implementación final.',
      'Automatice procesos de solicitudes de apertira de vacantes y gestión de recursos humanos, lo que resulto en una reducción del 25% en tiempos administrativos y una mejora en la eficiencia del equipo de RRHH.',
      'Desarrolle e implemente un sistema para la gestion de combusible y optimizacipon de rutas para el reparto, lo que resulto en una reducción del 15% en costos de combustible y una mejora en la eficiencia de las entregas.',
      'Diseñe y desarrolle un punto de venta utilizado para eventos especiales, lo que permitió una gestión eficiente de ventas asi como consolidarr reportes de ventas y stock en tiempo real, mejorando la toma de decisiones durante eventos y reduciendo errores en el proceso de venta.'
    ]
  },
  {
    company: 'Emerson',
    role: 'Desarrollador de Software',
    period: 'Febrero 2023 - Junio 2023',
    achievements: [
      'Desarrollo de sistema de tickets para soporte interno con mejora de eficiencia de 30%.',
      'Soporte técnico y mantenimiento preventivo/correctivo con reducción de inactividad cercana al 25%.'
    ]
  }
]

const certifications = {
  recent: [
    'Certificado en SQL Associate - DataCamp (Enero 2026)',
    'Fundamentos de GitHub - DataCamp (Febrero 2026)',
    'Participación en Networking Academy Learn-A-Thon 2025',
    'Fundamentos de C# - Microsoft (Noviembre 2025)',
    'JavaScript Esencial - LinkedIn Learning (Octubre 2025)',
    'Introducción a contenedores con Docker - Microsoft Learn (Octubre 2025)'
  ],
  extra: [
    'Inteligencia artificial para startups - LinkedIn Learning (Septiembre 2025)',
    'Python sin experiencia en programación - LinkedIn Learning (Septiembre 2025)',
    'Gestión de proyectos con Microsoft 365 - LinkedIn Learning (Septiembre 2025)',
    'Fundamentos de seguridad - Microsoft y LinkedIn Learning (Septiembre 2025)',
    'Desarrollo Web Full Stack - LinkedIn Learning (Mayo 2024)',
    'Big Data - Santander Academy (Febrero 2024)'
  ]
}

const technicalSkills = [
  { name: 'Java', level: 75, logo: 'openjdk', color: 'ED8B00' },
  { name: 'PHP', level: 85, logo: 'php', color: '777BB4' },
  { name: 'Python', level: 70, logo: 'python', color: '3776AB' },
  { name: 'JavaScript', level: 85, logo: 'javascript', color: 'F7DF1E' },
  { name: 'SQL', level: 78, logo: 'mysql', color: '4479A1' },
  { name: 'React', level: 80, logo: 'react', color: '61DAFB' },
  { name: 'Laravel', level: 90, logo: 'laravel', color: 'FF2D20' },
  { name: 'Node.js', level: 80, logo: 'nodedotjs', color: '5FA04E' },
  { name: 'Vite', level: 82, logo: 'vitess', color: '646CFF' }
]
const tools = ['Git y GitHub', 'VS Code', 'Android Studio', 'Netlify', 'Hostinger', 'AWS', 'Power BI', 'Figma', 'WordPress y Elementor', 'Microsoft 365']
const softSkills = ['Comunicación efectiva', 'Trabajo en equipo', 'Adaptabilidad', 'Resolución de problemas', 'Orientación a resultados', 'Aprendizaje continuo']

const skillChart = [
  { label: 'Frontend', value: 85 },
  { label: 'Backend', value: 80 },
  { label: 'Bases de datos', value: 70 },
  { label: 'Cloud y despliegue', value: 75 },
  { label: 'QA y soporte', value: 80 }
]

function Icon({ type }) {
  if (type === 'profile') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-8 9a8 8 0 0 1 16 0" /></svg>
    )
  }
  if (type === 'chart') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5m0 14h16M8 17v-4m4 4V9m4 8V7" /></svg>
    )
  }
  if (type === 'work') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 2h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /></svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18" /></svg>
  )
}

export default function SobreMi() {
  const timelineRef = useRef(null)

  useEffect(() => {
    const el = timelineRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('in-view')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section about">
      <h2 className="section__title">Sobre mí</h2>

      <div className="intro-section about-hero">
        <div className="about-hero__heading">
          <span className="about-icon"><Icon type="profile" /></span>
          <h3>Perfil Profesional</h3>
        </div>
        <p className="lead">
          Ingeniero en Software por la Universidad Autónoma del Estado de México, con enfoque en desarrollo web full stack,
          automatización de procesos y soporte técnico. Actualmente me desempeño como Desarrollador Jr en Link Education and Travel,
          construyendo soluciones para educación, gestión operativa y experiencia de usuario.
        </p>
        <p>
          Me especializo en transformar necesidades de negocio en productos funcionales: desde arquitectura y desarrollo
          hasta despliegue y mejora continua. Trabajo con mentalidad de producto, priorizando calidad técnica, mantenibilidad
          y resultados medibles.
        </p>
      </div>

      <div className="grid grid--two about-panels">
        <div className="card about-card">
          <div className="about-card__title"><span className="about-icon"><Icon type="chart" /></span><h3>Resumen</h3></div>
          <div className="about-kpis">
            <article className="about-kpi">
              <span className="about-kpi__number">2+</span>
              <span className="about-kpi__label">Años de experiencia profesional</span>
            </article>
            <article className="about-kpi">
              <span className="about-kpi__number">20+</span>
              <span className="about-kpi__label">Proyectos y entregables implementados</span>
            </article>
            <article className="about-kpi">
              <span className="about-kpi__number">12+</span>
              <span className="about-kpi__label">Tecnologías usadas en producción</span>
            </article>
          </div>
        </div>
      </div>

      <div className="card about-skillchart">
        <div className="about-card__title"><span className="about-icon"><Icon type="chart" /></span><h3>Fortalezas técnicas</h3></div>
        <div className="about-bars">
          {skillChart.map((item) => (
            <div key={item.label} className="about-bar">
              <div className="about-bar__meta"><span>{item.label}</span><span>{item.value}%</span></div>
              <div className="about-bar__track"><div className="about-bar__fill" style={{ width: `${item.value}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <h3>Experiencia Profesional</h3>
      <div ref={timelineRef} className="experience about-timeline">
        {experience.map((job) => (
          <article key={`${job.company}-${job.period}`} className="experience-item">
            <div className="about-card__title"><span className="about-icon"><Icon type="work" /></span><h4>{job.company}</h4></div>
            <p className="job-title">{job.role}</p>
            <span className="period">{job.period}</span>
            <ul>
              {job.achievements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h3>Educación</h3>
      <div className="education-item">
        <h4>Universidad Autónoma del Estado de México</h4>
        <span className="period">Santiago Tianguistenco, Estado de México</span>
        <p><strong>Ingeniería en Software (Promedio: 8.4)</strong></p>
        <p>Cursos relevantes: Estructuras de Datos y Algoritmos, Ingeniería de Requisitos y Bases de Datos Relacionales (MySQL).</p>
      </div>

      <h3>Certificaciones y formación continua</h3>
      <div className="grid grid--two">
        <div className="card">
          <h4>Certificaciones recientes</h4>
          <ul>
            {certifications.recent.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h4>Formación complementaria</h4>
          <ul>
            {certifications.extra.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3>Habilidades técnicas</h3>
      <div className="tech-logo-grid" aria-label="Habilidades técnicas">
        {technicalSkills.map((skill) => (
          <article key={skill.name} className="tech-logo-card" style={{ '--value': skill.level }}>
            <div className="tech-logo-wrap">
              <img src={`https://cdn.simpleicons.org/${skill.logo}/${skill.color}`} alt={`Logo ${skill.name}`} loading="lazy" />
              <div className="tech-donut" aria-hidden="true">
                <div className="tech-donut__inner">{skill.level}%</div>
              </div>
            </div>
            <span className="tech-logo-name">{skill.name}</span>
          </article>
        ))}
      </div>

      <h3>Herramientas y plataformas</h3>
      <ul className="skills-list" aria-label="Herramientas y plataformas">
        {tools.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>

      <h3>Habilidades blandas</h3>
      <ul className="skills-list" aria-label="Habilidades blandas">
        {softSkills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      <h3>Idiomas</h3>
      <div className="languages">
        <div className="language"><span>Español</span><div className="progress-bar"><div className="progress" style={{ width: '100%' }}></div></div><span>Nativo</span></div>
        <div className="language"><span>Inglés</span><div className="progress-bar"><div className="progress" style={{ width: '70%' }}></div></div><span>Intermedio</span></div>
      </div>

      <h3>Enlaces profesionales</h3>
      <div className="links">
        <p><strong>GitHub:</strong> <a href="https://github.com/Gad07" target="_blank" rel="noreferrer">github.com/Gad07</a></p>
        <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/gadiel-palma-ramos-08375817b/" target="_blank" rel="noreferrer">linkedin.com/in/gadiel-palma-ramos-08375817b</a></p>
      </div>

      <h3>Referencias</h3>
      <p className="muted">Disponibles a solicitud.</p>
    </section>
  )
}
import { useEffect, useRef } from 'react'
