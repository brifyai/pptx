import { useState } from 'react'
import { structureTextToSlides } from '../services/aiService'
import '../styles/TextOnlyMode.css'

function TextOnlyMode({ onCreateSlides, onClose }) {
  const [rawText, setRawText] = useState('')
  const [numSlides, setNumSlides] = useState(5)
  const [processing, setProcessing] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleProcess = async () => {
    if (!rawText.trim()) return
    
    setProcessing(true)
    try {
      const structuredSlides = await structureTextToSlides(rawText, numSlides)
      setPreview(structuredSlides)
    } catch (error) {
      console.error('Error structuring text:', error)
      alert('Error al procesar el texto: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleApply = () => {
    if (preview) {
      onCreateSlides(preview)
      onClose()
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRawText(text)
    } catch (error) {
      console.error('Error reading clipboard:', error)
    }
  }

  const exampleText = `Transformación Digital en las Empresas

Introducción
La transformación digital es el proceso de integrar tecnología digital en todas las áreas de una empresa.
Cambia fundamentalmente cómo operan las organizaciones y entregan valor a sus clientes.

Beneficios Principales
- Mayor eficiencia operativa
- Mejor experiencia del cliente
- Nuevas oportunidades de negocio
- Reducción de costos a largo plazo

Desafíos Comunes
- Resistencia al cambio
- Falta de talento digital
- Integración de sistemas legacy
- Seguridad de datos

Conclusiones
La transformación digital no es opcional, es necesaria para la supervivencia empresarial.`

  return (
    <div className="text-only-overlay">
      <div className="text-only-modal">
        <div className="text-only-header">
          <h3>
            <span className="material-icons">text_fields</span>
            Modo Solo Texto
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {!preview ? (
          <div className="input-section">
            <p className="description">
              Pega cualquier texto y la IA lo estructurará automáticamente en diapositivas.
              Ideal para convertir documentos, notas o contenido de otras fuentes.
            </p>

            <div className="text-input-container">
              <div className="input-header">
                <label>Tu texto:</label>
                <div className="input-actions">
                  <button type="button" onClick={handlePaste} title="Pegar desde portapapeles">
                    <span className="material-icons">content_paste</span>
                    Pegar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRawText(exampleText)}
                    title="Cargar ejemplo"
                  >
                    <span className="material-icons">description</span>
                    Ejemplo
                  </button>
                </div>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Pega aquí tu texto, documento, notas, o cualquier contenido que quieras convertir en presentación..."
                rows={12}
              />
              <div className="char-count">
                {rawText.length} caracteres
              </div>
            </div>

            <div className="options-row">
              <div className="option-group">
                <label>Número de slides:</label>
                <div className="slide-count-selector">
                  {[3, 5, 7, 10].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={numSlides === num ? 'active' : ''}
                      onClick={() => setNumSlides(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="button"
              className="process-btn"
              onClick={handleProcess}
              disabled={!rawText.trim() || processing}
            >
              <span className="material-icons">
                {processing ? 'hourglass_empty' : 'auto_fix_high'}
              </span>
              {processing ? 'Procesando...' : 'Estructurar en Slides'}
            </button>

            <div className="tips">
              <h4>
                <span className="material-icons">tips_and_updates</span>
                Tips para mejores resultados:
              </h4>
              <ul>
                <li>Usa párrafos separados para diferentes secciones</li>
                <li>Incluye un título o tema principal al inicio</li>
                <li>Usa listas con guiones (-) o asteriscos (*) para bullets</li>
                <li>Separa ideas principales con líneas en blanco</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="preview-section">
            <div className="preview-header">
              <h4>
                <span className="material-icons">preview</span>
                Vista previa ({preview.length} slides)
              </h4>
              <button 
                type="button" 
                className="back-btn"
                onClick={() => setPreview(null)}
              >
                <span className="material-icons">arrow_back</span>
                Editar texto
              </button>
            </div>

            <div className="slides-preview">
              {preview.map((slide, index) => (
                <div key={index} className={`slide-preview-card ${slide.type}`}>
                  <div className="slide-number">{index + 1}</div>
                  <div className="slide-content-preview">
                    {slide.type === 'title' ? (
                      <>
                        <h5 className="preview-title">{slide.content?.title || ''}</h5>
                        {slide.content?.subtitle && (
                          <p className="preview-subtitle">{slide.content.subtitle}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <h5 className="preview-heading">{slide.content?.heading || ''}</h5>
                        {slide.content?.bullets && (
                          <ul className="preview-bullets">
                            {slide.content.bullets.slice(0, 4).map((bullet, i) => (
                              <li key={i}>{bullet}</li>
                            ))}
                            {slide.content.bullets.length > 4 && (
                              <li className="more">+{slide.content.bullets.length - 4} más</li>
                            )}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="preview-actions">
              <button 
                type="button"
                className="regenerate-btn"
                onClick={handleProcess}
                disabled={processing}
              >
                <span className="material-icons">refresh</span>
                Regenerar
              </button>
              <button 
                type="button"
                className="apply-btn"
                onClick={handleApply}
              >
                <span className="material-icons">check</span>
                Crear Presentación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextOnlyMode
