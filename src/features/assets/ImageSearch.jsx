import { useState } from 'react'

// Imágenes de ejemplo (en producción usarías Unsplash API)
const sampleImages = [
  { id: 1, url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', alt: 'Oficina moderna', category: 'business' },
  { id: 2, url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', alt: 'Equipo de trabajo', category: 'team' },
  { id: 3, url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', alt: 'Análisis de datos', category: 'data' },
  { id: 4, url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400', alt: 'Desarrollo', category: 'tech' },
  { id: 5, url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', alt: 'Colaboración', category: 'team' },
  { id: 6, url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400', alt: 'Presentación', category: 'business' },
  { id: 7, url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400', alt: 'Startup', category: 'business' },
  { id: 8, url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400', alt: 'Reunión', category: 'team' },
  { id: 9, url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400', alt: 'Dashboard', category: 'data' },
  { id: 10, url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', alt: 'Tecnología', category: 'tech' },
  { id: 11, url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400', alt: 'Estrategia', category: 'business' },
  { id: 12, url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400', alt: 'Brainstorming', category: 'team' }
]

const categories = [
  { id: 'all', label: 'Todas', icon: 'apps' },
  { id: 'business', label: 'Negocios', icon: 'business' },
  { id: 'team', label: 'Equipos', icon: 'groups' },
  { id: 'data', label: 'Datos', icon: 'analytics' },
  { id: 'tech', label: 'Tecnología', icon: 'computer' }
]

function ImageSearch({ query = '', onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  
  const filteredImages = sampleImages.filter(img => {
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory
    const matchesQuery = !query || img.alt.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })

  return (
    <div className="image-search">
      <div className="image-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={selectedCategory === cat.id ? 'active' : ''}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="material-icons">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
      
      <div className="image-results">
        {filteredImages.map(img => (
          <div 
            key={img.id} 
            className="image-card"
            onClick={() => onSelect(img)}
          >
            <img src={img.url} alt={img.alt} loading="lazy" />
            <div className="image-overlay">
              <span className="material-icons">add_circle</span>
            </div>
            <span className="image-label">{img.alt}</span>
          </div>
        ))}
      </div>
      
      {filteredImages.length === 0 && (
        <div className="no-results">
          <span className="material-icons">image_not_supported</span>
          <p>No se encontraron imágenes</p>
        </div>
      )}
      
      <div className="image-upload">
        <span className="material-icons">cloud_upload</span>
        <span>O arrastra una imagen aquí</span>
      </div>
    </div>
  )
}

export default ImageSearch
