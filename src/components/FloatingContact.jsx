import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiMail, FiCheck, FiX } from 'react-icons/fi'

export default function FloatingContact() {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopyEmail = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText('gadpalma7@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hola Gadiel, vi tu portafolio y me gustaría conversar sobre una oportunidad o proyecto.')
    window.open(`https://wa.me/527223659263?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.75rem',
        pointerEvents: 'auto'
      }}
    >
      {/* Toast de confirmación al copiar email */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            style={{
              background: 'rgba(10, 30, 60, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--accent, #00E5FF)',
              color: '#FFFFFF',
              padding: '0.6rem 1.1rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              boxShadow: '0 8px 30px rgba(0, 229, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiCheck style={{ color: '#34D399' }} size={16} />
            <span>¡gadpalma7@gmail.com copiado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opciones desplegadas */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(11, 25, 45, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 229, 255, 0.15)',
              minWidth: '220px'
            }}
          >
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.9rem',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(37, 211, 102, 0.15)',
                color: '#25D366',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.86rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)')}
            >
              <FiMessageCircle size={18} />
              <span>Chatear por WhatsApp</span>
            </button>

            {/* Copiar Email */}
            <button
              type="button"
              onClick={handleCopyEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.9rem',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(0, 229, 255, 0.12)',
                color: 'var(--accent, #00E5FF)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.86rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.22)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.12)')}
            >
              <FiMail size={18} />
              <span>Copiar Correo</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Principal Flotante */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-label="Contacto rápido"
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent, #00E5FF) 0%, var(--accent2, #38BDF8) 100%)',
          color: '#0A0F1D',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(0, 229, 255, 0.45)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 229, 255, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1.0)'
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 229, 255, 0.45)'
        }}
      >
        {expanded ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  )
}
