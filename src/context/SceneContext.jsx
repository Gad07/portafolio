import React, { createContext, useContext, useState, useEffect } from 'react'

const SceneContext = createContext({
  sceneMode: 'aquarium',
  setSceneMode: () => {},
  toggleSceneMode: () => {},
  zoomLevel: 1.0,
  setZoomLevel: () => {},
  zoomIn: () => {},
  zoomOut: () => {},
  resetZoom: () => {}
})

export function SceneProvider({ children }) {
  const [sceneMode, setSceneMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_scene_mode')
      if (saved === 'space' || saved === 'aquarium') return saved
    }
    return 'aquarium'
  })

  const [zoomLevel, setZoomLevel] = useState(1.0)

  useEffect(() => {
    localStorage.setItem('portfolio_scene_mode', sceneMode)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', sceneMode)
    }
  }, [sceneMode])

  const toggleSceneMode = () => {
    setSceneMode((prev) => (prev === 'aquarium' ? 'space' : 'aquarium'))
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(2.5, +(prev * 1.25).toFixed(2)))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(0.45, +(prev / 1.25).toFixed(2)))
  }

  const resetZoom = () => {
    setZoomLevel(1.0)
  }

  return (
    <SceneContext.Provider
      value={{
        sceneMode,
        setSceneMode,
        toggleSceneMode,
        zoomLevel,
        setZoomLevel,
        zoomIn,
        zoomOut,
        resetZoom
      }}
    >
      {children}
    </SceneContext.Provider>
  )
}

export function useScene() {
  return useContext(SceneContext)
}

