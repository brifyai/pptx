import { useState, lazy, Suspense } from 'react'
import Draggable from 'react-draggable'
import { useSwipe, usePinch } from '../hooks/useSwipe'
import { useMobile } from '../hooks/useMobile'
import '../styles/MainSlideViewer.css'

const ChartRenderer = lazy(() => import('./ChartRenderer'))
const ChartEditor = lazy(() => import('./ChartEditor'))

// SVG paths para formas (mismo que en ShapeLibrary)
const shapeSVGs = {
  'rect': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="5" y="5" width="90" height="90" fill={color} rx="0" />
    </svg>
  ),
  'rounded-rect': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="5" y="5" width="90" height="90" fill={color} rx="15" />
    </svg>
  ),
  'circle': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="45" fill={color} />
    </svg>
  ),
  'oval': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <ellipse cx="50" cy="30" rx="45" ry="25" fill={color} />
    </svg>
  ),
  'triangle': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 95,95 5,95" fill={color} />
    </svg>
  ),
  'diamond': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 95,50 50,95 5,50" fill={color} />
    </svg>
  ),
  'pentagon': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 97,38 79,95 21,95 3,38" fill={color} />
    </svg>
  ),
  'hexagon': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill={color} />
    </svg>
  ),
  'star': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={color} />
    </svg>
  ),
  'arrow-right': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill={color} />
    </svg>
  ),
  'arrow-left': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <polygon points="100,20 40,20 40,0 0,30 40,60 40,40 100,40" fill={color} />
    </svg>
  ),
  'arrow-up': (color) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%">
      <polygon points="30,0 60,40 40,40 40,100 20,100 20,40 0,40" fill={color} />
    </svg>
  ),
  'arrow-down': (color) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%">
      <polygon points="30,100 60,60 40,60 40,0 20,0 20,60 0,60" fill={color} />
    </svg>
  ),
  'double-arrow': (color) => (
    <svg viewBox="0 0 100 40" width="100%" height="100%">
      <polygon points="0,20 15,5 15,15 85,15 85,5 100,20 85,35 85,25 15,25 15,35" fill={color} />
    </svg>
  ),
  'chevron-right': (color) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%">
      <polygon points="0,0 60,50 0,100 0,80 40,50 0,20" fill={color} />
    </svg>
  ),
  'callout': (color) => (
    <svg viewBox="0 0 100 80" width="100%" height="100%">
      <path d="M5,5 H95 V55 H30 L15,75 L20,55 H5 Z" fill={color} />
    </svg>
  ),
  'cloud': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <path d="M25,55 C10,55 0,45 0,35 C0,25 10,15 25,15 C25,5 40,0 55,5 C70,0 85,10 85,25 C100,25 100,45 85,50 C85,55 75,55 75,55 Z" fill={color} />
    </svg>
  ),
  'heart': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M50,90 C20,60 0,40 0,25 C0,10 15,0 30,0 C40,0 50,10 50,20 C50,10 60,0 70,0 C85,0 100,10 100,25 C100,40 80,60 50,90 Z" fill={color} />
    </svg>
  ),
  'plus': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" fill={color} />
    </svg>
  ),
  'cross': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="20,0 50,30 80,0 100,20 70,50 100,80 80,100 50,70 20,100 0,80 30,50 0,20" fill={color} />
    </svg>
  ),
  'badge': (color) => (
    <svg viewBox="0 0 100 120" width="100%" height="100%">
      <path d="M50,0 L65,20 L90,20 L80,45 L95,70 L70,70 L50,95 L30,70 L5,70 L20,45 L10,20 L35,20 Z" fill={color} />
    </svg>
  ),
  'banner': (color) => (
    <svg viewBox="0 0 120 60" width="100%" height="100%">
      <polygon points="0,10 10,0 110,0 120,10 120,50 110,60 10,60 0,50 15,30" fill={color} />
    </svg>
  ),
  'cylinder': (color) => (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <ellipse cx="40" cy="15" rx="35" ry="15" fill={color} />
      <rect x="5" y="15" width="70" height="70" fill={color} />
      <ellipse cx="40" cy="85" rx="35" ry="15" fill={color} opacity="0.8" />
    </svg>
  ),
  'document': (color) => (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <path d="M0,0 H55 L80,25 V100 H0 Z" fill={color} />
      <path d="M55,0 V25 H80" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  ),
  'database': (color) => (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <ellipse cx="40" cy="15" rx="35" ry="15" fill={color} />
      <rect x="5" y="15" width="70" height="70" fill={color} />
      <ellipse cx="40" cy="85" rx="35" ry="15" fill={color} />
      <ellipse cx="40" cy="50" rx="35" ry="15" fill={color} opacity="0.5" />
    </svg>
  )
}

// Componente para assets extraídos
function ExtractedAssetOverlay({ asset, slideWidth, slideHeight }) {
  const left = (asset.x / slideWidth) * 100
  const top = (asset.y / slideHeight) * 100
  const width = (asset.width / slideWidth) * 100
  const height = (asset.height / slideHeight) * 100

  return (
    <div 
      className="extracted-asset-overlay"
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        pointerEvents: 'none'
      }}
    >
      <img 
        src={asset.data} 
        alt={asset.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  )
}

// Función para renderizar contenido de assets
function renderAssetContent(asset) {
  switch (asset.type) {
    case 'chart':
      return (
        <Suspense fallback={<div className="loading-chart">Cargando gráfico...</div>}>
          <ChartRenderer 
            data={asset.customData}
            chartType={asset.chartType}
            width={280}
            height={200}
          />
        </Suspense>
      )
    
    case 'icon':
      return (
        <div className="asset-icon" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '8px'
        }}>
          <span 
            className="material-icons" 
            style={{ 
              fontSize: asset.size || 48, 
              color: asset.color || '#D24726' 
            }}
          >
            {asset.icon}
          </span>
        </div>
      )
    
    case 'shape':
      const shapeRenderer = shapeSVGs[asset.shapeType || asset.svgPath]
      return (
        <div className="asset-shape" style={{ 
          width: 100, 
          height: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {shapeRenderer ? shapeRenderer(asset.color || '#D24726') : (
            <span className="material-icons" style={{ fontSize: 64, color: asset.color }}>
              category
            </span>
          )}
        </div>
      )
    
    case 'image':
      return (
        <div className="asset-image" style={{ maxWidth: 200, maxHeight: 150 }}>
          <img 
            src={asset.url} 
            alt={asset.alt || 'Imagen'} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )
    
    case 'template':
      return (
        <div className="asset-template" style={{ 
          padding: '16px',
          background: asset.color || '#f3f4f6',
          borderRadius: '8px',
          minWidth: 150,
          textAlign: 'center'
        }}>
          <span className="material-icons" style={{ fontSize: 32, color: 'white' }}>
            {asset.templateId === 'timeline' ? 'timeline' :
             asset.templateId === 'process' ? 'account_tree' :
             asset.templateId === 'comparison' ? 'compare' :
             asset.templateId === 'swot' ? 'grid_view' :
             asset.templateId === 'funnel' ? 'filter_alt' :
             'dashboard'}
          </span>
          <p style={{ margin: '8px 0 0', color: 'white', fontSize: '12px' }}>{asset.name}</p>
        </div>
      )
    
    default:
      return (
        <div className="asset-unknown">
          <span className="material-icons">help_outline</span>
        </div>
      )
  }
}

// Componente para assets draggables
function DraggableAsset({ asset, index, isSelected, onSelect, onRemove, onPositionChange, onEdit }) {
  return (
    <Draggable
      position={asset.position || { x: 50, y: 50 }}
      onStop={(e, data) => onPositionChange({ x: data.x, y: data.y })}
      bounds="parent"
    >
      <div 
        className={`draggable-asset ${isSelected ? 'selected' : ''} asset-type-${asset.type}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        {renderAssetContent(asset)}
        
        {isSelected && (
          <div className="asset-controls">
            {asset.type === 'chart' && (
              <button
                type="button"
                className="asset-control-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                title="Editar gráfico"
              >
                <span className="material-icons">edit</span>
              </button>
            )}
            <button
              type="button"
              className="asset-control-btn danger"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              title="Eliminar"
            >
              <span className="material-icons">delete</span>
            </button>
          </div>
        )}
        
        {/* Resize handles cuando está seleccionado */}
        {isSelected && (
          <div className="resize-handles">
            <div className="resize-handle nw"></div>
            <div className="resize-handle ne"></div>
            <div className="resize-handle sw"></div>
            <div className="resize-handle se"></div>
          </div>
        )}
      </div>
    </Draggable>
  )
}

// Componente principal
function MainSlideViewer({ slide, slideIndex, onSlideUpdate, extractedAssets, onNavigateSlide, totalSlides }) {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [editingChart, setEditingChart] = useState(null)
  const [showExtractedAssets] = useState(false) // Deshabilitado por defecto
  const isMobile = useMobile(768)

  // Gestos mobile: Swipe para navegar entre slides
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (isMobile && onNavigateSlide && slideIndex < totalSlides - 1) {
        onNavigateSlide(slideIndex + 1)
      }
    },
    onSwipeRight: () => {
      if (isMobile && onNavigateSlide && slideIndex > 0) {
        onNavigateSlide(slideIndex - 1)
      }
    },
    minSwipeDistance: 50,
    maxSwipeTime: 300
  })

  // Gestos mobile: Pinch to zoom
  const { scale, isPinching, resetScale, ...pinchHandlers } = usePinch({
    onPinchEnd: ({ scale }) => {
      // Reset zoom después de 1 segundo
      if (scale !== 1) {
        setTimeout(resetScale, 1000)
      }
    },
    minScale: 0.8,
    maxScale: 3
  })

  // Early return si no hay slide
  if (!slide) {
    return (
      <div className="main-slide-viewer">
        <div className="no-slide-message">
          <span className="material-icons">slideshow</span>
          <p>No hay lámina seleccionada</p>
        </div>
      </div>
    )
  }

  // Validar que slide tenga la estructura correcta
  if (!slide.content) {
    console.warn('Slide sin content:', slide)
    return (
      <div className="main-slide-viewer">
        <div className="no-slide-message">
          <span className="material-icons">warning</span>
          <p>Lámina sin contenido</p>
        </div>
      </div>
    )
  }

  const assets = slide.content.assets || []
  const currentSlideExtractedAssets = (extractedAssets && Array.isArray(extractedAssets)) 
    ? extractedAssets.filter(asset => asset.slideIndex === slideIndex)
    : []

  const handleRemoveAsset = (index) => {
    const newAssets = assets.filter((_, i) => i !== index)
    onSlideUpdate(slide.id, {
      ...slide.content,
      assets: newAssets
    })
    setSelectedAsset(null)
  }

  const handleAssetPositionChange = (index, position) => {
    const newAssets = [...assets]
    newAssets[index] = { ...newAssets[index], position }
    onSlideUpdate(slide.id, {
      ...slide.content,
      assets: newAssets
    })
  }

  return (
    <div className="main-slide-viewer">
      <div 
        className="slide-canvas" 
        onClick={() => setSelectedAsset(null)}
        {...(isMobile ? swipeHandlers : {})}
      >
        {slide.preview ? (
          <div 
            className="slide-preview-container"
            {...(isMobile ? pinchHandlers : {})}
            style={isMobile && isPinching ? {
              transform: `scale(${scale})`,
              transition: isPinching ? 'none' : 'transform 0.3s ease-out'
            } : {}}
          >
            <img 
              src={slide.preview} 
              alt={`Lámina ${slideIndex + 1}`}
              className="slide-preview-image"
            />
            
            {/* Indicador de mapeo preciso */}
            {slide.layout?.textAreas?.length > 0 && (
              <div className="precision-indicator">
                <span className="material-icons">check_circle</span>
                Mapeo Preciso ({slide.layout.textAreas.length} áreas)
              </div>
            )}
            
            {/* Assets extraídos del PPTX */}
            {showExtractedAssets && currentSlideExtractedAssets.map((extractedAsset, idx) => (
              <ExtractedAssetOverlay
                key={`extracted-${idx}`}
                asset={extractedAsset}
                slideWidth={slide.slideWidth || 9144000}
                slideHeight={slide.slideHeight || 6858000}
              />
            ))}
            
            {/* Assets draggables */}
            {assets.map((asset, index) => (
              <DraggableAsset
                key={index}
                asset={asset}
                index={index}
                isSelected={selectedAsset === index}
                onSelect={() => setSelectedAsset(index)}
                onRemove={() => handleRemoveAsset(index)}
                onPositionChange={(pos) => handleAssetPositionChange(index, pos)}
                onEdit={() => asset.type === 'chart' && setEditingChart(index)}
              />
            ))}
          </div>
        ) : (
          <div className="slide-content-fallback">
            <p>Sin preview disponible</p>
          </div>
        )}
      </div>

      {/* Chart Editor Modal */}
      {editingChart !== null && (
        <Suspense fallback={<div>Cargando editor...</div>}>
          <ChartEditor
            chart={assets[editingChart]}
            onSave={(updatedChart) => {
              const newAssets = [...assets]
              newAssets[editingChart] = updatedChart
              onSlideUpdate(slide.id, {
                ...slide.content,
                assets: newAssets
              })
              setEditingChart(null)
            }}
            onClose={() => setEditingChart(null)}
          />
        </Suspense>
      )}

      {/* Mobile slide indicator dots */}
      {isMobile && totalSlides > 1 && (
        <div className="mobile-slide-indicator">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              className={`slide-dot ${i === slideIndex ? 'active' : ''}`}
              onClick={() => onNavigateSlide?.(i)}
              aria-label={`Ir a lámina ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MainSlideViewer
