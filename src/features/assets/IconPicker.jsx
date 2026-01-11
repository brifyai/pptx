import { useState, useMemo } from 'react'

const iconCategories = {
  'Negocios': ['business', 'work', 'trending_up', 'trending_down', 'analytics', 'insights', 'assessment', 'bar_chart', 'pie_chart', 'show_chart', 'timeline', 'account_balance', 'payments', 'credit_card', 'attach_money', 'monetization_on', 'savings', 'receipt', 'inventory', 'storefront'],
  'Comunicación': ['mail', 'email', 'chat', 'forum', 'message', 'send', 'call', 'phone', 'video_call', 'contacts', 'share', 'campaign', 'announcement', 'notifications', 'feedback'],
  'Personas': ['person', 'people', 'group', 'groups', 'diversity_3', 'handshake', 'support_agent', 'engineering', 'school', 'psychology', 'face', 'sentiment_satisfied', 'emoji_people'],
  'Tecnología': ['computer', 'laptop', 'smartphone', 'tablet', 'devices', 'cloud', 'cloud_upload', 'cloud_download', 'storage', 'database', 'memory', 'code', 'terminal', 'api', 'integration_instructions', 'security', 'vpn_key', 'lock', 'verified'],
  'Navegación': ['home', 'menu', 'search', 'settings', 'tune', 'filter_list', 'sort', 'arrow_forward', 'arrow_back', 'arrow_upward', 'arrow_downward', 'chevron_right', 'chevron_left', 'expand_more', 'expand_less', 'open_in_new', 'launch'],
  'Acciones': ['check', 'check_circle', 'done', 'done_all', 'close', 'cancel', 'add', 'remove', 'edit', 'delete', 'save', 'download', 'upload', 'refresh', 'sync', 'undo', 'redo', 'copy', 'content_paste'],
  'Objetos': ['lightbulb', 'emoji_objects', 'flag', 'bookmark', 'star', 'favorite', 'thumb_up', 'thumb_down', 'grade', 'workspace_premium', 'emoji_events', 'military_tech', 'rocket_launch', 'target', 'gps_fixed'],
  'Tiempo': ['schedule', 'access_time', 'timer', 'hourglass_empty', 'calendar_today', 'event', 'date_range', 'today', 'update', 'history', 'restore'],
  'Ubicación': ['location_on', 'place', 'map', 'public', 'language', 'explore', 'near_me', 'directions', 'navigation', 'my_location'],
  'Alertas': ['info', 'help', 'warning', 'error', 'report', 'priority_high', 'new_releases', 'tips_and_updates', 'task_alt', 'rule']
}

function IconPicker({ query = '', onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
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
    
    return [...new Set(icons)] // Remove duplicates
  }, [selectedCategory, query])

  return (
    <div className="icon-picker">
      <div className="category-tabs">
        <button 
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </button>
        {Object.keys(iconCategories).map(category => (
          <button
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
            key={icon} 
            onClick={() => onSelect(icon)} 
            title={icon.replace(/_/g, ' ')}
          >
            <span className="material-icons">{icon}</span>
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
