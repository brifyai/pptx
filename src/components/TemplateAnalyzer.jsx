import { useEffect, useCallback, useState } from 'react'
import { useVisionAnalysis, VALID_ELEMENT_TYPES, ERROR_TYPES, getErrorInfo } from '../hooks/useVisionAnalysis'
import { analyzeTemplate as legacyAnalyzeTemplate } from '../services/visionService'
import BoundingBoxRenderer from './BoundingBoxRenderer'

/**
 * TemplateAnalyzer Component
 * 
 * Analyzes PPTX templates using Gemini Vision to detect content areas.
 * Shows a "Template reconocido" indicator when the result comes from cache.
 * Displays visual bounding boxes over the template image when imageUri is provided.
 * Provides specific error messages and manual mode fallback (Requirements 6.1, 6.2).
 * 
 * Requirements: 1.5, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2
 * 
 * @param {Object} props
 * @param {File} props.file - The PPTX file to analyze
 * @param {string} [props.imageUri] - Optional image URI for preview with bounding boxes
 * @param {function} props.onAnalysisComplete - Callback when analysis completes
 * @param {function} [props.onError] - Optional callback for errors
 * @param {function} [props.onManualModeRequest] - Optional callback when user requests manual mapping mode
 * @param {boolean} [props.useLegacyMode] - Use legacy visionService instead of new hook
 * @param {boolean} [props.showVisualPreview] - Whether to show visual bounding box preview (default: true)
 */
function TemplateAnalyzer({ 
  file, 
  imageUri,
  onAnalysisComplete, 
  onError,
  onManualModeRequest,
  useLegacyMode = false,
  showVisualPreview = true
}) {
  const [viewMode, setViewMode] = useState('visual') // 'visual' or 'list'
  const {
    elements,
    isAnalyzing,
    isCached,
    error,
    errorType,
    templateHash,
    shapeMapping,
    analyzeTemplate,
    updateElementType,
    reset,
    getErrorInfo: getHookErrorInfo
  } = useVisionAnalysis()

  // Run analysis when file changes
  useEffect(() => {
    if (!file) return

    const runAnalysis = async () => {
      try {
        if (useLegacyMode) {
          // Use legacy visionService for backward compatibility
          const result = await legacyAnalyzeTemplate(file)
          onAnalysisComplete?.(result)
        } else {
          // Use new useVisionAnalysis hook
          await analyzeTemplate(file)
          // Note: onAnalysisComplete will be called in a separate effect
          // when elements are updated, to ensure we have the latest state
        }
      } catch (err) {
        onError?.(err.message || 'Error al analizar template')
      }
    }

    runAnalysis()

    // Cleanup on unmount or file change
    return () => {
      if (!useLegacyMode) {
        reset()
      }
    }
  }, [file, useLegacyMode])

  // Call onAnalysisComplete when analysis results are ready
  useEffect(() => {
    if (useLegacyMode || isAnalyzing || error || elements.length === 0) return

    // Build result object compatible with existing consumers
    const result = {
      templateHash,
      elements,
      shapeMapping,
      source: isCached ? 'cache' : 'vision',
      // Legacy format compatibility
      slides: [{
        type: 'content',
        textAreas: elements.filter(e => 
          ['TITLE', 'SUBTITLE', 'BODY', 'FOOTER'].includes(e.type)
        ),
        imageAreas: elements.filter(e => 
          ['IMAGE_HOLDER', 'CHART_AREA'].includes(e.type)
        )
      }]
    }
    
    onAnalysisComplete?.(result)
  }, [elements, templateHash, shapeMapping, isCached, isAnalyzing, error, useLegacyMode, onAnalysisComplete])

  // Handle element type change
  const handleTypeChange = useCallback(async (elementId, newType) => {
    try {
      await updateElementType(elementId, newType)
    } catch (err) {
      console.error('Error updating element type:', err)
      onError?.(err.message)
    }
  }, [updateElementType, onError])

  // Loading state
  if (isAnalyzing) {
    return (
      <div className="analyzing">
        <div className="spinner"></div>
        <h3>Analizando tu plantilla...</h3>
        <p>Detectando áreas de texto, imágenes y estructura del diseño</p>
      </div>
    )
  }

  // Error state with specific messages (Requirements 6.1, 6.2)
  if (error) {
    const errorInfo = getHookErrorInfo() || getErrorInfo(ERROR_TYPES.UNKNOWN_ERROR)
    
    return (
      <div className="error-message" style={{
        padding: '20px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <h3 style={{ 
          color: '#dc2626', 
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>❌</span>
          {errorInfo.title}
        </h3>
        
        <p style={{ color: '#7f1d1d', margin: '0 0 12px 0' }}>
          {error}
        </p>
        
        <div style={{
          backgroundColor: '#fef9c3',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <p style={{ 
            color: '#854d0e', 
            margin: 0,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.2em' }}>💡</span>
            <span><strong>Sugerencia:</strong> {errorInfo.suggestion}</span>
          </p>
        </div>
        
        {/* Manual mode button (Requirement 6.2) */}
        {errorInfo.canUseManualMode && onManualModeRequest && (
          <button
            onClick={onManualModeRequest}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            <span>✏️</span>
            Usar modo de mapeo manual
          </button>
        )}
        
        {/* Retry button */}
        <button
          onClick={() => {
            reset()
            if (file) {
              analyzeTemplate(file).catch(() => {})
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: errorInfo.canUseManualMode && onManualModeRequest ? '8px' : '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
        >
          <span>🔄</span>
          Intentar nuevamente
        </button>
      </div>
    )
  }

  // No elements detected - offer manual mode (Requirement 6.2)
  if (elements.length === 0 && !isAnalyzing) {
    return (
      <div className="analysis-result" style={{
        padding: '20px',
        backgroundColor: '#fffbeb',
        borderRadius: '8px',
        border: '1px solid #fde68a'
      }}>
        <h3 style={{ 
          color: '#d97706', 
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          Sin elementos detectados
        </h3>
        
        <p style={{ color: '#92400e', margin: '0 0 12px 0' }}>
          No se detectaron áreas de contenido en el template.
        </p>
        
        <div style={{
          backgroundColor: '#fef3c7',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <p style={{ 
            color: '#854d0e', 
            margin: 0,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.2em' }}>💡</span>
            <span>
              El template puede tener una estructura no estándar. 
              Puedes usar el modo de mapeo manual para definir las áreas de contenido.
            </span>
          </p>
        </div>
        
        {/* Manual mode button (Requirement 6.2) */}
        {onManualModeRequest && (
          <button
            onClick={onManualModeRequest}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            <span>✏️</span>
            Usar modo de mapeo manual
          </button>
        )}
      </div>
    )
  }

  // Group elements by type for display
  const elementsByType = elements.reduce((acc, element) => {
    const type = element.type || 'UNKNOWN'
    if (!acc[type]) acc[type] = []
    acc[type].push(element)
    return acc
  }, {})

  // Get type display name
  const getTypeDisplayName = (type) => {
    const names = {
      'TITLE': 'Título',
      'SUBTITLE': 'Subtítulo',
      'BODY': 'Cuerpo',
      'FOOTER': 'Pie de página',
      'IMAGE_HOLDER': 'Imagen',
      'CHART_AREA': 'Gráfico',
      'UNKNOWN': 'Desconocido'
    }
    return names[type] || type
  }

  // Get type color for visual distinction
  const getTypeColor = (type) => {
    const colors = {
      'TITLE': '#3498db',
      'SUBTITLE': '#9b59b6',
      'BODY': '#2ecc71',
      'FOOTER': '#95a5a6',
      'IMAGE_HOLDER': '#e74c3c',
      'CHART_AREA': '#f39c12',
      'UNKNOWN': '#7f8c8d'
    }
    return colors[type] || '#7f8c8d'
  }

  return (
    <div className="analysis-result">
      {/* Cache indicator - Requirement 4.5 */}
      {isCached && (
        <div className="cache-indicator" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '8px 16px',
          borderRadius: '4px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.2em' }}>⚡</span>
          <span>Template reconocido - Cargado desde caché</span>
        </div>
      )}

      <h3>✅ Análisis Completado</h3>
      <p><strong>Archivo:</strong> {file?.name}</p>
      <p><strong>Elementos detectados:</strong> {elements.length}</p>
      
      {templateHash && (
        <p style={{ fontSize: '0.85em', color: '#666' }}>
          <strong>Hash:</strong> {templateHash.substring(0, 16)}...
        </p>
      )}

      {/* View mode toggle - Requirements: 5.1, 5.2, 5.3 */}
      {imageUri && showVisualPreview && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginTop: '16px',
          marginBottom: '16px'
        }}>
          <button
            onClick={() => setViewMode('visual')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: viewMode === 'visual' ? '2px solid #667eea' : '2px solid #e5e7eb',
              background: viewMode === 'visual' ? '#f0f3ff' : 'white',
              color: viewMode === 'visual' ? '#667eea' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>visibility</span>
            Vista Visual
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: viewMode === 'list' ? '2px solid #667eea' : '2px solid #e5e7eb',
              background: viewMode === 'list' ? '#f0f3ff' : 'white',
              color: viewMode === 'list' ? '#667eea' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>list</span>
            Vista Lista
          </button>
        </div>
      )}

      {/* Visual Bounding Box View - Requirements: 5.1, 5.2, 5.3, 5.4, 5.5 */}
      {imageUri && showVisualPreview && viewMode === 'visual' && (
        <div style={{ 
          marginTop: '16px',
          marginBottom: '16px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <BoundingBoxRenderer
            imageUri={imageUri}
            elements={elements}
            onElementTypeChange={handleTypeChange}
            editable={true}
            showLabels={true}
            showConfidence={true}
          />
        </div>
      )}

      {/* List View - Elements by type */}
      {(!imageUri || !showVisualPreview || viewMode === 'list') && (
        <div style={{ marginTop: '20px' }}>
          <h4>Elementos por tipo:</h4>
          {Object.entries(elementsByType).map(([type, typeElements]) => (
            <div key={type} className="element-type-group" style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: `4px solid ${getTypeColor(type)}`
            }}>
              <h5 style={{ 
                margin: '0 0 8px 0',
                color: getTypeColor(type),
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getTypeColor(type),
                  borderRadius: '2px',
                  display: 'inline-block'
                }}></span>
                {getTypeDisplayName(type)} ({typeElements.length})
              </h5>
              
              {typeElements.map((element) => (
                <div key={element.id} className="element-item" style={{
                  padding: '8px',
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  fontSize: '0.9em'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><strong>ID:</strong> {element.id}</span>
                    <span style={{ 
                      backgroundColor: `${getTypeColor(element.type)}20`,
                      color: getTypeColor(element.type),
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.85em'
                    }}>
                      {Math.round(element.confidence * 100)}% confianza
                    </span>
                  </div>
                  
                  <div style={{ marginTop: '4px', color: '#666' }}>
                    <span>
                      📍 ({element.coordinates.left}, {element.coordinates.top}) - 
                      {element.coordinates.width}×{element.coordinates.height}
                    </span>
                  </div>

                  {element.shapeId && (
                    <div style={{ marginTop: '4px', color: '#666' }}>
                      <span>🔗 Shape ID: {element.shapeId}</span>
                    </div>
                  )}

                  {/* Type change dropdown */}
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ fontSize: '0.85em', color: '#666' }}>
                      Cambiar tipo:{' '}
                      <select
                        value={element.type}
                        onChange={(e) => handleTypeChange(element.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '0.9em'
                        }}
                      >
                        {VALID_ELEMENT_TYPES.map(t => (
                          <option key={t} value={t}>{getTypeDisplayName(t)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Shape mapping summary */}
      {Object.keys(shapeMapping).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Mapeo de Shapes:</h4>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.9em'
          }}>
            {Object.entries(shapeMapping).map(([type, shapeId]) => (
              <div key={type} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '4px 0',
                borderBottom: '1px solid #eee'
              }}>
                <span style={{ color: getTypeColor(type) }}>
                  {getTypeDisplayName(type)}
                </span>
                <span style={{ color: '#666' }}>
                  → Shape #{shapeId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateAnalyzer
