import { useState, useRef, useEffect } from 'react'
import '../styles/HeaderDropdown.css'

function HeaderDropdown({ icon, label, items, isActive }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item) => {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div className={`header-dropdown ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <button 
        type="button"
        className={`dropdown-trigger ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={label}
      >
        <span className="material-icons">{icon}</span>
        <span className="material-icons arrow">expand_more</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">{label}</div>
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className="dropdown-item"
              onClick={() => handleItemClick(item)}
            >
              <span className="material-icons">{item.icon}</span>
              <span className="item-label">{item.label}</span>
              {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeaderDropdown
