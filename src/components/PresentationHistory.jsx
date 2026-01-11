import { useState, useEffect } from 'react'
import '../styles/PresentationHistory.css'

const HISTORY_KEY = 'ai_presentation_history'
const MAX_HISTORY = 20

function PresentationHistory({ onLoad, onClose, currentSlides, currentTemplate }) {
  const [presentations, setPresentations] = useState([])
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'recent' | 'favorites'

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        setPresentations(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const saveHistory = (newHistory) => {
    try {
      // Limitar a MAX_HISTORY presentaciones
      const limited = newHistory.slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(limited))
      setPresentations(limited)
    } catch (error) {
      console.error('Error saving history:', error)
      alert('Error al guardar. El almacenamiento puede estar lleno.')
    }
  }

  const handleSaveCurrent = () => {
    if (!currentSlides || currentSlides.length === 0) {
      alert('No hay presentación para guardar')
      return
    }
    
    if (!newName.trim()) return

    setSaving(true)
    try {
      const presentation = {
        id: Date.now(),
        name: newName.trim(),
        slides: currentSlides.map(s => ({
          id: s.id,
          type: s.type,
          content: s.content,
          preview: s.preview
        })),
        templateName: currentTemplate?.fileName || 'Sin template',
        slideCount: currentSlides.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false
      }

      const updated = [presentation, ...presentations]
      saveHistory(updated)
      setNewName('')
      setShowSaveForm(false)
    } catch (error) {
      alert('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = (presentation) => {
    if (confirm(`¿Cargar "${presentation.name}"? Se reemplazará la presentación actual.`)) {
      onLoad(presentation)
      onClose()
    }
  }

  const handleDuplicate = (presentation) => {
    const duplicate = {
      ...presentation,
      id: Date.now(),
      name: `${presentation.name} (copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [duplicate, ...presentations]
    saveHistory(updated)
  }

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar esta presentación del historial?')) return
    const updated = presentations.filter(p => p.id !== id)
    saveHistory(updated)
  }

  const handleToggleFavorite = (id) => {
    const updated = presentations.map(p => 
      p.id === id ? { ...p, favorite: !p.favorite } : p
    )
    saveHistory(updated)
  }

  const handleRename = (id, newName) => {
    const updated = presentations.map(p => 
      p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
    )
    saveHistory(updated)
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date
    
    // Menos de 1 hora
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `Hace ${mins} min`
    }
    // Menos de 24 horas
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `Hace ${hours}h`
    }
    // Menos de 7 días
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `Hace ${days} días`
    }
    // Más de 7 días
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }

  const filteredPresentations = presentations.filter(p => {
    if (filter === 'favorites') return p.favorite
    if (filter === 'recent') {
      const weekAgo = Date.now() - 604800000
      return new Date(p.updatedAt).getTime() > weekAgo
    }
    return true
  })

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h3>
            <span className="material-icons">history</span>
            Historial de Presentaciones
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Save current */}
        {currentSlides && currentSlides.length > 0 && (
          <div className="save-current-section">
            {!showSaveForm ? (
              <button 
                type="button" 
                className="save-current-btn"
                onClick={() => setShowSaveForm(true)}
              >
                <span className="material-icons">save</span>
                Guardar presentación actual
              </button>
            ) : (
              <div className="save-form">
                <input
                  type="text"
                  placeholder="Nombre de la presentación"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrent()}
                />
                <div className="save-form-actions">
                  <button type="button" onClick={() => setShowSaveForm(false)}>
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn-save"
                    onClick={handleSaveCurrent}
                    disabled={saving || !newName.trim()}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="history-filters">
          <button 
            type="button"
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todas ({presentations.length})
          </button>
          <button 
            type="button"
            className={filter === 'recent' ? 'active' : ''}
            onClick={() => setFilter('recent')}
          >
            Recientes
          </button>
          <button 
            type="button"
            className={filter === 'favorites' ? 'active' : ''}
            onClick={() => setFilter('favorites')}
          >
            <span className="material-icons">star</span>
            Favoritas
          </button>
        </div>

        {/* List */}
        <div className="history-list">
          {filteredPresentations.length === 0 ? (
            <div className="empty-history">
              <span className="material-icons">folder_open</span>
              <p>No hay presentaciones guardadas</p>
              <p className="hint">Guarda tu trabajo para acceder después</p>
            </div>
          ) : (
            filteredPresentations.map(pres => (
              <PresentationCard
                key={pres.id}
                presentation={pres}
                onLoad={() => handleLoad(pres)}
                onDuplicate={() => handleDuplicate(pres)}
                onDelete={() => handleDelete(pres.id)}
                onToggleFavorite={() => handleToggleFavorite(pres.id)}
                onRename={(name) => handleRename(pres.id, name)}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PresentationCard({ presentation, onLoad, onDuplicate, onDelete, onToggleFavorite, onRename, formatDate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(presentation.name)

  const handleSaveRename = () => {
    if (editName.trim() && editName !== presentation.name) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className="presentation-card">
      <div className="card-preview">
        {presentation.slides[0]?.preview ? (
          <img src={presentation.slides[0].preview} alt="Preview" />
        ) : (
          <div className="no-preview">
            <span className="material-icons">slideshow</span>
          </div>
        )}
        <div className="slide-count">{presentation.slideCount} slides</div>
      </div>

      <div className="card-info">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
            autoFocus
            className="rename-input"
          />
        ) : (
          <h4 onClick={() => setIsEditing(true)} title="Click para renombrar">
            {presentation.name}
          </h4>
        )}
        <p className="template-name">{presentation.templateName}</p>
        <p className="date">{formatDate(presentation.updatedAt)}</p>
      </div>

      <div className="card-actions">
        <button 
          type="button" 
          className={`btn-favorite ${presentation.favorite ? 'active' : ''}`}
          onClick={onToggleFavorite}
          title={presentation.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <span className="material-icons">
            {presentation.favorite ? 'star' : 'star_border'}
          </span>
        </button>
        <button type="button" onClick={onLoad} title="Cargar">
          <span className="material-icons">folder_open</span>
        </button>
        <button type="button" onClick={onDuplicate} title="Duplicar">
          <span className="material-icons">content_copy</span>
        </button>
        <button type="button" className="btn-delete" onClick={onDelete} title="Eliminar">
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  )
}

export default PresentationHistory
