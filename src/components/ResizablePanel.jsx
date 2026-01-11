import { useState, useRef, useEffect } from 'react'
import '../styles/ResizablePanel.css'

function ResizablePanel({ 
  children, 
  defaultWidth = 300, 
  minWidth = 200, 
  maxWidth = 600,
  position = 'left', // 'left' or 'right'
  storageKey = 'panel-width'
}) {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? parseInt(saved) : defaultWidth
  })
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef(null)

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
      localStorage.setItem(storageKey, width.toString())
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('resizing')
    }
  }, [isResizing, position, minWidth, maxWidth, width, storageKey])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsResizing(true)
  }

  return (
    <div 
      ref={panelRef}
      className={`resizable-panel ${position}`}
      style={{ width: `${width}px` }}
    >
      {children}
      <div 
        className={`resize-handle ${position} ${isResizing ? 'active' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resize-handle-line" />
      </div>
    </div>
  )
}

export default ResizablePanel
