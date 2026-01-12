// Servicio de búsqueda web y análisis de sitios
// Permite a la IA obtener información de URLs y buscar en web

/**
 * Buscar información en la web o analizar una URL específica
 */
export async function searchWeb(query) {
  try {
    console.log('🔍 Buscando en web:', query)
    
    // Extraer URL si existe en la query
    const urlMatch = query.match(/https?:\/\/[^\s]+/)
    
    if (urlMatch) {
      const url = urlMatch[0]
      console.log('🌐 URL detectada:', url)
      return await fetchWebsite(url)
    }
    
    // Buscar URLs sin protocolo
    const domainMatch = query.match(/([a-zA-Z0-9-]+\.(com|net|org|io|ai|co|es|mx|cl|ar|pe|uy|ve|bo|ec|py|gt|hn|sv|ni|cr|pa|do|cu|pr)[^\s]*)/i)
    
    if (domainMatch) {
      const url = `https://${domainMatch[0]}`
      console.log('🌐 Dominio detectado:', url)
      return await fetchWebsite(url)
    }
    
    // Si no hay URL, buscar en web
    console.log('🔎 Realizando búsqueda web...')
    return await performWebSearch(query)
    
  } catch (error) {
    console.error('❌ Error en búsqueda web:', error)
    return {
      error: true,
      message: 'No se pudo obtener información de la web',
      query: query
    }
  }
}

/**
 * Obtener y analizar contenido de un sitio web
 */
async function fetchWebsite(url) {
  try {
    console.log('📥 Obteniendo contenido de:', url)
    
    // Intentar múltiples métodos
    let content = null
    
    // Método 1: AllOrigins (más confiable)
    try {
      content = await fetchViaAllOrigins(url)
      if (content) {
        console.log('✅ Contenido obtenido via AllOrigins')
        return content
      }
    } catch (e) {
      console.warn('⚠️ AllOrigins falló:', e.message)
    }
    
    // Método 2: CORS Anywhere (backup)
    try {
      content = await fetchViaCorsAnywhere(url)
      if (content) {
        console.log('✅ Contenido obtenido via CORS Anywhere')
        return content
      }
    } catch (e) {
      console.warn('⚠️ CORS Anywhere falló:', e.message)
    }
    
    // Si todo falla, retornar información básica
    return {
      url: url,
      title: 'Sitio Web',
      content: `No se pudo acceder al contenido completo de ${url}. Proporciona información específica sobre lo que necesitas del sitio.`,
      snippet: `URL: ${url}`,
      error: true
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo website:', error)
    return {
      url: url,
      error: true,
      message: error.message
    }
  }
}

/**
 * Obtener contenido via AllOrigins
 */
async function fetchViaAllOrigins(url) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data.contents) {
    const text = cleanHtmlText(data.contents)
    const title = extractTitle(data.contents)
    const description = extractDescription(data.contents)
    const headings = extractHeadings(data.contents)
    
    return {
      url: url,
      title: title,
      description: description,
      headings: headings,
      content: text.substring(0, 5000), // Primeros 5000 caracteres
      snippet: description || text.substring(0, 300),
      wordCount: text.split(/\s+/).length,
      method: 'allorigins'
    }
  }
  
  return null
}

/**
 * Obtener contenido via CORS Anywhere (backup)
 */
async function fetchViaCorsAnywhere(url) {
  const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  const html = await response.text()
  const text = cleanHtmlText(html)
  
  return {
    url: url,
    title: extractTitle(html),
    description: extractDescription(html),
    content: text.substring(0, 5000),
    snippet: text.substring(0, 300),
    method: 'cors-anywhere'
  }
}

/**
 * Realizar búsqueda web (simulada por ahora)
 */
async function performWebSearch(query) {
  console.log('🔎 Búsqueda web:', query)
  
  // En producción, aquí usarías una API de búsqueda real
  // Por ahora, retornamos información general
  
  return {
    query: query,
    results: [],
    content: `Búsqueda web para "${query}". Para obtener información específica de un sitio, proporciona la URL completa (ej: https://ejemplo.com)`,
    snippet: `Búsqueda: ${query}`,
    isSearch: true
  }
}

/**
 * Limpiar texto HTML
 */
function cleanHtmlText(html) {
  // Remover scripts, styles, y elementos no deseados
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
  
  // Remover comentarios HTML
  text = text.replace(/<!--[\s\S]*?-->/g, '')
  
  // Remover tags HTML pero mantener saltos de línea
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/p>/gi, '\n\n')
  text = text.replace(/<\/div>/gi, '\n')
  text = text.replace(/<\/h[1-6]>/gi, '\n\n')
  text = text.replace(/<[^>]+>/g, ' ')
  
  // Decodificar entidades HTML
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&apos;/g, "'")
  
  // Limpiar espacios múltiples pero mantener saltos de línea
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s+/g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.trim()
  
  return text
}

/**
 * Extraer título de HTML
 */
function extractTitle(html) {
  // Intentar meta og:title primero
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (ogTitleMatch) return ogTitleMatch[1].trim()
  
  // Intentar title tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  if (titleMatch) return titleMatch[1].trim()
  
  // Intentar h1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  if (h1Match) return cleanHtmlText(h1Match[1]).trim()
  
  return 'Sin título'
}

/**
 * Extraer descripción de HTML
 */
function extractDescription(html) {
  // Intentar meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (metaDescMatch) return metaDescMatch[1].trim()
  
  // Intentar og:description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  if (ogDescMatch) return ogDescMatch[1].trim()
  
  return null
}

/**
 * Extraer encabezados principales
 */
function extractHeadings(html) {
  const headings = []
  
  // Extraer h1, h2, h3
  const h1Matches = html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)
  const h2Matches = html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)
  const h3Matches = html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gi)
  
  for (const match of h1Matches) {
    headings.push({ level: 1, text: cleanHtmlText(match[1]).trim() })
  }
  
  for (const match of h2Matches) {
    headings.push({ level: 2, text: cleanHtmlText(match[1]).trim() })
  }
  
  for (const match of h3Matches) {
    headings.push({ level: 3, text: cleanHtmlText(match[1]).trim() })
  }
  
  return headings.slice(0, 10) // Primeros 10 encabezados
}

/**
 * Formatear resultados para la IA
 */
export function formatSearchResults(results) {
  if (!results) return ''
  
  if (results.error) {
    return `No se pudo acceder a la información web. ${results.message || ''}`
  }
  
  if (results.url) {
    let formatted = `
═══════════════════════════════════════════════════
ANÁLISIS DE SITIO WEB
═══════════════════════════════════════════════════

URL: ${results.url}
Título: ${results.title}
${results.description ? `Descripción: ${results.description}\n` : ''}
${results.wordCount ? `Palabras: ${results.wordCount}\n` : ''}
`
    
    if (results.headings && results.headings.length > 0) {
      formatted += `\nENCBEZADOS PRINCIPALES:\n`
      results.headings.forEach(h => {
        formatted += `${'  '.repeat(h.level - 1)}• ${h.text}\n`
      })
    }
    
    formatted += `\nCONTENIDO:\n${results.content}\n`
    formatted += `\n═══════════════════════════════════════════════════\n`
    
    return formatted
  }
  
  if (results.isSearch) {
    return `BÚSQUEDA WEB: ${results.query}\n${results.content}`
  }
  
  return results.content || 'Sin información disponible'
}

/**
 * Detectar si un mensaje contiene una URL
 */
export function containsUrl(text) {
  const urlPattern = /https?:\/\/[^\s]+|([a-zA-Z0-9-]+\.(com|net|org|io|ai|co|es|mx|cl|ar|pe|uy|ve|bo|ec|py|gt|hn|sv|ni|cr|pa|do|cu|pr)[^\s]*)/i
  return urlPattern.test(text)
}
