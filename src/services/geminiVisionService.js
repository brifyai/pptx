// Servicio para Google Gemini Vision API
// Analiza imágenes de slides para detectar diseño, fuentes, colores, etc.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

// Valid element types for template analysis
export const VALID_ELEMENT_TYPES = [
  'TITLE',
  'SUBTITLE', 
  'BODY',
  'FOOTER',
  'IMAGE_HOLDER',
  'CHART_AREA',
  'UNKNOWN'
]

// Technical prompt for template layout analysis (from design.md)
const TEMPLATE_ANALYSIS_PROMPT = `Actúa como un analizador experto de XML de PowerPoint.

Tarea: Analiza la imagen adjunta e identifica todos los contenedores de contenido (placeholders).

Instrucciones de Extracción:
1. Identifica el propósito de cada área: TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, o CHART_AREA
2. Devuelve las coordenadas en formato normalizado (0-1000) para top, left, width, height
3. Identifica atributos visuales: font_color (hex), text_alignment (left, center, right), y background_color
4. Estima el "Z-index" (orden de capas) si hay elementos superpuestos

Formato de salida: JSON puro. No agregues explicaciones.

{
  "slide_metadata": { "aspect_ratio": "16:9" },
  "elements": [
    {
      "id": "element_1",
      "type": "TITLE",
      "coordinates": {"top": 50, "left": 100, "width": 800, "height": 100},
      "style": {"color": "#2C3E50", "align": "center"},
      "confidence": 0.95
    }
  ]
}`

/**
 * Normalize a coordinate value to the range [0, 1000]
 * Clamps values outside the valid range
 * @param {number} value - The coordinate value to normalize
 * @returns {number} - Normalized value in range [0, 1000]
 */
export function normalizeCoordinate(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0
  }
  return Math.max(0, Math.min(1000, Math.round(value)))
}

/**
 * Validate and normalize element type to one of the valid types
 * @param {string} type - The element type from Gemini response
 * @returns {string} - Valid element type or 'UNKNOWN'
 */
export function validateElementType(type) {
  if (typeof type !== 'string') {
    return 'UNKNOWN'
  }
  const upperType = type.toUpperCase().trim()
  return VALID_ELEMENT_TYPES.includes(upperType) ? upperType : 'UNKNOWN'
}

/**
 * Parse and validate Gemini Vision response for template analysis
 * Normalizes coordinates to range [0, 1000] and validates element types
 * @param {object} rawResponse - Raw JSON response from Gemini Vision
 * @returns {{slide_metadata: object, elements: Array<VisionElement>}}
 */
export function parseVisionResponse(rawResponse) {
  // Handle null/undefined input
  if (!rawResponse || typeof rawResponse !== 'object') {
    return {
      slide_metadata: { aspect_ratio: '16:9' },
      elements: []
    }
  }

  // Extract slide metadata with defaults
  const slideMetadata = {
    aspect_ratio: rawResponse.slide_metadata?.aspect_ratio || '16:9'
  }

  // Parse and normalize elements
  const rawElements = Array.isArray(rawResponse.elements) ? rawResponse.elements : []
  
  const elements = rawElements.map((element, index) => {
    // Extract and normalize coordinates
    const coords = element.coordinates || {}
    const normalizedCoordinates = {
      top: normalizeCoordinate(coords.top),
      left: normalizeCoordinate(coords.left),
      width: normalizeCoordinate(coords.width),
      height: normalizeCoordinate(coords.height)
    }

    // Validate element type
    const validatedType = validateElementType(element.type)

    // Extract style with defaults
    const style = element.style || {}
    const normalizedStyle = {
      color: typeof style.color === 'string' ? style.color : '#000000',
      align: ['left', 'center', 'right'].includes(style.align) ? style.align : 'left',
      backgroundColor: typeof style.backgroundColor === 'string' ? style.backgroundColor : undefined
    }

    // Extract confidence with default
    const confidence = typeof element.confidence === 'number' 
      ? Math.max(0, Math.min(1, element.confidence)) 
      : 0.5

    return {
      id: element.id || `element_${index + 1}`,
      type: validatedType,
      coordinates: normalizedCoordinates,
      style: normalizedStyle,
      confidence,
      shapeId: element.shapeId // Will be populated after shape matching
    }
  })

  return {
    slide_metadata: slideMetadata,
    elements
  }
}

/**
 * Sleep utility for retry backoff
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Make a single Gemini Vision API call
 * @param {string} base64Data - Base64 encoded image data (without prefix)
 * @returns {Promise<object>} - Raw JSON response from Gemini
 * @throws {Error} - If API call fails or response is invalid
 */
async function callGeminiVisionAPI(base64Data) {
  const response = await fetch(
    `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: TEMPLATE_ANALYSIS_PROMPT },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json'
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Gemini API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  // Extract JSON from response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Gemini response')
  }

  return JSON.parse(jsonMatch[0])
}

/**
 * Analyze template layout with retry logic and exponential backoff
 * Retries up to 2 times with backoff: 1s, 2s
 * @param {string} imageBase64 - Base64 encoded image of the slide
 * @param {object} options - Optional configuration
 * @param {number} options.maxRetries - Maximum number of retries (default: 2)
 * @param {number} options.initialBackoffMs - Initial backoff in ms (default: 1000)
 * @returns {Promise<{slide_metadata: object, elements: Array}>}
 * @throws {Error} - If all retries fail
 */
export async function analyzeTemplateLayoutWithRetry(imageBase64, options = {}) {
  const maxRetries = options.maxRetries ?? 2
  const initialBackoffMs = options.initialBackoffMs ?? 1000

  console.log('🔍 Analyzing template layout with Gemini Vision (with retry)...')

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const backoffMs = initialBackoffMs * attempt // 1s, 2s
        console.log(`⏳ Retry attempt ${attempt}/${maxRetries} after ${backoffMs}ms backoff...`)
        await sleep(backoffMs)
      }

      const rawResult = await callGeminiVisionAPI(base64Data)
      console.log('📄 Raw Gemini response received')
      
      // Parse and validate the response
      const parsed = parseVisionResponse(rawResult)
      
      // Validate that we got at least some elements (empty response might need retry)
      if (parsed.elements.length === 0 && attempt < maxRetries) {
        console.warn('⚠️ Empty elements array, retrying...')
        lastError = new Error('Gemini returned empty elements array')
        continue
      }

      console.log(`✅ Template analysis completed with ${parsed.elements.length} elements`)
      return parsed

    } catch (error) {
      lastError = error
      console.error(`❌ Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message)
      
      if (attempt === maxRetries) {
        break
      }
    }
  }

  // All retries exhausted
  throw new Error(`Gemini Vision analysis failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Analyze template layout using Gemini Vision with technical prompt
 * Returns structured JSON with normalized coordinates (0-1000)
 * Uses retry logic with exponential backoff (max 2 retries, backoff: 1s, 2s)
 * @param {string} imageBase64 - Base64 encoded image of the slide
 * @returns {Promise<{slide_metadata: object, elements: Array}>}
 */
export async function analyzeTemplateLayout(imageBase64) {
  return analyzeTemplateLayoutWithRetry(imageBase64)
}

/**
 * Analizar diseño de un slide usando Gemini Vision
 */
export async function analyzeSlideDesign(imageBase64, slideNumber) {
  try {
    console.log(`🔍 Analizando diseño del slide ${slideNumber} con Gemini Vision...`)

    // Remover el prefijo data:image/png;base64, si existe
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

    const prompt = `Analiza esta diapositiva de presentación y proporciona un análisis detallado del diseño.

IMPORTANTE: Responde SOLO con JSON válido, sin texto adicional.

Identifica:
1. Áreas de texto (posición aproximada en %, tamaño, alineación)
2. Fuentes utilizadas (familia, tamaño estimado en pt)
3. Colores predominantes (hex)
4. Espaciado y márgenes
5. Estilo general (corporativo, moderno, minimalista, etc.)

Formato de respuesta JSON:
{
  "textAreas": [
    {
      "type": "title" | "subtitle" | "body" | "bullets",
      "position": {"x": 10, "y": 15, "width": 80, "height": 20},
      "estimatedFont": {"family": "Arial", "size": 44, "weight": "bold"},
      "color": "#000000",
      "alignment": "center" | "left" | "right",
      "maxChars": 100
    }
  ],
  "colorScheme": {
    "primary": "#667eea",
    "secondary": "#764ba2",
    "text": "#333333",
    "background": "#ffffff"
  },
  "spacing": {
    "marginTop": 10,
    "marginBottom": 10,
    "marginLeft": 5,
    "marginRight": 5,
    "lineHeight": 1.5
  },
  "style": "corporativo" | "moderno" | "minimalista" | "creativo"
}`

    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Error de Gemini Vision:', errorData)
      throw new Error(`Gemini API Error: ${response.status}`)
    }

    const data = await response.json()
    const textContent = data.candidates[0]?.content?.parts[0]?.text || '{}'
    
    console.log('📄 Respuesta de Gemini:', textContent)

    // Extraer JSON de la respuesta
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      console.log('✅ Análisis de diseño completado:', analysis)
      return analysis
    }

    throw new Error('No se pudo extraer JSON de la respuesta')

  } catch (error) {
    console.error('Error analizando con Gemini Vision:', error)
    // Retornar análisis por defecto
    return getDefaultAnalysis()
  }
}

/**
 * Analizar múltiples slides en paralelo
 */
export async function analyzeMultipleSlides(slides) {
  console.log(`🔍 Analizando ${slides.length} slides con Gemini Vision...`)
  
  const analyses = await Promise.all(
    slides.map((slide, index) => 
      analyzeSlideDesign(slide.preview, index + 1)
    )
  )

  return analyses
}

/**
 * Análisis por defecto si falla Gemini
 */
function getDefaultAnalysis() {
  return {
    textAreas: [
      {
        type: 'title',
        position: { x: 10, y: 15, width: 80, height: 15 },
        estimatedFont: { family: 'Arial', size: 44, weight: 'bold' },
        color: '#000000',
        alignment: 'center',
        maxChars: 100
      },
      {
        type: 'body',
        position: { x: 10, y: 35, width: 80, height: 50 },
        estimatedFont: { family: 'Arial', size: 24, weight: 'normal' },
        color: '#333333',
        alignment: 'left',
        maxChars: 500
      }
    ],
    colorScheme: {
      primary: '#667eea',
      secondary: '#764ba2',
      text: '#333333',
      background: '#ffffff'
    },
    spacing: {
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      lineHeight: 1.5
    },
    style: 'corporativo'
  }
}

/**
 * Mapear contenido a áreas detectadas por visión
 */
export function mapContentToVisualAreas(content, visualAnalysis) {
  const mappedAreas = []

  visualAnalysis.textAreas.forEach(area => {
    let mappedContent = ''

    // Mapeo inteligente según tipo de área
    if (area.type === 'title') {
      mappedContent = content.title || content.heading || ''
    } else if (area.type === 'subtitle') {
      mappedContent = content.subtitle || ''
    } else if (area.type === 'bullets' || area.type === 'body') {
      if (content.bullets && Array.isArray(content.bullets)) {
        mappedContent = content.bullets.join('\n• ')
        if (mappedContent) mappedContent = '• ' + mappedContent
      } else {
        mappedContent = content.text || ''
      }
    }

    // Adaptar al tamaño máximo
    if (mappedContent.length > area.maxChars) {
      mappedContent = mappedContent.substring(0, area.maxChars - 3) + '...'
    }

    mappedAreas.push({
      areaId: `visual-${area.type}-${Math.random().toString(36).substr(2, 9)}`,
      areaType: area.type,
      content: mappedContent,
      position: area.position,
      formatting: {
        font: area.estimatedFont.family,
        size: area.estimatedFont.size,
        weight: area.estimatedFont.weight,
        color: area.color,
        alignment: area.alignment
      },
      maxChars: area.maxChars
    })
  })

  return {
    areas: mappedAreas,
    colorScheme: visualAnalysis.colorScheme,
    spacing: visualAnalysis.spacing,
    style: visualAnalysis.style
  }
}
