import { useState } from 'react'
import { generateContentVariants } from '../services/aiService'
import '../styles/VariantGenerator.css'

function VariantGenerator({ slide, onApplyVariant, onClose }) {
  const [variants, setVariants] = useState([])
  const [generating, setGenerating] = useState(false)
  const [selectedParts, setSelectedParts] = useState({})
  const [combineMode, setCombineMode] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const currentContent = slide.content
      const generatedVariants = await generateContentVariants(currentContent, 3)
      setVariants(generatedVariants)
      
      // Inicializar selección con la primera variante
      setSelectedParts({
        title: 0,
        subtitle: 0,
        heading: 0,
        bullets: 0
      })
    } catch (error) {
      console.error('Error generating variants:', error)
      alert('Error al generar variantes: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectVariant = (index) => {
    if (!combineMode) {
      // Aplicar variante completa
      onApplyVariant(variants[index])
      onClose()
    }
  }

  const handleSelectPart = (part, variantIndex) => {
    setSelectedParts(prev => ({
      ...prev,
      [part]: variantIndex
    }))
  }

  const handleApplyCombined = () => {
    // Combinar partes seleccionadas de diferentes variantes
    const combined = {}
    
    Object.keys(selectedParts).forEach(part => {
      const variantIndex = selectedParts[part]
      if (variants[variantIndex] && variants[variantIndex][part]) {
        combined[part] = variants[variantIndex][part]
      }
    })
    
    onApplyVariant(combined)
    onClose()
  }

  const getPartPreview = (variant, part) => {
    if (!variant || !variant[part]) return null
    
    if (part === 'bullets' && Array.isArray(variant[part])) {
      return variant[part].slice(0, 2).join(' • ') + (variant[part].length > 2 ? '...' : '')
    }
    
    const text = variant[part]
    return text.length > 60 ? text.substring(0, 60) + '...' : text
  }

  return (
    <div className="variant-generator-overlay">
      <div className="variant-generator-modal">
        <div className="variant-header">
          <h3>
            <span className="material-icons">auto_awesome</span>
            Generador de Variantes
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="generate-section">
            <div className="current-content">
              <h4>Contenido actual:</h4>
              <div className="content-preview">
                {slide.content?.title && <p><strong>Título:</strong> {slide.content.title}</p>}
                {slide.content?.heading && <p><strong>Encabezado:</strong> {slide.content.heading}</p>}
                {slide.content?.bullets && (
                  <p><strong>Bullets:</strong> {slide.content.bullets.slice(0, 2).join(', ')}...</p>
                )}
              </div>
            </div>
            
            <button 
              type="button" 
              className="generate-btn"
              onClick={handleGenerate}
              disabled={generating}
            >
              <span className="material-icons">
                {generating ? 'hourglass_empty' : 'auto_fix_high'}
              </span>
              {generating ? 'Generando 3 variantes...' : 'Generar 3 Variantes'}
            </button>
            
            <p className="hint">
              La IA generará 3 versiones alternativas del contenido actual
            </p>
          </div>
        ) : (
          <div className="variants-section">
            <div className="mode-toggle">
              <button 
                type="button"
                className={!combineMode ? 'active' : ''}
                onClick={() => setCombineMode(false)}
              >
                <span className="material-icons">check_circle</span>
                Seleccionar completa
              </button>
              <button 
                type="button"
                className={combineMode ? 'active' : ''}
                onClick={() => setCombineMode(true)}
              >
                <span className="material-icons">merge</span>
                Combinar partes
              </button>
            </div>

            {!combineMode ? (
              // Modo selección completa
              <div className="variants-list">
                {variants.map((variant, index) => (
                  <div 
                    key={index} 
                    className="variant-card"
                    onClick={() => handleSelectVariant(index)}
                  >
                    <div className="variant-number">
                      <span>{index + 1}</span>
                    </div>
                    <div className="variant-content">
                      {variant.title && (
                        <div className="variant-part">
                          <span className="part-label">Título</span>
                          <p>{variant.title}</p>
                        </div>
                      )}
                      {variant.heading && (
                        <div className="variant-part">
                          <span className="part-label">Encabezado</span>
                          <p>{variant.heading}</p>
                        </div>
                      )}
                      {variant.bullets && (
                        <div className="variant-part">
                          <span className="part-label">Bullets</span>
                          <ul>
                            {variant.bullets.slice(0, 3).map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                            {variant.bullets.length > 3 && (
                              <li className="more">+{variant.bullets.length - 3} más</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button type="button" className="select-btn">
                      <span className="material-icons">check</span>
                      Usar esta
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Modo combinación
              <div className="combine-section">
                <p className="combine-hint">
                  Selecciona la mejor versión de cada parte:
                </p>
                
                {['title', 'heading', 'bullets'].map(part => {
                  const hasContent = variants.some(v => v[part])
                  if (!hasContent) return null
                  
                  return (
                    <div key={part} className="combine-part">
                      <h5>{part === 'title' ? 'Título' : part === 'heading' ? 'Encabezado' : 'Bullets'}</h5>
                      <div className="part-options">
                        {variants.map((variant, index) => (
                          <div 
                            key={index}
                            className={`part-option ${selectedParts[part] === index ? 'selected' : ''}`}
                            onClick={() => handleSelectPart(part, index)}
                          >
                            <div className="option-number">{index + 1}</div>
                            <p>{getPartPreview(variant, part) || '(vacío)'}</p>
                            {selectedParts[part] === index && (
                              <span className="material-icons check">check_circle</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                
                <button 
                  type="button" 
                  className="apply-combined-btn"
                  onClick={handleApplyCombined}
                >
                  <span className="material-icons">merge</span>
                  Aplicar Combinación
                </button>
              </div>
            )}
            
            <button 
              type="button" 
              className="regenerate-btn"
              onClick={handleGenerate}
              disabled={generating}
            >
              <span className="material-icons">refresh</span>
              Regenerar variantes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VariantGenerator
