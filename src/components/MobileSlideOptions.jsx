import BottomSheet from './BottomSheet'
import '../styles/MobileSlideOptions.css'

function MobileSlideOptions({ 
  isOpen, 
  onClose, 
  slide, 
  onDuplicate, 
  onDelete, 
  onRename,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}) {
  const options = [
    {
      icon: 'content_copy',
      label: 'Duplicar slide',
      onClick: () => {
        onDuplicate()
        onClose()
      },
      color: 'default'
    },
    {
      icon: 'arrow_upward',
      label: 'Mover arriba',
      onClick: () => {
        onMoveUp()
        onClose()
      },
      disabled: !canMoveUp,
      color: 'default'
    },
    {
      icon: 'arrow_downward',
      label: 'Mover abajo',
      onClick: () => {
        onMoveDown()
        onClose()
      },
      disabled: !canMoveDown,
      color: 'default'
    },
    {
      icon: 'drive_file_rename_outline',
      label: 'Renombrar',
      onClick: () => {
        onRename()
        onClose()
      },
      color: 'default'
    },
    {
      icon: 'delete',
      label: 'Eliminar slide',
      onClick: () => {
        onDelete()
        onClose()
      },
      color: 'danger'
    }
  ]

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Opciones del Slide"
      snapPoints={[0.4]}
      initialSnap={0.4}
    >
      <div className="mobile-slide-options">
        {slide && (
          <div className="slide-preview-mini">
            {slide.preview ? (
              <img src={slide.preview} alt={`Slide ${slide.id}`} />
            ) : (
              <div className="preview-placeholder">
                <span className="material-icons">slideshow</span>
              </div>
            )}
            <div className="slide-info">
              <div className="slide-number">Slide {slide.id}</div>
              <div className="slide-type">{slide.type === 'title' ? 'Título' : 'Contenido'}</div>
            </div>
          </div>
        )}

        <div className="options-list">
          {options.map((option, index) => (
            <button
              key={index}
              className={`option-item ${option.color} ${option.disabled ? 'disabled' : ''}`}
              onClick={option.onClick}
              disabled={option.disabled}
            >
              <span className="material-icons option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
              <span className="material-icons option-arrow">chevron_right</span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}

export default MobileSlideOptions
