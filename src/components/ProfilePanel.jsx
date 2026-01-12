import { useState, useEffect } from 'react'
import '../styles/ProfilePanel.css'

function ProfilePanel({ isOpen, onClose, onSelectTemplate, onLogout, initialTab = 'profile' }) {
  const [savedTemplates, setSavedTemplates] = useState([])
  const [activeTab, setActiveTab] = useState(initialTab) // profile, templates, settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    avatar: null
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadSavedTemplates()
      loadProfile()
      setActiveTab(initialTab) // Reset to initial tab when opening
    }
  }, [isOpen, initialTab])

  const loadProfile = () => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
    setProfile({
      name: savedProfile.name || '',
      email: savedProfile.email || '',
      phone: savedProfile.phone || '',
      company: savedProfile.company || '',
      role: savedProfile.role || '',
      avatar: savedProfile.avatar || null
    })
  }

  const loadSavedTemplates = () => {
    const templates = JSON.parse(localStorage.getItem('savedTemplates') || '[]')
    setSavedTemplates(templates)
  }

  const handleEditProfile = () => {
    setEditedProfile({ ...profile })
    setIsEditing(true)
  }

  const handleSaveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(editedProfile))
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedProfile({})
    setIsEditing(false)
  }

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleProfileChange('avatar', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeleteTemplate = (templateId) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      const templates = savedTemplates.filter(t => t.id !== templateId)
      localStorage.setItem('savedTemplates', JSON.stringify(templates))
      setSavedTemplates(templates)
    }
  }

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template)
    onClose()
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!isOpen) return null

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" />
            ) : profile.name ? (
              <span className="initials">{getInitials(profile.name)}</span>
            ) : (
              <span className="material-icons">person</span>
            )}
          </div>
          <div className="profile-info">
            <h3>{profile.name || 'Mi Perfil'}</h3>
            <p>{profile.email || 'Configura tu información'}</p>
          </div>
          <div className="profile-header-actions">
            {onLogout && (
              <button 
                type="button" 
                className="logout-header-btn" 
                onClick={() => {
                  onClose()
                  onLogout()
                }}
                title="Cerrar sesión"
              >
                <span className="material-icons">logout</span>
              </button>
            )}
            <button type="button" className="close-btn" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="material-icons">person</span>
            Perfil
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <span className="material-icons">folder</span>
            Plantillas
            {savedTemplates.length > 0 && <span className="badge">{savedTemplates.length}</span>}
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="material-icons">settings</span>
            Ajustes
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              {!isEditing ? (
                <>
                  <div className="profile-card">
                    <div className="profile-card-avatar">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {profile.name ? getInitials(profile.name) : <span className="material-icons">person</span>}
                        </div>
                      )}
                    </div>
                    <div className="profile-card-info">
                      <h4>{profile.name || 'Sin nombre'}</h4>
                      {profile.role && <p className="role">{profile.role}</p>}
                      {profile.company && <p className="company">{profile.company}</p>}
                    </div>
                  </div>

                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="material-icons">email</span>
                      <div className="detail-content">
                        <label>Email</label>
                        <p>{profile.email || 'No configurado'}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="material-icons">phone</span>
                      <div className="detail-content">
                        <label>Teléfono</label>
                        <p>{profile.phone || 'No configurado'}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="material-icons">business</span>
                      <div className="detail-content">
                        <label>Empresa</label>
                        <p>{profile.company || 'No configurado'}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="material-icons">badge</span>
                      <div className="detail-content">
                        <label>Cargo</label>
                        <p>{profile.role || 'No configurado'}</p>
                      </div>
                    </div>
                  </div>

                  <button type="button" className="btn-edit-profile" onClick={handleEditProfile}>
                    <span className="material-icons">edit</span>
                    Editar perfil
                  </button>
                </>
              ) : (
                <div className="profile-edit-form">
                  <div className="avatar-edit">
                    <div className="avatar-preview">
                      {editedProfile.avatar ? (
                        <img src={editedProfile.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {editedProfile.name ? getInitials(editedProfile.name) : <span className="material-icons">person</span>}
                        </div>
                      )}
                    </div>
                    <label className="avatar-upload-btn">
                      <span className="material-icons">photo_camera</span>
                      Cambiar foto
                      <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                    </label>
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="material-icons">person</span>
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={editedProfile.name || ''}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="material-icons">email</span>
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="material-icons">phone</span>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="material-icons">business</span>
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={editedProfile.company || ''}
                      onChange={(e) => handleProfileChange('company', e.target.value)}
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="material-icons">badge</span>
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={editedProfile.role || ''}
                      onChange={(e) => handleProfileChange('role', e.target.value)}
                      placeholder="Tu cargo o rol"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                      Cancelar
                    </button>
                    <button type="button" className="btn-save" onClick={handleSaveProfile}>
                      <span className="material-icons">check</span>
                      Guardar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'templates' && (
            <div className="templates-section">
              {savedTemplates.length === 0 ? (
                <div className="empty-state">
                  <span className="material-icons">folder_open</span>
                  <h4>No hay plantillas guardadas</h4>
                  <p>Sube una plantilla y guárdala para usarla después</p>
                </div>
              ) : (
                <div className="templates-grid">
                  {savedTemplates.map(template => (
                    <div key={template.id} className="template-card">
                      <div className="template-preview">
                        {template.preview ? (
                          <img src={template.preview} alt={template.name} />
                        ) : (
                          <div className="template-placeholder">
                            <span className="material-icons">slideshow</span>
                          </div>
                        )}
                      </div>
                      <div className="template-info">
                        <h4>{template.name}</h4>
                        <div className="template-meta">
                          <span>
                            <span className="material-icons">layers</span>
                            {template.slideCount} slides
                          </span>
                          <span>
                            <span className="material-icons">calendar_today</span>
                            {formatDate(template.savedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="template-actions">
                        <button
                          type="button"
                          className="btn-use"
                          onClick={() => handleSelectTemplate(template)}
                          title="Usar plantilla"
                        >
                          <span className="material-icons">play_arrow</span>
                          Usar
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Eliminar"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="setting-group">
                <h4>
                  <span className="material-icons">palette</span>
                  Apariencia
                </h4>
                <div className="setting-item">
                  <label>Tema</label>
                  <select className="setting-select">
                    <option>Claro</option>
                    <option>Oscuro</option>
                    <option>Automático</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h4>
                  <span className="material-icons">smart_toy</span>
                  IA
                </h4>
                <div className="setting-item">
                  <label>Modelo preferido</label>
                  <select className="setting-select">
                    <option>MiniMax M2.1</option>
                    <option>GPT-4</option>
                    <option>Gemini Pro</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h4>
                  <span className="material-icons">storage</span>
                  Almacenamiento
                </h4>
                <div className="setting-item">
                  <label>Plantillas guardadas</label>
                  <div className="storage-info">
                    <span>{savedTemplates.length} plantillas</span>
                    <button
                      type="button"
                      className="btn-clear"
                      onClick={() => {
                        if (confirm('¿Eliminar todas las plantillas?')) {
                          localStorage.removeItem('savedTemplates')
                          setSavedTemplates([])
                        }
                      }}
                    >
                      Limpiar todo
                    </button>
                  </div>
                </div>
              </div>

              {onLogout && (
                <div className="setting-group logout-group">
                  <button
                    type="button"
                    className="btn-logout"
                    onClick={() => {
                      onClose()
                      onLogout()
                    }}
                  >
                    <span className="material-icons">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePanel
