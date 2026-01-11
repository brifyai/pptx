import { useState, useMemo } from 'react'

const iconCategories = {
  'Negocios': ['business', 'work', 'trending_up', 'trending_down', 'analytics', 'insights', 'assessment', 'bar_chart', 'pie_chart', 'show_chart', 'timeline', 'account_balance', 'payments', 'credit_card', 'attach_money', 'monetization_on', 'savings', 'receipt', 'inventory', 'storefront', 'shopping_cart', 'local_shipping', 'handshake', 'real_estate_agent'],
  'Comunicación': ['mail', 'email', 'chat', 'forum', 'message', 'send', 'call', 'phone', 'video_call', 'contacts', 'share', 'campaign', 'announcement', 'notifications', 'feedback', 'comment', 'textsms', 'mark_email_read', 'forward_to_inbox', 'contact_mail'],
  'Personas': ['person', 'people', 'group', 'groups', 'diversity_3', 'handshake', 'support_agent', 'engineering', 'school', 'psychology', 'face', 'sentiment_satisfied', 'emoji_people', 'supervisor_account', 'manage_accounts', 'badge', 'person_add', 'person_search'],
  'Tecnología': ['computer', 'laptop', 'smartphone', 'tablet', 'devices', 'cloud', 'cloud_upload', 'cloud_download', 'storage', 'database', 'memory', 'code', 'terminal', 'api', 'integration_instructions', 'security', 'vpn_key', 'lock', 'verified', 'wifi', 'bluetooth', 'usb', 'developer_mode', 'bug_report'],
  'Navegación': ['home', 'menu', 'search', 'settings', 'tune', 'filter_list', 'sort', 'arrow_forward', 'arrow_back', 'arrow_upward', 'arrow_downward', 'chevron_right', 'chevron_left', 'expand_more', 'expand_less', 'open_in_new', 'launch', 'first_page', 'last_page', 'subdirectory_arrow_right'],
  'Acciones': ['check', 'check_circle', 'done', 'done_all', 'close', 'cancel', 'add', 'remove', 'edit', 'delete', 'save', 'download', 'upload', 'refresh', 'sync', 'undo', 'redo', 'copy', 'content_paste', 'content_cut', 'select_all', 'deselect', 'zoom_in', 'zoom_out'],
  'Objetos': ['lightbulb', 'emoji_objects', 'flag', 'bookmark', 'star', 'favorite', 'thumb_up', 'thumb_down', 'grade', 'workspace_premium', 'emoji_events', 'military_tech', 'rocket_launch', 'target', 'gps_fixed', 'key', 'lock_open', 'shield', 'verified_user', 'workspace_premium'],
  'Tiempo': ['schedule', 'access_time', 'timer', 'hourglass_empty', 'calendar_today', 'event', 'date_range', 'today', 'update', 'history', 'restore', 'alarm', 'alarm_on', 'snooze', 'timer_off', 'watch_later'],
  'Ubicación': ['location_on', 'place', 'map', 'public', 'language', 'explore', 'near_me', 'directions', 'navigation', 'my_location', 'pin_drop', 'add_location', 'edit_location', 'wrong_location', 'travel_explore'],
  'Alertas': ['info', 'help', 'warning', 'error', 'report', 'priority_high', 'new_releases', 'tips_and_updates', 'task_alt', 'rule', 'notification_important', 'error_outline', 'help_outline', 'info_outline'],
  'Multimedia': ['play_arrow', 'pause', 'stop', 'skip_next', 'skip_previous', 'fast_forward', 'fast_rewind', 'volume_up', 'volume_down', 'volume_mute', 'mic', 'videocam', 'photo_camera', 'image', 'movie', 'music_note'],
  'Educación': ['school', 'menu_book', 'auto_stories', 'library_books', 'science', 'biotech', 'calculate', 'architecture', 'draw', 'brush', 'palette', 'design_services']
}

const colorOptions = [
  { name: 'PowerPoint', color: '#D24726' },
  { name: 'Azul', color: '#3b82f6' },
  { name: 'Verde', color: '#10b981' },
  { name: 'Morado', color: '#8b5cf6' },
  { name: 'Rosa', color: '#ec4899' },
  { name: 'Naranja', color: '#f97316' },
  { name: 'Amarillo', color: '#eab308' },
  { name: 'Gris', color: '#6b7280' },
  { name: 'Negro', color: '#1f2937' }
]

const sizeOptions = [
  { name: 'Pequeño', size: 32 },
  { name: 'Mediano', size: 48 },
  { name: 'Grande', size: 64 },
  { name: 'Extra Grande', size: 96 }
]

function IconPicker({ query = '', onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedColor, setSelectedColor] = useState('#D24726')
  const [selectedSize, setSelectedSize] = useState(48)
  const [previewIcon, setPreviewIcon] = useState(null)
  
  const filteredIcons = useMemo(() => {
    let icons = []
    
    if (selectedCategory === 'all') {
      Object.values(iconCategories).forEach(categoryIcons => {
        icons = [...icons, ...categoryIcons]
      })
    } else {
      icons = iconCategories[selectedCategory] || []
    }
    
    if (query) {
      icons = icons.filter(icon => icon.toLowerCase().includes(query.toLowerCase()))
    }
    
    return [...new Set(icons)]
  }, [selectedCategory, query])

  const handleSelectIcon = (icon) => {
    onSelect({
      icon,
      color: selectedColor,
      size: selectedSize,
      name: icon.replace(/_/g, ' ')
    })
  }

  return (
    <div className="icon-picker">
      {/* Opciones de personalización */}
      <div className="icon-customization">
        <div className="customization-row">
          <label>Color:</label>
          <div className="color-options">
            {colorOptions.map(opt => (
              <button
                key={opt.name}
                type="button"
                className={`color-btn ${selectedColor === opt.color ? 'active' : ''}`}
                style={{ backgroundColor: opt.color }}
                onClick={() => setSelectedColor(opt.color)}
                title={opt.name}
              />
            ))}
          </div>
        </div>
        <div className="customization-row">
          <label>Tamaño:</label>
          <div className="size-options">
            {sizeOptions.map(opt => (
              <button
                key={opt.name}
                type="button"
                className={`size-btn ${selectedSize === opt.size ? 'active' : ''}`}
                onClick={() => setSelectedSize(opt.size)}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview del icono seleccionado */}
      {previewIcon && (
        <div className="icon-preview-box">
          <span 
            className="material-icons" 
            style={{ fontSize: selectedSize, color: selectedColor }}
          >
            {previewIcon}
          </span>
          <button 
            type="button" 
            className="insert-preview-btn"
            onClick={() => handleSelectIcon(previewIcon)}
          >
            Insertar
          </button>
        </div>
      )}

      <div className="category-tabs">
        <button 
          type="button"
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </button>
        {Object.keys(iconCategories).map(category => (
          <button
            type="button"
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="icons-count">
        {filteredIcons.length} iconos disponibles
      </div>
      
      <div className="icon-grid">
        {filteredIcons.map(icon => (
          <button 
            type="button"
            key={icon} 
            onClick={() => handleSelectIcon(icon)}
            onMouseEnter={() => setPreviewIcon(icon)}
            onMouseLeave={() => setPreviewIcon(null)}
            title={icon.replace(/_/g, ' ')}
            className="icon-btn"
          >
            <span className="material-icons" style={{ color: selectedColor }}>{icon}</span>
            <span className="icon-name">{icon.replace(/_/g, ' ')}</span>
          </button>
        ))}
      </div>
      
      {filteredIcons.length === 0 && (
        <div className="no-results">
          <span className="material-icons">search_off</span>
          <p>No se encontraron iconos</p>
        </div>
      )}
    </div>
  )
}

export default IconPicker
