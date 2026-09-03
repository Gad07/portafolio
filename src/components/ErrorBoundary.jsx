import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Reporte a consola en desarrollo (en producción podrías enviarlo a un servicio)
    if (import.meta.env.DEV) {
      console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--text, #e5e7eb)'
          }}
        >
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Algo salió mal</h2>
          <p style={{ color: 'var(--muted, #9ca3af)', maxWidth: '420px', margin: 0 }}>
            Ocurrió un error inesperado al mostrar esta sección. Recarga la página para continuar.
          </p>
          <button
            onClick={this.handleReload}
            className="btn btn--accent"
            style={{ marginTop: '0.5rem' }}
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
