import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useInView } from 'framer-motion'

export default function ProjectCard({ project, index = 0 }) {
  const [open, setOpen] = useState(false)
  const [indexModal, setIndexModal] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { margin: "-30% 0px -30% 0px" })

  const openGallery = (i = 0) => {
    setIndexModal(i)
    setOpen(true)
  }

  const next = () => setIndexModal((i) => (i + 1) % (project.gallery?.length || 1))
  const prev = () => setIndexModal((i) => (i - 1 + (project.gallery?.length || 1)) % (project.gallery?.length || 1))

  const repoUrl = project.repo && project.repo !== '#' ? project.repo : null
  const hasPrivateSource = Boolean(project.privateSource)
  const isGitHub = repoUrl && repoUrl.includes('github.com')
  const showRepoLink = !!repoUrl && !hasPrivateSource
  const repoLabel = isGitHub ? 'Ver en GitHub' : 'Ver proyecto'

  useEffect(() => {
    if (!open) return

    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <article ref={ref} className={`editorial-item ${isInView ? 'is-active' : ''}`} onClick={() => openGallery(0)}>
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
                <button className="btn btn--ghost btn--details" onClick={() => openGallery(0)}>Ver galería</button>
                {project.demo && (
                  <a className="btn btn--ghost" href={project.demo} target="_blank" rel="noreferrer">Visitar sitio</a>
                )}
                {showRepoLink && (
                  <a className="btn btn--accent" href={repoUrl} target="_blank" rel="noreferrer">{repoLabel}</a>
                )}
                {!showRepoLink && hasPrivateSource && <span className="chip">Código cerrado</span>}
              </div>
            </div>
          </div>
        </div>
      </article>

      {open && createPortal(
        <div className="modal" role="dialog" aria-modal="true" aria-label={`Galería - ${project.title}`}>
          <div className="modal__backdrop" onClick={() => setOpen(false)} />
          <div className="modal__content">
            <button className="modal__close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
            <div className="modal__left">
              <button className="modal__arrow" onClick={prev} aria-label="Anterior">‹</button>
            </div>
            <div className="modal__gallery">
              {project.gallery && project.gallery.length ? (
                <img src={project.gallery[indexModal]} alt={`${project.title} ${indexModal + 1}`} />
              ) : (
                <div className="modal__empty">No hay imágenes disponibles</div>
              )}
            </div>
            <div className="modal__meta">
              <h3>{project.title}</h3>
              <p className="muted">{project.description}</p>
              {project.tech?.length ? (
                <ul className="tags" aria-label="Tecnologías usadas">
                  {project.tech.map((t) => (
                    <li key={t} className="tag">{t}</li>
                  ))}
                </ul>
              ) : null}
              {showRepoLink && (
                <a className="btn btn--accent" href={repoUrl} target="_blank" rel="noreferrer">{repoLabel}</a>
              )}
              {!showRepoLink && hasPrivateSource && <p className="muted">Código fuente privado.</p>}
            </div>
            <div className="modal__right">
              <button className="modal__arrow" onClick={next} aria-label="Siguiente">›</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
