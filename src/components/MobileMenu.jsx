import { useEffect } from 'react'
import '../styles/MobileMenu.css'

function MobileMenu({ 
  isOpen, 
  onClose, 
  user, 
  onLogout,
  onShowProfile,
  onShowLibrary,
  onShowThemes,
  onShowAnalytics,
  onShowCollaboration,
  onShowHistory,
  onShowAssets,
  onShowShortcuts,
  onShowHelp,
  onShowSettings,
  onNavigateHome
}) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAction = (action) => {
    onClose()
    
    switch (action) {
      case 'profile':
        onShowProfile?.()
        break
      case 'library':
        onShowLibrary?.()
        break
      case 'theme':
        onShowThemes?.()
        break
      case 'analytics':
        onShowAnalytics?.()
        break
      case 'collaboration':
        onShowCollaboration?.()
        break
      case 'history':
        onShowHistory?.()
        break
      case 'assets':
        onShowAssets?.()
        break
      case 'shortcuts':
        onShowShortcuts?.()
        break
      case 'help':
        onShowHelp?.()
        break
      case 'settings':
        onShowSettings?.()
        break
      case 'home':
        onNavigateHome?.()
        break
      default:
        console.log('Acción no implementada:', action)
    }
  }

  const menuItems = [
    { icon: 'account_circle', label: 'Mi Perfil', action: 'profile' },
    { icon: 'folder', label: 'Biblioteca de Templates', action: 'library' },
    { icon: 'palette', label: 'Personalizar Tema', action: 'theme' },
    { icon: 'analytics', label: 'Analytics', action: 'analytics' },
    { icon: 'history', label: 'Historial de Versiones', action: 'history' },
    { icon: 'photo_library', label: 'Assets', action: 'assets' },
  ]

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose} />
      <nav className="mobile-menu">
        <div className="mobile-menu-header">
          <button className="close-menu-btn" onClick={onClose} aria-label="Cerrar menú">
            <span className="material-icons">close</span>
          </button>
          <h2>Menú</h2>
        </div>

        <div className="mobile-menu-user">
          <div className="user-avatar">
            <span className="material-icons">account_circle</span>
          </div>
          <div className="user-info">
            <div className="user-name">{user?.displayName || 'Usuario'}</div>
            <div className="user-email">{user?.email || 'usuario@ejemplo.com'}</div>
          </div>
        </div>

        <div className="mobile-menu-items">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="mobile-menu-item"
              onClick={() => handleAction(item.action)}
            >
              <span className="material-icons menu-item-icon">{item.icon}</span>
              <span className="menu-item-label">{item.label}</span>
              <span className="material-icons menu-item-arrow">chevron_right</span>
            </button>
          ))}
        </div>

        <div className="mobile-menu-footer">
          <button className="logout-btn" onClick={() => {
            onClose()
            onLogout?.()
          }}>
            <span className="material-icons">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default MobileMenu
