import BottomSheet from './BottomSheet'
import '../styles/MobileCreateModal.css'

function MobileCreateModal({ isOpen, onClose, onSelectOption }) {
  const options = [
    {
      icon: 'upload_file',
      title: 'Subir Template',
      description: 'Usa tu diseño corporativo',
      color: 'orange',
      action: 'upload'
    },
    {
      icon: 'description',
      title: 'Crear desde Cero',
      description: 'Empieza con plantilla base',
      color: 'blue',
      action: 'blank'
    },
    {
      icon: 'folder_special',
      title: 'Biblioteca',
      description: 'Usa un template guardado',
      color: 'purple',
      action: 'library'
    },
    {
      icon: 'content_paste',
      title: 'Importar Texto',
      description: 'Pega contenido de ChatGPT',
      color: 'green',
      action: 'text'
    }
  ]

  const handleSelect = (action) => {
    onSelectOption(action)
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Presentación"
      snapPoints={[0.6]}
      initialSnap={0.6}
    >
      <div className="mobile-create-modal">
        <div className="create-options-grid">
          {options.map((option, index) => (
            <button
              key={index}
              className={`create-option ${option.color}`}
              onClick={() => handleSelect(option.action)}
            >
              <div className="option-icon-wrapper">
                <span className="material-icons">{option.icon}</span>
              </div>
              <div className="option-content">
                <div className="option-title">{option.title}</div>
                <div className="option-description">{option.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="create-hint">
          <span className="material-icons">info</span>
          <p>Tip: Puedes subir tu template corporativo para mantener tu branding</p>
        </div>
      </div>
    </BottomSheet>
  )
}

export default MobileCreateModal
