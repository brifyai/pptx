import { useMemo } from 'react'
import '../styles/ContentOverlay.css'

/**
 * ContentOverlay - Muestra el contenido textual sobre el preview del slide
 * Permite al usuario ver el contenido generado por la IA antes de exportar
 */
function ContentOverlay({ slide, slideWidth, slideHeight }) {
  if (!slide || !slide.content) return null
  if (!slideWidth || !slideHeight || slideWidth <= 0 || slideHeight <= 0) {
    console.warn('ContentOverlay: dimensiones de slide inválidas', { slideWidth, slideHeight })
    return null
  }

  const { content, layout } = slide
  const textAreas = layout?.textAreas || []

  // Calcular posiciones de las áreas de texto
  const renderTextAreas = useMemo(() => {
    if (textAreas.length === 0) return null

    const areas = textAreas.map((area, idx) => {
      const { type, bounds, maxChars } = area
      
      // Validar que bounds existe
      if (!bounds || !bounds.x || !bounds.y || !bounds.width || !bounds.height) {
        console.warn('ContentOverlay: bounds inválido para área', idx, area)
        return null
      }
      
      // Obtener el contenido correspondiente
      let textContent = ''
      if (type === 'title' && content.title) {
        textContent = content.title
      } else if (type === 'subtitle' && content.subtitle) {
        textContent = content.subtitle
      } else if (type === 'heading' && content.heading) {
        textContent = content.heading
      } else if (type === 'bullets' && content.bullets) {
        textContent = content.bullets.map(b => `• ${b}`).join('\n')
      } else if (type === 'body' && content.bullets) {
        textContent = content.bullets.join('\n')
      }

      if (!textContent) return null

      // Convertir coordenadas EMU a porcentajes
      const left = (bounds.x / slideWidth) * 100
      const top = (bounds.y / slideHeight) * 100
      const width = (bounds.width / slideWidth) * 100
      const height = (bounds.height / slideHeight) * 100

      // Determinar tamaño de fuente basado en el tipo
      let fontSize = '14px'
      let fontWeight = 'normal'
      let textAlign = 'left'
      
      if (type === 'title') {
        fontSize = '32px'
        fontWeight = 'bold'
        textAlign = 'center'
      } else if (type === 'subtitle') {
        fontSize = '20px'
        textAlign = 'center'
      } else if (type === 'heading') {
        fontSize = '24px'
        fontWeight = 'bold'
      }

      return (
        <div
          key={`area-${idx}`}
          className={`content-overlay-area content-overlay-area--${type}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            fontSize,
            fontWeight,
            textAlign
          }}
          title={`${type} (${textContent.length}/${maxChars || '∞'} chars)`}
        >
          <div className="content-overlay-text">
            {textContent}
          </div>
        </div>
      )
    }).filter(Boolean) // Filtrar nulls
    
    return areas.length > 0 ? areas : null
  }, [textAreas, content, slideWidth, slideHeight])

  // Fallback: Si no hay textAreas, mostrar contenido en posiciones por defecto
  const renderFallbackContent = useMemo(() => {
    if (textAreas.length > 0) return null

    return (
      <div className="content-overlay-fallback">
        {content.title && (
          <div className="content-overlay-fallback-title">
            {content.title}
          </div>
        )}
        {content.subtitle && (
          <div className="content-overlay-fallback-subtitle">
            {content.subtitle}
          </div>
        )}
        {content.heading && (
          <div className="content-overlay-fallback-heading">
            {content.heading}
          </div>
        )}
        {content.bullets && content.bullets.length > 0 && (
          <div className="content-overlay-fallback-bullets">
            {content.bullets.map((bullet, idx) => (
              <div key={idx} className="content-overlay-fallback-bullet">
                • {bullet}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }, [content, textAreas.length])

  return (
    <div className="content-overlay">
      {renderTextAreas}
      {renderFallbackContent}
    </div>
  )
}

export default ContentOverlay
