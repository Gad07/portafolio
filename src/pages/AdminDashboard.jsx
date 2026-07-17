import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [githubRepos, setGithubRepos] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    gallery: '',
    demo: '',
    repo: '',
    privateSource: false,
    tech: ''
  });

  // Constante con el nombre de usuario de github
  const GITHUB_USERNAME = 'Gad07';

  // Obtener proyectos actuales de Firebase
  async function fetchMyProjects() {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setMyProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoadingProjects(false);
    }
  }

  // Obtener repos de Github y filtrar los que ya están en Firebase
  async function fetchGithubRecommendations(existingProjects) {
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error('Error al obtener repositorios');
      
      const data = await res.json();
      
      // Filtros de recomendación: no ser fork y que no esté ya añadido (por html_url o nombre)
      const existingUrls = existingProjects.map(p => p.githubUrl || p.link || p.repo);
      
      const recommendations = data.filter(repo => {
        if (repo.fork) return false;
        if (existingUrls.includes(repo.html_url)) return false;
        return true;
      });

      setGithubRepos(recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingRepos(false);
    }
  }

  useEffect(() => {
    fetchMyProjects();
  }, []);

  // Una vez cargados los proyectos locales, buscar recomendaciones
  useEffect(() => {
    if (!loadingProjects) {
      fetchGithubRecommendations(myProjects);
    }
  }, [loadingProjects]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error("Error al cerrar sesión");
    }
  }

  function openAddModal(repo) {
    setEditingProjectId(null);
    setSelectedRepo(repo);
    setFormData({
      title: repo.name.replace(/-/g, ' ').toUpperCase(),
      description: repo.description || '',
      image: '',
      gallery: '',
      demo: repo.homepage || '',
      repo: repo.html_url,
      privateSource: repo.private,
      tech: repo.language || ''
    });
    setIsModalOpen(true);
  }

  function openEditModal(project) {
    setEditingProjectId(project.id);
    setSelectedRepo(null);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      image: project.image || '',
      gallery: project.gallery ? project.gallery.join(', ') : '',
      demo: project.demo || '',
      repo: project.repo || project.githubUrl || project.link || '',
      privateSource: project.privateSource || false,
      tech: project.tech ? project.tech.join(', ') : ''
    });
    setIsModalOpen(true);
  }

  async function handleDeleteProject(id) {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    
    try {
      await deleteDoc(doc(db, 'projects', id));
      setMyProjects(myProjects.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar proyecto", err);
      alert('Error al eliminar el proyecto');
    }
  }

  async function handleSaveProject(e) {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // 1. Sanitizar todos los datos para evitar cualquier undefined
      const projectData = {
        title: formData.title || '',
        description: formData.description || '',
        image: formData.image || '',
        gallery: (formData.gallery || '').split(',').map(s => s.trim()).filter(s => s),
        demo: formData.demo || '',
        repo: formData.repo || '',
        privateSource: Boolean(formData.privateSource),
        tech: (formData.tech || '').split(',').map(s => s.trim()).filter(s => s),
        link: formData.repo || '', 
        githubUrl: formData.repo || '' 
      };

      console.log("Datos a guardar:", projectData);
      
      // 2. Crear un timeout para que no se quede colgado
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000));
      
      if (editingProjectId) {
        console.log("Modo Edición - Actualizando documento...");
        await Promise.race([
          updateDoc(doc(db, 'projects', editingProjectId), projectData),
          timeout
        ]);
        setMyProjects(myProjects.map(p => p.id === editingProjectId ? { ...p, ...projectData } : p));
      } else {
        console.log("Modo Creación - Añadiendo documento...");
        projectData.createdAt = serverTimestamp();
        const docRef = await Promise.race([
          addDoc(collection(db, 'projects'), projectData),
          timeout
        ]);
        setMyProjects([...myProjects, { id: docRef.id, ...projectData }]);
        
        if (selectedRepo) {
          setGithubRepos(githubRepos.filter(r => r.id !== selectedRepo.id));
        }
      }
      
      console.log("Guardado con éxito");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al guardar proyecto:", err);
      if (err.message === 'Timeout') {
        alert('La conexión con Firebase tardó demasiado. Revisa tu internet o los permisos de la base de datos.');
      } else {
        alert('Error al guardar el proyecto: ' + err.message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="section" style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <div className="container">
        
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="section__title">Panel de <span className="accent-stroke">Administración</span></h2>
          <button onClick={handleLogout} className="btn btn--ghost">Cerrar Sesión</button>
        </div>
        
        <div className="bento-grid">
          
          {/* Columna Izquierda: Mis Proyectos */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Mis Proyectos ({myProjects.length})
            </h3>
            
            {loadingProjects ? <p className="muted">Cargando proyectos...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myProjects.map(proj => (
                  <div key={proj.id} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--text)' }}>{proj.title}</strong>
                      {proj.privateSource && <span className="chip" style={{ fontSize: '0.7rem' }}>Privado</span>}
                    </div>
                    <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{proj.description}</p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                      <button onClick={() => openEditModal(proj)} className="btn btn--ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Editar</button>
                      <button onClick={() => handleDeleteProject(proj.id)} className="btn btn--ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', color: '#ff6b6b', borderColor: 'rgba(255, 107, 107, 0.3)' }}>Eliminar</button>
                    </div>
                  </div>
                ))}
                {myProjects.length === 0 && <p className="muted">No hay proyectos configurados.</p>}
              </div>
            )}
          </div>

          {/* Columna Derecha: Recomendaciones */}
          <div className="glass-card bento-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Recomendaciones de GitHub (@{GITHUB_USERNAME})</h3>
              <span className="chip" style={{ fontSize: '0.8rem' }}>{githubRepos.length} repos</span>
            </div>

            {error && <p style={{ color: '#ff6b6b', background: 'rgba(255, 0, 0, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 0, 0, 0.2)' }}>{error}</p>}
            
            {loadingRepos ? <p className="muted">Analizando repositorios...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {githubRepos.map(repo => (
                  <div key={repo.id} style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{repo.name}</h4>
                    <p className="muted" style={{ fontSize: '0.85rem', flexGrow: 1, marginBottom: '1rem' }}>{repo.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="chip">{repo.language || 'Code'}</span>
                      <span className="muted" style={{ fontSize: '0.8rem' }}>⭐ {repo.stargazers_count}</span>
                    </div>
                    
                    <button 
                      onClick={() => openAddModal(repo)} 
                      className="btn btn--accent"
                      style={{ width: '100%', fontSize: '0.9rem', padding: '0.6rem' }}
                    >
                      + Configurar y Añadir
                    </button>
                  </div>
                ))}
                {githubRepos.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    <p className="muted">No hay nuevas recomendaciones por el momento.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>(Tal vez los repositorios no tienen descripción o ya están todos agregados)</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuración */}
      {isModalOpen && createPortal(
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card" style={{ zIndex: 10, width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Configurar Proyecto</h3>
            
            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Título</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>¿Código Privado?</label>
                  <select value={formData.privateSource} onChange={e => setFormData({...formData, privateSource: e.target.value === 'true'})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                    <option value="false">No (Público)</option>
                    <option value="true">Sí (Privado)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Descripción</label>
                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Tecnologías (separadas por coma)</label>
                <input value={formData.tech} onChange={e => setFormData({...formData, tech: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="React, Firebase, CSS..." />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>URL de Imagen Principal</label>
                <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Galería de Imágenes (URLs separadas por coma)</label>
                <textarea rows="2" value={formData.gallery} onChange={e => setFormData({...formData, gallery: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', resize: 'vertical' }} placeholder="https://img1.jpg, https://img2.jpg..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Sitio Web en Vivo (Demo)</label>
                  <input type="url" value={formData.demo} onChange={e => setFormData({...formData, demo: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="https://..." />
                </div>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>URL del Repositorio</label>
                  <input type="url" required={!formData.privateSource} value={formData.repo} onChange={e => setFormData({...formData, repo: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn--ghost" disabled={isSaving}>Cancelar</button>
                <button type="submit" className="btn btn--accent" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
