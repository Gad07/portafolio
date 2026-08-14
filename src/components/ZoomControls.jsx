import React from 'react'
import { motion } from 'framer-motion'
import { useScene } from '../context/SceneContext.jsx'

export default function ZoomControls() {
  const { zoomLevel, zoomIn, zoomOut, resetZoom, sceneMode } = useScene()
  const isAquarium = sceneMode === 'aquarium'
  const percentage = Math.round(zoomLevel * 100)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '9999px',
        padding: '5px 8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        userSelect: 'none'
      }}
      role="group"
      aria-label="Controles de Zoom 3D"
    >
      {/* Botón Alejar (-) */}
      <button
        onClick={zoomOut}
        disabled={zoomLevel <= 0.46}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#FFFFFF',
          fontSize: '1.2rem',
          fontWeight: 700,
          cursor: zoomLevel <= 0.46 ? 'not-allowed' : 'pointer',
          opacity: zoomLevel <= 0.46 ? 0.35 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="Alejar cámara (Zoom Out)"
      >
        −
      </button>

      {/* Indicador de porcentaje / Reset */}
      <button
        onClick={resetZoom}
        style={{
          background: 'transparent',
          border: 'none',
          color: isAquarium ? '#38BDF8' : '#EC4899',
          fontSize: '0.82rem',
          fontWeight: 700,
          padding: '0 6px',
          cursor: 'pointer',
          minWidth: '46px',
          textAlign: 'center',
          outline: 'none',
          letterSpacing: '0.5px'
        }}
        title="Restablecer Zoom a 100%"
      >
        {percentage}%
      </button>

      {/* Botón Acercar (+) */}
      <button
        onClick={zoomIn}
        disabled={zoomLevel >= 2.45}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#FFFFFF',
          fontSize: '1.2rem',
          fontWeight: 700,
          cursor: zoomLevel >= 2.45 ? 'not-allowed' : 'pointer',
          opacity: zoomLevel >= 2.45 ? 0.35 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        title="Acercar cámara (Zoom In)"
      >
        +
      </button>
    </div>
  )
}
