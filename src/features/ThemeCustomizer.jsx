import { useState } from 'react'
import '../styles/ThemeCustomizer.css'

const fontCategories = {
  'Sans Serif': [
    { name: 'Inter', family: 'Inter, sans-serif' },
    { name: 'Roboto', family: 'Roboto, sans-serif' },
    { name: 'Open Sans', family: 'Open Sans, sans-serif' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { name: 'Poppins', family: 'Poppins, sans-serif' },
    { name: 'Lato', family: 'Lato, sans-serif' },
    { name: 'Nunito', family: 'Nunito, sans-serif' },
    { name: 'Source Sans Pro', family: 'Source Sans Pro, sans-serif' },
    { name: 'Raleway', family: 'Raleway, sans-serif' },
    { name: 'Ubuntu', family: 'Ubuntu, sans-serif' },
    { name: 'Work Sans', family: 'Work Sans, sans-serif' },
    { name: 'Quicksand', family: 'Quicksand, sans-serif' },
    { name: 'Rubik', family: 'Rubik, sans-serif' },
    { name: 'Karla', family: 'Karla, sans-serif' },
    { name: 'Manrope', family: 'Manrope, sans-serif' },
    { name: 'DM Sans', family: 'DM Sans, sans-serif' },
    { name: 'Outfit', family: 'Outfit, sans-serif' },
    { name: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans, sans-serif' },
    { name: 'Space Grotesk', family: 'Space Grotesk, sans-serif' },
    { name: 'Figtree', family: 'Figtree, sans-serif' }
  ],
  'Serif': [
    { name: 'Playfair Display', family: 'Playfair Display, serif' },
    { name: 'Merriweather', family: 'Merriweather, serif' },
    { name: 'Lora', family: 'Lora, serif' },
    { name: 'PT Serif', family: 'PT Serif, serif' },
    { name: 'Crimson Text', family: 'Crimson Text, serif' },
    { name: 'Libre Baskerville', family: 'Libre Baskerville, serif' },
    { name: 'Cormorant Garamond', family: 'Cormorant Garamond, serif' },
    { name: 'EB Garamond', family: 'EB Garamond, serif' },
    { name: 'Bitter', family: 'Bitter, serif' },
    { name: 'Spectral', family: 'Spectral, serif' },
    { name: 'Noto Serif', family: 'Noto Serif, serif' },
    { name: 'Source Serif Pro', family: 'Source Serif Pro, serif' },
    { name: 'Vollkorn', family: 'Vollkorn, serif' },
    { name: 'Cardo', family: 'Cardo, serif' },
    { name: 'Fraunces', family: 'Fraunces, serif' }
  ],
  'Display': [
    { name: 'Oswald', family: 'Oswald, sans-serif' },
    { name: 'Bebas Neue', family: 'Bebas Neue, sans-serif' },
    { name: 'Anton', family: 'Anton, sans-serif' },
    { name: 'Archivo Black', family: 'Archivo Black, sans-serif' },
    { name: 'Righteous', family: 'Righteous, sans-serif' },
    { name: 'Alfa Slab One', family: 'Alfa Slab One, serif' },
    { name: 'Passion One', family: 'Passion One, sans-serif' },
    { name: 'Bungee', family: 'Bungee, sans-serif' },
    { name: 'Staatliches', family: 'Staatliches, sans-serif' },
    { name: 'Russo One', family: 'Russo One, sans-serif' },
    { name: 'Black Ops One', family: 'Black Ops One, sans-serif' },
    { name: 'Permanent Marker', family: 'Permanent Marker, cursive' },
    { name: 'Bangers', family: 'Bangers, cursive' },
    { name: 'Fredoka One', family: 'Fredoka One, sans-serif' },
    { name: 'Pacifico', family: 'Pacifico, cursive' }
  ],
  'Monospace': [
    { name: 'Fira Code', family: 'Fira Code, monospace' },
    { name: 'JetBrains Mono', family: 'JetBrains Mono, monospace' },
    { name: 'Source Code Pro', family: 'Source Code Pro, monospace' },
    { name: 'IBM Plex Mono', family: 'IBM Plex Mono, monospace' },
    { name: 'Roboto Mono', family: 'Roboto Mono, monospace' },
    { name: 'Space Mono', family: 'Space Mono, monospace' },
    { name: 'Ubuntu Mono', family: 'Ubuntu Mono, monospace' },
    { name: 'Inconsolata', family: 'Inconsolata, monospace' }
  ],
  'Handwriting': [
    { name: 'Dancing Script', family: 'Dancing Script, cursive' },
    { name: 'Caveat', family: 'Caveat, cursive' },
    { name: 'Satisfy', family: 'Satisfy, cursive' },
    { name: 'Great Vibes', family: 'Great Vibes, cursive' },
    { name: 'Parisienne', family: 'Parisienne, cursive' },
    { name: 'Sacramento', family: 'Sacramento, cursive' },
    { name: 'Kaushan Script', family: 'Kaushan Script, cursive' },
    { name: 'Lobster', family: 'Lobster, cursive' },
    { name: 'Courgette', family: 'Courgette, cursive' },
    { name: 'Indie Flower', family: 'Indie Flower, cursive' }
  ]
}

const presetThemes = [
  { name: 'Corporativo Azul', primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa', bg: '#f8fafc' },
  { name: 'Profesional', primary: '#667eea', secondary: '#764ba2', accent: '#a78bfa', bg: '#faf5ff' },
  { name: 'Elegante Oscuro', primary: '#1f2937', secondary: '#374151', accent: '#6b7280', bg: '#f9fafb' },
  { name: 'Verde Naturaleza', primary: '#059669', secondary: '#10b981', accent: '#34d399', bg: '#ecfdf5' },
  { name: 'Naranja Energía', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c', bg: '#fff7ed' },
  { name: 'Rosa Creativo', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6', bg: '#fdf2f8' },
  { name: 'Rojo Impacto', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171', bg: '#fef2f2' },
  { name: 'Morado Premium', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa', bg: '#f5f3ff' },
  { name: 'Cyan Tech', primary: '#0891b2', secondary: '#06b6d4', accent: '#22d3ee', bg: '#ecfeff' },
  { name: 'Minimalista', primary: '#18181b', secondary: '#3f3f46', accent: '#71717a', bg: '#fafafa' }
]

const fontSizes = [
  { name: 'Pequeño', value: 'small', scale: 0.875 },
  { name: 'Normal', value: 'medium', scale: 1 },
  { name: 'Grande', value: 'large', scale: 1.125 },
  { name: 'Extra Grande', value: 'xlarge', scale: 1.25 }
]

function ThemeCustomizer({ onThemeChange, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('themes')
  const [theme, setTheme] = useState({
    mode: 'light',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#a78bfa',
    backgroundColor: '#ffffff',
    titleFont: 'Montserrat, sans-serif',
    bodyFont: 'Inter, sans-serif',
    fontSize: 'medium',
    borderRadius: 8,
    spacing: 'normal'
  })

  const handleThemeChange = (updates) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)
    onThemeChange(newTheme)
    
    // Aplicar CSS variables
    document.documentElement.style.setProperty('--primary-color', newTheme.primaryColor)
    document.documentElement.style.setProperty('--secondary-color', newTheme.secondaryColor)
    document.documentElement.style.setProperty('--accent-color', newTheme.accentColor)
    document.documentElement.style.setProperty('--title-font', newTheme.titleFont)
    document.documentElement.style.setProperty('--body-font', newTheme.bodyFont)
  }

  const applyPreset = (preset) => {
    handleThemeChange({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      backgroundColor: preset.bg
    })
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'themes', label: 'Temas', icon: 'auto_awesome' },
    { id: 'colors', label: 'Colores', icon: 'palette' },
    { id: 'fonts', label: 'Fuentes', icon: 'text_fields' },
    { id: 'layout', label: 'Diseño', icon: 'dashboard' }
  ]

  return (
    <div className="theme-customizer-overlay" onClick={onClose}>
      <div className="theme-customizer-pro" onClick={e => e.stopPropagation()}>
        <div className="customizer-header">
          <div className="header-title">
            <span className="material-icons">palette</span>
            <h3>Personalizar Tema</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="customizer-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-icons">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="customizer-content">
          {/* Temas Predefinidos */}
          {activeTab === 'themes' && (
            <div className="tab-content">
              <div className="section-header">
                <h4>Temas Predefinidos</h4>
                <p>Selecciona un tema para aplicar instantáneamente</p>
              </div>
              
              <div className="mode-toggle">
                <button 
                  type="button"
                  className={theme.mode === 'light' ? 'active' : ''}
                  onClick={() => handleThemeChange({ mode: 'light' })}
                >
                  <span className="material-icons">light_mode</span>
                  Modo Claro
                </button>
                <button 
                  type="button"
                  className={theme.mode === 'dark' ? 'active' : ''}
                  onClick={() => handleThemeChange({ mode: 'dark' })}
                >
                  <span className="material-icons">dark_mode</span>
                  Modo Oscuro
                </button>
              </div>

              <div className="preset-grid">
                {presetThemes.map(preset => (
                  <div 
                    key={preset.name}
                    className={`preset-card ${theme.primaryColor === preset.primary ? 'active' : ''}`}
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="preset-preview" style={{ background: preset.bg }}>
                      <div className="preview-header" style={{ background: preset.primary }}></div>
                      <div className="preview-content">
                        <div className="preview-title" style={{ background: preset.primary }}></div>
                        <div className="preview-text" style={{ background: preset.secondary }}></div>
                        <div className="preview-accent" style={{ background: preset.accent }}></div>
                      </div>
                    </div>
                    <span className="preset-name">{preset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colores */}
          {activeTab === 'colors' && (
            <div className="tab-content">
              <div className="section-header">
                <h4>Personalizar Colores</h4>
                <p>Ajusta los colores de tu presentación</p>
              </div>

              <div className="color-pickers">
                <div className="color-picker-item">
                  <label>Color Principal</label>
                  <div className="color-input-group">
                    <input 
                      type="color" 
                      value={theme.primaryColor}
                      onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                    />
                    <input 
                      type="text" 
                      value={theme.primaryColor}
                      onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="color-picker-item">
                  <label>Color Secundario</label>
                  <div className="color-input-group">
                    <input 
                      type="color" 
                      value={theme.secondaryColor}
                      onChange={(e) => handleThemeChange({ secondaryColor: e.target.value })}
                    />
                    <input 
                      type="text" 
                      value={theme.secondaryColor}
                      onChange={(e) => handleThemeChange({ secondaryColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="color-picker-item">
                  <label>Color de Acento</label>
                  <div className="color-input-group">
                    <input 
                      type="color" 
                      value={theme.accentColor}
                      onChange={(e) => handleThemeChange({ accentColor: e.target.value })}
                    />
                    <input 
                      type="text" 
                      value={theme.accentColor}
                      onChange={(e) => handleThemeChange({ accentColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="color-preview-box">
                <h5>Vista Previa</h5>
                <div className="preview-slide" style={{ background: theme.backgroundColor }}>
                  <div className="preview-title-bar" style={{ background: theme.primaryColor }}>
                    Título de Ejemplo
                  </div>
                  <div className="preview-body">
                    <p style={{ color: theme.secondaryColor }}>Texto secundario de ejemplo</p>
                    <button style={{ background: theme.accentColor }}>Botón de Acento</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fuentes */}
          {activeTab === 'fonts' && (
            <div className="tab-content">
              <div className="section-header">
                <h4>Tipografía</h4>
                <p>Elige las fuentes para títulos y texto</p>
              </div>

              <div className="font-section">
                <label>Fuente para Títulos</label>
                <div className="font-categories">
                  {Object.entries(fontCategories).map(([category, fonts]) => (
                    <div key={category} className="font-category">
                      <h5>{category}</h5>
                      <div className="font-list">
                        {fonts.map(font => (
                          <button
                            key={font.name}
                            type="button"
                            className={theme.titleFont === font.family ? 'active' : ''}
                            onClick={() => handleThemeChange({ titleFont: font.family })}
                            style={{ fontFamily: font.family }}
                          >
                            <span className="font-preview">Aa</span>
                            <span className="font-name">{font.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="font-section">
                <label>Fuente para Texto</label>
                <div className="font-categories">
                  {Object.entries(fontCategories).slice(0, 2).map(([category, fonts]) => (
                    <div key={category} className="font-category">
                      <h5>{category}</h5>
                      <div className="font-list">
                        {fonts.map(font => (
                          <button
                            key={font.name}
                            type="button"
                            className={theme.bodyFont === font.family ? 'active' : ''}
                            onClick={() => handleThemeChange({ bodyFont: font.family })}
                            style={{ fontFamily: font.family }}
                          >
                            <span className="font-preview">Aa</span>
                            <span className="font-name">{font.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="font-size-section">
                <label>Tamaño de Fuente Base</label>
                <div className="size-options">
                  {fontSizes.map(size => (
                    <button
                      key={size.value}
                      type="button"
                      className={theme.fontSize === size.value ? 'active' : ''}
                      onClick={() => handleThemeChange({ fontSize: size.value })}
                    >
                      <span style={{ fontSize: `${size.scale}rem` }}>Aa</span>
                      <span>{size.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Diseño */}
          {activeTab === 'layout' && (
            <div className="tab-content">
              <div className="section-header">
                <h4>Opciones de Diseño</h4>
                <p>Ajusta el estilo visual de los elementos</p>
              </div>

              <div className="layout-option">
                <label>Radio de Bordes</label>
                <div className="slider-group">
                  <input 
                    type="range" 
                    min="0" 
                    max="24" 
                    value={theme.borderRadius}
                    onChange={(e) => handleThemeChange({ borderRadius: parseInt(e.target.value) })}
                  />
                  <span>{theme.borderRadius}px</span>
                </div>
                <div className="border-preview">
                  <div style={{ borderRadius: theme.borderRadius }}>Ejemplo</div>
                </div>
              </div>

              <div className="layout-option">
                <label>Espaciado</label>
                <div className="spacing-options">
                  {['compact', 'normal', 'relaxed'].map(spacing => (
                    <button
                      key={spacing}
                      type="button"
                      className={theme.spacing === spacing ? 'active' : ''}
                      onClick={() => handleThemeChange({ spacing })}
                    >
                      <span className="material-icons">
                        {spacing === 'compact' ? 'density_small' : spacing === 'normal' ? 'density_medium' : 'density_large'}
                      </span>
                      <span>{spacing === 'compact' ? 'Compacto' : spacing === 'normal' ? 'Normal' : 'Amplio'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="customizer-footer">
          <button type="button" className="btn-reset" onClick={() => handleThemeChange({
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            accentColor: '#a78bfa',
            titleFont: 'Montserrat, sans-serif',
            bodyFont: 'Inter, sans-serif',
            fontSize: 'medium',
            borderRadius: 8
          })}>
            <span className="material-icons">restart_alt</span>
            Restablecer
          </button>
          <button type="button" className="btn-apply" onClick={onClose}>
            <span className="material-icons">check</span>
            Aplicar Tema
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer
