import { useState } from 'react'

// SVG paths para formas reales
const shapeSVGs = {
  'rect': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="5" y="5" width="90" height="90" fill={color} rx="0" />
    </svg>
  ),
  'rounded-rect': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <rect x="5" y="5" width="90" height="90" fill={color} rx="15" />
    </svg>
  ),
  'circle': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="45" fill={color} />
    </svg>
  ),
  'oval': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <ellipse cx="50" cy="30" rx="45" ry="25" fill={color} />
    </svg>
  ),
  'triangle': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 95,95 5,95" fill={color} />
    </svg>
  ),
  'diamond': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 95,50 50,95 5,50" fill={color} />
    </svg>
  ),
  'pentagon': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 97,38 79,95 21,95 3,38" fill={color} />
    </svg>
  ),
  'hexagon': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill={color} />
    </svg>
  ),
  'star': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={color} />
    </svg>
  ),
  'arrow-right': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill={color} />
    </svg>
  ),
  'arrow-left': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <polygon points="100,20 40,20 40,0 0,30 40,60 40,40 100,40" fill={color} />
    </svg>
  ),
  'arrow-up': (color) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%">
      <polygon points="30,0 60,40 40,40 40,100 20,100 20,40 0,40" fill={color} />
    </svg>
  ),
  'arrow-down': (color) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%">
      <polygon points="30,100 60,60 40,60 40,0 20,0 20,60 0,60" fill={color} />
    </svg>
  ),
  'double-arrow': (color) => (
    <svg viewBox="0 0 100 40" width="100%" height="100%">
      <polygon points="0,20 15,5 15,15 85,15 85,5 100,20 85,35 85,25 15,25 15,35" fill={color} />
    </svg>
  ),
  'chevron-right': (color) => (
    <svg viewBox="0 0 60 100" width="100%" height="100%">
      <polygon points="0,0 60,50 0,100 0,80 40,50 0,20" fill={color} />
    </svg>
  ),
  'callout': (color) => (
    <svg viewBox="0 0 100 80" width="100%" height="100%">
      <path d="M5,5 H95 V55 H30 L15,75 L20,55 H5 Z" fill={color} />
    </svg>
  ),
  'cloud': (color) => (
    <svg viewBox="0 0 100 60" width="100%" height="100%">
      <path d="M25,55 C10,55 0,45 0,35 C0,25 10,15 25,15 C25,5 40,0 55,5 C70,0 85,10 85,25 C100,25 100,45 85,50 C85,55 75,55 75,55 Z" fill={color} />
    </svg>
  ),
  'heart': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <path d="M50,90 C20,60 0,40 0,25 C0,10 15,0 30,0 C40,0 50,10 50,20 C50,10 60,0 70,0 C85,0 100,10 100,25 C100,40 80,60 50,90 Z" fill={color} />
    </svg>
  ),
  'plus': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="35,0 65,0 65,35 100,35 100,65 65,65 65,100 35,100 35,65 0,65 0,35 35,35" fill={color} />
    </svg>
  ),
  'cross': (color) => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <polygon points="20,0 50,30 80,0 100,20 70,50 100,80 80,100 50,70 20,100 0,80 30,50 0,20" fill={color} />
    </svg>
  ),
  'badge': (color) => (
    <svg viewBox="0 0 100 120" width="100%" height="100%">
      <path d="M50,0 L65,20 L90,20 L80,45 L95,70 L70,70 L50,95 L30,70 L5,70 L20,45 L10,20 L35,20 Z" fill={color} />
    </svg>
  ),
  'banner': (color) => (
    <svg viewBox="0 0 120 60" width="100%" height="100%">
      <polygon points="0,10 10,0 110,0 120,10 120,50 110,60 10,60 0,50 15,30" fill={color} />
    </svg>
  ),
  'cylinder': (color) => (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <ellipse cx="40" cy="15" rx="35" ry="15" fill={color} />
      <rect x="5" y="15" width="70" height="70" fill={color} />
      <ellipse cx="40" cy="85" rx="35" ry="15" fill={color} opacity="0.8" />
    </svg>
  ),
  'document': (color) => (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <path d="M0,0 H55 L80,25 V100 H0 Z" fill={color} />
      <path d="M55,0 V25 H80" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  ),
  'database': (color) => (
    <svg viewBox="0 0 80 100" width="100%" height="100%">
      <ellipse cx="40" cy="15" rx="35" ry="15" fill={color} />
      <rect x="5" y="15" width="70" height="70" fill={color} />
      <ellipse cx="40" cy="85" rx="35" ry="15" fill={color} />
      <ellipse cx="40" cy="50" rx="35" ry="15" fill={color} opacity="0.5" />
    </svg>
  )
}

const shapeCategories = {
  'Básicas': [
    { id: 'rect', name: 'Rectángulo', defaultColor: '#D24726' },
    { id: 'rounded-rect', name: 'Rect. Redondeado', defaultColor: '#3b82f6' },
    { id: 'circle', name: 'Círculo', defaultColor: '#10b981' },
    { id: 'oval', name: 'Óvalo', defaultColor: '#8b5cf6' },
    { id: 'triangle', name: 'Triángulo', defaultColor: '#f97316' },
    { id: 'diamond', name: 'Diamante', defaultColor: '#ec4899' }
  ],
  'Polígonos': [
    { id: 'pentagon', name: 'Pentágono', defaultColor: '#6366f1' },
    { id: 'hexagon', name: 'Hexágono', defaultColor: '#14b8a6' },
    { id: 'star', name: 'Estrella', defaultColor: '#eab308' },
    { id: 'plus', name: 'Cruz +', defaultColor: '#ef4444' },
    { id: 'cross', name: 'Cruz X', defaultColor: '#f97316' }
  ],
  'Flechas': [
    { id: 'arrow-right', name: 'Flecha Derecha', defaultColor: '#3b82f6' },
    { id: 'arrow-left', name: 'Flecha Izquierda', defaultColor: '#3b82f6' },
    { id: 'arrow-up', name: 'Flecha Arriba', defaultColor: '#10b981' },
    { id: 'arrow-down', name: 'Flecha Abajo', defaultColor: '#ef4444' },
    { id: 'double-arrow', name: 'Doble Flecha', defaultColor: '#8b5cf6' },
    { id: 'chevron-right', name: 'Chevron', defaultColor: '#D24726' }
  ],
  'Especiales': [
    { id: 'callout', name: 'Bocadillo', defaultColor: '#fbbf24' },
    { id: 'cloud', name: 'Nube', defaultColor: '#60a5fa' },
    { id: 'heart', name: 'Corazón', defaultColor: '#ef4444' },
    { id: 'badge', name: 'Insignia', defaultColor: '#D24726' },
    { id: 'banner', name: 'Banner', defaultColor: '#8b5cf6' }
  ],
  'Diagramas': [
    { id: 'cylinder', name: 'Cilindro', defaultColor: '#6366f1' },
    { id: 'document', name: 'Documento', defaultColor: '#f97316' },
    { id: 'database', name: 'Base de Datos', defaultColor: '#14b8a6' }
  ]
}

const colorPalette = [
  '#D24726', '#B83D1F', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'
]

function ShapeLibrary({ onSelect }) {
  const [selectedColor, setSelectedColor] = useState('#D24726')
  const [previewShape, setPreviewShape] = useState(null)

  const handleSelectShape = (shape) => {
    // Generar SVG como data URL para insertar
    const svgElement = document.createElement('div')
    const svgContent = shapeSVGs[shape.id](selectedColor)
    
    onSelect({
      id: shape.id,
      name: shape.name,
      color: selectedColor,
      shapeType: shape.id,
      // Incluir el SVG como string para renderizar
      svgPath: shape.id
    })
  }

  return (
    <div className="shape-library">
      {/* Selector de color */}
      <div className="shape-color-picker">
        <label>Color de la forma:</label>
        <div className="color-palette">
          {colorPalette.map(color => (
            <button
              key={color}
              type="button"
              className={`palette-color ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      {previewShape && (
        <div className="shape-preview-box">
          <div className="shape-preview-svg">
            {shapeSVGs[previewShape.id](selectedColor)}
          </div>
          <span>{previewShape.name}</span>
        </div>
      )}

      {/* Categorías de formas */}
      {Object.entries(shapeCategories).map(([category, shapes]) => (
        <div key={category} className="shape-category">
          <h4>{category}</h4>
          <div className="shape-grid">
            {shapes.map(shape => (
              <button 
                type="button"
                key={shape.id} 
                onClick={() => handleSelectShape(shape)}
                onMouseEnter={() => setPreviewShape(shape)}
                onMouseLeave={() => setPreviewShape(null)}
                title={shape.name}
                className="shape-btn"
              >
                <div className="shape-svg-container">
                  {shapeSVGs[shape.id](selectedColor)}
                </div>
                <span className="shape-name">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ShapeLibrary
