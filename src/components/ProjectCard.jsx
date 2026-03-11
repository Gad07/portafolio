import { useState, useEffect } from 'react'

export default function ProjectCard({ project }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const openGallery = (i = 0) => {
    setIndex(i)
    setOpen(true)
  }

  const next = () => setIndex((i) => (i + 1) % (project.gallery?.length || 1))
  const prev = () => setIndex((i) => (i - 1 + (project.gallery?.length || 1)) % (project.gallery?.length || 1))

  const repoUrl = project.repo && project.repo !== '#' ? project.repo : null
  const isGitHub = repoUrl && repoUrl.includes('github.com')
  const repoLabel = isGitHub ? 'Ver en GitHub' : 'Ver proyecto'
  const hasPrivateSource = Boolean(project.privateSource)

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
      <article className="card project-card">
        <div className="card__head">
          <h3 className="card__title">{project.title}</h3>
          {project.year && <span className="chip">{project.year}</span>}
        </div>

        {project.image && (
          <div className="project-thumb" role="img" aria-label={project.title} onClick={() => openGallery(0)}>
            <img src={project.image} alt={project.title} />
          </div>
        )}

        <p className="muted">{project.description}</p>

        {project.tech?.length ? (
          <ul className="tags" aria-label="Tecnologías usadas">
            {project.tech.map((t) => (
              <li key={t} className="tag">{t}</li>
            ))}
          </ul>
        ) : null}

        <div className="card__actions">
          <button className="btn btn--ghost btn--details" onClick={() => openGallery(0)}>Ver detalle</button>
          {project.demo && (
            <a className="btn btn--ghost" href={project.demo} target="_blank" rel="noreferrer">Ir a sitio</a>
          )}
          {repoUrl && (
            <a className="btn btn--accent" href={repoUrl} target="_blank" rel="noreferrer">{repoLabel}</a>
          )}
          {!repoUrl && hasPrivateSource && <span className="chip">Código fuente privado</span>}
        </div>
      </article>

      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={`Galería - ${project.title}`}>
          <div className="modal__backdrop" onClick={() => setOpen(false)} />
          <div className="modal__content">
            <button className="modal__close" onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
            <div className="modal__left">
              <button className="modal__arrow" onClick={prev} aria-label="Anterior">‹</button>
            </div>
            <div className="modal__gallery">
              {project.gallery && project.gallery.length ? (
                <img src={project.gallery[index]} alt={`${project.title} ${index + 1}`} />
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
              {repoUrl && (
                <a className="btn btn--accent" href={repoUrl} target="_blank" rel="noreferrer">{repoLabel}</a>
              )}
              {!repoUrl && hasPrivateSource && <p className="muted">Código fuente privado.</p>}
            </div>
            <div className="modal__right">
              <button className="modal__arrow" onClick={next} aria-label="Siguiente">›</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
