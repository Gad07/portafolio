import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
};

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGithub } = useAuth();
  const navigate = useNavigate();

  async function handleGithubLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGithub();
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con GitHub.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
      <motion.div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem' }} {...fadeUp}>
        <h2 className="section__title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin <span className="accent-stroke">Login</span></h2>
        
        {error && <div style={{ color: '#ff6b6b', background: 'rgba(255, 0, 0, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(255, 0, 0, 0.2)' }}>{error}</div>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: '0.95rem' }}>
            Acceso restringido. Solo el administrador puede entrar conectando su cuenta de GitHub.
          </p>
          
          <button 
            disabled={loading} 
            onClick={handleGithubLogin} 
            className="btn btn--accent" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {/* GitHub SVG Icon */}
            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            {loading ? 'Conectando...' : 'Iniciar Sesión con GitHub'}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
