import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ProjectCard from '../components/ProjectCard.jsx'
import projects from '../shared/projects.js'
import { GITHUB_USERNAME, USE_GITHUB_REPOS, GITHUB_TOKEN } from '../shared/config.js'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Proyectos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

  async function fetchAndMerge(cancelToken = { cancelled: false }) {
    try {
      if (!GITHUB_USERNAME || GITHUB_USERNAME === 'TU_USUARIO_GITHUB') {
        setItems([])
        setLoading(false)
        return
      }
      const headers = { 'Accept': 'application/vnd.github+json' }
      if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`

      // If we have a token, request authenticated repos (includes private and collaborations)
      const baseUrl = GITHUB_TOKEN ? `https://api.github.com/user/repos?per_page=100&sort=updated` : `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=36&type=owner&sort=updated`
      const res = await fetch(baseUrl, { headers })
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

      // Try to include repos where the user has public contributions (only when unauthenticated)
      try {
        if (!GITHUB_TOKEN) {
          const evRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`, { headers })
          if (evRes.ok) {
            const events = await evRes.json()
            const extraNames = new Set()
            events.forEach((ev) => {
              if (ev.repo?.name && ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(ev.type)) {
                extraNames.add(ev.repo.name)
              }
            })

            const existing = new Set(mapped.map(m => (m.title || '').toLowerCase()))
            const toFetch = Array.from(extraNames).filter(n => !existing.has(n.toLowerCase()))

            const extra = await Promise.all(toFetch.slice(0, 12).map(async (fullName) => {
              try {
                const rres = await fetch(`https://api.github.com/repos/${fullName}`, { headers })
                if (!rres.ok) return null
                const rd = await rres.json()
                if (rd.fork || rd.archived) return null
                return {
                  id: String(rd.id),
                  title: rd.name,
                  description: rd.description || 'Sin descripción',
                  tech: rd.language ? [rd.language] : [],
                  repo: rd.html_url,
                  demo: rd.homepage || '',
                  year: rd.updated_at ? new Date(rd.updated_at).getFullYear() : '',
                  image: rd.owner?.avatar_url || '',
                  gallery: rd.owner?.avatar_url ? [rd.owner.avatar_url] : [],
                }
              } catch (e) { return null }
            }))

            mapped.push(...extra.filter(Boolean))
          }
        }
      } catch (e) {
        // ignore events fetch errors, we already have owned/repos from authenticated request
      }

      // Merge fetched GitHub repos with local `projects` so local/private items are preserved.
      const combined = projects.map(p => ({ ...p }))

      mapped.forEach((r) => {
        const repoName = (r.title || '').toLowerCase()
        const localIndex = combined.findIndex((p) => {
          if (!p.repo) return false
          try {
            const parts = p.repo.split('/')
            const name = parts[parts.length - 1].toLowerCase()
            return name === repoName
          } catch (e) {
            return false
          }
        })

        if (localIndex >= 0) {
          const local = combined[localIndex]
          combined[localIndex] = {
            // prefer local title/description/tech when provided, but fill gaps from GitHub
            id: local.id || r.id,
            title: local.title || r.title,
            description: local.description || r.description,
            tech: (local.tech && local.tech.length) ? local.tech : r.tech,
            repo: local.repo || r.repo,
            demo: local.demo || r.demo,
            year: local.year || r.year,
            image: local.image || r.image,
            gallery: (local.gallery && local.gallery.length) ? local.gallery : r.gallery,
            privateSource: Boolean(local.privateSource),
          }
        } else {
          combined.push(r)
        }
      })

      if (!cancelToken.cancelled) {
        setItems(combined)
        setLastUpdated(new Date())
        setError(null)
      }
    } catch (e) {
      if (!cancelToken.cancelled) setError(e.message || 'Error cargando repos')
    } finally {
      if (!cancelToken.cancelled) setLoading(false)
    }
  }

  useEffect(() => {
    // If local JSON is preferred or GitHub fetching is disabled, avoid network fetch.
    // USE_GITHUB_REPOS can be toggled in src/shared/config.js
    if (!USE_GITHUB_REPOS) {
      setLoading(false)
      return
    }

    const cancelToken = { cancelled: false }

    // initial load
    setLoading(true)
    fetchAndMerge(cancelToken)

    // periodic refresh
    const id = setInterval(() => {
      fetchAndMerge(cancelToken)
    }, REFRESH_INTERVAL_MS)

    return () => {
      cancelToken.cancelled = true
      clearInterval(id)
    }
  }, [])

  const list = items.length ? items : projects

  function humanTime(d) {
    if (!d) return ''
    return new Date(d).toLocaleString()
  }

  return (
    <div className="projects-page">

      {/* ── Hero de Proyectos ── */}
      <div className="projects-hero">
        <motion.div {...fadeUp(0.1)} style={{ maxWidth: '800px' }}>
          <h1 className="display-title" style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', lineHeight: 1 }}>
            Casos de<br />
            <span className="accent-stroke">estudio.</span>
          </h1>
          <p className="display-sub" style={{ textAlign: 'left', marginTop: '1.5rem', marginBottom: '2rem' }}>
            Selección de plataformas, herramientas y prototipos. Código limpio y enfoque en la experiencia de usuario.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {loading && (<p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Cargando ecosistema…</p>)}
            {lastUpdated && <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Última actualización: {humanTime(lastUpdated)}</p>}
          </div>
          {error && (<p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{error}. Mostrando archivo local.</p>)}
        </motion.div>
      </div>

      {/* ── Listado Editorial de Proyectos (Opción C) ── */}
      <section className="container" style={{ paddingBottom: '8rem', paddingTop: '6rem' }}>
        <div className="editorial-list">
          {list.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
