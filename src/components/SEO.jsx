import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const routeMetadata = {
  '/': {
    title: 'Gadiel Palma | Ingeniero de Software & Full Stack Developer',
    description: 'Portafolio profesional de Gadiel Palma. Ingeniero de Software y Desarrollador Full Stack especializado en Next.js, React, TypeScript, Laravel y PostgreSQL. Creación de plataformas de alto impacto y rendimiento.',
  },
  '/sobre-mi': {
    title: 'Sobre Mí | Gadiel Palma — Ingeniero de Software',
    description: 'Conoce más sobre la trayectoria, experiencia profesional en empresas como SELOASA, Grupo LET y Emerson, y stack tecnológico de Gadiel Palma.',
  },
  '/proyectos': {
    title: 'Proyectos & Portafolio | Gadiel Palma',
    description: 'Explora proyectos destacados, plataformas web de alta conversión, CMS a la medida y aplicaciones desarrolladas por Gadiel Palma.',
  },
  '/contacto': {
    title: 'Contacto | Gadiel Palma — Desarrollador Full Stack',
    description: 'Ponte en contacto con Gadiel Palma para colaboraciones, desarrollo de software, consultoría o nuevos proyectos.',
  },
  '/login': {
    title: 'Acceso Administrador | Gadiel Palma',
    description: 'Portal de acceso para la administración del portafolio.',
  },
  '/admin': {
    title: 'Panel de Control | Gadiel Palma',
    description: 'Dashboard de gestión y proyectos del portafolio.',
  },
}

export default function SEO() {
  const location = useLocation()

  useEffect(() => {
    const meta = routeMetadata[location.pathname] || routeMetadata['/']
    
    // Update Document Title
    document.title = meta.title

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', meta.description)
    }

    // Update OG Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', meta.title)
    }
    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) {
      ogDesc.setAttribute('content', meta.description)
    }

    // Update Twitter Title & Description
    let twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) {
      twTitle.setAttribute('content', meta.title)
    }
    let twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) {
      twDesc.setAttribute('content', meta.description)
    }

    // Google Analytics 4 (GA4) Page View Tracking for SPAs
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: meta.title,
        page_location: window.location.href,
      })
    }
  }, [location.pathname])

  return null
}
