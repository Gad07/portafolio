import { useEffect, useState } from 'react'
import ProjectCard from '../components/ProjectCard.jsx'
import projects from '../shared/projects.js'
import { GITHUB_USERNAME, USE_GITHUB_REPOS } from '../shared/config.js'

export default function Proyectos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If local JSON is preferred or GitHub fetching is disabled, avoid network fetch.
    // USE_GITHUB_REPOS can be toggled in src/shared/config.js
    if (!USE_GITHUB_REPOS) {
      setLoading(false)
      return
    }

    let cancelled = false
    async function load() {
      try {
        if (!GITHUB_USERNAME || GITHUB_USERNAME === 'TU_USUARIO_GITHUB') {
          if (!cancelled) {
            setItems([])
            setLoading(false)
          }
          return
        }
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=36&type=owner&sort=updated`, {
          headers: { 'Accept': 'application/vnd.github+json' },
        })
        if (!res.ok) throw new Error(`GitHub API ${res.status}`)
        const data = await res.json()
        const mapped = data
          .filter(r => !r.fork && !r.archived)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 12)
          .map(r => ({
            id: String(r.id),
            title: r.name,
            description: r.description || 'Sin descripción',
            tech: r.language ? [r.language] : [],
            repo: r.html_url,
            demo: r.homepage || '',
            year: new Date(r.updated_at).getFullYear(),
            image: r.owner?.avatar_url || '',
            gallery: r.owner?.avatar_url ? [r.owner.avatar_url] : [],
          }))
        if (!cancelled) setItems(mapped)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error cargando repos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const list = items.length ? items : projects

  return (
    <section className="section">
      <h2 className="section__title">Proyectos</h2>
      <p className="muted">Selección de trabajos y prototipos. Código limpio, enfoque en experiencia y rendimiento.</p>
      {loading && (<p className="muted">Cargando proyectos…</p>)}
      {error && (<p className="muted">{error}. Mostrando proyectos locales.</p>)}
      <div className="grid grid--cards">
        {list.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  )
}

