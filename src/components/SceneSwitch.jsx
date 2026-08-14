import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScene } from '../context/SceneContext.jsx'

export default function SceneSwitch() {
  const { sceneMode, setSceneMode } = useScene()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const isAquarium = sceneMode === 'aquarium'
  const isSpace = sceneMode === 'space'
  const isMusic = sceneMode === 'music'

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
    if (isAquarium) return '#38BDF8'
    if (isSpace) return '#F472B6'
    return '#A855F7'
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
      {/* Opción de menú en el Navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
          background: isOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
          border: 'none',
          padding: '0.5rem 1.05rem',
          borderRadius: '9999px',
          fontSize: '0.88rem',
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: '0.01em',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = '#FFFFFF'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
            e.currentTarget.style.background = 'transparent'
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Tema</span>
        <span style={{ fontSize: '0.68rem', color: getThemeColor(), fontWeight: 700, textTransform: 'uppercase' }}>
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
            opacity: 0.7
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
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              minWidth: '150px',
              background: 'rgba(11, 19, 38, 0.92)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
            role="menu"
          >
            {/* Opción 1: Acuario */}
            <button
              onClick={() => selectTheme('aquarium')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: isAquarium ? 600 : 400,
                color: isAquarium ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                background: isAquarium ? 'rgba(2, 132, 199, 0.3)' : 'transparent',
                borderLeft: isAquarium ? '3px solid #38BDF8' : '3px solid transparent',
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
              <span>Acuario</span>
              {isAquarium && <span style={{ color: '#38BDF8', fontSize: '0.8rem' }}>✓</span>}
            </button>

            {/* Opción 2: Cosmos */}
            <button
              onClick={() => selectTheme('space')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: isSpace ? 600 : 400,
                color: isSpace ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                background: isSpace ? 'rgba(219, 39, 119, 0.3)' : 'transparent',
                borderLeft: isSpace ? '3px solid #F472B6' : '3px solid transparent',
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
              <span>Cosmos</span>
              {isSpace && <span style={{ color: '#F472B6', fontSize: '0.8rem' }}>✓</span>}
            </button>

            {/* Opción 3: Música */}
            <button
              onClick={() => selectTheme('music')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.86rem',
                fontWeight: isMusic ? 600 : 400,
                color: isMusic ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                background: isMusic ? 'rgba(124, 58, 237, 0.3)' : 'transparent',
                borderLeft: isMusic ? '3px solid #A855F7' : '3px solid transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isMusic) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
              onMouseLeave={(e) => {
                if (!isMusic) e.currentTarget.style.background = 'transparent'
              }}
              role="menuitem"
            >
              <span>Música</span>
              {isMusic && <span style={{ color: '#A855F7', fontSize: '0.8rem' }}>✓</span>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
