import { useEffect, useState } from 'react'
import { useSwipe } from '../hooks/useSwipe'
import '../styles/BottomSheet.css'

function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0.6 
}) {
  const [snapIndex, setSnapIndex] = useState(1) // Índice del snap point actual
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)

  const swipeHandlers = useSwipe({
    onSwipeDown: () => {
      if (snapIndex === 0) {
        onClose()
      } else {
        setSnapIndex(prev => Math.max(0, prev - 1))
      }
    },
    onSwipeUp: () => {
      setSnapIndex(prev => Math.min(snapPoints.length - 1, prev + 1))
    },
    minSwipeDistance: 30
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const currentHeight = snapPoints[snapIndex] * 100

  return (
    <>
      <div 
        className="bottom-sheet-overlay" 
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0 }}
      />
      <div 
        className={`bottom-sheet ${isOpen ? 'open' : ''}`}
        style={{ 
          height: `${currentHeight}vh`,
          transform: isDragging ? `translateY(${dragY}px)` : 'none'
        }}
      >
        <div 
          className="bottom-sheet-handle"
          {...swipeHandlers}
        >
          <div className="handle-bar" />
        </div>

        {title && (
          <div className="bottom-sheet-header">
            <h3>{title}</h3>
            <button className="close-btn" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>
        )}

        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </>
  )
}

export default BottomSheet
