import { useMemo, useCallback, useState, useEffect, useRef } from 'react'

/**
 * Hook para optimizar operaciones con slides
 * Memoiza funciones y cálculos pesados
 */
export function useSlideOptimization(slides) {
  // Memoizar el conteo de slides
  const slideCount = useMemo(() => slides.length, [slides.length])

  // Memoizar slides con assets
  const slidesWithAssets = useMemo(() => {
    return slides.filter(slide => slide.content?.assets?.length > 0)
  }, [slides])

  // Memoizar slides con preview
  const slidesWithPreview = useMemo(() => {
    return slides.filter(slide => slide.preview)
  }, [slides])

  // Función memoizada para encontrar slide por ID
  const findSlideById = useCallback((slideId) => {
    return slides.find(s => s.id === slideId)
  }, [slides])

  // Función memoizada para encontrar índice por ID
  const findSlideIndex = useCallback((slideId) => {
    return slides.findIndex(s => s.id === slideId)
  }, [slides])

  // Función memoizada para validar si un slide puede moverse
  const canMoveSlide = useCallback((slideIndex, direction) => {
    if (direction === 'up') return slideIndex > 0
    if (direction === 'down') return slideIndex < slides.length - 1
    return false
  }, [slides.length])

  return {
    slideCount,
    slidesWithAssets,
    slidesWithPreview,
    findSlideById,
    findSlideIndex,
    canMoveSlide
  }
}

/**
 * Hook para lazy loading de imágenes
 * Carga imágenes solo cuando están cerca del viewport
 */
export function useLazyImage(src, options = {}) {
  const { threshold = 0.1, rootMargin = '50px' } = options

  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  useEffect(() => {
    if (!isInView) return

    const img = new Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
  }, [isInView, src])

  return { imgRef, isLoaded, isInView }
}

/**
 * Hook para debounce de funciones
 * Útil para optimizar búsquedas y filtros
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para throttle de funciones
 * Útil para optimizar scroll y resize handlers
 */
export function useThrottle(callback, delay = 100) {
  const lastRun = useRef(Date.now())

  return useCallback((...args) => {
    const now = Date.now()
    if (now - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = now
    }
  }, [callback, delay])
}
