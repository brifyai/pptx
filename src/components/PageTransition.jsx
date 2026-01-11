import { useEffect, useState } from 'react'
import '../styles/PageTransition.css'

/**
 * Componente para transiciones de página suaves
 * Soporta múltiples tipos de animación
 */
function PageTransition({ children, type = 'fade', duration = 300, isActive = true }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      // Pequeño delay para trigger la animación
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isActive])

  return (
    <div 
      className={`page-transition page-transition-${type} ${isVisible ? 'visible' : ''}`}
      style={{ '--transition-duration': `${duration}ms` }}
    >
      {children}
    </div>
  )
}

export default PageTransition
