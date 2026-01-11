import { memo } from 'react'
import { useLongPress } from '../hooks/useSwipe'
import { useMobile } from '../hooks/useMobile'

/**
 * Componente memoizado para thumbnails de slides
 * Optimiza el renderizado evitando re-renders innecesarios
 */
const SlideThumbnail = memo(function SlideThumbnail({
  slide,
  index,
  currentSlide,
  draggedSlide,
  dragOverSlide,
  editingSlideId,
  slideNameInput,
  onSlideChange,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onSlideOptionsOpen,
  onSlideNameChange,
  onSaveRename,
  onCancelRename
}) {
  const isMobile = useMobile(768)

  // Long press handler para mobile
  const longPressHandlers = isMobile && onSlideOptionsOpen ? useLongPress(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      onSlideOptionsOpen(slide, index)
    },
    500
  ) : {}

  return (
    <div
      className={`thumbnail ${index === currentSlide ? 'active' : ''} ${draggedSlide === index ? 'dragging' : ''} ${dragOverSlide === index ? 'drag-over' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={() => onSlideChange(index)}
      onContextMenu={(e) => onContextMenu(e, index)}
      {...longPressHandlers}
    >
      <div className="thumbnail-number">{index + 1}</div>
      <div className="thumbnail-preview">
        {slide.preview ? (
          <img 
            src={slide.preview} 
            alt={`Slide ${index + 1}`}
            draggable="false"
            loading="lazy"
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
            onChange={(e) => onSlideNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveRename()
              if (e.key === 'Escape') onCancelRename()
            }}
            onBlur={onSaveRename}
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
          onContextMenu(e, index)
        }}
        title="Opciones"
      >
        <span className="material-icons">more_vert</span>
      </button>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders innecesarios
  return (
    prevProps.slide.id === nextProps.slide.id &&
    prevProps.slide.preview === nextProps.slide.preview &&
    prevProps.slide.name === nextProps.slide.name &&
    prevProps.currentSlide === nextProps.currentSlide &&
    prevProps.draggedSlide === nextProps.draggedSlide &&
    prevProps.dragOverSlide === nextProps.dragOverSlide &&
    prevProps.editingSlideId === nextProps.editingSlideId &&
    prevProps.slideNameInput === nextProps.slideNameInput
  )
})

export default SlideThumbnail
