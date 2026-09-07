import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScene } from '../context/SceneContext.jsx'

export default function SceneSwitch() {
  const { sceneMode, setSceneMode } = useScene()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const isAquarium = sceneMode === 'aquarium'
  const isSpace = sceneMode === 'space'

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectTheme = (mode) => {
    setSceneMode(mode)
    setIsOpen(false)
  }

  const getThemeColor = () => {
    if (isAquarium) return '#00E5FF'
    return '#C084FC'
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        userSelect: 'none'
      }}
    >
      {/* Botón Tema en el Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          height: '34px',
          color: isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
          background: isOpen ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.06)',
          border: isOpen ? '1px solid var(--accent, #00E5FF)' : '1px solid rgba(255, 255, 255, 0.12)',
          padding: '0 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          whiteSpace: 'nowrap'
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Tema</span>
        <span style={{ fontSize: '0.68rem', color: getThemeColor(), fontWeight: 800 }}>
          •
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            opacity: 0.8
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Menú Desplegable flotante */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              left: 'auto',
              minWidth: '160px',
              background: 'rgba(9, 20, 42, 0.96)',
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 20px rgba(0, 229, 255, 0.15)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
            role="menu"
          >
            {/* Opción 1: Acuario */}
            <button
              type="button"
              onClick={() => selectTheme('aquarium')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                border: isAquarium ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isAquarium ? 700 : 500,
                color: isAquarium ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                background: isAquarium ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isAquarium) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
              onMouseLeave={(e) => {
                if (!isAquarium) e.currentTarget.style.background = 'transparent'
              }}
              role="menuitem"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E5FF', display: 'inline-block' }} />
                <span>Acuario</span>
              </div>
              {isAquarium && <span style={{ color: '#00E5FF', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>}
            </button>

            {/* Opción 2: Cosmos */}
            <button
              type="button"
              onClick={() => selectTheme('space')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                border: isSpace ? '1px solid rgba(192, 132, 252, 0.4)' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isSpace ? 700 : 500,
                color: isSpace ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                background: isSpace ? 'rgba(192, 132, 252, 0.22)' : 'transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isSpace) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
              onMouseLeave={(e) => {
                if (!isSpace) e.currentTarget.style.background = 'transparent'
              }}
              role="menuitem"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C084FC', display: 'inline-block' }} />
                <span>Cosmos</span>
              </div>
              {isSpace && <span style={{ color: '#C084FC', fontSize: '0.85rem', fontWeight: 800 }}>✓</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
