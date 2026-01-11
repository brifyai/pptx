import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import '../styles/KeyboardShortcutsHelp.css'

function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null

  const categories = {
    general: 'General',
    navigation: 'Navegación',
    help: 'Ayuda'
  }

  const groupedShortcuts = KEYBOARD_SHORTCUTS.reduce((acc, shortcut) => {
    const cat = shortcut.category || 'general'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(shortcut)
    return acc
  }, {})

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h3>
            <span className="material-icons">keyboard</span>
            Atajos de Teclado
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="shortcuts-content">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category} className="shortcut-category">
              <h4>{categories[category]}</h4>
              <div className="shortcuts-list">
                {shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd>{key}</kbd>
                          {i < shortcut.keys.length - 1 && <span className="plus">+</span>}
                        </span>
                      ))}
                    </div>
                    <span className="shortcut-desc">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Presiona <kbd>?</kbd> en cualquier momento para ver esta ayuda</p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
