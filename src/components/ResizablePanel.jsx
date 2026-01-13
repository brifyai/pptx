import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import '../styles/ResizablePanel.css'

function ResizablePanel({ 
  children, 
  defaultWidth = 300, 
  minWidth = 200, 
  maxWidth = 600,
  position = 'left', // 'left' or 'right'
  storageKey = 'panel-width'
}) {
  // Usar useRef para el ancho inicial para evitar re-renders innecesarios
  const initialWidth = useRef(() => {
    const saved = localStorage.getItem(storageKey)
    const savedWidth = saved ? parseInt(saved) : defaultWidth
    if (savedWidth < minWidth || savedWidth > maxWidth || isNaN(savedWidth)) {
      localStorage.setItem(storageKey, defaultWidth.toString())
      return defaultWidth
    }
    return savedWidth
  })
  
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    const savedWidth = saved ? parseInt(saved) : defaultWidth
    // Validar que el ancho guardado esté dentro de los límites
    if (savedWidth < minWidth || savedWidth > maxWidth || isNaN(savedWidth)) {
      // Corregir inmediatamente en localStorage
      localStorage.setItem(storageKey, defaultWidth.toString())
      return defaultWidth
    }
    return savedWidth
  })
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef(null)
  const handleRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const isMountedRef = useRef(true)

  // Marcar cuando el componente se desmonta
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Listener para detectar cambios en localStorage desde otras pestañas o código
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue && isMountedRef.current) {
        const newWidth = parseInt(e.newValue)
        
        if (newWidth < minWidth || newWidth > maxWidth || isNaN(newWidth)) {
          localStorage.setItem(storageKey, defaultWidth.toString())
          setWidth(defaultWidth)
        } else {
          setWidth(newWidth)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey, minWidth, maxWidth, defaultWidth])

  // Función para guardar el ancho con debounce
  const saveWidth = useCallback((widthToSave) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (widthToSave >= minWidth && widthToSave <= maxWidth && !isNaN(widthToSave) && isMountedRef.current) {
        localStorage.setItem(storageKey, widthToSave.toString())
      }
    }, 500) // Esperar 500ms después del último cambio
  }, [minWidth, maxWidth, storageKey])

  // NO guardar el ancho cuando el componente se desmonta
  // Esto previene que se guarden valores incorrectos cuando se abre un modal
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // REMOVIDO: No guardar al desmontar para evitar problemas con modales
    }
  }, [])

  useEffect(() => {
    if (!isResizing) return

    // Agregar clase al body para cursor global
    document.body.classList.add('resizing')

    const handleMouseMove = (e) => {
      if (!panelRef.current) return
      
      const containerRect = panelRef.current.parentElement.getBoundingClientRect()
      let newWidth
      
      if (position === 'left') {
        newWidth = e.clientX - containerRect.left
      } else {
        newWidth = containerRect.right - e.clientX
      }
      
      // Aplicar límites
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.classList.remove('resizing')
      // Guardar el ancho actual al terminar el resize
      setWidth(currentWidth => {
        saveWidth(currentWidth)
        return currentWidth
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('resizing')
    }
  }, [isResizing, position, minWidth, maxWidth, storageKey, saveWidth])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Función para resetear el ancho al valor por defecto
  const handleDoubleClick = () => {
    setWidth(defaultWidth)
    saveWidth(defaultWidth)
  }

  // Usar useLayoutEffect para aplicar el ancho antes del paint
  useLayoutEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.width = `${width}px`
    }
  }, [width])

  return (
    <div 
      ref={panelRef}
      className={`resizable-panel-wrapper ${position}`}
      style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
    >
      <div className="resizable-panel-content">
        {children}
      </div>
      <div 
        ref={handleRef}
        className={`resize-handle ${position} ${isResizing ? 'active' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="Doble clic para resetear ancho"
      >
        <div className="resize-handle-line" />
      </div>
    </div>
  )
}

export default ResizablePanel
