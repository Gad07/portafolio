import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ProjectCard from '../components/ProjectCard.jsx'
import { db } from '../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Proyectos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchProjects() {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(data);
    } catch (err) {
      console.error("Error al cargar proyectos desde Firebase:", err);
      // Fallback behavior if needed, currently just showing empty or error state
      setError("No se pudieron cargar los proyectos. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="projects-page">
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
          </div>
          {error && (<p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{error}</p>)}
        </motion.div>
      </div>

      <section className="container" style={{ paddingBottom: '8rem', paddingTop: '6rem' }}>
        <div className="editorial-list">
          {items.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
          {!loading && items.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>No hay proyectos para mostrar aún.</p>
          )}
        </div>
      </section>
    </div>
  )
}
