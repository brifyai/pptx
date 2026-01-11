import { useState } from 'react'
import '../styles/MobileTabBar.css'

function MobileTabBar({ activeTab, onTabChange, onCreateClick }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Inicio' },
    { id: 'chat', icon: 'chat', label: 'Chat' },
    { id: 'create', icon: 'add_circle', label: 'Crear', isFAB: true },
    { id: 'slides', icon: 'slideshow', label: 'Slides' },
    { id: 'more', icon: 'menu', label: 'Más' }
  ]

  return (
    <nav className="mobile-tab-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''} ${tab.isFAB ? 'fab' : ''}`}
          onClick={() => tab.isFAB ? onCreateClick() : onTabChange(tab.id)}
          aria-label={tab.label}
        >
          <span className="material-icons tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default MobileTabBar
