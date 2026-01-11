import { useState } from 'react'
import '../styles/ContentImporter.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function ContentImporter({ slides, onImport, onClose }) {
  const [importing, setImporting] = useState(false)
  const [extractedContent, setExtractedContent] = useState(null)
  const [mapping, setMapping] = useState([])

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${BACKEND_URL}/api/extract-content`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al extraer contenido')
      }

      const data = await response.json()
      setExtractedContent(data)

      // Crear mapeo automático inicial
      const autoMapping = data.slides.map((sourceSlide, index) => ({
        sourceIndex: index,
        targetIndex: index < slides.length ? index : -1,
        sourceSlide,
        confirmed: false
      }))

      setMapping(autoMapping)
    } catch (error) {
      alert('Error al importar: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  const handleMappingChange = (sourceIndex, newTargetIndex) => {
    setMapping(prev => prev.map(m =>
      m.sourceIndex === sourceIndex
        ? { ...m, targetIndex: parseInt(newTargetIndex) }
        : m
    ))
  }

  const handleApplyMapping = () => {
    const updates = []

    mapping.forEach(map => {
      if (map.targetIndex >= 0 && map.targetIndex < slides.length) {
        const sourceSlide = map.sourceSlide
        const targetSlide = slides[map.targetIndex]
        
        // Construir contenido desde los textos extraídos
        const newContent = {}
        
        sourceSlide.texts.forEach(text => {
          if (text.type === 'title') {
            newContent.title = text.content
          } else if (text.type === 'subtitle') {
            newContent.subtitle = text.content
          } else if (text.type === 'bullets') {
            newContent.bullets = text.content
          } else if (text.type === 'body') {
            // Si es texto de cuerpo, intentar detectar si son bullets
            if (Array.isArray(text.content)) {
              newContent.bullets = text.content
            } else {
              newContent.heading = text.content
            }
          }
        })

        updates.push({
          slideIndex: map.targetIndex,
          slideId: targetSlide.id,
          content: newContent
        })
      }
    })

    onImport(updates)
    onClose()
  }

  const getSlidePreview = (slideData) => {
    const texts = slideData.texts || []
    if (texts.length === 0) return 'Slide vacío'
    
    const firstText = texts[0]
    if (firstText.type === 'title') {
      return firstText.content
    } else if (firstText.type === 'bullets' && Array.isArray(firstText.content)) {
      return firstText.content[0] || 'Bullets'
    }
    return firstText.content || 'Contenido'
  }

  return (
    <div className="content-importer-overlay">
      <div className="content-importer-modal">
        <div className="importer-header">
          <h3>
            <span className="material-icons">file_upload</span>
            Importar Contenido desde PPTX
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {!extractedContent ? (
          <div className="importer-upload">
            <div className="upload-instructions">
              <span className="material-icons">info</span>
              <p>Sube un PPTX generado por Gemini, GPT u otra IA</p>
              <p className="small">El contenido se extraerá y mapeará a tu template</p>
            </div>

            <input
              type="file"
              accept=".pptx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="content-file-input"
              disabled={importing}
            />
            <label htmlFor="content-file-input">
              <button
                type="button"
                className="upload-content-btn"
                onClick={() => document.getElementById('content-file-input').click()}
                disabled={importing}
              >
                <span className="material-icons">
                  {importing ? 'hourglass_empty' : 'upload_file'}
                </span>
                {importing ? 'Extrayendo contenido...' : 'Seleccionar PPTX'}
              </button>
            </label>
          </div>
        ) : (
          <div className="importer-mapping">
            <div className="mapping-info">
              <span className="material-icons">info</span>
              <p>
                Se encontraron {extractedContent.slideCount} slides. 
                Mapea el contenido a tu template:
              </p>
            </div>

            <div className="mapping-list">
              {mapping.map((map, idx) => (
                <div key={idx} className="mapping-item">
                  <div className="source-slide">
                    <div className="slide-label">Slide {map.sourceIndex + 1}</div>
                    <div className="slide-preview">
                      {getSlidePreview(map.sourceSlide)}
                    </div>
                  </div>

                  <span className="material-icons mapping-arrow">arrow_forward</span>

                  <div className="target-slide">
                    <select
                      value={map.targetIndex}
                      onChange={(e) => handleMappingChange(map.sourceIndex, e.target.value)}
                      className="target-select"
                    >
                      <option value="-1">No mapear</option>
                      {slides.map((slide, index) => (
                        <option key={index} value={index}>
                          Lámina {index + 1} ({slide.type === 'title' ? 'Título' : 'Contenido'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="importer-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setExtractedContent(null)
                  setMapping([])
                }}
              >
                <span className="material-icons">arrow_back</span>
                Cambiar archivo
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyMapping}
              >
                <span className="material-icons">check</span>
                Aplicar Contenido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentImporter
