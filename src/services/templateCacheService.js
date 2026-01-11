/**
 * Servicio de cache para templates analizados
 * DESHABILITADO - localStorage tiene límites muy pequeños para imágenes base64
 * Los templates se analizan cada vez que se cargan
 */

const CACHE_KEY = 'ai_presentation_template_cache'

/**
 * Limpia todo el cache y localStorage si está muy lleno
 */
export function clearCache() {
  try {
    // Verificar tamaño del localStorage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (totalSize > maxSize) {
      console.warn(`⚠️ localStorage muy lleno (${(totalSize / 1024 / 1024).toFixed(2)}MB), limpiando completamente...`);
      localStorage.clear();
      console.log('✅ localStorage completamente limpiado');
      return;
    }
    
    // Si no está lleno, solo limpiar caches de templates
    localStorage.removeItem(CACHE_KEY)
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('template') || key.includes('cache') || key.includes('presentation'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log('🗑️ Template caches cleared')
  } catch (e) {
    console.warn('Error clearing cache:', e)
    // Si hay error, intentar limpiar todo
    try {
      localStorage.clear();
      console.log('✅ localStorage limpiado por error');
    } catch (e2) {
      console.error('❌ No se pudo limpiar localStorage:', e2);
    }
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
