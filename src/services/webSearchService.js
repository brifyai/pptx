// Servicio de búsqueda web para el chat
// Nota: Este servicio simula búsqueda web. En producción necesitarías una API real.

/**
 * Buscar información en la web
 */
export async function searchWeb(query) {
  try {
    console.log('🔍 Buscando en web:', query)
    
    // Extraer URL si existe en la query
    const urlMatch = query.match(/https?:\/\/[^\s]+|([a-zA-Z0-9-]+\.(com|net|org|io|ai|co)[^\s]*)/i)
    
    if (urlMatch) {
      const url = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`
      return await fetchWebsite(url)
    }
    
    // Si no hay URL, simular búsqueda
    return simulateSearch(query)
    
  } catch (error) {
    console.error('Error en búsqueda web:', error)
    return null
  }
}

/**
 * Obtener contenido de un sitio web
 */
async function fetchWebsite(url) {
  try {
    console.log('🌐 Obteniendo contenido de:', url)
    
    // Usar un proxy CORS para obtener el contenido
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    
    const response = await fetch(proxyUrl)
    const data = await response.json()
    
    if (data.contents) {
      // Limpiar HTML y extraer texto
      const text = cleanHtmlText(data.contents)
      
      return {
        url: url,
        title: extractTitle(data.contents),
        content: text.substring(0, 3000), // Primeros 3000 caracteres
        snippet: text.substring(0, 500)
      }
    }
    
    return null
  } catch (error) {
    console.error('Error obteniendo website:', error)
    return null
  }
}

/**
 * Limpiar texto HTML
 */
function cleanHtmlText(html) {
  // Remover scripts y styles
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Remover tags HTML
  text = text.replace(/<[^>]+>/g, ' ')
  
  // Decodificar entidades HTML
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  
  // Limpiar espacios múltiples
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}

/**
 * Extraer título de HTML
 */
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : 'Sin título'
}

/**
 * Simular búsqueda (fallback)
 */
function simulateSearch(query) {
  console.log('⚠️ Búsqueda web no disponible, usando información general')
  
  return {
    query: query,
    content: `Información general sobre "${query}". Para obtener datos específicos y actualizados, proporciona la URL del sitio web.`,
    snippet: `Búsqueda: ${query}`
  }
}

/**
 * Formatear resultados de búsqueda para la IA
 */
export function formatSearchResults(results) {
  if (!results) return ''
  
  if (results.url) {
    return `
INFORMACIÓN DE ${results.url}:
Título: ${results.title}

Contenido:
${results.content}
`
  }
  
  return `
BÚSQUEDA: ${results.query}
${results.content}
`
}
