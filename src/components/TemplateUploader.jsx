import { useState } from 'react'
import { analyzeTemplate } from '../services/visionService'
import { getCacheStats, clearCache } from '../services/templateCacheService'

function TemplateUploader({ onUpload }) {
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [showCacheInfo, setShowCacheInfo] = useState(false)

  // Tipos de archivo aceptados
  const acceptedTypes = ['.pptx', '.pdf']
  const acceptedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/pdf'
  ]

  const isValidFile = (file) => {
    const fileName = file.name.toLowerCase()
    return acceptedTypes.some(ext => fileName.endsWith(ext)) || 
           acceptedMimeTypes.some(mime => file.type === mime)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file && isValidFile(file)) {
      await processFile(file)
    } else {
      alert('Por favor sube un archivo PowerPoint (.pptx) o PDF (.pdf)')
    }
  }

  const handleFileInput = async (e) => {
    const file = e.target.files[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file, skipCache = false) => {
    console.log('📄 Procesando archivo:', file.name)
    setAnalyzing(true)
    
    // Timeout de 60 segundos
    const timeoutId = setTimeout(() => {
      setAnalyzing(false)
      alert('⏱️ El análisis está tomando demasiado tiempo.\n\nPosibles causas:\n- El backend no está corriendo\n- El archivo es muy grande\n- Hay un error en el servidor\n\nRevisa la consola del navegador (F12) para más detalles.')
    }, 60000)
    
    try {
      console.log('🔍 Analizando plantilla...')
      const analysis = await analyzeTemplate(file, skipCache)
      clearTimeout(timeoutId)
      console.log('✅ Análisis completado:', analysis)
      
      // Verificar que el análisis tenga la estructura correcta
      if (!analysis || !analysis.slides || analysis.slides.length === 0) {
        throw new Error('El análisis no devolvió slides válidos')
      }
      
      onUpload(file, analysis)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('❌ Error al analizar:', error)
      
      let errorMsg = error.message
      if (error.message.includes('fetch')) {
        errorMsg = 'No se pudo conectar al backend. Verifica que esté corriendo en http://localhost:8000'
      }
      
      alert(`Error al analizar el archivo: ${errorMsg}\n\nIntenta de nuevo o verifica que el backend esté corriendo.`)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleClearCache = () => {
    if (confirm('¿Limpiar cache de templates? Esto forzará re-análisis de todos los templates.')) {
      clearCache()
      setShowCacheInfo(false)
    }
  }

  const cacheStats = getCacheStats()

  if (analyzing) {
    return (
      <div className="upload-zone analyzing">
        <div className="spinner"></div>
        <h3>Analizando tu plantilla...</h3>
        <p>Detectando estructura y diseño</p>
      </div>
    )
  }

  return (
    <div 
      className={`upload-zone ${dragOver ? 'dragover' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="upload-icon">
        <span className="material-icons">cloud_upload</span>
      </div>
      <h3>Sube tu plantilla</h3>
      <p>Arrastra tu archivo .pptx o .pdf aquí o haz clic para seleccionar</p>
      
      <input 
        type="file" 
        accept=".pptx,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input">
        <button className="upload-btn" onClick={() => document.getElementById('file-input').click()}>
          <span className="material-icons">folder_open</span>
          Seleccionar Archivo
        </button>
      </label>
      
      <div className="supported-formats">
        <span className="format-badge pptx">
          <span className="material-icons">slideshow</span> PPTX
        </span>
        <span className="format-badge pdf">
          <span className="material-icons">picture_as_pdf</span> PDF
        </span>
      </div>
      
      {/* Indicador de cache */}
      {cacheStats.count > 0 && (
        <div className="cache-indicator">
          <button 
            type="button" 
            className="cache-info-btn"
            onClick={() => setShowCacheInfo(!showCacheInfo)}
            title="Templates en cache"
          >
            <span className="material-icons">cached</span>
            <span>{cacheStats.count} en cache</span>
          </button>
          
          {showCacheInfo && (
            <div className="cache-dropdown">
              <div className="cache-header">
                <span>Templates cacheados</span>
                <button type="button" onClick={handleClearCache} title="Limpiar cache">
                  <span className="material-icons">delete</span>
                </button>
              </div>
              <ul className="cache-list">
                {cacheStats.templates.map((t, i) => (
                  <li key={i}>
                    <span className="template-name">{t.name}</span>
                    <span className="template-date">{t.cachedAt}</span>
                  </li>
                ))}
              </ul>
              <p className="cache-hint">
                Los templates cacheados se cargan más rápido
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TemplateUploader
