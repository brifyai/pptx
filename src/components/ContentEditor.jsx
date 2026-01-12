import { useState, useEffect } from 'react'
import '../styles/ContentEditor.css'

/**
 * ContentEditor - Editor inline para modificar el contenido de un slide
 * Permite editar title, subtitle, heading, bullets
 */
function ContentEditor({ slide, onSave, onClose }) {
  const [content, setContent] = useState({
    title: '',
    subtitle: '',
    heading: '',
    bullets: []
  })

  useEffect(() => {
    if (slide?.content) {
      setContent({
        title: slide.content.title || '',
        subtitle: slide.content.subtitle || '',
        heading: slide.content.heading || '',
        bullets: slide.content.bullets || []
      })
    }
  }, [slide])

  const handleBulletChange = (index, value) => {
    const newBullets = [...content.bullets]
    newBullets[index] = value
    setContent({ ...content, bullets: newBullets })
  }

  const handleAddBullet = () => {
    setContent({ ...content, bullets: [...content.bullets, ''] })
  }

  const handleRemoveBullet = (index) => {
    const newBullets = content.bullets.filter((_, i) => i !== index)
    setContent({ ...content, bullets: newBullets })
  }

  const handleSave = () => {
    // Limpiar bullets vacíos
    const cleanedContent = {
      ...content,
      bullets: content.bullets.filter(b => b.trim() !== '')
    }
    onSave(cleanedContent)
  }

  const handleClear = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el contenido de esta lámina?')) {
      onSave({
        title: '',
        subtitle: '',
        heading: '',
        bullets: []
      })
    }
  }

  const slideType = slide?.type || 'content'
  const textAreas = slide?.layout?.textAreas || []

  // Determinar qué campos mostrar basado en textAreas
  const hasTitle = textAreas.some(a => a.type === 'title') || slideType === 'title'
  const hasSubtitle = textAreas.some(a => a.type === 'subtitle') || slideType === 'title'
  const hasHeading = textAreas.some(a => a.type === 'heading') || slideType === 'content'
  const hasBullets = textAreas.some(a => a.type === 'bullets' || a.type === 'body') || slideType === 'content'

  // Obtener límites de caracteres
  const getTitleLimit = () => textAreas.find(a => a.type === 'title')?.maxChars
  const getSubtitleLimit = () => textAreas.find(a => a.type === 'subtitle')?.maxChars
  const getHeadingLimit = () => textAreas.find(a => a.type === 'heading')?.maxChars
  const getBulletsLimit = () => textAreas.find(a => a.type === 'bullets' || a.type === 'body')?.maxChars

  return (
    <div className="content-editor-overlay" onClick={onClose}>
      <div className="content-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="content-editor-header">
          <h3>
            <span className="material-icons">edit</span>
            Editar Contenido - Lámina {slide?.id}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="content-editor-body">
          {/* Title */}
          {hasTitle && (
            <div className="editor-field">
              <label>
                Título
                {getTitleLimit() && (
                  <span className="char-count" data-over={content.title.length > getTitleLimit()}>
                    {content.title.length}/{getTitleLimit()}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                placeholder="Título principal..."
                maxLength={getTitleLimit() || undefined}
              />
            </div>
          )}

          {/* Subtitle */}
          {hasSubtitle && (
            <div className="editor-field">
              <label>
                Subtítulo
                {getSubtitleLimit() && (
                  <span className="char-count" data-over={content.subtitle.length > getSubtitleLimit()}>
                    {content.subtitle.length}/{getSubtitleLimit()}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                placeholder="Subtítulo..."
                maxLength={getSubtitleLimit() || undefined}
              />
            </div>
          )}

          {/* Heading */}
          {hasHeading && (
            <div className="editor-field">
              <label>
                Encabezado
                {getHeadingLimit() && (
                  <span className="char-count" data-over={content.heading.length > getHeadingLimit()}>
                    {content.heading.length}/{getHeadingLimit()}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={content.heading}
                onChange={(e) => setContent({ ...content, heading: e.target.value })}
                placeholder="Encabezado de la sección..."
                maxLength={getHeadingLimit() || undefined}
              />
            </div>
          )}

          {/* Bullets */}
          {hasBullets && (
            <div className="editor-field">
              <label>
                Puntos Clave
                {getBulletsLimit() && (
                  <span className="char-count-info">
                    Máx. {getBulletsLimit()} chars total
                  </span>
                )}
              </label>
              <div className="bullets-list">
                {content.bullets.map((bullet, index) => (
                  <div key={index} className="bullet-item">
                    <span className="bullet-number">{index + 1}</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(index, e.target.value)}
                      placeholder={`Punto ${index + 1}...`}
                    />
                    <button
                      type="button"
                      className="btn-icon-small"
                      onClick={() => handleRemoveBullet(index)}
                      title="Eliminar punto"
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add-bullet"
                  onClick={handleAddBullet}
                >
                  <span className="material-icons">add</span>
                  Agregar punto
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="editor-preview">
            <div className="preview-label">Vista Previa:</div>
            <div className="preview-content">
              {content.title && <div className="preview-title">{content.title}</div>}
              {content.subtitle && <div className="preview-subtitle">{content.subtitle}</div>}
              {content.heading && <div className="preview-heading">{content.heading}</div>}
              {content.bullets.length > 0 && (
                <div className="preview-bullets">
                  {content.bullets.filter(b => b.trim()).map((bullet, idx) => (
                    <div key={idx} className="preview-bullet">• {bullet}</div>
                  ))}
                </div>
              )}
              {!content.title && !content.subtitle && !content.heading && content.bullets.length === 0 && (
                <div className="preview-empty">Sin contenido</div>
              )}
            </div>
          </div>
        </div>

        <div className="content-editor-footer">
          <button
            type="button"
            className="btn-danger"
            onClick={handleClear}
          >
            <span className="material-icons">delete</span>
            Limpiar Todo
          </button>
          <div className="footer-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
            >
              <span className="material-icons">check</span>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentEditor
