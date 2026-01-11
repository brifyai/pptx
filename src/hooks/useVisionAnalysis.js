import { useState, useCallback } from 'react'

/**
 * @typedef {Object} VisionElementCoordinates
 * @property {number} top - Top position (0-1000 normalized)
 * @property {number} left - Left position (0-1000 normalized)
 * @property {number} width - Width (0-1000 normalized)
 * @property {number} height - Height (0-1000 normalized)
 */

/**
 * @typedef {Object} VisionElementStyle
 * @property {string} color - Text color in hex format
 * @property {'left'|'center'|'right'} align - Text alignment
 * @property {string} [backgroundColor] - Background color in hex format
 */

/**
 * @typedef {Object} VisionElement
 * @property {string} id - Unique element identifier
 * @property {'TITLE'|'SUBTITLE'|'BODY'|'FOOTER'|'IMAGE_HOLDER'|'CHART_AREA'|'UNKNOWN'} type - Element type
 * @property {VisionElementCoordinates} coordinates - Normalized coordinates (0-1000)
 * @property {VisionElementStyle} style - Visual style attributes
 * @property {number} confidence - Detection confidence (0-1)
 * @property {number} [shapeId] - Linked PowerPoint shape ID after matching
 */

/**
 * @typedef {Object} UseVisionAnalysisReturn
 * @property {VisionElement[]} elements - Detected elements from template analysis
 * @property {boolean} isAnalyzing - Whether analysis is in progress
 * @property {boolean} isCached - Whether the result came from cache
 * @property {string|null} error - Error message if analysis failed
 * @property {string|null} templateHash - Hash of the analyzed template
 * @property {Object<string, number>} shapeMapping - Mapping of element types to shape IDs
 * @property {function(File): Promise<VisionElement[]>} analyzeTemplate - Function to analyze a template file
 * @property {function(string, string): Promise<void>} updateElementType - Function to update element type
 * @property {function(): void} reset - Function to reset state
 */

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Valid element types for validation
export const VALID_ELEMENT_TYPES = [
  'TITLE',
  'SUBTITLE',
  'BODY',
  'FOOTER',
  'IMAGE_HOLDER',
  'CHART_AREA',
  'UNKNOWN'
]

// Error types for specific error handling (Requirements 6.1, 6.2)
export const ERROR_TYPES = {
  CONVERSION_ERROR: 'CONVERSION_ERROR',
  NO_DETECTIONS: 'NO_DETECTIONS',
  API_ERROR: 'API_ERROR',
  INVALID_FILE: 'INVALID_FILE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// Error messages with suggestions (Requirements 6.1, 6.2)
export const ERROR_MESSAGES = {
  [ERROR_TYPES.CONVERSION_ERROR]: {
    title: 'Error de conversión',
    message: 'No se pudo procesar el archivo PPTX.',
    suggestion: 'Verifica que el archivo sea un PPTX válido y no esté corrupto. Intenta abrirlo en PowerPoint para confirmar.',
    canUseManualMode: true
  },
  [ERROR_TYPES.NO_DETECTIONS]: {
    title: 'Sin elementos detectados',
    message: 'No se detectaron áreas de contenido en el template.',
    suggestion: 'El template puede tener una estructura no estándar. Puedes usar el modo de mapeo manual para definir las áreas.',
    canUseManualMode: true
  },
  [ERROR_TYPES.API_ERROR]: {
    title: 'Error de análisis visual',
    message: 'El servicio de análisis visual no está disponible.',
    suggestion: 'Intenta nuevamente en unos momentos. Si el problema persiste, usa el modo de mapeo manual.',
    canUseManualMode: true
  },
  [ERROR_TYPES.INVALID_FILE]: {
    title: 'Archivo inválido',
    message: 'El archivo no es un PPTX válido.',
    suggestion: 'Solo se aceptan archivos con extensión .pptx o .ppt. Verifica el formato del archivo.',
    canUseManualMode: false
  },
  [ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Error de conexión',
    message: 'No se pudo conectar con el servidor.',
    suggestion: 'Verifica tu conexión a internet y que el servidor esté funcionando.',
    canUseManualMode: false
  },
  [ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Error desconocido',
    message: 'Ocurrió un error inesperado.',
    suggestion: 'Intenta nuevamente. Si el problema persiste, contacta al soporte técnico.',
    canUseManualMode: true
  }
}

/**
 * Classify error type based on error message or response
 * @param {Error|string} error - The error to classify
 * @param {Response} [response] - Optional fetch response
 * @returns {string} - Error type from ERROR_TYPES
 */
export function classifyError(error, response = null) {
  const errorMessage = typeof error === 'string' ? error : error?.message || ''
  const lowerMessage = errorMessage.toLowerCase()
  
  // Check for network errors
  if (error instanceof TypeError && lowerMessage.includes('fetch')) {
    return ERROR_TYPES.NETWORK_ERROR
  }
  
  // Check for invalid file errors
  if (lowerMessage.includes('solo se aceptan') || 
      lowerMessage.includes('archivo inválido') ||
      lowerMessage.includes('invalid file') ||
      lowerMessage.includes('.pptx')) {
    return ERROR_TYPES.INVALID_FILE
  }
  
  // Check for conversion errors
  if (lowerMessage.includes('conversión') || 
      lowerMessage.includes('conversion') ||
      lowerMessage.includes('procesar') ||
      lowerMessage.includes('libreoffice')) {
    return ERROR_TYPES.CONVERSION_ERROR
  }
  
  // Check for no detections
  if (lowerMessage.includes('sin elementos') || 
      lowerMessage.includes('no se detectaron') ||
      lowerMessage.includes('empty elements') ||
      lowerMessage.includes('no elements')) {
    return ERROR_TYPES.NO_DETECTIONS
  }
  
  // Check for API errors (Gemini, etc.)
  if (lowerMessage.includes('gemini') || 
      lowerMessage.includes('api error') ||
      lowerMessage.includes('análisis visual') ||
      (response && response.status >= 500)) {
    return ERROR_TYPES.API_ERROR
  }
  
  return ERROR_TYPES.UNKNOWN_ERROR
}

/**
 * Get detailed error info for display
 * @param {string} errorType - Error type from ERROR_TYPES
 * @returns {Object} - Error info with title, message, suggestion, canUseManualMode
 */
export function getErrorInfo(errorType) {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR]
}

/**
 * Hook for managing template vision analysis with Gemini Vision API.
 * Provides state management for analyzing PPTX templates, detecting elements,
 * and handling user corrections.
 * 
 * Features:
 * - Automatic cache detection (shows "Template reconocido" indicator)
 * - Element type correction with persistence
 * - Error handling with descriptive messages
 * 
 * Requirements: 1.5, 2.4
 * 
 * @returns {UseVisionAnalysisReturn}
 */
export function useVisionAnalysis() {
  // State: elements, isAnalyzing, isCached, error, errorType
  const [elements, setElements] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCached, setIsCached] = useState(false)
  const [error, setError] = useState(null)
  const [errorType, setErrorType] = useState(null)
  const [templateHash, setTemplateHash] = useState(null)
  const [shapeMapping, setShapeMapping] = useState({})

  /**
   * Analyze a PPTX template file using the backend API.
   * The backend will check cache first, then call Gemini Vision if needed.
   * 
   * @param {File} file - The PPTX file to analyze
   * @returns {Promise<VisionElement[]>} - Array of detected elements
   * @throws {Error} - If analysis fails
   */
  const analyzeTemplate = useCallback(async (file) => {
    if (!file) {
      const err = new Error('No se proporcionó archivo para analizar')
      err.errorType = ERROR_TYPES.INVALID_FILE
      throw err
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx') && !file.name.toLowerCase().endsWith('.ppt')) {
      const err = new Error('Solo se aceptan archivos .pptx o .ppt')
      err.errorType = ERROR_TYPES.INVALID_FILE
      throw err
    }

    setIsAnalyzing(true)
    setError(null)
    setErrorType(null)
    setIsCached(false)
    setElements([])
    setTemplateHash(null)
    setShapeMapping({})

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Call backend API
      let response
      try {
        response = await fetch(`${API_BASE_URL}/api/analyze-template`, {
          method: 'POST',
          body: formData
        })
      } catch (fetchError) {
        // Network error
        const err = new Error('No se pudo conectar con el servidor')
        err.errorType = ERROR_TYPES.NETWORK_ERROR
        throw err
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || `Error del servidor: ${response.status}`
        const err = new Error(errorMessage)
        err.errorType = classifyError(errorMessage, response)
        throw err
      }

      const data = await response.json()

      if (!data.success) {
        const err = new Error(data.message || 'Error al analizar template')
        err.errorType = classifyError(data.message)
        throw err
      }

      // Check for empty detections (Requirement 6.2)
      const detectedElements = data.elements || []
      if (detectedElements.length === 0) {
        const err = new Error('No se detectaron áreas de contenido en el template')
        err.errorType = ERROR_TYPES.NO_DETECTIONS
        throw err
      }

      // Update state with results
      setElements(detectedElements)
      setIsCached(data.source === 'cache')
      setTemplateHash(data.templateHash)
      setShapeMapping(data.shapeMapping || {})

      console.log(`✅ Template analysis complete: ${detectedElements.length} elements (source: ${data.source})`)

      return detectedElements

    } catch (err) {
      // Classify error if not already classified
      const classifiedType = err.errorType || classifyError(err)
      const errorInfo = getErrorInfo(classifiedType)
      
      setError(err.message || errorInfo.message)
      setErrorType(classifiedType)
      
      console.error('❌ Template analysis failed:', err.message, `(type: ${classifiedType})`)
      
      // Attach error info to the error for consumers
      err.errorType = classifiedType
      err.errorInfo = errorInfo
      throw err

    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  /**
   * Update the type of a detected element.
   * This correction is persisted to the backend cache for future use.
   * 
   * Requirements: 2.4, 2.5
   * 
   * @param {string} elementId - ID of the element to update
   * @param {string} newType - New element type (must be valid)
   * @returns {Promise<void>}
   * @throws {Error} - If update fails or type is invalid
   */
  const updateElementType = useCallback(async (elementId, newType) => {
    if (!templateHash) {
      throw new Error('No hay template analizado para actualizar')
    }

    if (!elementId) {
      throw new Error('ID de elemento no proporcionado')
    }

    // Validate new type
    const upperType = newType?.toUpperCase?.()?.trim?.() || ''
    if (!VALID_ELEMENT_TYPES.includes(upperType)) {
      throw new Error(`Tipo de elemento inválido: ${newType}. Tipos válidos: ${VALID_ELEMENT_TYPES.join(', ')}`)
    }

    try {
      // Call backend API to persist the correction
      const response = await fetch(`${API_BASE_URL}/api/update-mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_hash: templateHash,
          element_id: elementId,
          new_type: upperType
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || `Error del servidor: ${response.status}`
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Error al actualizar elemento')
      }

      // Update local state
      setElements(prevElements => 
        prevElements.map(element => 
          element.id === elementId 
            ? { ...element, type: upperType }
            : element
        )
      )

      console.log(`✅ Element ${elementId} updated to type ${upperType}`)

    } catch (err) {
      const errorMessage = err.message || 'Error desconocido al actualizar elemento'
      console.error('❌ Element update failed:', errorMessage)
      throw err
    }
  }, [templateHash])

  /**
   * Reset all state to initial values.
   * Useful when switching templates or clearing the analysis.
   */
  const reset = useCallback(() => {
    setElements([])
    setIsAnalyzing(false)
    setIsCached(false)
    setError(null)
    setErrorType(null)
    setTemplateHash(null)
    setShapeMapping({})
  }, [])

  return {
    elements,
    isAnalyzing,
    isCached,
    error,
    errorType,
    templateHash,
    shapeMapping,
    analyzeTemplate,
    updateElementType,
    reset,
    // Helper to get error info for display
    getErrorInfo: () => errorType ? getErrorInfo(errorType) : null
  }
}

export default useVisionAnalysis
