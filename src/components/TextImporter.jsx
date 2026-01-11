import { useState } from 'react'
import '../styles/TextImporter.css'

function TextImporter({ slides, onImport, onClose }) {
  const [rawText, setRawText] = useState('')
  const [parsedSlides, setParsedSlides] = useState([])
  const [step, setStep] = useState('input') // 'input' | 'preview' | 'mapping'

  const handleParseText = () => {
    if (!rawText.trim()) return
    
    // Parsear texto en slides
    const parsed = parseTextToSlides(rawText)
    setParsedSlides(parsed)
    setStep('preview')
  }

  const parseTextToSlides = (text) => {
    const slides = []
    
    // Detectar patrones comunes de estructura
    // Patrón 1: "Slide 1:", "Diapositiva 1:", etc.
    const slidePattern = /(?:slide|diapositiva|lámina)\s*(\d+)[:\s]*/gi
    
    // Patrón 2: Títulos con ## o ###
    const markdownPattern = /^#{1,3}\s+(.+)$/gm
    
    // Patrón 3: Líneas en mayúsculas como títulos
    const uppercasePattern = /^([A-ZÁÉÍÓÚÑ\s]{10,})$/gm
    
    // Intentar dividir por "Slide X:"
    let parts = text.split(slidePattern).filter(p => p.trim())
    
    if (parts.length > 1) {
      // Formato: Slide 1: contenido, Slide 2: contenido...
      for (let i = 0; i < parts.length; i += 2) {
        const content = parts[i + 1] || parts[i]
        if (content && content.trim()) {
          slides.push(parseSlideContent(content.trim()))
        }
      }
    } else {
      // Intentar dividir por líneas vacías dobles
      parts = text.split(/\n\s*\n\s*\n/)
      
      if (parts.length > 1) {
        parts.forEach(part => {
          if (part.trim()) {
            slides.push(parseSlideContent(part.trim()))
          }
        })
      } else {
        // Dividir por párrafos
        parts = text.split(/\n\s*\n/)
        
        // Agrupar: primer párrafo = título, resto = contenido
        if (parts.length >= 2) {
          // Primer slide: título
          slides.push({
            type: 'title',
            title: parts[0].trim(),
            subtitle: parts[1]?.trim() || ''
          })
          
          // Resto: slides de contenido
          for (let i = 2; i < parts.length; i++) {
            slides.push(parseSlideContent(parts[i].trim()))
          }
        } else {
          // Solo un bloque de texto
          slides.push(parseSlideContent(text.trim()))
        }
      }
    }
    
    return slides
  }

  const parseSlideContent = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)
    
    if (lines.length === 0) {
      return { type: 'content', heading: '', bullets: [] }
    }
    
    // Primera línea = heading
    const heading = lines[0].replace(/^[#\-\*•]+\s*/, '')
    
    // Resto = bullets
    const bullets = lines.slice(1).map(line => {
      // Limpiar marcadores de lista
      return line.replace(/^[\-\*•\d\.]+\s*/, '')
    }).filter(b => b)
    
    // Detectar si es slide de título
    if (bullets.length === 0 && heading.length < 100) {
      return {
        type: 'title',
        title: heading,
        subtitle: ''
      }
    }
    
    return {
      type: 'content',
      heading: heading,
      bullets: bullets
    }
  }

  const handleApplyImport = () => {
    // Mapear slides parseados a slides del template
    const updates = parsedSlides.map((parsed, index) => {
      if (index >= slides.length) return null
      
      return {
        slideIndex: index,
        slideId: slides[index].id,
        content: parsed.type === 'title' 
          ? { title: parsed.title, subtitle: parsed.subtitle }
          : { heading: parsed.heading, bullets: parsed.bullets }
      }
    }).filter(u => u !== null)
    
    onImport(updates)
    onClose()
  }

  return (
    <div className="text-importer-overlay">
      <div className="text-importer-modal">
        <div className="importer-header">
          <h3>
            <span className="material-icons">content_paste</span>
            Importar Texto
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {step === 'input' && (
          <div className="input-step">
            <div className="input-instructions">
              <span className="material-icons">info</span>
              <div>
                <p>Pega el texto generado por ChatGPT, Claude u otra IA</p>
                <p className="hint">El sistema detectará automáticamente la estructura de slides</p>
              </div>
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Ejemplo:

Slide 1: Introducción
Título de la presentación
Subtítulo o descripción

Slide 2: Objetivos
- Primer objetivo importante
- Segundo objetivo
- Tercer objetivo

Slide 3: Conclusiones
Resumen final
- Punto clave 1
- Punto clave 2`}
              rows={15}
            />

            <div className="input-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handleParseText}
                disabled={!rawText.trim()}
              >
                <span className="material-icons">auto_fix_high</span>
                Analizar Texto
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="preview-step">
            <div className="preview-header">
              <span className="material-icons">check_circle</span>
              <p>Se detectaron {parsedSlides.length} slides</p>
            </div>

            <div className="parsed-slides-list">
              {parsedSlides.map((slide, index) => (
                <div key={index} className="parsed-slide-card">
                  <div className="slide-number">
                    <span>{index + 1}</span>
                  </div>
                  <div className="slide-content-preview">
                    <div className="slide-type-badge">
                      {slide.type === 'title' ? 'Título' : 'Contenido'}
                    </div>
                    <h4>{slide.title || slide.heading || 'Sin título'}</h4>
                    {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
                    {slide.bullets && slide.bullets.length > 0 && (
                      <ul>
                        {slide.bullets.slice(0, 3).map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                        {slide.bullets.length > 3 && (
                          <li className="more">+{slide.bullets.length - 3} más...</li>
                        )}
                      </ul>
                    )}
                  </div>
                  {index < slides.length ? (
                    <div className="mapping-indicator success">
                      <span className="material-icons">arrow_forward</span>
                      <span>Lámina {index + 1}</span>
                    </div>
                  ) : (
                    <div className="mapping-indicator warning">
                      <span className="material-icons">warning</span>
                      <span>Sin destino</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {parsedSlides.length > slides.length && (
              <div className="warning-message">
                <span className="material-icons">warning</span>
                <p>
                  Hay más slides parseados ({parsedSlides.length}) que láminas en el template ({slides.length}).
                  Solo se importarán los primeros {slides.length}.
                </p>
              </div>
            )}

            <div className="preview-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep('input')}>
                <span className="material-icons">arrow_back</span>
                Volver
              </button>
              <button type="button" className="btn-primary" onClick={handleApplyImport}>
                <span className="material-icons">check</span>
                Aplicar a Template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextImporter
