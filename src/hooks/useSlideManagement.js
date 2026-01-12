/**
 * Hook for managing slide operations (CRUD, reorder, etc.)
 */
import { useState, useCallback } from 'react'

export function useSlideManagement(initialSlides = [], { showToast, showWarning, showDeleteConfirm, logActivity }) {
  const [slides, setSlides] = useState(initialSlides)
  const [currentSlide, setCurrentSlide] = useState(0)

  const getEmptyContent = useCallback((type) => {
    if (type === 'title') {
      return { title: 'Título Principal', subtitle: 'Subtítulo' }
    }
    return { heading: 'Título', bullets: ['Punto 1', 'Punto 2', 'Punto 3'] }
  }, [])

  const handleSlideUpdate = useCallback((slideId, newContent, skipLog = false) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, content: newContent } : slide
    ))
    
    if (!skipLog && logActivity) {
      const slideIndex = slides.findIndex(s => s.id === slideId)
      logActivity('edit', `Contenido editado en lámina ${slideIndex + 1}`)
    }
  }, [slides, logActivity])

  const handleNavigateSlide = useCallback((newIndex) => {
    if (newIndex !== currentSlide && newIndex >= 0 && newIndex < slides.length) {
      setCurrentSlide(newIndex)
    }
  }, [currentSlide, slides.length])

  const handleSlideReorder = useCallback((fromIndex, toIndex) => {
    setSlides(prev => {
      const newSlides = [...prev]
      const [movedSlide] = newSlides.splice(fromIndex, 1)
      newSlides.splice(toIndex, 0, movedSlide)
      return newSlides.map((slide, index) => ({ ...slide, id: index + 1 }))
    })
    
    if (currentSlide === fromIndex) {
      setCurrentSlide(toIndex)
    } else if (fromIndex < currentSlide && toIndex >= currentSlide) {
      setCurrentSlide(currentSlide - 1)
    } else if (fromIndex > currentSlide && toIndex <= currentSlide) {
      setCurrentSlide(currentSlide + 1)
    }
    
    logActivity?.('reorder', `Lámina ${fromIndex + 1} movida a posición ${toIndex + 1}`)
  }, [currentSlide, logActivity])

  const handleSlideAdd = useCallback(() => {
    const newSlideNum = slides.length + 1
    
    setSlides(prev => {
      const newSlide = {
        id: Date.now(),
        type: 'content',
        name: `Lámina ${prev.length + 1}`,
        content: getEmptyContent('content'),
        preview: null
      }
      return [...prev, newSlide].map((slide, index) => ({ ...slide, id: index + 1 }))
    })
    
    setCurrentSlide(slides.length)
    showToast?.('Nueva lámina agregada')
    logActivity?.('add', `Nueva lámina ${newSlideNum} creada`)
  }, [slides.length, getEmptyContent, showToast, logActivity])

  const handleSlideDuplicate = useCallback((slideIndex) => {
    setSlides(prev => {
      const slideToDuplicate = prev[slideIndex]
      const newSlide = {
        ...slideToDuplicate,
        id: Date.now(),
        name: `${slideToDuplicate.name || `Lámina ${slideIndex + 1}`} (copia)`,
        content: JSON.parse(JSON.stringify(slideToDuplicate.content)),
        preview: slideToDuplicate.preview
      }
      
      const newSlides = [
        ...prev.slice(0, slideIndex + 1),
        newSlide,
        ...prev.slice(slideIndex + 1)
      ]
      return newSlides.map((slide, index) => ({ ...slide, id: index + 1 }))
    })
    
    setCurrentSlide(slideIndex + 1)
    showToast?.(`Lámina ${slideIndex + 1} duplicada`)
    logActivity?.('duplicate', `Lámina ${slideIndex + 1} duplicada`)
  }, [showToast, logActivity])

  const handleSlideDelete = useCallback((slideIndex) => {
    if (slides.length <= 1) {
      showWarning?.('No se puede eliminar', 'No puedes eliminar la única lámina de la presentación.')
      return
    }
    
    showDeleteConfirm?.(`Lámina ${slideIndex + 1}`, () => {
      setSlides(prev => {
        const newSlides = prev.filter((_, index) => index !== slideIndex)
        return newSlides.map((slide, index) => ({ ...slide, id: index + 1 }))
      })
      
      if (currentSlide >= slides.length - 1) {
        setCurrentSlide(Math.max(0, currentSlide - 1))
      } else if (currentSlide > slideIndex) {
        setCurrentSlide(currentSlide - 1)
      }
      
      showToast?.(`Lámina ${slideIndex + 1} eliminada`)
      logActivity?.('delete', `Lámina ${slideIndex + 1} eliminada`)
    })
  }, [slides.length, currentSlide, showWarning, showDeleteConfirm, showToast, logActivity])

  const handleSlideRename = useCallback((slideId, newName) => {
    const slideIndex = slides.findIndex(s => s.id === slideId)
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, name: newName } : slide
    ))
    logActivity?.('rename', `Lámina ${slideIndex + 1} renombrada a "${newName}"`)
  }, [slides, logActivity])

  const initializeSlides = useCallback((analysis, file) => {
    const initialSlides = analysis.slides.map((slide, index) => ({
      id: index + 1,
      type: slide.type,
      content: getEmptyContent(slide.type),
      preview: slide.preview,
      layout: slide,
      slideWidth: analysis.slideSize?.width,
      slideHeight: analysis.slideSize?.height
    }))
    setSlides(initialSlides)
    setCurrentSlide(0)
    return initialSlides
  }, [getEmptyContent])

  return {
    slides,
    setSlides,
    currentSlide,
    setCurrentSlide,
    getEmptyContent,
    handleSlideUpdate,
    handleNavigateSlide,
    handleSlideReorder,
    handleSlideAdd,
    handleSlideDuplicate,
    handleSlideDelete,
    handleSlideRename,
    initializeSlides
  }
}
