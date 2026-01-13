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

  // Batch update for multiple slides at once
  const handleBatchSlideUpdate = useCallback((updates, skipLog = false) => {
    console.log('🔧 handleBatchSlideUpdate llamado')
    console.log('📦 Updates recibidos:', updates)
    console.log('📦 Slides actuales:', slides.length)
    
    setSlides(prev => {
      console.log('📦 Slides previos:', prev.length)
      const updatedSlides = [...prev]
      
      updates.forEach((update, idx) => {
        console.log(`  Procesando update ${idx}:`, update)
        const slideIndex = update.slideIndex
        
        if (slideIndex >= 0 && slideIndex < updatedSlides.length) {
          const slide = updatedSlides[slideIndex]
          const oldContent = slide?.content || {}
          const newContent = {
            ...oldContent,
            ...update.content
          }
          
          console.log(`  ✅ Actualizando slide ${slideIndex}`)
          console.log(`    Contenido anterior:`, oldContent)
          console.log(`    Contenido nuevo:`, newContent)
          
          updatedSlides[slideIndex] = {
            ...slide,
            content: newContent
          }
        } else {
          console.error(`  ❌ Índice inválido: ${slideIndex} (total: ${updatedSlides.length})`)
        }
      })
      
      console.log('✅ Slides actualizados:', updatedSlides.length)
      return updatedSlides
    })
    
    if (!skipLog && logActivity) {
      logActivity('edit', `${updates.length} láminas actualizadas con contenido generado`)
    }
  }, [logActivity])

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
    setSlides(prev => {
      const newSlide = {
        id: Date.now(),
        type: 'content',
        name: `Lámina ${prev.length + 1}`,
        content: getEmptyContent('content'),
        preview: null
      }
      const newSlides = [...prev, newSlide].map((slide, index) => ({ ...slide, id: index + 1 }))
      // Navegar al nuevo slide (último índice)
      setCurrentSlide(newSlides.length - 1)
      return newSlides
    })
    
    showToast?.('Nueva lámina agregada')
    logActivity?.('add', `Nueva lámina ${slides.length + 1} creada`)
  }, [getEmptyContent, showToast, logActivity, slides.length])

  const handleSlideDuplicate = useCallback((slideIndex) => {
    setSlides(prev => {
      const slideToDuplicate = prev[slideIndex]
      if (!slideToDuplicate) {
        console.warn(`⚠️ No se puede duplicar: slide ${slideIndex} no existe`)
        return prev
      }
      const newSlide = {
        ...slideToDuplicate,
        id: Date.now(),
        name: `${slideToDuplicate.name || `Lámina ${slideIndex + 1}`} (copia)`,
        content: slideToDuplicate.content 
          ? JSON.parse(JSON.stringify(slideToDuplicate.content))
          : getEmptyContent(slideToDuplicate.type || 'content'),
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
  }, [showToast, logActivity, getEmptyContent])

  const handleSlideDelete = useCallback((slideIndex) => {
    if (slides.length <= 1) {
      showWarning?.('No se puede eliminar', 'No puedes eliminar la única lámina de la presentación.')
      return
    }
    
    showDeleteConfirm?.(`Lámina ${slideIndex + 1}`, () => {
      setSlides(prev => {
        const newSlides = prev.filter((_, index) => index !== slideIndex)
        const reindexedSlides = newSlides.map((slide, index) => ({ ...slide, id: index + 1 }))
        
        // Ajustar currentSlide basado en la nueva longitud
        if (currentSlide >= reindexedSlides.length) {
          // Si currentSlide está fuera de rango, ir al último slide
          setCurrentSlide(Math.max(0, reindexedSlides.length - 1))
        } else if (currentSlide > slideIndex) {
          // Si estábamos después del slide eliminado, retroceder uno
          setCurrentSlide(currentSlide - 1)
        }
        // Si currentSlide < slideIndex, no hacer nada (mantener posición)
        
        return reindexedSlides
      })
      
      showToast?.(`Lámina ${slideIndex + 1} eliminada`)
      logActivity?.('delete', `Lámina ${slideIndex + 1} eliminada`)
    })
  }, [currentSlide, showWarning, showDeleteConfirm, showToast, logActivity])

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
    handleBatchSlideUpdate,
    handleNavigateSlide,
    handleSlideReorder,
    handleSlideAdd,
    handleSlideDuplicate,
    handleSlideDelete,
    handleSlideRename,
    initializeSlides
  }
}
