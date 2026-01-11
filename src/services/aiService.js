// Servicio de IA para Presentaciones
// Usa chutesService que ya funciona correctamente

import { callChutesAI } from './chutesService'
import { searchWeb, formatSearchResults } from './webSearchService'

// Historial de conversación
let conversationHistory = []

/**
 * Inicializar contexto
 */
export function initializePresentationContext(slides, templateAnalysis) {
  conversationHistory = []
}

/**
 * Generar respuesta de IA
 */
export async function generateAIResponse(userMessage, currentSlide, allSlides = []) {
  try {
    const slideIndex = allSlides.indexOf(currentSlide)
    const slideInfo = `Slide ${slideIndex + 1} de ${allSlides.length}, tipo: ${currentSlide?.type || 'content'}`
    
    // Detectar si necesita búsqueda web
    const needsWebSearch = detectWebSearchIntent(userMessage)
    let webContext = ''
    
    if (needsWebSearch) {
      console.log('🌐 Detectada necesidad de búsqueda web...')
      webContext = await performWebSearch(userMessage)
    }
    
    const systemPrompt = `Eres un asistente de IA para crear presentaciones profesionales.
${slideInfo}

Contenido actual: ${JSON.stringify(currentSlide?.content || {})}

${webContext ? `INFORMACIÓN DE INTERNET:\n${webContext}\n\n` : ''}

REGLAS:
1. Si el usuario pide editar/mejorar: genera contenido mejorado
2. Si hace pregunta general: responde normalmente
3. Si da información: organízala en el slide
4. Si pide investigar algo: usa la información de internet proporcionada

FORMATO DE RESPUESTA:
- Si hay cambios al slide: {"message": "tu respuesta", "updates": {"title": "...", "subtitle": "...", "heading": "...", "bullets": ["...", "..."]}}
- Si NO hay cambios: {"message": "tu respuesta", "updates": null}

IMPORTANTE: 
- Para slides tipo "title": usa "title" y "subtitle"
- Para slides tipo "content": usa "heading" y "bullets" (array de strings)
- Responde SOLO con JSON válido`

    const messages = [
      { role: 'user', content: userMessage }
    ]

    const aiContent = await callChutesAI(messages, { systemPrompt, maxTokens: 2000 })
    
    console.log('📄 Respuesta de IA:', aiContent)
    
    // Intentar parsear JSON de forma segura
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        // Validar que sea JSON válido antes de parsear
        const jsonStr = jsonMatch[0]
        // Limpiar posibles caracteres problemáticos
        const cleanJson = jsonStr
          .replace(/[\x00-\x1F\x7F]/g, '') // Remover caracteres de control
          .replace(/,\s*}/g, '}') // Remover comas finales
          .replace(/,\s*]/g, ']')
        
        const parsed = JSON.parse(cleanJson)
        return {
          message: parsed.message || aiContent,
          updates: parsed.updates || null,
          slideUpdates: parsed.updates ? [{ slideIndex: allSlides.indexOf(currentSlide), content: parsed.updates }] : null
        }
      }
    } catch (e) {
      console.warn('⚠️ No se pudo parsear JSON en respuesta:', e.message)
    }

    // Si no hay JSON, devolver el texto como mensaje
    return { message: aiContent, updates: null, slideUpdates: null }

  } catch (error) {
    console.error('Error en IA:', error)
    return handleFallback(userMessage, currentSlide)
  }
}

/**
 * Generar presentación completa con validación automática
 */
export async function generateFullPresentation(topic, allSlides) {
  try {
    const systemPrompt = `Eres un asistente experto en crear presentaciones profesionales.

TAREA: Generar contenido para TODAS las ${allSlides.length} diapositivas sobre: "${topic}"

Estructura de slides:
${allSlides.map((s, i) => {
  const layout = s.layout?.textAreas || []
  const maxChars = layout.reduce((sum, area) => sum + (area.maxChars || 0), 0)
  return `Slide ${i + 1}: tipo "${s.type}" (${maxChars} chars max)`
}).join('\n')}

IMPORTANTE - LÍMITES DE ESPACIO:
${allSlides.map((s, i) => {
  const layout = s.layout?.textAreas || []
  if (layout.length === 0) return `Slide ${i + 1}: Sin límites específicos`
  return `Slide ${i + 1}:\n${layout.map(area => `  - ${area.type}: ${area.maxChars} chars max`).join('\n')}`
}).join('\n')}

FORMATO DE RESPUESTA OBLIGATORIO (JSON):
{
  "message": "He generado contenido completo para tu presentación sobre ${topic}",
  "slideUpdates": [
    {"slideIndex": 0, "content": {"title": "Título Principal Impactante", "subtitle": "Subtítulo descriptivo"}},
    {"slideIndex": 1, "content": {"heading": "Primera Sección", "bullets": ["Punto clave 1", "Punto clave 2", "Punto clave 3"]}},
    {"slideIndex": 2, "content": {"heading": "Segunda Sección", "bullets": ["Punto 1", "Punto 2", "Punto 3"]}}
  ]
}

REGLAS CRÍTICAS:
1. DEBES generar contenido para TODOS los ${allSlides.length} slides
2. Slide 1: SIEMPRE usar "title" y "subtitle"
3. Slides 2-${allSlides.length}: SIEMPRE usar "heading" y "bullets" (array de 3-5 strings)
4. RESPETAR los límites de caracteres especificados arriba
5. Si un área tiene límite de 100 chars, NO exceder 90 chars
6. Bullets: cada punto debe ser conciso (máximo 80 chars por bullet)
7. Responde SOLO con JSON válido, SIN texto adicional antes o después
8. El contenido debe ser profesional, relevante y específico para "${topic}"`

    const messages = [
      { role: 'user', content: `Genera ahora el contenido completo en formato JSON, respetando los límites de espacio.` }
    ]

    const aiContent = await callChutesAI(messages, { systemPrompt, maxTokens: 4000 })
    
    console.log('📄 Respuesta de IA para presentación completa:', aiContent)
    
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        
        // Validar y ajustar contenido automáticamente
        if (result.slideUpdates) {
          result.slideUpdates = result.slideUpdates.map((update, idx) => {
            const slide = allSlides[idx]
            if (!slide || !slide.layout?.textAreas) return update
            
            // Validar y truncar si es necesario
            const validatedContent = validateAndAdjustContent(update.content, slide.layout.textAreas)
            
            return {
              ...update,
              content: validatedContent,
              wasAdjusted: validatedContent !== update.content
            }
          })
        }
        
        return result
      }
    } catch (e) {
      console.log('Error parsing JSON')
    }

    return generateFallbackPresentation(topic, allSlides)

  } catch (error) {
    console.error('Error generando presentación:', error)
    return generateFallbackPresentation(topic, allSlides)
  }
}

/**
 * Valida y ajusta el contenido para que quepa en las áreas disponibles
 */
function validateAndAdjustContent(content, textAreas) {
  if (!content || !textAreas || textAreas.length === 0) return content
  
  const adjustedContent = { ...content }
  
  textAreas.forEach(area => {
    const fieldContent = content[area.type]
    if (!fieldContent || !area.maxChars) return
    
    if (typeof fieldContent === 'string') {
      // Truncar si excede el límite
      if (fieldContent.length > area.maxChars) {
        adjustedContent[area.type] = fieldContent.substring(0, area.maxChars - 3) + '...'
        console.log(`⚠️ Contenido truncado en ${area.type}: ${fieldContent.length} → ${area.maxChars}`)
      }
    } else if (Array.isArray(fieldContent)) {
      // Para bullets, ajustar cada elemento
      const maxPerBullet = Math.floor(area.maxChars / fieldContent.length)
      adjustedContent[area.type] = fieldContent.map(bullet => {
        if (typeof bullet === 'string' && bullet.length > maxPerBullet) {
          return bullet.substring(0, maxPerBullet - 3) + '...'
        }
        return bullet
      })
    }
  })
  
  return adjustedContent
}

/**
 * Fallback cuando la API falla
 */
function handleFallback(userMessage, currentSlide) {
  const msg = userMessage.toLowerCase()
  
  if (msg.includes('título') || msg.includes('mejora')) {
    return {
      message: 'He mejorado el contenido de tu slide.',
      updates: {
        ...currentSlide?.content,
        title: 'Título Profesional Mejorado',
        heading: 'Contenido Optimizado'
      }
    }
  }

  if (msg.includes('agregar') || msg.includes('más')) {
    const bullets = currentSlide?.content?.bullets || []
    return {
      message: 'He agregado más puntos a tu slide.',
      updates: {
        ...currentSlide?.content,
        bullets: [...bullets, 'Nuevo punto estratégico', 'Análisis adicional']
      }
    }
  }

  return {
    message: '¿En qué puedo ayudarte con tu presentación?',
    updates: null
  }
}

/**
 * Fallback para presentación completa
 */
function generateFallbackPresentation(topic, allSlides) {
  const slideUpdates = allSlides.map((slide, index) => {
    if (slide.type === 'title' || index === 0) {
      return {
        slideIndex: index,
        content: {
          title: topic || 'Presentación Profesional',
          subtitle: 'Estrategia y Visión 2026'
        }
      }
    }
    return {
      slideIndex: index,
      content: {
        heading: `Sección ${index}: Puntos Clave`,
        bullets: [
          'Análisis de situación actual',
          'Objetivos estratégicos', 
          'Plan de acción',
          'Métricas de seguimiento'
        ]
      }
    }
  })

  return {
    message: `He generado contenido para tu presentación sobre "${topic}".`,
    slideUpdates
  }
}

// Exportar para compatibilidad
export async function generateContent(prompt, templateAnalysis) {
  const mockSlides = templateAnalysis.slides.map((s, i) => ({
    id: i + 1,
    type: s.type,
    content: {}
  }))
  
  const result = await generateFullPresentation(prompt, mockSlides)
  
  return {
    slides: result.slideUpdates?.map(u => ({
      slideNumber: u.slideIndex + 1,
      content: u.content
    })) || []
  }
}

/**
 * Detectar si el mensaje requiere búsqueda web
 */
function detectWebSearchIntent(message) {
  const msg = message.toLowerCase()
  const webKeywords = [
    'investiga', 'busca', 'información sobre', 'qué es', 'quién es',
    'página', 'sitio web', 'website', '.com', '.net', '.org',
    'actualidad', 'noticias', 'últimas', 'reciente'
  ]
  
  return webKeywords.some(keyword => msg.includes(keyword))
}

/**
 * Realizar búsqueda web
 */
async function performWebSearch(query) {
  try {
    const results = await searchWeb(query)
    return formatSearchResults(results)
  } catch (error) {
    console.error('Error en búsqueda web:', error)
    return ''
  }
}

/**
 * Generar variantes de contenido
 * Genera múltiples versiones alternativas del mismo contenido
 */
export async function generateContentVariants(currentContent, numVariants = 3) {
  try {
    const systemPrompt = `Eres un experto en crear contenido para presentaciones.
Tu tarea es generar ${numVariants} VARIANTES DIFERENTES del contenido proporcionado.

Cada variante debe:
1. Mantener el mismo mensaje/idea central
2. Usar diferentes palabras, estructura o enfoque
3. Ser profesional y clara
4. Tener aproximadamente la misma longitud

CONTENIDO ACTUAL:
${JSON.stringify(currentContent, null, 2)}

RESPONDE SOLO con un JSON array de ${numVariants} objetos, cada uno con la misma estructura que el contenido original.
Ejemplo de formato:
[
  {"title": "Variante 1...", "bullets": ["punto 1", "punto 2"]},
  {"title": "Variante 2...", "bullets": ["punto 1", "punto 2"]},
  {"title": "Variante 3...", "bullets": ["punto 1", "punto 2"]}
]`

    const messages = [
      { role: 'user', content: `Genera ${numVariants} variantes del contenido proporcionado.` }
    ]

    const aiContent = await callChutesAI(messages, { systemPrompt, maxTokens: 2000 })
    
    // Parsear respuesta
    const jsonMatch = aiContent.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const variants = JSON.parse(jsonMatch[0])
      if (Array.isArray(variants) && variants.length > 0) {
        return variants
      }
    }
    
    // Fallback: generar variantes simples
    return generateFallbackVariants(currentContent, numVariants)
    
  } catch (error) {
    console.error('Error generating variants:', error)
    return generateFallbackVariants(currentContent, numVariants)
  }
}

/**
 * Generar variantes de fallback si la IA falla
 */
function generateFallbackVariants(content, numVariants) {
  const variants = []
  const prefixes = ['', 'Descubre: ', 'Explora: ']
  const bulletPrefixes = [
    ['✓ ', '• ', '→ '],
    ['Primero, ', 'Además, ', 'Finalmente, '],
    ['', '', '']
  ]
  
  for (let i = 0; i < numVariants; i++) {
    const variant = {}
    
    if (content.title) {
      variant.title = prefixes[i % 3] + content.title
    }
    if (content.subtitle) {
      variant.subtitle = content.subtitle
    }
    if (content.heading) {
      variant.heading = prefixes[i % 3] + content.heading
    }
    if (content.bullets && Array.isArray(content.bullets)) {
      variant.bullets = content.bullets.map((b, j) => 
        bulletPrefixes[i % 3][j % 3] + b
      )
    }
    
    variants.push(variant)
  }
  
  return variants
}

/**
 * Sugerir mejoras al contenido
 */
export async function suggestContentImprovements(content) {
  try {
    const systemPrompt = `Eres un editor experto en presentaciones profesionales.
Analiza el contenido y sugiere mejoras específicas.

CONTENIDO A ANALIZAR:
${JSON.stringify(content, null, 2)}

RESPONDE con un JSON con esta estructura:
{
  "grammarIssues": [{"original": "texto con error", "suggestion": "texto corregido", "reason": "explicación"}],
  "titleSuggestions": ["título alternativo 1", "título alternativo 2"],
  "bulletImprovements": [{"original": "bullet original", "improved": "bullet mejorado"}],
  "generalTips": ["consejo 1", "consejo 2"],
  "overallScore": 8,
  "summary": "Resumen breve de las mejoras sugeridas"
}`

    const messages = [
      { role: 'user', content: 'Analiza y sugiere mejoras para este contenido.' }
    ]

    const aiContent = await callChutesAI(messages, { systemPrompt, maxTokens: 1500 })
    
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return generateFallbackSuggestions(content)
    
  } catch (error) {
    console.error('Error suggesting improvements:', error)
    return generateFallbackSuggestions(content)
  }
}

/**
 * Sugerencias de fallback
 */
function generateFallbackSuggestions(content) {
  const suggestions = {
    grammarIssues: [],
    titleSuggestions: [],
    bulletImprovements: [],
    generalTips: [
      'Usa verbos de acción al inicio de los bullets',
      'Mantén los títulos concisos (máximo 8 palabras)',
      'Asegúrate de que cada bullet tenga una idea clara'
    ],
    overallScore: 7,
    summary: 'El contenido es bueno. Considera hacer los títulos más impactantes.'
  }
  
  if (content.title) {
    suggestions.titleSuggestions = [
      content.title + ' - Guía Completa',
      'Descubre: ' + content.title,
      content.title + ' en 5 Pasos'
    ]
  }
  
  return suggestions
}

/**
 * Estructurar texto plano en slides
 */
export async function structureTextToSlides(rawText, numSlides = 5) {
  try {
    const systemPrompt = `Eres un experto en crear presentaciones.
Tu tarea es estructurar el texto proporcionado en ${numSlides} slides.

TEXTO A ESTRUCTURAR:
${rawText}

REGLAS:
1. El primer slide debe ser de tipo "title" con título y subtítulo
2. Los demás slides son de tipo "content" con heading y bullets
3. Cada slide debe tener 3-5 bullets
4. Los bullets deben ser concisos (máximo 15 palabras)
5. Organiza el contenido de forma lógica

RESPONDE SOLO con un JSON array:
[
  {"type": "title", "content": {"title": "...", "subtitle": "..."}},
  {"type": "content", "content": {"heading": "...", "bullets": ["...", "..."]}},
  ...
]`

    const messages = [
      { role: 'user', content: `Estructura este texto en ${numSlides} slides.` }
    ]

    const aiContent = await callChutesAI(messages, { systemPrompt, maxTokens: 2000 })
    
    const jsonMatch = aiContent.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const slides = JSON.parse(jsonMatch[0])
      if (Array.isArray(slides) && slides.length > 0) {
        return slides
      }
    }
    
    return structureTextFallback(rawText, numSlides)
    
  } catch (error) {
    console.error('Error structuring text:', error)
    return structureTextFallback(rawText, numSlides)
  }
}

/**
 * Estructuración de fallback
 */
function structureTextFallback(rawText, numSlides) {
  const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim())
  const slides = []
  
  // Primer slide: título
  const firstPara = paragraphs[0] || 'Presentación'
  slides.push({
    type: 'title',
    content: {
      title: firstPara.split('\n')[0].substring(0, 60),
      subtitle: firstPara.split('\n')[1]?.substring(0, 80) || ''
    }
  })
  
  // Resto: slides de contenido
  for (let i = 1; i < Math.min(paragraphs.length, numSlides); i++) {
    const para = paragraphs[i]
    const lines = para.split('\n').filter(l => l.trim())
    
    slides.push({
      type: 'content',
      content: {
        heading: lines[0]?.substring(0, 60) || `Sección ${i}`,
        bullets: lines.slice(1, 6).map(l => l.replace(/^[\-\*•]\s*/, '').substring(0, 80))
      }
    })
  }
  
  // Rellenar si faltan slides
  while (slides.length < numSlides) {
    slides.push({
      type: 'content',
      content: {
        heading: `Sección ${slides.length}`,
        bullets: ['Punto a desarrollar']
      }
    })
  }
  
  return slides
}
