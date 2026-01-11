import { useState, useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import '../styles/BoundingBoxRenderer.css'

/**
 * Color mapping for different element types
 * Requirements: 5.3 - Use distinct colors for each content type
 */
const TYPE_COLORS = {
  TITLE: { bg: 'rgba(52, 152, 219, 0.3)', border: '#3498db', text: '#2980b9' },
  SUBTITLE: { bg: 'rgba(155, 89, 182, 0.3)', border: '#9b59b6', text: '#8e44ad' },
  BODY: { bg: 'rgba(46, 204, 113, 0.3)', border: '#2ecc71', text: '#27ae60' },
  FOOTER: { bg: 'rgba(149, 165, 166, 0.3)', border: '#95a5a6', text: '#7f8c8d' },
  IMAGE_HOLDER: { bg: 'rgba(231, 76, 60, 0.3)', border: '#e74c3c', text: '#c0392b' },
  CHART_AREA: { bg: 'rgba(243, 156, 18, 0.3)', border: '#f39c12', text: '#d68910' },
  UNKNOWN: { bg: 'rgba(127, 140, 141, 0.3)', border: '#7f8c8d', text: '#566573' }
}

/**
 * Display names for element types
 */
const TYPE_DISPLAY_NAMES = {
  TITLE: 'Título',
  SUBTITLE: 'Subtítulo',
  BODY: 'Cuerpo',
  FOOTER: 'Pie de página',
  IMAGE_HOLDER: 'Imagen',
  CHART_AREA: 'Gráfico',
  UNKNOWN: 'Desconocido'
}

/**
 * Valid element types for the dropdown
 */
const VALID_ELEMENT_TYPES = [
  'TITLE',
  'SUBTITLE',
  'BODY',
  'FOOTER',
  'IMAGE_HOLDER',
  'CHART_AREA',
  'UNKNOWN'
]

/**
 * BoundingBoxRenderer Component
 * 
 * Renders semitransparent bounding boxes over a template image to visualize
 * detected content areas. Supports hover interactions and type editing.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * @param {Object} props
 * @param {string} props.imageUri - URI of the template image to display
 * @param {Array} props.elements - Array of detected elements with coordinates
 * @param {function} [props.onElementTypeChange] - Callback when element type is changed
 * @param {boolean} [props.editable] - Whether elements can be edited (default: true)
 * @param {boolean} [props.showLabels] - Whether to show type labels (default: true)
 * @param {boolean} [props.showConfidence] - Whether to show confidence on hover (default: true)
 */
function BoundingBoxRenderer({
  imageUri,
  elements = [],
  onElementTypeChange,
  editable = true,
  showLabels = true,
  showConfidence = true
}) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [hoveredElement, setHoveredElement] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Update container size when image loads or window resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [imageLoaded])

  /**
   * Convert normalized coordinates (0-1000) to pixel positions
   * based on the current container size
   */
  const normalizedToPixels = useCallback((coord, dimension) => {
    return (coord / 1000) * dimension
  }, [])

  /**
   * Handle mouse enter on a bounding box
   * Requirements: 5.4 - Hover to highlight and show additional info
   */
  const handleMouseEnter = useCallback((element) => {
    setHoveredElement(element.id)
  }, [])

  /**
   * Handle mouse leave from a bounding box
   */
  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null)
  }, [])

  /**
   * Handle click on a bounding box to show type dropdown
   * Requirements: 5.5 - Click to change content type via dropdown
   */
  const handleBoxClick = useCallback((element, event) => {
    if (!editable) return
    event.stopPropagation()
    setActiveDropdown(activeDropdown === element.id ? null : element.id)
  }, [editable, activeDropdown])

  /**
   * Handle type change from dropdown
   * Requirements: 5.5 - Allow changing content type
   */
  const handleTypeChange = useCallback((elementId, newType) => {
    if (onElementTypeChange) {
      onElementTypeChange(elementId, newType)
    }
    setActiveDropdown(null)
  }, [onElementTypeChange])

  /**
   * Close dropdown when clicking outside
   */
  const handleContainerClick = useCallback(() => {
    setActiveDropdown(null)
  }, [])

  /**
   * Handle image load event
   */
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
  }, [])

  /**
   * Get color configuration for an element type
   */
  const getTypeColors = (type) => {
    return TYPE_COLORS[type] || TYPE_COLORS.UNKNOWN
  }

  /**
   * Get display name for an element type
   */
  const getTypeDisplayName = (type) => {
    return TYPE_DISPLAY_NAMES[type] || type
  }

  /**
   * Format dimensions for display
   */
  const formatDimensions = (coords) => {
    return `${coords.width}×${coords.height}`
  }

  /**
   * Format position for display
   */
  const formatPosition = (coords) => {
    return `(${coords.left}, ${coords.top})`
  }

  if (!imageUri) {
    return (
      <div className="bbox-renderer bbox-renderer--empty">
        <span className="material-icons">image</span>
        <p>No hay imagen para mostrar</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="bbox-renderer"
      onClick={handleContainerClick}
    >
      {/* Template image */}
      <img
        src={imageUri}
        alt="Template preview"
        className="bbox-renderer__image"
        onLoad={handleImageLoad}
        draggable={false}
      />

      {/* Bounding boxes overlay */}
      {imageLoaded && elements.map((element) => {
        const colors = getTypeColors(element.type)
        const isHovered = hoveredElement === element.id
        const isActive = activeDropdown === element.id
        const coords = element.coordinates || {}

        // Calculate pixel positions from normalized coordinates
        const style = {
          left: `${normalizedToPixels(coords.left || 0, containerSize.width)}px`,
          top: `${normalizedToPixels(coords.top || 0, containerSize.height)}px`,
          width: `${normalizedToPixels(coords.width || 0, containerSize.width)}px`,
          height: `${normalizedToPixels(coords.height || 0, containerSize.height)}px`,
          backgroundColor: colors.bg,
          borderColor: colors.border
        }

        return (
          <div
            key={element.id}
            className={`bbox-renderer__box ${isHovered ? 'bbox-renderer__box--hovered' : ''} ${isActive ? 'bbox-renderer__box--active' : ''} ${editable ? 'bbox-renderer__box--editable' : ''}`}
            style={style}
            onMouseEnter={() => handleMouseEnter(element)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleBoxClick(element, e)}
            role="button"
            tabIndex={editable ? 0 : -1}
            aria-label={`${getTypeDisplayName(element.type)} area`}
          >
            {/* Type label - Requirements: 5.2 */}
            {showLabels && (
              <div 
                className="bbox-renderer__label"
                style={{ 
                  backgroundColor: colors.border,
                  color: 'white'
                }}
              >
                <span className="bbox-renderer__label-text">
                  {getTypeDisplayName(element.type)}
                </span>
                {element.shapeId && (
                  <span className="bbox-renderer__label-shape">
                    #{element.shapeId}
                  </span>
                )}
              </div>
            )}

            {/* Hover info tooltip - Requirements: 5.4 */}
            {isHovered && showConfidence && (
              <div className="bbox-renderer__tooltip">
                <div className="bbox-renderer__tooltip-row">
                  <span className="bbox-renderer__tooltip-label">Tipo:</span>
                  <span className="bbox-renderer__tooltip-value">{getTypeDisplayName(element.type)}</span>
                </div>
                <div className="bbox-renderer__tooltip-row">
                  <span className="bbox-renderer__tooltip-label">Posición:</span>
                  <span className="bbox-renderer__tooltip-value">{formatPosition(coords)}</span>
                </div>
                <div className="bbox-renderer__tooltip-row">
                  <span className="bbox-renderer__tooltip-label">Dimensiones:</span>
                  <span className="bbox-renderer__tooltip-value">{formatDimensions(coords)}</span>
                </div>
                {element.confidence !== undefined && (
                  <div className="bbox-renderer__tooltip-row">
                    <span className="bbox-renderer__tooltip-label">Confianza:</span>
                    <span className="bbox-renderer__tooltip-value">
                      {Math.round(element.confidence * 100)}%
                    </span>
                  </div>
                )}
                {editable && (
                  <div className="bbox-renderer__tooltip-hint">
                    Click para cambiar tipo
                  </div>
                )}
              </div>
            )}

            {/* Type change dropdown - Requirements: 5.5 */}
            {isActive && editable && (
              <div className="bbox-renderer__dropdown">
                <div className="bbox-renderer__dropdown-header">
                  Cambiar tipo de contenido
                </div>
                <div className="bbox-renderer__dropdown-options">
                  {VALID_ELEMENT_TYPES.map((type) => {
                    const typeColors = getTypeColors(type)
                    const isSelected = element.type === type
                    return (
                      <button
                        key={type}
                        className={`bbox-renderer__dropdown-option ${isSelected ? 'bbox-renderer__dropdown-option--selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTypeChange(element.id, type)
                        }}
                        style={{
                          '--option-color': typeColors.border
                        }}
                      >
                        <span 
                          className="bbox-renderer__dropdown-color"
                          style={{ backgroundColor: typeColors.border }}
                        />
                        <span className="bbox-renderer__dropdown-name">
                          {getTypeDisplayName(type)}
                        </span>
                        {isSelected && (
                          <span className="material-icons bbox-renderer__dropdown-check">
                            check
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Legend */}
      <div className="bbox-renderer__legend">
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className="bbox-renderer__legend-item">
            <span 
              className="bbox-renderer__legend-color"
              style={{ backgroundColor: colors.border }}
            />
            <span className="bbox-renderer__legend-name">
              {getTypeDisplayName(type)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

BoundingBoxRenderer.propTypes = {
  imageUri: PropTypes.string,
  elements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(VALID_ELEMENT_TYPES),
    coordinates: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number
    }),
    confidence: PropTypes.number,
    shapeId: PropTypes.number
  })),
  onElementTypeChange: PropTypes.func,
  editable: PropTypes.bool,
  showLabels: PropTypes.bool,
  showConfidence: PropTypes.bool
}

export default BoundingBoxRenderer
