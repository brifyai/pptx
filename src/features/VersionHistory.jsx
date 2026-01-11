import { useState, useEffect } from 'react'
import '../styles/VersionHistory.css'

// Lazy loaded: Solo se carga cuando el usuario abre el panel de historial
function VersionHistory({ slides, onRestore }) {
  const [history, setHistory] = useState([])
  const [currentVersion, setCurrentVersion] = useState(0)

  useEffect(() => {
    // Guardar snapshot cada cambio
    const snapshot = {
      id: Date.now(),
      timestamp: new Date(),
      slides: JSON.parse(JSON.stringify(slides)),
      description: 'Cambios realizados'
    }
    
    setHistory(prev => [...prev, snapshot].slice(-20)) // Mantener últimas 20 versiones
    setCurrentVersion(history.length)
  }, [slides])

  const handleRestore = (version) => {
    onRestore(version.slides)
    setCurrentVersion(history.indexOf(version))
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return 'Hace un momento'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
    return date.toLocaleDateString()
  }

  return (
    <div className="version-history">
      <h3>
        <span className="material-icons">history</span>
        Historial de Versiones
      </h3>
      <div className="version-list">
        {history.slice().reverse().map((version, index) => (
          <div 
            key={version.id}
            className={`version-item ${index === currentVersion ? 'current' : ''}`}
          >
            <div className="version-info">
              <span className="version-time">{formatTime(version.timestamp)}</span>
              <span className="version-desc">{version.description}</span>
            </div>
            <button 
              className="restore-btn"
              onClick={() => handleRestore(version)}
            >
              <span className="material-icons">restore</span>
              Restaurar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VersionHistory
