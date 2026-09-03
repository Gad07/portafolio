import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ProjectCard from '../components/ProjectCard.jsx'
import Reveal from '../components/Reveal.jsx'
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
  const [activeCategory, setActiveCategory] = useState('Todos')

  const categories = ['Todos', 'Full-Stack', 'Frontend', 'Backend', 'Mobile']

  async function fetchProjects() {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordenar proyectos por campo 'order' ascendente
      data.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setItems(data);
    } catch (err) {
      console.error("Error al cargar proyectos desde Firebase:", err);
      setError("No se pudieron cargar los proyectos. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredItems = activeCategory === 'Todos'
    ? items
    : items.filter(p => (p.category || 'Full-Stack').toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="projects-page">
      <div className="projects-hero">
        <motion.div className="projects-hero__title-content" {...fadeUp(0.1)}>
          <h1 className="display-title projects-hero__title">
            Proyectos<br />
            <span className="accent-stroke">destacados.</span>
          </h1>
        </motion.div>

        <motion.div className="projects-hero__description" {...fadeUp(0.2)}>
          <p className="display-sub" style={{ textAlign: 'left' }}>
            Proyectos realizados para resolver necesidades reales con plataformas, herramientas y productos digitales enfocados en resultados.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {loading && (<p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Cargando ecosistema…</p>)}
          </div>
          {error && (<p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{error}</p>)}
        </motion.div>
      </div>

      <section className="container" style={{ paddingBottom: '8rem', paddingTop: '4rem' }}>
        {/* Pestañas de Filtrado por Categoría (Switches Estilizados) */}
        <Reveal y={20}>
          <div className="category-filter-bar">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            const count = cat === 'Todos' 
              ? items.length 
              : items.filter(p => (p.category || 'Full-Stack').toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeCategoryTab"
                    className="category-filter-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="category-filter-label">
                  {cat}
                  {count > 0 && <span className="category-filter-count">{count}</span>}
                </span>
              </button>
            );
          })}
          </div>
        </Reveal>

        <Reveal y={24} delay={0.05}>
          <div className="editorial-list">
            {filteredItems.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
            {!loading && filteredItems.length === 0 && (
              <p style={{ color: 'var(--muted)', padding: '2rem 0' }}>No hay proyectos disponibles en la categoría "{activeCategory}".</p>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  )
}
