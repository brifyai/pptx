/**
 * Hook for managing template state and operations
 */
import { useState, useCallback } from 'react'

export function useTemplateManager({ showToast, showWarning, logActivity }) {
  const [hasTemplate, setHasTemplate] = useState(false)
  const [currentTemplateData, setCurrentTemplateData] = useState(null)
  const [templateFile, setTemplateFile] = useState(null)
  const [extractedAssets, setExtractedAssets] = useState(null)
  const [fontAnalysis, setFontAnalysis] = useState(null)
  const [showFontWarning, setShowFontWarning] = useState(true)

  const analyzeFonts = useCallback(async (file) => {
    try {
      console.log('🔤 Analizando fuentes del template...')
      const formData = new FormData()
      formData.append('file', file)
      
      const fontResponse = await fetch('http://localhost:8000/api/analyze-fonts', {
        method: 'POST',
        body: formData
      })
      
      if (fontResponse.ok) {
        const fontData = await fontResponse.json()
        console.log('🔤 Análisis de fuentes:', fontData)
        
        if (fontData.summary?.missing > 0 || fontData.availableOnline?.length > 0) {
          setFontAnalysis(fontData)
          setShowFontWarning(true)
        } else {
          setFontAnalysis(null)
        }
        return fontData
      }
    } catch (error) {
      console.warn('⚠️ No se pudo analizar fuentes:', error)
    }
    return null
  }, [])

  const saveTemplate = useCallback(() => {
    if (!currentTemplateData) {
      showWarning?.('No hay plantilla', 'Primero debes cargar una plantilla')
      return false
    }

    try {
      const currentSize = new Blob([JSON.stringify(localStorage)]).size
      if (currentSize > 4 * 1024 * 1024) {
        console.log('🗑️ Limpiando localStorage...')
        localStorage.removeItem('ai_presentation_template_cache')
        localStorage.removeItem('savedTemplates')
      }

      const savedTemplates = JSON.parse(localStorage.getItem('savedTemplates') || '[]')
      
      const lightAnalysis = {
        ...currentTemplateData.analysis,
        slides: currentTemplateData.analysis.slides.map(slide => ({
          ...slide,
          preview: null,
          images: []
        }))
      }
      
      const templateToSave = {
        id: Date.now(),
        name: currentTemplateData.fileName,
        slideCount: currentTemplateData.analysis.slides.length,
        preview: null,
        analysis: lightAnalysis,
        savedAt: Date.now()
      }

      if (savedTemplates.length >= 5) {
        savedTemplates.shift()
      }

      savedTemplates.push(templateToSave)
      localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates))
      
      console.log('✅ Template saved successfully')
      showToast?.('Plantilla guardada correctamente')
      logActivity?.('save', `Plantilla "${currentTemplateData.fileName}" guardada`)
      return true
    } catch (error) {
      console.error('❌ Error saving template:', error)
      if (error.name === 'QuotaExceededError') {
        localStorage.clear()
        showWarning?.('Almacenamiento lleno', 'Se limpió el caché. Intenta guardar de nuevo.')
      } else {
        showWarning?.('Error al guardar', error.message)
      }
      return false
    }
  }, [currentTemplateData, showToast, showWarning, logActivity])

  const loadTemplate = useCallback((file, analysis) => {
    if (analysis.extractedAssets) {
      setExtractedAssets(analysis.extractedAssets)
    }
    
    setCurrentTemplateData({
      fileName: file.name,
      analysis: analysis,
      uploadedAt: Date.now()
    })
    
    setTemplateFile(file)
    setHasTemplate(true)
    
    return {
      fileName: file.name,
      analysis,
      uploadedAt: Date.now()
    }
  }, [])

  const clearTemplate = useCallback(() => {
    setHasTemplate(false)
    setCurrentTemplateData(null)
    setTemplateFile(null)
    setExtractedAssets(null)
    setFontAnalysis(null)
  }, [])

  return {
    hasTemplate,
    setHasTemplate,
    currentTemplateData,
    setCurrentTemplateData,
    templateFile,
    setTemplateFile,
    extractedAssets,
    setExtractedAssets,
    fontAnalysis,
    setFontAnalysis,
    showFontWarning,
    setShowFontWarning,
    analyzeFonts,
    saveTemplate,
    loadTemplate,
    clearTemplate
  }
}
