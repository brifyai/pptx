import { useState, useEffect } from 'react'
import '../styles/TemplateLibrary.css'

const STORAGE_KEY = 'ai_presentation_templates'

function TemplateLibrary({ onSelectTemplate, onClose, currentTemplateFile }) {
  const [templates, setTemplates] = useState([])
  const [saving, setSaving] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setTemplates(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const saveTemplates = (newTemplates) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates))
      setTemplates(newTemplates)
    } catch (error) {
      console.error('Error saving templates:', error)
    }
  }

  const handleSaveCurrentTemplate = async () => {
    if (!currentTemplateFile || !newTemplateName.trim()) return
    
    setSaving(true)
    try {
      // Convertir archivo a base64 para guardar en localStorage
      const base64 = await fileToBase64(currentTemplateFile)
      
      const newTemplate = {
        id: Date.now(),
        name: newTemplateName.trim(),
        fileName: currentTemplateFile.name,
        fileData: base64,
        fileSize: currentTemplateFile.size,
        savedAt: new Date().toISOString(),
        slideCount: 0 // Se actualizará al cargar
      }
      
      const updated = [...templates, newTemplate]
      saveTemplates(updated)
      setNewTemplateName('')
      setShowSaveForm(false)
    } catch (error) {
      alert('Error al guardar template: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSelectTemplate = async (template) => {
    try {
      // Convertir base64 de vuelta a File
      const file = base64ToFile(template.fileData, template.fileName)
      onSelectTemplate(file)
      onClose()
    } catch (error) {
      alert('Error al cargar template: ' + error.message)
    }
  }

  const handleDeleteTemplate = (templateId) => {
    if (!confirm('¿Eliminar este template de la biblioteca?')) return
    const updated = templates.filter(t => t.id !== templateId)
    saveTemplates(updated)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const base64ToFile = (base64, fileName) => {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], fileName, { type: mime })
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="template-library-overlay">
      <div className="template-library-modal">
        <div className="library-header">
          <h3>
            <span className="material-icons">folder_special</span>
            Biblioteca de Templates
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Guardar template actual */}
        {currentTemplateFile && (
          <div className="save-current-section">
            {!showSaveForm ? (
              <button 
                type="button" 
                className="save-current-btn"
                onClick={() => setShowSaveForm(true)}
              >
                <span className="material-icons">add</span>
                Guardar template actual en biblioteca
              </button>
            ) : (
              <div className="save-form">
                <input
                  type="text"
                  placeholder="Nombre del template (ej: Corporativo 2024)"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  autoFocus
                />
                <div className="save-form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowSaveForm(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    className="btn-save"
                    onClick={handleSaveCurrentTemplate}
                    disabled={saving || !newTemplateName.trim()}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de templates */}
        <div className="templates-list">
          {templates.length === 0 ? (
            <div className="empty-library">
              <span className="material-icons">inventory_2</span>
              <p>No hay templates guardados</p>
              <p className="hint">Sube un template y guárdalo aquí para reutilizarlo</p>
            </div>
          ) : (
            templates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-icon">
                  <span className="material-icons">slideshow</span>
                </div>
                <div className="template-info">
                  <h4>{template.name}</h4>
                  <p className="template-meta">
                    {template.fileName} • {formatFileSize(template.fileSize)}
                  </p>
                  <p className="template-date">
                    Guardado: {formatDate(template.savedAt)}
                  </p>
                </div>
                <div className="template-actions">
                  <button 
                    type="button"
                    className="btn-use"
                    onClick={() => handleSelectTemplate(template)}
                    title="Usar este template"
                  >
                    <span className="material-icons">play_arrow</span>
                    Usar
                  </button>
                  <button 
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Eliminar"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplateLibrary
