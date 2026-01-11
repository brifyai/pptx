const shapeCategories = {
  'Básicas': [
    { id: 'rect', name: 'Rectángulo', icon: 'rectangle', color: '#667eea' },
    { id: 'rounded-rect', name: 'Rect. Redondeado', icon: 'rounded_corner', color: '#48bb78' },
    { id: 'circle', name: 'Círculo', icon: 'circle', color: '#ed8936' },
    { id: 'oval', name: 'Óvalo', icon: 'panorama_fish_eye', color: '#e53e3e' },
    { id: 'triangle', name: 'Triángulo', icon: 'change_history', color: '#9f7aea' },
    { id: 'diamond', name: 'Diamante', icon: 'diamond', color: '#38b2ac' }
  ],
  'Flechas': [
    { id: 'arrow-right', name: 'Flecha Derecha', icon: 'arrow_forward', color: '#667eea' },
    { id: 'arrow-left', name: 'Flecha Izquierda', icon: 'arrow_back', color: '#667eea' },
    { id: 'arrow-up', name: 'Flecha Arriba', icon: 'arrow_upward', color: '#667eea' },
    { id: 'arrow-down', name: 'Flecha Abajo', icon: 'arrow_downward', color: '#667eea' },
    { id: 'double-arrow', name: 'Doble Flecha', icon: 'sync_alt', color: '#48bb78' },
    { id: 'curved-arrow', name: 'Flecha Curva', icon: 'redo', color: '#ed8936' }
  ],
  'Diagramas': [
    { id: 'process', name: 'Proceso', icon: 'account_tree', color: '#667eea' },
    { id: 'decision', name: 'Decisión', icon: 'diamond', color: '#e53e3e' },
    { id: 'connector', name: 'Conector', icon: 'radio_button_unchecked', color: '#48bb78' },
    { id: 'document', name: 'Documento', icon: 'description', color: '#ed8936' },
    { id: 'database', name: 'Base de Datos', icon: 'storage', color: '#9f7aea' },
    { id: 'cloud', name: 'Nube', icon: 'cloud', color: '#38b2ac' }
  ],
  'Especiales': [
    { id: 'star', name: 'Estrella', icon: 'star', color: '#ecc94b' },
    { id: 'heart', name: 'Corazón', icon: 'favorite', color: '#e53e3e' },
    { id: 'hexagon', name: 'Hexágono', icon: 'hexagon', color: '#667eea' },
    { id: 'pentagon', name: 'Pentágono', icon: 'pentagon', color: '#48bb78' },
    { id: 'badge', name: 'Insignia', icon: 'verified', color: '#38b2ac' },
    { id: 'burst', name: 'Explosión', icon: 'auto_awesome', color: '#ed8936' }
  ]
}

function ShapeLibrary({ onSelect }) {
  return (
    <div className="shape-library">
      {Object.entries(shapeCategories).map(([category, shapes]) => (
        <div key={category} className="shape-category">
          <h4>{category}</h4>
          <div className="shape-grid">
            {shapes.map(shape => (
              <button 
                key={shape.id} 
                onClick={() => onSelect(shape)} 
                title={shape.name}
                style={{ '--shape-color': shape.color }}
              >
                <span className="material-icons">{shape.icon}</span>
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
