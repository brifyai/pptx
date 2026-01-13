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
      
      // Verificar si es red social
      if (isSocialMediaUrl(url)) {
        console.log('📱 URL de red social detectada')
        return await analyzeSocialMedia(url)
      }
      
      return await fetchWebsite(url)
    }
    
    // Buscar URLs sin protocolo
    const domainMatch = query.match(/([a-zA-Z0-9-]+\.(com|net|org|io|ai|co|es|mx|cl|ar|pe|uy|ve|bo|ec|py|gt|hn|sv|ni|cr|pa|do|cu|pr)[^\s]*)/i)
    
    if (domainMatch) {
      const url = `https://${domainMatch[0]}`
      console.log('🌐 Dominio detectado:', url)
      
      // Verificar si es red social
      if (isSocialMediaUrl(url)) {
        console.log('📱 URL de red social detectada')
        return await analyzeSocialMedia(url)
      }
      
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
    
    // Usar el backend para evitar CORS
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
    
    try {
      console.log('🔗 Usando backend para fetch:', `${BACKEND_URL}/api/fetch-url`)
      const response = await fetch(`${BACKEND_URL}/api/fetch-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Contenido obtenido via backend')
        return {
          url: data.url,
          title: data.title,
          description: data.description,
          content: data.fullText,
          snippet: data.content,
          headings: data.headings,
          keywords: data.keywords
        }
      }
    } catch (e) {
      console.warn('⚠️ Backend fetch falló:', e.message)
    }
    
    // Si el backend falla, retornar información básica
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
 * Realizar búsqueda web REAL usando el backend
 */
async function performWebSearch(query) {
  try {
    console.log('🔍 Realizando búsqueda web real:', query)
    
    const response = await fetch('http://localhost:8000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        num_results: 5
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Resultados de búsqueda:', data.count)
    
    return {
      query: data.query,
      results: data.results,
      content: formatSearchResultsDetailed(data.results),
      count: data.count,
      isSearch: true
    }
    
  } catch (error) {
    console.error('❌ Error en búsqueda web:', error)
    
    // Fallback: mensaje informativo
    return {
      query: query,
      results: [],
      content: `⚠️ No se pudo realizar la búsqueda web. Verifica que el backend esté corriendo.\n\nPara obtener información específica de un sitio, proporciona la URL completa (ej: https://ejemplo.com)`,
      snippet: `Búsqueda: ${query}`,
      isSearch: true,
      error: true
    }
  }
}

function formatSearchResultsDetailed(results) {
  if (!results || results.length === 0) {
    return 'No se encontraron resultados.'
  }
  
  let formatted = `
═══════════════════════════════════════════════════
RESULTADOS DE BÚSQUEDA WEB (${results.length})
═══════════════════════════════════════════════════\n\n`
  
  results.forEach((result, index) => {
    formatted += `${index + 1}. ${result.title}\n`
    formatted += `   URL: ${result.url}\n`
    formatted += `   ${result.snippet}\n\n`
    
    if (result.content && result.content.length > 100) {
      formatted += `   CONTENIDO:\n`
      formatted += `   ${result.content.substring(0, 500)}...\n\n`
    }
    
    formatted += `───────────────────────────────────────────────────\n\n`
  })
  
  return formatted
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
  
  if (results.error && !results.platform) {
    return `No se pudo acceder a la información web. ${results.message || ''}`
  }
  
  // Contenido de redes sociales
  if (results.platform) {
    return results.content
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

/**
 * Detectar si es URL de red social
 */
export function isSocialMediaUrl(url) {
  const socialPatterns = [
    /facebook\.com/i,
    /instagram\.com/i,
    /tiktok\.com/i,
    /twitter\.com/i,
    /x\.com/i,
    /linkedin\.com/i,
    /youtube\.com/i,
    /youtu\.be/i
  ]
  
  return socialPatterns.some(pattern => pattern.test(url))
}

/**
 * Analizar URL de red social (limitado)
 */
export async function analyzeSocialMedia(url) {
  console.log('📱 Analizando red social:', url)
  
  // Detectar plataforma
  let platform = 'unknown'
  if (/facebook\.com/i.test(url)) platform = 'facebook'
  else if (/instagram\.com/i.test(url)) platform = 'instagram'
  else if (/tiktok\.com/i.test(url)) platform = 'tiktok'
  else if (/twitter\.com|x\.com/i.test(url)) platform = 'twitter'
  else if (/linkedin\.com/i.test(url)) platform = 'linkedin'
  else if (/youtube\.com|youtu\.be/i.test(url)) platform = 'youtube'
  
  // Extraer información básica de la URL
  const urlInfo = extractSocialUrlInfo(url, platform)
  
  return {
    url: url,
    platform: platform,
    ...urlInfo,
    content: generateSocialMediaGuidance(platform, urlInfo),
    isLimited: true,
    requiresManualInput: true
  }
}

/**
 * Extraer información de la URL de red social
 */
function extractSocialUrlInfo(url, platform) {
  const info = {}
  
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)
    
    switch (platform) {
      case 'facebook':
        info.type = pathParts[0] // 'profile', 'page', 'groups', etc.
        info.username = pathParts[1] || null
        break
        
      case 'instagram':
        if (pathParts[0] === 'p') {
          info.type = 'post'
          info.postId = pathParts[1]
        } else if (pathParts[0] === 'reel') {
          info.type = 'reel'
          info.reelId = pathParts[1]
        } else {
          info.type = 'profile'
          info.username = pathParts[0]
        }
        break
        
      case 'tiktok':
        if (pathParts[0] && pathParts[0].startsWith('@')) {
          info.type = 'profile'
          info.username = pathParts[0]
          if (pathParts[1] === 'video') {
            info.type = 'video'
            info.videoId = pathParts[2]
          }
        }
        break
        
      case 'twitter':
        info.type = 'profile'
        info.username = pathParts[0]
        if (pathParts[1] === 'status') {
          info.type = 'tweet'
          info.tweetId = pathParts[2]
        }
        break
        
      case 'linkedin':
        if (pathParts[0] === 'in') {
          info.type = 'profile'
          info.username = pathParts[1]
        } else if (pathParts[0] === 'company') {
          info.type = 'company'
          info.companyName = pathParts[1]
        }
        break
        
      case 'youtube':
        if (pathParts[0] === 'watch') {
          info.type = 'video'
          info.videoId = urlObj.searchParams.get('v')
        } else if (pathParts[0] === 'channel' || pathParts[0] === 'c' || pathParts[0] === '@') {
          info.type = 'channel'
          info.channelName = pathParts[1] || pathParts[0]
        }
        break
    }
  } catch (e) {
    console.error('Error extrayendo info de URL:', e)
  }
  
  return info
}

/**
 * Generar guía para contenido de redes sociales
 */
function generateSocialMediaGuidance(platform, info) {
  const platformNames = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    youtube: 'YouTube'
  }
  
  const platformName = platformNames[platform] || 'Red Social'
  
  let guidance = `
═══════════════════════════════════════════════════
ANÁLISIS DE ${platformName.toUpperCase()}
═══════════════════════════════════════════════════

⚠️ LIMITACIÓN: El contenido de redes sociales requiere autenticación
y no puede ser extraído automáticamente.

URL: ${info.url || 'N/A'}
Plataforma: ${platformName}
Tipo: ${info.type || 'Desconocido'}
${info.username ? `Usuario: @${info.username}\n` : ''}
${info.postId ? `Post ID: ${info.postId}\n` : ''}
${info.videoId ? `Video ID: ${info.videoId}\n` : ''}

INFORMACIÓN DETECTADA:
`
  
  // Agregar guía específica por plataforma
  switch (platform) {
    case 'instagram':
      guidance += `
Para analizar este contenido de Instagram:
1. Abre el enlace en tu navegador
2. Copia el texto de la publicación
3. Pégalo en el chat con contexto
4. Ejemplo: "Analiza este post de Instagram: [texto copiado]"

Información útil a copiar:
- Descripción del post
- Hashtags
- Comentarios relevantes
- Número de likes/interacciones
`
      break
      
    case 'tiktok':
      guidance += `
Para analizar este contenido de TikTok:
1. Abre el video en tu navegador
2. Copia la descripción y hashtags
3. Describe el contenido del video
4. Pégalo en el chat

Información útil:
- Descripción del video
- Hashtags
- Tema principal
- Mensaje clave
`
      break
      
    case 'facebook':
      guidance += `
Para analizar este contenido de Facebook:
1. Abre el enlace en tu navegador
2. Copia el texto de la publicación
3. Describe imágenes/videos si los hay
4. Pégalo en el chat

Información útil:
- Texto de la publicación
- Tipo de contenido (foto, video, texto)
- Reacciones y comentarios destacados
`
      break
      
    case 'youtube':
      guidance += `
Para analizar este contenido de YouTube:
1. Abre el video en tu navegador
2. Copia el título y descripción
3. Describe el contenido principal
4. Pégalo en el chat

Información útil:
- Título del video
- Descripción
- Puntos clave del contenido
- Transcripción si está disponible
`
      break
      
    default:
      guidance += `
Para analizar este contenido:
1. Abre el enlace en tu navegador
2. Copia el contenido relevante
3. Pégalo en el chat con contexto
`
  }
  
  guidance += `
═══════════════════════════════════════════════════

💡 TIP: Proporciona el contenido manualmente para que pueda
analizarlo y generar una presentación basada en él.
`
  
  return guidance
}
