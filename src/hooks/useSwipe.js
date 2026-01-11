import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook para detectar gestos de swipe
 * @param {object} options - Configuración del swipe
 * @returns {object} - Handlers y estado del swipe
 */
export function useSwipe(options = {}) {
  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onSwipeUp = () => {},
    onSwipeDown = () => {},
    minSwipeDistance = 50,
    maxSwipeTime = 300
  } = options

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [touchStartTime, setTouchStartTime] = useState(null)

  const handleTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
    setTouchStartTime(Date.now())
  }

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const swipeTime = Date.now() - touchStartTime
    if (swipeTime > maxSwipeTime) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY)

    if (isHorizontal) {
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          onSwipeLeft()
        } else {
          onSwipeRight()
        }
      }
    } else {
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0) {
          onSwipeUp()
        } else {
          onSwipeDown()
        }
      }
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}

/**
 * Hook para detectar long press
 * @param {function} callback - Función a ejecutar en long press
 * @param {number} duration - Duración en ms (default: 500ms)
 * @returns {object} - Handlers del long press
 */
export function useLongPress(callback, duration = 500) {
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const timeout = useRef()
  const target = useRef()

  const start = useCallback((event) => {
    target.current = event.target
    timeout.current = setTimeout(() => {
      callback(event)
      setLongPressTriggered(true)
    }, duration)
  }, [callback, duration])

  const clear = useCallback((event, shouldTriggerClick = true) => {
    timeout.current && clearTimeout(timeout.current)
    if (shouldTriggerClick && !longPressTriggered) {
      // Click normal
    }
    setLongPressTriggered(false)
  }, [longPressTriggered])

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: (e) => clear(e, false),
    onTouchEnd: clear
  }
}

/**
 * Hook para detectar pinch to zoom
 * @param {object} options - Configuración del pinch
 * @returns {object} - Handlers y estado del pinch
 */
export function usePinch(options = {}) {
  const {
    onPinchStart = () => {},
    onPinchMove = () => {},
    onPinchEnd = () => {},
    minScale = 0.5,
    maxScale = 3
  } = options

  const [isPinching, setIsPinching] = useState(false)
  const [scale, setScale] = useState(1)
  const initialDistance = useRef(null)
  const initialScale = useRef(1)

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      setIsPinching(true)
      initialDistance.current = getDistance(e.touches)
      initialScale.current = scale
      onPinchStart({ scale })
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault()
      const currentDistance = getDistance(e.touches)
      const newScale = Math.max(
        minScale,
        Math.min(maxScale, initialScale.current * (currentDistance / initialDistance.current))
      )
      setScale(newScale)
      onPinchMove({ scale: newScale })
    }
  }

  const handleTouchEnd = (e) => {
    if (isPinching) {
      setIsPinching(false)
      onPinchEnd({ scale })
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    scale,
    isPinching,
    resetScale: () => setScale(1)
  }
}
