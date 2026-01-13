import { Component } from 'react'

/**
 * Error Boundary específico para capturar errores en SlideViewer
 * Evita que la app crashee y muestra un mensaje amigable
 */
class SlideErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 SlideErrorBoundary capturó error:', error)
    console.error('📍 Component Stack:', errorInfo.componentStack)
    this.setState({ errorInfo })
    
    // Log detallado para debugging
    console.log('🔍 Props del componente padre:', this.props)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Forzar re-render
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
          borderRadius: '12px',
          border: '1px solid #fc8181',
          margin: '10px',
          textAlign: 'center'
        }}>
          <span className="material-icons" style={{ fontSize: '48px', color: '#e53e3e' }}>
            error_outline
          </span>
          <h3 style={{ color: '#c53030', margin: '10px 0' }}>
            Error al renderizar las láminas
          </h3>
          <p style={{ color: '#742a2a', fontSize: '14px', marginBottom: '15px' }}>
            Hubo un problema temporal. Haz clic en "Reintentar" para continuar.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>
              refresh
            </span>
            Reintentar
          </button>
          
          {/* Debug info en desarrollo */}
          {import.meta.env.DEV && (
            <details style={{ marginTop: '15px', textAlign: 'left', fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#718096' }}>
                Detalles técnicos (desarrollo)
              </summary>
              <pre style={{ 
                background: '#2d3748', 
                color: '#e2e8f0', 
                padding: '10px', 
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '200px',
                marginTop: '10px'
              }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default SlideErrorBoundary
