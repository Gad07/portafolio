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
  const [currentPage, setCurrentPage] = useState(1);
  const reposPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Full-Stack',
    accentColor: '#6366F1',
    image: '',
    gallery: '',
    demo: '',
    repo: '',
    privateSource: false,
    tech: ''
  });

  // Función para activar el gotero nativo del navegador (EyeDropper API)
  async function handleEyeDropper() {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setFormData(prev => ({ ...prev, accentColor: result.sRGBHex }));
        }
      } catch (e) {
        console.log("Gotero cancelado o no disponible:", e);
      }
    } else {
      alert("Gotero nativo: Haz clic en el selector de color tradicional o usa los colores recomendados.");
    }
  }

  // Función para extraer el color más vibrante de una imagen mediante Canvas
  async function autoExtractVibrantColor(imgUrl) {
    if (!imgUrl) return;
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imgUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);

          const imgData = ctx.getImageData(0, 0, 64, 64).data;
          let maxSaturation = -1;
          let bestHex = '#6366F1';

          for (let i = 0; i < imgData.length; i += 16) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a < 128) continue;
            const avg = (r + g + b) / 3;
            if (avg < 30 || avg > 235) continue;

            const max = Math.max(r, g, b) / 255;
            const min = Math.min(r, g, b) / 255;
            const l = (max + min) / 2;
            let s = 0;
            if (max !== min) {
              s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
            }

            if (s > maxSaturation) {
              maxSaturation = s;
              const toHex = (c) => c.toString(16).padStart(2, '0');
              bestHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            }
          }
          setFormData(prev => ({ ...prev, accentColor: bestHex }));
        } catch (e) {
          console.log("No se pudo extraer color por CORS o formato:", e);
        }
      };
    } catch (e) {
      console.log("Error al procesar imagen:", e);
    }
  }

  // Constante con el nombre de usuario de github
  const GITHUB_USERNAME = 'Gad07';

  // Obtener proyectos actuales de Firebase ordenados por posición
  async function fetchMyProjects() {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      // Ordenar por campo 'order' ascendente o por orden original
      projectsData.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setMyProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoadingProjects(false);
    }
  }

  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('github_token') || import.meta.env.VITE_GITHUB_TOKEN || '');
  const [showTokenInput, setShowTokenInput] = useState(false);

  function saveToken(token) {
    const cleanToken = token.trim();
    setGithubToken(cleanToken);
    if (cleanToken) {
      localStorage.setItem('github_token', cleanToken);
    } else {
      localStorage.removeItem('github_token');
    }
  }

  // Obtener repos de Github incluyendo públicos, privados, forks y colaborativos
  async function fetchGithubRecommendations(existingProjects, token = githubToken) {
    setLoadingRepos(true);
    setError('');
    try {
      let url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&sort=updated&per_page=100`;
      const headers = {};

      if (token) {
        url = `https://api.github.com/user/repos?type=all&sort=updated&per_page=100`;
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Token de GitHub no válido o sin permisos. Verifica el token ingresado.');
        }
        throw new Error('Error al obtener repositorios de GitHub.');
      }
      
      const data = await res.json();
      
      const existingUrls = existingProjects.map(p => (p.githubUrl || p.link || p.repo || '').toLowerCase().trim());
      
      const processedRepos = data.map(repo => {
        const repoUrl = (repo.html_url || '').toLowerCase().trim();
        const repoName = (repo.name || '').toLowerCase().trim();

        const existingProj = existingProjects.find(p => {
          const pUrl = (p.githubUrl || p.link || p.repo || '').toLowerCase().trim();
          return pUrl && (pUrl === repoUrl || pUrl.endsWith(`/${repoName}`));
        });

        return {
          ...repo,
          isAdded: Boolean(existingProj),
          existingProject: existingProj || null
        };
      });

      setGithubRepos(processedRepos);
      setCurrentPage(1);
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

  async function openAddModal(repo) {
    setEditingProjectId(null);
    setSelectedRepo(repo);

    // Detección inicial de tecnologías desde lenguaje principal y topics de GitHub
    const techList = [];
    if (repo.language) techList.push(repo.language);
    
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach(t => {
        const formatted = t.charAt(0).toUpperCase() + t.slice(1);
        if (!techList.some(item => item.toLowerCase() === t.toLowerCase())) {
          techList.push(formatted);
        }
      });
    }

    // Formatear título limpio en formato Title Case
    const formattedTitle = repo.name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());

    // Generar descripción profesional prellenada si no tiene en GitHub
    const defaultDescription = repo.description 
      ? repo.description 
      : `Plataforma y solución de software desarrollada en ${repo.language || 'tecnologías modernas'}, con enfoque en alto rendimiento, arquitectura escalable y excelente experiencia de usuario.`;

    // Auto-detectar categoría según lenguaje o topics
    let initialCategory = 'Full-Stack';
    const mainLang = (repo.language || '').toLowerCase();
    if (['swift', 'kotlin', 'dart', 'flutter'].includes(mainLang)) {
      initialCategory = 'Mobile';
    } else if (['html', 'css', 'scss', 'vue', 'svelte'].includes(mainLang)) {
      initialCategory = 'Frontend';
    } else if (['php', 'python', 'ruby', 'go', 'java', 'c#'].includes(mainLang)) {
      initialCategory = 'Backend';
    }

    const initialFormData = {
      title: formattedTitle,
      description: defaultDescription,
      category: initialCategory,
      accentColor: '#6366F1',
      image: '',
      gallery: '',
      demo: repo.homepage || '',
      repo: repo.html_url || repo.svn_url || '',
      privateSource: Boolean(repo.private),
      tech: techList.join(', ')
    };

    setFormData(initialFormData);
    setIsModalOpen(true);

    // Consultar lenguajes del repositorio desde la API de GitHub para auto-completar el stack completo
    if (repo.full_name) {
      try {
        const headers = {};
        if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`;
        const res = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, { headers });
        if (res.ok) {
          const languagesData = await res.json();
          const detectedLanguages = Object.keys(languagesData);
          
          detectedLanguages.forEach(lang => {
            if (!techList.some(item => item.toLowerCase() === lang.toLowerCase())) {
              techList.push(lang);
            }
          });

          setFormData(prev => ({
            ...prev,
            tech: techList.join(', ')
          }));
        }
      } catch (err) {
        console.log("No se pudieron consultar lenguajes adicionales:", err);
      }
    }
  }

  function openEditModal(project) {
    setEditingProjectId(project.id);
    setSelectedRepo(null);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      category: project.category || 'Full-Stack',
      accentColor: project.accentColor || '#6366F1',
      image: project.image || '',
      gallery: project.gallery ? project.gallery.join(', ') : '',
      demo: project.demo || '',
      repo: project.repo || project.githubUrl || project.link || '',
      privateSource: project.privateSource || false,
      tech: project.tech ? project.tech.join(', ') : ''
    });
    setIsModalOpen(true);
  }

  // Reordenar posición de proyectos (Subir / Bajar)
  async function moveProject(index, direction) {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= myProjects.length) return;

    const updatedProjects = [...myProjects];
    const itemCurrent = { ...updatedProjects[index] };
    const itemTarget = { ...updatedProjects[targetIndex] };

    const orderCurrent = itemCurrent.order ?? index;
    const orderTarget = itemTarget.order ?? targetIndex;

    itemCurrent.order = targetIndex;
    itemTarget.order = index;

    updatedProjects[index] = itemTarget;
    updatedProjects[targetIndex] = itemCurrent;

    setMyProjects(updatedProjects);

    try {
      await updateDoc(doc(db, 'projects', itemCurrent.id), { order: itemCurrent.order });
      await updateDoc(doc(db, 'projects', itemTarget.id), { order: itemTarget.order });
    } catch (err) {
      console.error("Error al actualizar posición del proyecto:", err);
    }
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
      const existingProj = editingProjectId ? myProjects.find(p => p.id === editingProjectId) : null;
      const currentOrder = existingProj ? (existingProj.order ?? 0) : myProjects.length;

      const projectData = {
        title: formData.title || '',
        description: formData.description || '',
        category: formData.category || 'Full-Stack',
        accentColor: formData.accentColor || '#6366F1',
        order: currentOrder,
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

  const totalPages = Math.ceil(githubRepos.length / reposPerPage) || 1;
  const startIndex = (currentPage - 1) * reposPerPage;
  const paginatedRepos = githubRepos.slice(startIndex, startIndex + reposPerPage);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Panel de Administración</h1>
            <p className="muted" style={{ fontSize: '0.9rem' }}>Gestiona tus casos de estudio y sincroniza proyectos desde GitHub.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="chip" style={{ fontSize: '0.85rem' }}>👤 {currentUser?.email}</span>
            <button onClick={handleLogout} className="btn btn--ghost" style={{ fontSize: '0.85rem' }}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Layout Bento: 2 Columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Columna Izquierda: Mis Proyectos */}
          <div className="glass-card bento-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Proyectos en Portafolio</h3>
              <button onClick={() => openEditModal({})} className="btn btn--accent" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                + Crear Nuevo
              </button>
            </div>

            {loadingProjects ? <p className="muted">Cargando proyectos...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {myProjects.map((proj, idx) => (
                  <div key={proj.id} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h4 style={{ color: 'var(--text)', fontSize: '1rem', margin: 0 }}>{proj.title}</h4>
                        <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.12)', color: '#A5B4FC', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                          {proj.category || 'Full-Stack'}
                        </span>
                        {proj.privateSource && (
                          <span className="chip" style={{ fontSize: '0.7rem' }}>Privado</span>
                        )}
                      </div>
                      <p className="muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{proj.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {/* Botones de Reordenar */}
                      <button 
                        onClick={() => moveProject(idx, 'up')} 
                        disabled={idx === 0}
                        className="btn btn--ghost" 
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', opacity: idx === 0 ? 0.4 : 1 }}
                        title="Subir posición"
                      >
                        ▲
                      </button>
                      <button 
                        onClick={() => moveProject(idx, 'down')} 
                        disabled={idx === myProjects.length - 1}
                        className="btn btn--ghost" 
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', opacity: idx === myProjects.length - 1 ? 0.4 : 1 }}
                        title="Bajar posición"
                      >
                        ▼
                      </button>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Recomendaciones de GitHub (@{GITHUB_USERNAME})</h3>
                <span className="chip" style={{ fontSize: '0.8rem' }}>{githubRepos.length} repos</span>
              </div>
              
              <button 
                onClick={() => setShowTokenInput(!showTokenInput)} 
                className="btn btn--ghost"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
              >
                {githubToken ? '🔑 Token Activo (Repos Privados Incluidos)' : '🔑 Incluir Repos Privados'}
              </button>
            </div>

            {showTokenInput && (
              <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>
                  Personal Access Token (PAT) de GitHub para cargar repositorios privados:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="password" 
                    value={githubToken} 
                    onChange={e => saveToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem' }}
                  />
                  <button 
                    onClick={() => fetchGithubRecommendations(myProjects)} 
                    className="btn btn--accent"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 1rem', whiteSpace: 'nowrap' }}
                  >
                    Actualizar
                  </button>
                </div>
                <span className="muted" style={{ fontSize: '0.78rem' }}>
                  Genera tu token en <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={{ color: '#818CF8' }}>GitHub Settings ➔ Developer Settings ➔ Personal Access Tokens</a> con permiso <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px' }}>repo</code>.
                </span>
              </div>
            )}

            {error && <p style={{ color: '#ff6b6b', background: 'rgba(255, 0, 0, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 0, 0, 0.2)' }}>{error}</p>}
            
            {loadingRepos ? <p className="muted">Analizando repositorios...</p> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {paginatedRepos.map(repo => (
                    <div key={repo.id} style={{ padding: '1.2rem', background: repo.isAdded ? 'rgba(255, 255, 255, 0.015)' : 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: repo.isAdded ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '0.5rem' }}>
                        <h4 style={{ color: repo.isAdded ? 'var(--muted)' : 'var(--text)', fontSize: '1.05rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</h4>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          {repo.private && (
                            <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                              🔒 Privado
                            </span>
                          )}
                          {repo.fork && (
                            <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.15)', color: '#A5B4FC', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                              Fork
                            </span>
                          )}
                          {repo.isAdded && (
                            <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                              ✓ En Portafolio
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="muted" style={{ fontSize: '0.85rem', flexGrow: 1, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {repo.description || 'Sin descripción en GitHub.'}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span className="chip">{repo.language || 'Code'}</span>
                        <span className="muted" style={{ fontSize: '0.8rem' }}>⭐ {repo.stargazers_count}</span>
                      </div>
                      
                      {repo.isAdded ? (
                        <button 
                          onClick={() => openEditModal(repo.existingProject)} 
                          className="btn btn--ghost"
                          style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem' }}
                        >
                          Editar en Portafolio
                        </button>
                      ) : (
                        <button 
                          onClick={() => openAddModal(repo)} 
                          className="btn btn--accent"
                          style={{ width: '100%', fontSize: '0.9rem', padding: '0.6rem' }}
                        >
                          + Configurar y Añadir
                        </button>
                      )}
                    </div>
                  ))}
                  {githubRepos.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                      <p className="muted">No hay nuevas recomendaciones por el momento.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>(Todos los repositorios ya han sido importados a tu portafolio)</p>
                    </div>
                  )}
                </div>

                {/* Paginación de 5 en 5 */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <span className="muted" style={{ fontSize: '0.85rem' }}>
                      Página {currentPage} de {totalPages} ({githubRepos.length} repositorios)
                    </span>
                    
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        ← Anterior
                      </button>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`btn ${page === currentPage ? 'btn--accent' : 'btn--ghost'}`}
                            style={{ 
                              padding: '0.35rem 0.65rem', 
                              fontSize: '0.8rem',
                              minWidth: '32px',
                              borderRadius: '6px'
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
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
                <div style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Categoría</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border)', color: '#f8fafc', outline: 'none' }}>
                    <option value="Full-Stack" style={{ background: '#0f172a', color: '#f8fafc' }}>Full-Stack</option>
                    <option value="Frontend" style={{ background: '#0f172a', color: '#f8fafc' }}>Frontend</option>
                    <option value="Backend" style={{ background: '#0f172a', color: '#f8fafc' }}>Backend</option>
                    <option value="Mobile" style={{ background: '#0f172a', color: '#f8fafc' }}>Mobile</option>
                    <option value="Otros" style={{ background: '#0f172a', color: '#f8fafc' }}>Otros</option>
                  </select>
                </div>
                <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>¿Código Privado?</label>
                  <select value={formData.privateSource} onChange={e => setFormData({...formData, privateSource: e.target.value === 'true'})} style={{ padding: '0.7rem', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border)', color: '#f8fafc', outline: 'none' }}>
                    <option value="false" style={{ background: '#0f172a', color: '#f8fafc' }}>No (Público)</option>
                    <option value="true" style={{ background: '#0f172a', color: '#f8fafc' }}>Sí (Privado)</option>
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

              {/* Selector y Recomendación de Color de Acento en Hover (Con Gotero e Imágenes) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 600 }}>Color de Acento en Hover</label>
                  
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      onClick={handleEyeDropper}
                      className="btn btn--accent"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      🧪 Activar Gotero
                    </button>

                    {(formData.image || formData.gallery) && (
                      <button 
                        type="button" 
                        onClick={() => autoExtractVibrantColor(formData.image || formData.gallery.split(',')[0].trim())}
                        className="btn btn--ghost"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', color: '#A5B4FC' }}
                      >
                        ✨ Auto-extraer
                      </button>
                    )}
                  </div>
                </div>

                {/* Previsualización de imágenes del proyecto para capturar color con el gotero */}
                {(formData.image || formData.gallery) && (
                  <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', padding: '0.3rem 0' }}>
                    {[formData.image, ...(formData.gallery ? formData.gallery.split(',') : [])]
                      .map(s => s ? s.trim() : '')
                      .filter(Boolean)
                      .map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', minWidth: '85px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#000' }}>
                          <img src={imgUrl} alt={`Vista previa ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))
                    }
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <input 
                    type="color" 
                    value={formData.accentColor} 
                    onChange={e => setFormData({...formData, accentColor: e.target.value})} 
                    style={{ width: '45px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }} 
                  />
                  <input 
                    type="text" 
                    value={formData.accentColor} 
                    onChange={e => setFormData({...formData, accentColor: e.target.value})} 
                    style={{ width: '100px', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.85rem' }} 
                  />

                  {/* Swatches de Colores Recomendados */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' }}>
                    {['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6', '#EF4444', '#EAB308'].map(colorHex => (
                      <button
                        key={colorHex}
                        type="button"
                        onClick={() => setFormData({...formData, accentColor: colorHex})}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: colorHex,
                          border: formData.accentColor === colorHex ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          transform: formData.accentColor === colorHex ? 'scale(1.25)' : 'scale(1)',
                          transition: 'all 0.2s ease'
                        }}
                        title={`Usar color ${colorHex}`}
                      />
                    ))}
                  </div>
                </div>
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
