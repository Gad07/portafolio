import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { SceneProvider } from './context/SceneContext.jsx'

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('GLOBAL ERROR:', e.error || e.message)
    let d = document.getElementById('debug-banner')
    if (!d) {
      d = document.createElement('div')
      d.id = 'debug-banner'
      d.style.cssText = 'position:fixed;bottom:0;left:0;background:red;color:white;z-index:99999;font-size:12px;padding:8px;max-width:100vw;word-break:break-all;'
      document.body.appendChild(d)
    }
    d.textContent = 'ERROR: ' + (e.error ? (e.error.stack || e.error.message) : e.message)
  })
  window.addEventListener('unhandledrejection', (e) => {
    console.error('UNHANDLED PROMISE:', e.reason)
    let d = document.getElementById('debug-banner')
    if (!d) {
      d = document.createElement('div')
      d.id = 'debug-banner'
      d.style.cssText = 'position:fixed;bottom:0;left:0;background:darkred;color:white;z-index:99999;font-size:12px;padding:8px;max-width:100vw;word-break:break-all;'
      document.body.appendChild(d)
    }
    d.textContent = 'PROMISE ERROR: ' + (e.reason ? (e.reason.stack || e.reason.message || String(e.reason)) : 'unknown')
  })
}

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SceneProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SceneProvider>
    </AuthProvider>
  </React.StrictMode>
)

