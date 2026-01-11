import { useState } from 'react'
import { exportToPowerPoint, exportToPDF, exportToGoogleSlides, exportToFigma } from '../services/exportService'
import '../styles/ExportOptions.css'

function ExportOptions({ slides, templateFile, isOpen, onClose }) {
  const [exporting, setExporting] = useState(false)
  const [format, setFormat] = useState('pptx')
  const [showPreview, setShowPreview] = useState(false)
  const [previewSlide, setPreviewSlide] = useState(0)

  const exportFormats = [
    { id: 'pptx', name: 'PowerPoint', icon: 'slideshow', description: 'Archivo .pptx editable' },
    { id: 'pdf', name: 'PDF', icon: 'picture_as_pdf', description: 'Documento para compartir' },
    { id: 'google', name: 'Google Slides', icon: 'cloud_upload', description: 'Exportar e importar a Google' },
    { id: 'figma', name: 'Figma', icon: 'design_services', description: 'JSON para plugins de Figma' }
  ]

  const handleExport = async () => {
    setExporting(true)
    
    try {
      switch(format) {
        case 'pptx':
          await exportToPowerPoint(slides, templateFile)
          break
        case 'pdf':
          await exportToPDF(slides, templateFile)
          break
        case 'google':
          await exportToGoogleSlides(slides, templateFile)
          break
        case 'figma':
          await exportToFigma(slides)
          break
      }
      
      onClose()
    } catch (error) {
      alert('Error al exportar: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="export-overlay">
      <div className={`export-modal ${showPreview ? 'with-preview' : ''}`}>
        <div className="export-header">
          <h3>
            <span className="material-icons">file_download</span>
            Exportar Presentación
          </h3>
          <div className="header-actions">
            <button 
              type="button" 
              className={`preview-toggle ${showPreview ? 'active' : ''}`}
              onClick={() => setShowPreview(!showPreview)}
              title="Ver preview"
            >
              <span className="material-icons">visibility</span>
            </button>
            <button type="button" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        <div className="export-content">
          {/* Preview Panel */}
          {showPreview && (
            <div className="preview-panel">
              <div className="preview-slide">
                {slides[previewSlide]?.preview ? (
                  <img 
                    src={slides[previewSlide].preview} 
                    alt={`Slide ${previewSlide + 1}`}
                  />
                ) : (
                  <div className="preview-placeholder">
                    <span className="material-icons">image</span>
                    <p>Sin preview</p>
                  </div>
                )}
                <div className="preview-content-overlay">
                  <div className="content-title">
                    {slides[previewSlide]?.content?.title || 
                     slides[previewSlide]?.content?.heading || 
                     'Sin título'}
                  </div>
                  {slides[previewSlide]?.content?.bullets && (
                    <ul className="content-bullets">
                      {slides[previewSlide].content.bullets.slice(0, 3).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="preview-nav">
                <button 
                  type="button"
                  disabled={previewSlide === 0}
                  onClick={() => setPreviewSlide(p => p - 1)}
                >
                  <span className="material-icons">chevron_left</span>
                </button>
                <span>{previewSlide + 1} / {slides.length}</span>
                <button 
                  type="button"
                  disabled={previewSlide === slides.length - 1}
                  onClick={() => setPreviewSlide(p => p + 1)}
                >
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>
              <div className="preview-thumbnails">
                {slides.map((slide, idx) => (
                  <div 
                    key={idx}
                    className={`thumbnail ${idx === previewSlide ? 'active' : ''}`}
                    onClick={() => setPreviewSlide(idx)}
                  >
                    {slide.preview ? (
                      <img src={slide.preview} alt={`Slide ${idx + 1}`} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="export-options-panel">
            <div className="export-summary">
              <div className="summary-item">
                <span className="material-icons">slideshow</span>
                <span>{slides.length} slides</span>
              </div>
              {templateFile && (
                <div className="summary-item template-badge">
                  <span className="material-icons">check_circle</span>
                  <span>Con template corporativo</span>
                </div>
              )}
            </div>

            <div className="export-formats">
              {exportFormats.map(fmt => (
                <div 
                  key={fmt.id}
                  className={`format-option ${format === fmt.id ? 'selected' : ''}`}
                  onClick={() => setFormat(fmt.id)}
                >
                  <span className="material-icons format-icon">{fmt.icon}</span>
                  <div className="format-info">
                    <strong>{fmt.name}</strong>
                    <p>{fmt.description}</p>
                  </div>
                  {format === fmt.id && (
                    <span className="material-icons check-icon">check_circle</span>
                  )}
                </div>
              ))}
            </div>

            <button 
              type="button"
              className="export-btn"
              onClick={handleExport}
              disabled={exporting}
            >
              <span className="material-icons">
                {exporting ? 'hourglass_empty' : 'file_download'}
              </span>
              {exporting ? 'Exportando...' : `Exportar como ${exportFormats.find(f => f.id === format)?.name}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportOptions
