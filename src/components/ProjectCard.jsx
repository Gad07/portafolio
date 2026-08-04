import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useInView, motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiChevronLeft, 
  FiChevronRight, 
  FiExternalLink, 
  FiArrowUpRight,
  FiGithub, 
  FiLock, 
  FiLayers,
  FiCalendar,
  FiUserCheck
} from 'react-icons/fi'

export default function ProjectCard({ project, index = 0 }) {
  const [open, setOpen] = useState(false)
  const [indexModal, setIndexModal] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-30% 0px -30% 0px" })

  const openGallery = (i = 0) => {
    setIndexModal(i)
    setOpen(true)
  }

  const images = project.gallery && project.gallery.length > 0 
    ? project.gallery 
    : project.image ? [project.image] : []

  const next = () => setIndexModal((i) => (i + 1) % (images.length || 1))
  const prev = () => setIndexModal((i) => (i - 1 + (images.length || 1)) % (images.length || 1))

  const repoUrl = project.repo && project.repo !== '#' ? project.repo : null
  const hasPrivateSource = Boolean(project.privateSource)
  const isGitHub = repoUrl && repoUrl.includes('github.com')
  const showRepoLink = !!repoUrl && !hasPrivateSource
  const repoLabel = isGitHub ? 'Ver en GitHub' : 'Ver repositorio'

  // Format description & extract role if present
  let roleText = ''
  let mainDescText = project.description || ''

  if (project.description && project.description.toLowerCase().startsWith('rol:')) {
    const parts = project.description.split(/—|-|\n/)
    if (parts.length > 1) {
      roleText = parts[0].replace(/^rol:\s*/i, '').trim()
      mainDescText = parts.slice(1).join(' — ').trim()
    } else {
      const firstPeriod = project.description.indexOf('.')
      if (firstPeriod !== -1) {
        roleText = project.description.substring(4, firstPeriod).trim()
        mainDescText = project.description.substring(firstPeriod + 1).trim()
      }
    }
  }

  useEffect(() => {
    if (!open) return

    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, images.length])

  const customAccent = project.accentColor || '#6366F1';

  return (
    <>
      <article 
        ref={ref} 
        className={`editorial-item ${isInView ? 'is-active' : ''}`} 
        style={{ '--custom-accent': customAccent }}
        onClick={() => openGallery(0)}
      >
        <div className="editorial-item__header">
          <h3 className="editorial-item__title">{project.title}</h3>
          {project.year && <span className="editorial-item__year">{project.year}</span>}
        </div>
        
        <div className="editorial-item__content">
          <div className="editorial-item__inner">
            <div className="editorial-item__image">
              {project.image ? (
                <img src={project.image} alt={project.title} />
              ) : (
                <div className="editorial-item__placeholder">Sin imagen</div>
              )}
            </div>
            <div className="editorial-item__info">
              <p className="editorial-item__desc muted">{project.description}</p>
              
              {project.tech?.length ? (
                <ul className="tags" aria-label="Tecnologías usadas">
                  {project.tech.map((t) => (
                    <li key={t} className="tag">{t}</li>
                  ))}
                </ul>
              ) : null}

              <div className="editorial-item__actions" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn--ghost btn--details" onClick={() => openGallery(0)}>Ver detalles</button>
                {project.demo && (
                  <a className="btn btn--ghost" href={project.demo} target="_blank" rel="noreferrer">Visitar sitio</a>
                )}
                {showRepoLink && (
                  <a className="btn btn--accent" href={repoUrl} target="_blank" rel="noreferrer">{repoLabel}</a>
                )}
                {!showRepoLink && hasPrivateSource && (
                  <span className="chip chip--private" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(99, 102, 241, 0.12)', color: '#A5B4FC', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                    <FiLock size={12} />
                    Código privado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {createPortal(
        <AnimatePresence>
          {open && (
            <div className="project-modal" role="dialog" aria-modal="true" aria-label={`Proyecto - ${project.title}`}>
              <motion.div 
                className="project-modal__backdrop" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setOpen(false)} 
              />
              
              <motion.div 
                className="project-modal__card"
                style={{ '--custom-accent': customAccent }}
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <button 
                  className="project-modal__close-btn" 
                  onClick={() => setOpen(false)} 
                  aria-label="Cerrar ventana"
                >
                  <FiX size={18} />
                </button>

                <div className="project-modal__body">
                  
                  {/* Left: Gallery & Preview Stage */}
                  <div className="project-modal__stage">
                    <div className="project-modal__viewport">
                      {images.length > 0 ? (
                        <AnimatePresence mode="wait">
                          <motion.img 
                            key={indexModal}
                            src={images[indexModal]} 
                            alt={`${project.title} - Vista ${indexModal + 1}`}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        </AnimatePresence>
                      ) : (
                        <div className="project-modal__empty">No hay vista previa disponible</div>
                      )}

                      {images.length > 1 && (
                        <>
                          <button className="project-modal__nav-btn project-modal__nav-btn--prev" onClick={prev} aria-label="Anterior">
                            <FiChevronLeft size={22} />
                          </button>
                          <button className="project-modal__nav-btn project-modal__nav-btn--next" onClick={next} aria-label="Siguiente">
                            <FiChevronRight size={22} />
                          </button>

                          <div className="project-modal__counter">
                            {indexModal + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="project-modal__thumbs">
                        {images.map((imgUrl, i) => (
                          <button
                            key={i}
                            className={`project-modal__thumb ${i === indexModal ? 'is-active' : ''}`}
                            onClick={() => setIndexModal(i)}
                          >
                            <img src={imgUrl} alt={`Vista previa ${i + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Detailed Info */}
                  <div className="project-modal__info">
                    <div className="project-modal__header">
                      {project.year && (
                        <div className="project-modal__badges">
                          <span className="project-modal__badge">
                            <FiCalendar size={12} style={{ marginRight: 4 }} />
                            {project.year}
                          </span>
                        </div>
                      )}
                      <h2 className="project-modal__title">{project.title}</h2>
                    </div>

                    <div className="project-modal__content-scroll">
                      {roleText && (
                        <div className="project-modal__role-box">
                          <FiUserCheck className="project-modal__role-icon" size={18} />
                          <div>
                            <span className="project-modal__role-label">Rol desempeñado</span>
                            <p className="project-modal__role-val">{roleText}</p>
                          </div>
                        </div>
                      )}

                      <div className="project-modal__desc-section">
                        <p className="project-modal__desc">{mainDescText}</p>
                      </div>

                      {project.tech?.length > 0 && (
                        <div className="project-modal__tech-section">
                          <h4 className="project-modal__section-title">
                            <FiLayers size={14} /> Tecnologías & Stack
                          </h4>
                          <ul className="project-modal__tags">
                            {project.tech.map((t) => (
                              <li key={t} className="project-modal__tag">{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="project-modal__actions">
                      {project.demo ? (
                        <a 
                          className="project-modal__btn project-modal__btn--chip" 
                          href={project.demo} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <FiExternalLink size={15} />
                          <span>Visitar Sitio Live</span>
                          <FiArrowUpRight size={16} />
                        </a>
                      ) : null}

                      {showRepoLink && (
                        <a 
                          className="project-modal__btn project-modal__btn--secondary" 
                          href={repoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <FiGithub size={15} /> {repoLabel}
                        </a>
                      )}

                      {!showRepoLink && hasPrivateSource && (
                        <div className="project-modal__private-tag">
                          <FiLock size={14} />
                          <span>Código privado</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

