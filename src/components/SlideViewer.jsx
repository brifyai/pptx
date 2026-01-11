import { useState, lazy, Suspense, useEffect } from 'react'
import Draggable from 'react-draggable'
import '../styles/SlideViewer.css'

const ChartRenderer = lazy(() => import('./ChartRenderer'))
const ChartEditor = lazy(() => import('./ChartEditor'))

function SlideViewer({ slides, currentSlide, onSlideChange, onSlideUpdate, extractedAssets, onSlideReorder, onSlideDuplicate, onSlideDelete, onSlideRename, onSlideAdd, logActivity }) {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [editingChart, setEditingChart] = useState(null)
  const [showExtractedAssets, setShowExtractedAssets] = useState(true)
  const [contextMenu, setContextMenu] = useState(null)
  const [editingSlideId, setEditingSlideId] = useState(null)
  const [slideNameInput, setSlideNameInput] = useState('')
  const [draggedSlide, setDraggedSlide] = useState(null)
  const [dragOverSlide, setDragOverSlide] = useState(null)

  // Cerrar menú contextual con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && contextMenu) {
        setContextMenu(null)
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [contextMenu])

  const handleTextEdit = (field, value) => {
    const slide = slides[currentSlide]
    const newContent = { ...slide.content, [field]: value }
    onSlideUpdate(slide.id, newContent)
  }

  // Gestión de slides
  const handleContextMenu = (e, slideIndex) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      slideIndex
    })
  }

  const handleDuplicateSlide = (slideIndex) => {
    if (onSlideDuplicate) {
      onSlideDuplicate(slideIndex)
    }
    setContextMenu(null)
  }

  const handleDeleteSlide = (slideIndex) => {
    if (onSlideDelete && slides.length > 1) {
      onSlideDelete(slideIndex)
    }
    setContextMenu(null)
  }

  const handleStartRename = (slideIndex) => {
    const slide = slides[slideIndex]
    setEditingSlideId(slide.id)
    setSlideNameInput(slide.name || `Lámina ${slideIndex + 1}`)
    setContextMenu(null)
  }

  const handleSaveRename = () => {
    if (editingSlideId && onSlideRename) {
      onSlideRename(editingSlideId, slideNameInput)
    }
    setEditingSlideId(null)
    setSlideNameInput('')
  }

  const handleCancelRename = () => {
    setEditingSlideId(null)
    setSlideNameInput('')
  }

  // Drag & Drop para reordenar
  const handleDragStart = (e, slideIndex) => {
    setDraggedSlide(slideIndex)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', slideIndex.toString())
    
    // Usar el elemento actual como imagen de arrastre
    // No crear clon porque causa problemas de timing
    e.dataTransfer.setDragImage(e.currentTarget, 50, 50)
  }

  const handleDragOver = (e, slideIndex) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedSlide !== null && draggedSlide !== slideIndex) {
      setDragOverSlide(slideIndex)
    }
  }

  const handleDragLeave = () => {
    setDragOverSlide(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedSlide !== null && draggedSlide !== dropIndex && onSlideReorder) {
      onSlideReorder(draggedSlide, dropIndex)
    }
    setDraggedSlide(null)
    setDragOverSlide(null)
  }

  const handleDragEnd = () => {
    setDraggedSlide(null)
    setDragOverSlide(null)
  }

  const handleRemoveAsset = (assetIndex) => {
    const slide = slides[currentSlide]
    const newAssets = [...(slide.content.assets || [])]
    newAssets.splice(assetIndex, 1)
    onSlideUpdate(slide.id, { ...slide.content, assets: newAssets })
    setSelectedAsset(null)
  }

  const handleAssetPositionChange = (assetIndex, position) => {
    const slide = slides[currentSlide]
    const newAssets = [...(slide.content.assets || [])]
    newAssets[assetIndex] = { ...newAssets[assetIndex], position }
    onSlideUpdate(slide.id, { ...slide.content, assets: newAssets })
  }

  const handleChartDataUpdate = (assetIndex, newData) => {
    const slide = slides[currentSlide]
    const newAssets = [...(slide.content.assets || [])]
    newAssets[assetIndex] = { ...newAssets[assetIndex], customData: newData }
    onSlideUpdate(slide.id, { ...slide.content, assets: newAssets })
    setEditingChart(null)
  }

  const currentSlideData = slides[currentSlide]
  const assets = currentSlideData.content?.assets || []
  
  // Obtener assets extraídos para el slide actual
  // MOSTRAR TODAS LAS IMÁGENES como overlay para que se vean correctamente
  // Esto incluye logos animados que LibreOffice no captura en el preview
  const currentSlideExtractedAssets = extractedAssets ? [
    ...(extractedAssets.logos || []).filter(a => a.slideNumber === currentSlide + 1),
    ...(extractedAssets.transparentImages || []).filter(a => a.slideNumber === currentSlide + 1),
    ...(extractedAssets.animatedElements || []).filter(a => a.slideNumber === currentSlide + 1),
    ...(extractedAssets.images || []).filter(a => a.slideNumber === currentSlide + 1)
  ] : []
  
  console.log(`📦 Assets para slide ${currentSlide + 1}:`, currentSlideExtractedAssets.length)

  return (
    <div className="slide-viewer">
      {/* Navegación de thumbnails */}
      <div className="slide-thumbnails">
        {/* Indicador de arrastre */}
        {draggedSlide !== null && (
          <div className="drag-indicator">
            <span className="material-icons">drag_indicator</span>
            Arrastrando lámina {draggedSlide + 1}
          </div>
        )}
        
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`thumbnail ${index === currentSlide ? 'active' : ''} ${draggedSlide === index ? 'dragging' : ''} ${dragOverSlide === index ? 'drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onSlideChange(index)}
            onContextMenu={(e) => handleContextMenu(e, index)}
          >
            <div className="thumbnail-number">{index + 1}</div>
            <div className="thumbnail-preview">
              {slide.preview ? (
                <img 
                  src={slide.preview} 
                  alt={`Slide ${index + 1}`}
                  draggable="false"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px', pointerEvents: 'none' }}
                />
              ) : (
                <div className="mini-slide">
                  <span className="material-icons">
                    {slide.type === 'title' ? 'title' : 'view_agenda'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Nombre editable del slide */}
            {editingSlideId === slide.id ? (
              <div className="thumbnail-name-edit" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={slideNameInput}
                  onChange={(e) => setSlideNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename()
                    if (e.key === 'Escape') handleCancelRename()
                  }}
                  onBlur={handleSaveRename}
                  autoFocus
                  className="slide-name-input"
                />
              </div>
            ) : (
              <div className="thumbnail-name" title={slide.name || `Lámina ${index + 1}`}>
                {slide.name || `Lámina ${index + 1}`}
              </div>
            )}
            
            {/* Botón de opciones */}
            <button
              type="button"
              className="thumbnail-options"
              onClick={(e) => {
                e.stopPropagation()
                handleContextMenu(e, index)
              }}
              title="Opciones"
            >
              <span className="material-icons">more_vert</span>
            </button>
          </div>
        ))}
        
        {/* Botón para agregar slide */}
        <button
          type="button"
          className="add-slide-btn"
          onClick={() => onSlideAdd && onSlideAdd()}
          title="Agregar lámina"
        >
          <span className="material-icons">add</span>
          <span>Nueva lámina</span>
        </button>
      </div>

      {/* Menú contextual */}
      {contextMenu && (
        <>
          <div 
            className="context-menu-overlay" 
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="context-menu"
            style={{ 
              left: `${contextMenu.x}px`, 
              top: `${contextMenu.y}px` 
            }}
          >
            <button
              type="button"
              className="context-menu-item"
              onClick={() => handleDuplicateSlide(contextMenu.slideIndex)}
            >
              <span className="material-icons">content_copy</span>
              Duplicar
            </button>
            <button
              type="button"
              className="context-menu-item"
              onClick={() => handleStartRename(contextMenu.slideIndex)}
            >
              <span className="material-icons">edit</span>
              Renombrar
            </button>
            <div className="context-menu-divider" />
            <button
              type="button"
              className="context-menu-item danger"
              onClick={() => handleDeleteSlide(contextMenu.slideIndex)}
              disabled={slides.length <= 1}
            >
              <span className="material-icons">delete</span>
              Eliminar
            </button>
          </div>
        </>
      )}

      {/* Visor principal */}
      <div className="slide-main">
        <div className="slide-canvas" onClick={() => setSelectedAsset(null)}>
          {currentSlideData.preview ? (
            <div className="slide-preview-container">
              <img 
                src={currentSlideData.preview} 
                alt={`Slide ${currentSlide + 1}`}
                className="slide-preview-image"
              />
              
              {/* Indicador de mapeo preciso */}
              {currentSlideData.layout?.textAreas?.length > 0 && (
                <div className="precision-indicator">
                  <span className="material-icons">check_circle</span>
                  Mapeo Preciso ({currentSlideData.layout.textAreas.length} áreas)
                </div>
              )}
              
              {/* Overlay de contenido editable usando coordenadas EXACTAS del análisis */}
              <PreciseContentOverlay
                slide={currentSlideData}
                onTextEdit={handleTextEdit}
              />
              
              {/* Assets extraídos del PPTX (logos, imágenes con transparencia) */}
              {showExtractedAssets && currentSlideExtractedAssets.map((extractedAsset, idx) => (
                <ExtractedAssetOverlay
                  key={`extracted-${idx}`}
                  asset={extractedAsset}
                  slideWidth={currentSlideData.slideWidth || 9144000}
                  slideHeight={currentSlideData.slideHeight || 6858000}
                />
              ))}
              
              {/* Assets draggables sobre la imagen */}
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
            <div className="slide-content">
              {currentSlideData.type === 'title' ? (
                <>
                  <input
                    type="text"
                    className="slide-title editable"
                    value={currentSlideData.content.title}
                    onChange={(e) => handleTextEdit('title', e.target.value)}
                    placeholder="Título principal"
                  />
                  <input
                    type="text"
                    className="slide-subtitle editable"
                    value={currentSlideData.content.subtitle}
                    onChange={(e) => handleTextEdit('subtitle', e.target.value)}
                    placeholder="Subtítulo"
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    className="slide-heading editable"
                    value={currentSlideData.content.heading}
                    onChange={(e) => handleTextEdit('heading', e.target.value)}
                    placeholder="Título de la diapositiva"
                  />
                  <div className="slide-bullets">
                    {currentSlideData.content.bullets.map((bullet, index) => (
                      <div key={index} className="bullet-item">
                        <span className="bullet-dot">•</span>
                        <input
                          type="text"
                          className="bullet-text editable"
                          value={bullet}
                          onChange={(e) => {
                            const newBullets = [...currentSlideData.content.bullets]
                            newBullets[index] = e.target.value
                            handleTextEdit('bullets', newBullets)
                          }}
                          placeholder={`Punto ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Assets en slides sin preview */}
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
          )}
        </div>

        {/* Controles de navegación */}
        <div className="slide-controls">
          <button
            className="nav-btn"
            onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            <span className="material-icons">chevron_left</span>
            Anterior
          </button>
          
          {/* Toggle para assets extraídos */}
          {currentSlideExtractedAssets.length > 0 && (
            <button
              type="button"
              className={`toggle-assets-btn ${showExtractedAssets ? 'active' : ''}`}
              onClick={() => setShowExtractedAssets(!showExtractedAssets)}
              title={showExtractedAssets ? 'Ocultar logos/transparencias' : 'Mostrar logos/transparencias'}
            >
              <span className="material-icons">
                {showExtractedAssets ? 'visibility' : 'visibility_off'}
              </span>
              <span className="badge">{currentSlideExtractedAssets.length}</span>
            </button>
          )}
          
          <span className="slide-indicator">
            <span className="material-icons">filter_none</span>
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            className="nav-btn"
            onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            Siguiente
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Modal de edición de gráfico */}
      {editingChart !== null && (
        <Suspense fallback={null}>
          <ChartEditor
            asset={assets[editingChart]}
            onSave={(data) => {
              const slide = slides[currentSlide]
              const newAssets = [...(slide.content.assets || [])]
              newAssets[editingChart] = { 
                ...newAssets[editingChart], 
                customData: data,
                chartType: data.chartType || newAssets[editingChart].chartType
              }
              onSlideUpdate(slide.id, { ...slide.content, assets: newAssets })
              setEditingChart(null)
            }}
            onClose={() => setEditingChart(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

// Componente draggable para assets
function DraggableAsset({ asset, index, isSelected, onSelect, onRemove, onPositionChange, onEdit }) {
  const handleDragStop = (e, data) => {
    onPositionChange({ x: data.x, y: data.y })
  }

  return (
    <>
      <Draggable
        defaultPosition={asset.position || { x: 50 + index * 30, y: 50 + index * 30 }}
        onStop={handleDragStop}
        bounds="parent"
        cancel=".asset-toolbar"
      >
        <div 
          className={`asset-item draggable ${isSelected ? 'selected' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          onDoubleClick={(e) => { 
            e.preventDefault()
            e.stopPropagation()
            if (asset.type === 'chart') onEdit()
          }}
        >
          <div className="drag-handle">
            <span className="material-icons">drag_indicator</span>
          </div>
          
          <AssetContent asset={asset} />
          
          {isSelected && (
            <div 
              className="asset-toolbar" 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {asset.type === 'chart' && (
                <button 
                  type="button" 
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onEdit()
                  }} 
                  title="Editar datos"
                >
                  <span className="material-icons">edit</span>
                </button>
              )}
              <button 
                type="button" 
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onRemove()
                }} 
                title="Eliminar" 
                className="delete-btn"
              >
                <span className="material-icons">delete</span>
              </button>
            </div>
          )}
        </div>
      </Draggable>
    </>
  )
}

// Contenido del asset
function AssetContent({ asset }) {
  switch (asset.type) {
    case 'chart':
      return (
        <Suspense fallback={<div className="loading-chart">Cargando...</div>}>
          <ChartRenderer 
            chartType={asset.chartType} 
            data={asset.customData}
            width={320} 
            height={220} 
          />
        </Suspense>
      )
    
    case 'icon':
      return (
        <div className="asset-icon">
          <span className="material-icons" style={{ fontSize: '56px', color: '#667eea' }}>
            {asset.value}
          </span>
        </div>
      )
    
    case 'image':
      return <img src={asset.url} alt={asset.alt || 'Imagen'} className="asset-image" />
    
    case 'shape':
      return (
        <div className="asset-shape" style={{ color: asset.color }}>
          <span className="material-icons" style={{ fontSize: '64px' }}>{asset.icon}</span>
        </div>
      )
    
    default:
      return <div>Asset</div>
  }
}

// Componente para mostrar assets extraídos del PPTX (logos, imágenes con transparencia, elementos animados)
function ExtractedAssetOverlay({ asset, slideWidth, slideHeight }) {
  // Calcular posición relativa (el contenedor del slide tiene aspect-ratio 16:9)
  const containerWidth = 100 // porcentaje
  const containerHeight = 100
  
  // Convertir EMUs a porcentaje
  const left = (asset.position.x / slideWidth) * containerWidth
  const top = (asset.position.y / slideHeight) * containerHeight
  const width = (asset.position.width / slideWidth) * containerWidth
  const height = (asset.position.height / slideHeight) * containerHeight
  
  // Determinar clases CSS
  const classNames = [
    'extracted-asset-overlay',
    asset.isLogo ? 'is-logo' : '',
    asset.hasTransparency ? 'has-transparency' : '',
    asset.hasAnimation ? 'has-animation' : ''
  ].filter(Boolean).join(' ')
  
  // Título descriptivo
  let title = 'Imagen'
  if (asset.hasAnimation) {
    title = 'Elemento con animación (se verá en movimiento en el PPTX)'
  } else if (asset.isLogo) {
    title = 'Logo extraído (transparencia preservada)'
  } else if (asset.hasTransparency) {
    title = 'Imagen con transparencia'
  }
  
  // Aplicar color de fondo del slide al contenedor del asset
  const backgroundColor = asset.backgroundColor || 'transparent'
  
  return (
    <div 
      className={classNames}
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        pointerEvents: 'none',
        zIndex: asset.hasAnimation ? 15 : 10,
        backgroundColor: backgroundColor  // Aplicar color de fondo del slide
      }}
      title={title}
    >
      <img 
        src={asset.imageBase64} 
        alt={asset.isLogo ? 'Logo' : 'Imagen'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
      {/* Badge para logos */}
      {asset.isLogo && !asset.hasAnimation && (
        <div className="asset-badge">
          <span className="material-icons">verified</span>
        </div>
      )}
      {/* Badge para elementos animados */}
      {asset.hasAnimation && (
        <div className="asset-badge animated-badge">
          <span className="material-icons">animation</span>
        </div>
      )}
    </div>
  )
}

// Componente para mapeo preciso de contenido usando coordenadas exactas del análisis
function PreciseContentOverlay({ slide, onTextEdit }) {
  const [showDebugOverlay, setShowDebugOverlay] = useState(false)
  const [contentValidations, setContentValidations] = useState({})
  
  // Determinar si hay textAreas válidas
  const hasTextAreas = slide.layout && slide.layout.textAreas && slide.layout.textAreas.length > 0

  // Validar contenido cuando cambia (siempre llamar el hook, pero solo ejecutar si hay textAreas)
  useEffect(() => {
    if (!hasTextAreas) return
    
    const validations = {}
    slide.layout.textAreas.forEach((area, idx) => {
      if (!area || !area.position) return // Skip invalid areas
      const content = getContentForArea(area, slide.content)
      validations[idx] = validateContentFits(content, area)
    })
    setContentValidations(validations)
  }, [slide.content, slide.layout?.textAreas, hasTextAreas])

  // Si no hay layout con textAreas, usar fallback genérico
  if (!hasTextAreas) {
    return <FallbackContentOverlay slide={slide} onTextEdit={onTextEdit} />
  }

  // Mapear cada área de texto del análisis a su posición exacta
  return (
    <div className="precise-content-overlay">
      {/* Toggle para debug overlay */}
      <button
        type="button"
        className="debug-toggle"
        onClick={() => setShowDebugOverlay(!showDebugOverlay)}
        title={showDebugOverlay ? 'Ocultar áreas detectadas' : 'Mostrar áreas detectadas'}
      >
        <span className="material-icons">
          {showDebugOverlay ? 'visibility_off' : 'grid_on'}
        </span>
      </button>

      {slide.layout.textAreas.filter(area => area && area.position).map((area, idx) => {
        // Obtener el contenido correspondiente según el tipo de área
        const content = getContentForArea(area, slide.content)
        const isBulletArea = area.type === 'bullets' || area.type === 'body'
        const validation = contentValidations[idx] || { fits: true }
        
        // Ajustar tamaño de fuente automáticamente si no cabe
        const baseFontSize = scaleFontSize(area.formatting?.size || 18)
        const adjustedFontSize = autoAdjustFontSize(content, area, baseFontSize)
        
        return (
          <div
            key={`text-area-${idx}`}
            className={`text-area-overlay ${area.type} ${showDebugOverlay ? 'debug-visible' : ''} ${validation.warning ? 'warning' : ''} ${validation.error ? 'error' : ''}`}
            style={{
              position: 'absolute',
              left: `${area.position?.x_percent || 0}%`,
              top: `${area.position?.y_percent || 0}%`,
              width: `${area.position?.width_percent || 100}%`,
              height: `${area.position?.height_percent || 20}%`,
              zIndex: 20
            }}
            title={`Área: ${area.type} (${area.maxChars} chars max)`}
          >
            {/* Debug overlay para mostrar el área detectada */}
            {showDebugOverlay && (
              <div className="debug-area-border">
                <span className="debug-label">{area.type}</span>
              </div>
            )}

            {/* Alerta de validación */}
            {(validation.warning || validation.error) && (
              <div className={`validation-alert ${validation.error ? 'error' : 'warning'}`}>
                <span className="material-icons">
                  {validation.error ? 'error' : 'warning'}
                </span>
                <span className="validation-message">
                  {validation.error 
                    ? `Excede ${validation.overflow} caracteres` 
                    : 'Cerca del límite'}
                </span>
              </div>
            )}

            {/* Input o textarea según el tipo */}
            {isBulletArea ? (
              <BulletsEditor
                bullets={content}
                area={area}
                onTextEdit={onTextEdit}
                validation={validation}
                adjustedFontSize={adjustedFontSize}
              />
            ) : (
              <textarea
                className="precise-text-input"
                value={content || ''}
                onChange={(e) => onTextEdit(area.type, e.target.value)}
                placeholder={getPlaceholderForType(area.type)}
                maxLength={area.maxChars}
                rows={area.type === 'title' ? 2 : 1}
                style={{
                  fontSize: `${adjustedFontSize}px`,
                  fontFamily: area.formatting?.font || 'Arial',
                  color: area.formatting?.color || '#000000',
                  fontWeight: area.formatting?.bold ? 'bold' : 'normal',
                  fontStyle: area.formatting?.italic ? 'italic' : 'normal',
                  textAlign: getTextAlign(area.formatting?.alignment || area.alignment),
                  width: '100%',
                  height: '100%',
                  background: showDebugOverlay ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  border: showDebugOverlay ? '1px dashed #667eea' : 'none',
                  outline: 'none',
                  resize: 'none',
                  padding: '4px 8px',
                  boxSizing: 'border-box'
                }}
              />
            )}

            {/* Contador de caracteres mejorado */}
            {area.maxChars && (
              <div 
                className={`char-counter ${validation.warning ? 'warning' : ''} ${validation.error ? 'error' : ''}`}
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  right: '0',
                  fontSize: '10px',
                  color: validation.error ? '#ef4444' : validation.warning ? '#f59e0b' : '#6b7280',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: showDebugOverlay || validation.warning || validation.error ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {validation.error && <span className="material-icons" style={{ fontSize: '12px' }}>error</span>}
                {validation.warning && !validation.error && <span className="material-icons" style={{ fontSize: '12px' }}>warning</span>}
                <span>{content?.length || 0} / {area.maxChars}</span>
                {validation.percentage > 0 && (
                  <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>
                    ({Math.round(validation.percentage)}%)
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Editor especializado para bullets
function BulletsEditor({ bullets, area, onTextEdit, validation, adjustedFontSize }) {
  const bulletArray = Array.isArray(bullets) ? bullets : (bullets ? [bullets] : ['', '', ''])
  const baseFontSize = adjustedFontSize || scaleFontSize(area.formatting?.size || 18)
  
  return (
    <div className="bullets-editor" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {bulletArray.map((bullet, index) => {
        // Validar cada bullet individualmente
        const bulletValidation = area.maxChars ? validateContentFits(bullet, { 
          ...area, 
          maxChars: Math.floor(area.maxChars / bulletArray.length) 
        }) : { fits: true }
        
        return (
          <div 
            key={index} 
            className={`bullet-row ${bulletValidation.warning ? 'warning' : ''} ${bulletValidation.error ? 'error' : ''}`}
            style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}
          >
            <span style={{
              fontSize: `${baseFontSize}px`,
              color: area.formatting?.color || '#000000',
              marginRight: '8px',
              flexShrink: 0
            }}>•</span>
            <input
              type="text"
              value={bullet || ''}
              onChange={(e) => {
                const newBullets = [...bulletArray]
                newBullets[index] = e.target.value
                onTextEdit('bullets', newBullets)
              }}
              placeholder={`Punto ${index + 1}`}
              maxLength={area.maxChars ? Math.floor(area.maxChars / bulletArray.length) : undefined}
              style={{
                flex: 1,
                fontSize: `${baseFontSize}px`,
                fontFamily: area.formatting?.font || 'Arial',
                color: area.formatting?.color || '#000000',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '2px 4px',
                borderBottom: bulletValidation.error ? '1px solid #ef4444' : bulletValidation.warning ? '1px solid #f59e0b' : 'none'
              }}
            />
            {bulletArray.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newBullets = bulletArray.filter((_, i) => i !== index)
                  if (newBullets.length === 0) newBullets.push('')
                  onTextEdit('bullets', newBullets)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  opacity: 0.5,
                  fontSize: '16px'
                }}
                title="Eliminar punto"
              >
                ×
              </button>
            )}
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => {
          const newBullets = [...bulletArray, '']
          onTextEdit('bullets', newBullets)
        }}
        style={{
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px dashed #667eea',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px',
          cursor: 'pointer',
          marginTop: '4px'
        }}
      >
        + Agregar punto
      </button>
      
      {/* Alerta de validación para bullets */}
      {validation && (validation.warning || validation.error) && (
        <div style={{
          marginTop: '8px',
          padding: '4px 8px',
          background: validation.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${validation.error ? '#ef4444' : '#f59e0b'}`,
          borderRadius: '4px',
          fontSize: '10px',
          color: validation.error ? '#ef4444' : '#f59e0b'
        }}>
          <span className="material-icons" style={{ fontSize: '12px', verticalAlign: 'middle' }}>
            {validation.error ? 'error' : 'warning'}
          </span>
          {validation.error 
            ? ` Contenido muy largo (${validation.overflow} chars extra)` 
            : ' Cerca del límite de espacio'}
        </div>
      )}
    </div>
  )
}

// Fallback para slides sin análisis de layout
function FallbackContentOverlay({ slide, onTextEdit }) {
  return (
    <div className="content-overlay fallback">
      {slide.type === 'title' ? (
        <>
          <div className="overlay-title">
            <input
              type="text"
              value={slide.content?.title || ''}
              onChange={(e) => onTextEdit('title', e.target.value)}
              placeholder="Título principal"
              className="overlay-input title-input"
            />
          </div>
          <div className="overlay-subtitle">
            <input
              type="text"
              value={slide.content?.subtitle || ''}
              onChange={(e) => onTextEdit('subtitle', e.target.value)}
              placeholder="Subtítulo"
              className="overlay-input subtitle-input"
            />
          </div>
        </>
      ) : (
        <>
          <div className="overlay-heading">
            <input
              type="text"
              value={slide.content?.heading || ''}
              onChange={(e) => onTextEdit('heading', e.target.value)}
              placeholder="Título"
              className="overlay-input heading-input"
            />
          </div>
          <div className="overlay-bullets">
            {(slide.content?.bullets || ['', '', '']).map((bullet, index) => (
              <div key={index} className="overlay-bullet-item">
                <span className="bullet-marker">•</span>
                <input
                  type="text"
                  value={bullet || ''}
                  onChange={(e) => {
                    const newBullets = [...(slide.content?.bullets || ['', '', ''])]
                    newBullets[index] = e.target.value
                    onTextEdit('bullets', newBullets)
                  }}
                  placeholder={`Punto ${index + 1}`}
                  className="overlay-input bullet-input"
                />
                <button
                  type="button"
                  className="remove-bullet-btn"
                  onClick={() => {
                    const newBullets = [...(slide.content?.bullets || [])]
                    newBullets.splice(index, 1)
                    if (newBullets.length === 0) newBullets.push('')
                    onTextEdit('bullets', newBullets)
                  }}
                  title="Eliminar punto"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-bullet-btn"
              onClick={() => {
                const newBullets = [...(slide.content?.bullets || []), '']
                onTextEdit('bullets', newBullets)
              }}
            >
              <span className="material-icons">add</span>
              Agregar punto
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Utilidades
function getContentForArea(area, content) {
  if (!content) return ''
  
  switch (area.type) {
    case 'title':
      return content.title || ''
    case 'subtitle':
      return content.subtitle || ''
    case 'heading':
      return content.heading || ''
    case 'bullets':
    case 'body':
      return content.bullets || ['', '', '']
    default:
      return content[area.type] || ''
  }
}

function getPlaceholderForType(type) {
  const placeholders = {
    title: 'Título principal',
    subtitle: 'Subtítulo',
    heading: 'Encabezado',
    body: 'Contenido',
    bullets: 'Puntos clave'
  }
  return placeholders[type] || 'Texto'
}

function getTextAlign(alignment) {
  if (!alignment) return 'left'
  const alignStr = String(alignment).toLowerCase()
  if (alignStr.includes('center') || alignStr.includes('1')) return 'center'
  if (alignStr.includes('right') || alignStr.includes('2')) return 'right'
  if (alignStr.includes('justify') || alignStr.includes('3')) return 'justify'
  return 'left'
}

function scaleFontSize(originalSize) {
  // Escalar el tamaño de fuente para que se vea bien en el preview
  // El preview es más pequeño que el slide real, así que escalamos proporcionalmente
  return Math.max(10, Math.min(48, originalSize * 0.5))
}

// ============================================
// VALIDACIÓN Y AJUSTE AUTOMÁTICO DE CONTENIDO
// ============================================

/**
 * Valida si el contenido cabe en el área disponible
 */
function validateContentFits(content, area) {
  if (!content || !area.maxChars) {
    return { fits: true, overflow: 0, percentage: 0 }
  }
  
  const contentLength = typeof content === 'string' ? content.length : JSON.stringify(content).length
  const maxChars = area.maxChars
  const percentage = (contentLength / maxChars) * 100
  
  return {
    fits: contentLength <= maxChars,
    overflow: Math.max(0, contentLength - maxChars),
    percentage: Math.min(100, percentage),
    warning: percentage > 90,
    error: percentage > 100
  }
}

/**
 * Ajusta automáticamente el tamaño de fuente si el contenido no cabe
 */
function autoAdjustFontSize(content, area, baseFontSize) {
  if (!content || !area.maxChars) {
    return baseFontSize
  }
  
  const validation = validateContentFits(content, area)
  
  if (validation.fits) {
    return baseFontSize
  }
  
  // Reducir fuente proporcionalmente al overflow
  const reductionFactor = Math.min(0.8, 1 - (validation.overflow / area.maxChars))
  const adjustedSize = Math.max(8, baseFontSize * reductionFactor)
  
  return adjustedSize
}

/**
 * Trunca el contenido si excede el límite
 */
function truncateContent(content, maxChars) {
  if (!content || !maxChars) return content
  
  if (typeof content === 'string') {
    if (content.length <= maxChars) return content
    return content.substring(0, maxChars - 3) + '...'
  }
  
  if (Array.isArray(content)) {
    // Para bullets, truncar cada elemento
    return content.map(item => {
      if (typeof item === 'string' && item.length > maxChars / content.length) {
        return item.substring(0, Math.floor(maxChars / content.length) - 3) + '...'
      }
      return item
    })
  }
  
  return content
}

/**
 * Sugiere mejoras para que el contenido quepa
 */
function suggestContentImprovements(content, area) {
  const validation = validateContentFits(content, area)
  
  if (validation.fits) {
    return null
  }
  
  const suggestions = []
  
  if (validation.overflow > 0) {
    suggestions.push(`Reducir ${validation.overflow} caracteres`)
  }
  
  if (validation.percentage > 120) {
    suggestions.push('Considerar dividir en múltiples slides')
  } else if (validation.percentage > 100) {
    suggestions.push('Usar fuente más pequeña')
    suggestions.push('Acortar frases')
  }
  
  return {
    overflow: validation.overflow,
    suggestions
  }
}

export default SlideViewer
