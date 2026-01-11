/**
 * Servicio de cache para templates analizados
 * DESHABILITADO - localStorage tiene límites muy pequeños para imágenes base64
 * Los templates se analizan cada vez que se cargan
 */

const CACHE_KEY = 'ai_presentation_template_cache'

/**
 * Limpia todo el cache
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
    // Limpiar también otros posibles caches grandes
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('template') || key.includes('cache') || key.includes('presentation'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log('🗑️ All template caches cleared')
  } catch (e) {
    console.warn('Error clearing cache:', e)
  }
}

/**
 * Busca un template en el cache - DESHABILITADO
 * @returns {null} - Siempre retorna null (sin cache)
 */
export async function getCachedAnalysis(file) {
  // Cache deshabilitado - siempre re-analizar
  console.log(`🔄 Cache disabled, will analyze: ${file.name}`)
  return null
}

/**
 * Guarda un análisis en el cache - DESHABILITADO
 * No hace nada para evitar errores de quota
 */
export async function cacheAnalysis(file, analysis) {
  // Cache deshabilitado - no guardar nada
  console.log(`⏭️ Cache disabled, skipping save for: ${file.name}`)
}

/**
 * Obtiene estadísticas del cache
 */
export function getCacheStats() {
  return {
    count: 0,
    maxSize: 0,
    templates: [],
    status: 'disabled'
  }
}

/**
 * Elimina un template específico del cache
 */
export async function removeCachedTemplate(file) {
  console.log(`⏭️ Cache disabled, nothing to remove for: ${file.name}`)
  return false
}

// Limpiar cache existente al cargar el módulo
clearCache()

export default {
  getCachedAnalysis,
  cacheAnalysis,
  clearCache,
  getCacheStats,
  removeCachedTemplate
}
