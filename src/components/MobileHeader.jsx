import '../styles/MobileHeader.css'

function MobileHeader({ 
  title = 'Slide AI', 
  onMenuClick, 
  onProfileClick, 
  showBack = false, 
  onBackClick,
  actions = []
}) {
  return (
    <header className="mobile-header">
      <div className="mobile-header-left">
        {showBack ? (
          <button className="header-btn" onClick={onBackClick} aria-label="Volver">
            <span className="material-icons">arrow_back</span>
          </button>
        ) : (
          <button className="header-btn" onClick={onMenuClick} aria-label="Menú">
            <span className="material-icons">menu</span>
          </button>
        )}
        <h1 className="mobile-header-title">{title}</h1>
      </div>
      
      <div className="mobile-header-right">
        {actions.map((action, index) => (
          <button 
            key={index}
            className="header-btn" 
            onClick={action.onClick}
            aria-label={action.label}
          >
            <span className="material-icons">{action.icon}</span>
          </button>
        ))}
        <button className="header-btn profile-btn" onClick={onProfileClick} aria-label="Perfil">
          <span className="material-icons">account_circle</span>
        </button>
      </div>
    </header>
  )
}

export default MobileHeader
