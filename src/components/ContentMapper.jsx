import { useState, useEffect } from 'react'
import { analyzeMultipleSlides, mapContentToVisualAreas } from '../services/geminiVisionService'
import '../styles/ContentMapper.css'

function ContentMapper({ slides, aiGeneratedContent, onApplyMapping, onClose }) {
  const [mappings, setMappings] = useState([])
  const [selectedSlide, setSelectedSlide] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (aiGeneratedContent) {
      analyzeAndMapContent()
    }
  }, [aiGeneratedContent, slides])

  const analyzeAndMapContent = async () => {
    setIsAnalyzing(true)
    try {
      console.log('🎨 Analizando diseño visual de slides...')
      
      // Primero intentar usar el análisis del backend (coordenadas exactas)
      const hasBackendAnalysis = slides.some(s => s.layout?.textAreas?.length > 0)
      
      if (hasBackendAnalysis) {
        console.log('✅ Usando análisis del backend (coordenadas exactas)')
        
        const newMappings = slides.map((slide, index) => {
          const suggestedContent = aiGeneratedContent[index] || {}
          const textAreas = slide.layout?.textAreas || []
          
          // Mapear contenido usando coordenadas exactas del análisis
          const areas = mapContentToExactAreas(suggestedContent, textAreas)
          
          return {
            slideIndex: index,
            slideType: slide.type,
            areas: areas,
            preview: slide.preview,
            textAreas: textAreas // Guardar áreas originales para referencia
          }
        })
        
        setMappings(newMappings)
        console.log('✅ Mapeo con coordenadas exactas completado:', newMappings)
      } else {
        // Fallback: usar Gemini Vision
        console.log('🔍 Usando Gemini Vision para análisis visual...')
        const visualAnalyses = await analyzeMultipleSlides(slides)
        
        const newMappings = slides.map((slide, index) => {
          const suggestedContent = aiGeneratedContent[index] || {}
          const visualAnalysis = visualAnalyses[index]
          const mapping = mapContentToVisualAreas(suggestedContent, visualAnalysis)
          
          return {
            slideIndex: index,
            slideType: slide.type,
            areas: mapping.areas,
            preview: slide.preview,
            colorScheme: mapping.colorScheme,
            spacing: mapping.spacing,
            style: mapping.style
          }
        })
        
        setMappings(newMappings)
      }
    } catch (error) {
      console.error('Error analizando contenido:', error)
      // Fallback: usar mapeo simple
      const fallbackMappings = slides.map((slide, index) => ({
        slideIndex: index,
        slideType: slide.type,
        areas: [{
          areaId: 'default',
          areaType: 'title',
          content: aiGeneratedContent[index]?.title || '',
          position: { x: 10, y: 15, width: 80, height: 15 },
          formatting: { font: 'Arial', size: 44, color: '#000000' },
          maxChars: 100
        }],
        preview: slide.preview
      }))
      setMappings(fallbackMappings)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Mapear contenido usando coordenadas exactas del análisis del backend
  const mapContentToExactAreas = (content, textAreas) => {
    const areas = []
    
    textAreas.forEach((area, idx) => {
      let mappedContent = ''
      
      // Mapear según el tipo de área
      switch (area.type) {
        case 'title':
          mappedContent = content.title || content.heading || ''
          break
        case 'subtitle':
          mappedContent = content.subtitle || ''
          break
        case 'bullets':
          mappedContent = Array.isArray(content.bullets) 
            ? content.bullets.join('\n') 
            : content.bullets || ''
          break
        case 'body':
          mappedContent = content.body || content.heading || ''
          break
        default:
          mappedContent = ''
      }
      
      // Calcular si el contenido cabe
      const maxChars = area.maxChars || 500
      const contentLength = mappedContent.length
      const fitsInArea = contentLength <= maxChars
      
      areas.push({
        areaId: area.id || `area-${idx}`,
        areaType: area.type,
        content: mappedContent,
        originalText: area.text,
        position: {
          x: area.position?.x_percent || 10,
          y: area.position?.y_percent || 10,
          width: area.position?.width_percent || 80,
          height: area.position?.height_percent || 20
        },
        formatting: area.formatting || { font: 'Arial', size: 18, color: '#000000' },
        maxChars: maxChars,
        fitsInArea: fitsInArea,
        overflow: fitsInArea ? 0 : contentLength - maxChars
      })
    })
    
    return areas
  }

  const handleContentEdit = (slideIndex, areaId, newContent) => {
    setMappings(prev => prev.map((mapping, idx) => {
      if (idx === slideIndex) {
        return {
          ...mapping,
          areas: mapping.areas.map(area => 
            area.areaId === areaId ? { ...area, content: newContent } : area
          )
        }
      }
      return mapping
    }))
  }

  const handleApplyAll = () => {
    onApplyMapping(mappings)
    onClose()
  }

  const currentMapping = mappings[selectedSlide]

  return (
    <div className="content-mapper-overlay">
      <div className="content-mapper">
        <div className="mapper-header">
          <div className="header-title">
            <span className="material-icons">auto_fix_high</span>
            <h3>Mapeo Inteligente de Contenido</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {isAnalyzing ? (
          <div className="analyzing-state">
            <div className="spinner"></div>
            <p>Analizando diseño y mapeando contenido...</p>
          </div>
        ) : (
          <>
            <div className="mapper-toolbar">
              <div className="slide-selector">
                {slides.map((slide, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`slide-tab ${selectedSlide === idx ? 'active' : ''}`}
                    onClick={() => setSelectedSlide(idx)}
                  >
                    <span className="material-icons">
                      {slide.type === 'title' ? 'title' : 'view_agenda'}
                    </span>
                    Slide {idx + 1}
                  </button>
                ))}
              </div>
              
              <div className="view-toggle">
                <button
                  type="button"
                  className={!previewMode ? 'active' : ''}
                  onClick={() => setPreviewMode(false)}
                >
                  <span className="material-icons">edit</span>
                  Editar
                </button>
                <button
                  type="button"
                  className={previewMode ? 'active' : ''}
                  onClick={() => setPreviewMode(true)}
                >
                  <span className="material-icons">visibility</span>
                  Preview
                </button>
              </div>
            </div>

            <div className="mapper-content">
              {currentMapping && (
                <div className="mapping-view">
                  {/* Vista de edición */}
                  {!previewMode && (
                    <div className="edit-view">
                      <div className="slide-preview-panel">
                        <h4>Diseño Original</h4>
                        {currentMapping.preview && (
                          <img 
                            src={currentMapping.preview} 
                            alt={`Slide ${selectedSlide + 1}`}
                            className="slide-preview-img"
                          />
                        )}
                      </div>

                      <div className="content-areas-panel">
                        <h4>Áreas de Contenido</h4>
                        <div className="areas-list">
                          {currentMapping.areas.map((area, idx) => (
                            <div key={idx} className="content-area-card">
                              <div className="area-header">
                                <span className="area-type-badge">{area.areaType}</span>
                                <span className="area-position">
                                  {Math.round(area.position.x_percent || 0)}%, {Math.round(area.position.y_percent || 0)}%
                                </span>
                              </div>
                              
                              <textarea
                                className="area-content-input"
                                value={area.content}
                                onChange={(e) => handleContentEdit(selectedSlide, area.areaId, e.target.value)}
                                placeholder={`Contenido para ${area.areaType}...`}
                                rows={area.areaType === 'title' ? 2 : 4}
                                maxLength={area.maxChars}
                              />
                              
                              <div className="area-meta">
                                <span className="char-count">
                                  {area.content.length} / {area.maxChars || '∞'} caracteres
                                </span>
                                {area.formatting && (
                                  <span className="formatting-info">
                                    {area.formatting.font || 'Arial'} • {area.formatting.size || 18}pt
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vista de preview */}
                  {previewMode && (
                    <div className="preview-view">
                      <div className="preview-container">
                        <div className="preview-slide">
                          {currentMapping.preview && (
                            <img 
                              src={currentMapping.preview} 
                              alt={`Slide ${selectedSlide + 1}`}
                              className="preview-background"
                            />
                          )}
                          
                          {/* Overlay de contenido */}
                          {currentMapping.areas.map((area, idx) => (
                            <div
                              key={idx}
                              className="preview-text-overlay"
                              style={{
                                left: `${area.position.x_percent || 0}%`,
                                top: `${area.position.y_percent || 0}%`,
                                width: `${area.position.width_percent || 100}%`,
                                height: `${area.position.height_percent || 20}%`,
                                fontSize: `${(area.formatting?.size || 18) / 2}px`,
                                fontFamily: area.formatting?.font || 'Arial',
                                color: area.formatting?.color || '#000000'
                              }}
                            >
                              {area.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mapper-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleApplyAll}>
                <span className="material-icons">check</span>
                Aplicar a Todas las Láminas
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ContentMapper
