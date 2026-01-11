import { useState, useEffect } from 'react'
import '../styles/FontWarning.css'

/**
 * FontWarning - Muestra advertencias sobre fuentes faltantes y ofrece alternativas
 * 
 * Props:
 * - fontAnalysis: Resultado del análisis de fuentes del backend
 * - onLoadGoogleFonts: Callback cuando el usuario acepta cargar fuentes de Google
 * - onDismiss: Callback para cerrar el aviso
 */
function FontWarning({ fontAnalysis, onLoadGoogleFonts, onDismiss }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loadingFonts, setLoadingFonts] = useState(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  if (!fontAnalysis || fontAnalysis.summary?.missing === 0) {
    return null
  }

  const { missingFonts, availableOnline, googleFontsLink, summary, warnings } = fontAnalysis

  const handleLoadFonts = async () => {
    if (!googleFontsLink || fontsLoaded) return
    
    setLoadingFonts(true)
    
    try {
      // Crear link element para cargar Google Fonts
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = googleFontsLink
      link.onload = () => {
        setFontsLoaded(true)
        setLoadingFonts(false)
        onLoadGoogleFonts?.(availableOnline)
      }
      link.onerror = () => {
        setLoadingFonts(false)
        console.error('Error cargando Google Fonts')
      }
      document.head.appendChild(link)
      
      // También inyectar CSS de mapeo de fuentes
      if (fontAnalysis.googleFontsCSS) {
        const style = document.createElement('style')
        style.textContent = fontAnalysis.googleFontsCSS
        document.head.appendChild(style)
      }
    } catch (error) {
      console.error('Error cargando fuentes:', error)
      setLoadingFonts(false)
    }
  }

  return (
    <div className={`font-warning ${isExpanded ? 'expanded' : ''}`}>
      <div className="font-warning-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="font-warning-icon">
          <span className="material-icons">font_download</span>
        </div>
        <div className="font-warning-summary">
          <strong>Fuentes no disponibles</strong>
          <span>{summary.missing} fuente{summary.missing > 1 ? 's' : ''} no encontrada{summary.missing > 1 ? 's' : ''}</span>
        </div>
        <button 
          className="font-warning-toggle"
          title={isExpanded ? 'Contraer' : 'Expandir'}
        >
          <span className="material-icons">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        <button 
          className="font-warning-close"
          onClick={(e) => { e.stopPropagation(); onDismiss?.() }}
          title="Cerrar"
        >
          <span className="material-icons">close</span>
        </button>
      </div>

      {isExpanded && (
        <div className="font-warning-content">
          {/* Fuentes faltantes */}
          {missingFonts?.length > 0 && (
            <div className="font-section">
              <h4>
                <span className="material-icons">warning</span>
                Fuentes no encontradas
              </h4>
              <ul className="font-list missing">
                {missingFonts.map((font, idx) => {
                  const fontName = typeof font === 'string' ? font : font.name
                  const downloadLinks = typeof font === 'object' ? font.downloadLinks : null
                  const alternative = downloadLinks?.alternative
                  const directDownload = downloadLinks?.directDownload
                  const searchLinks = downloadLinks?.searchLinks
                  
                  return (
                    <li key={idx}>
                      <div className="font-header">
                        <span className="font-name">{fontName}</span>
                        {alternative && (
                          <span className="font-proprietary-badge">Propietaria</span>
                        )}
                      </div>
                      
                      {/* Alternativa gratuita con descarga directa */}
                      {alternative && (
                        <div className="font-alternative">
                          <span className="alternative-label">
                            <span className="material-icons">swap_horiz</span>
                            Alternativa gratuita: <strong>{alternative.name}</strong>
                          </span>
                          <a 
                            href={alternative.downloadUrl} 
                            className="direct-download-btn"
                            title={`Descargar ${alternative.name} (ZIP)`}
                          >
                            <span className="material-icons">download</span>
                            Descargar {alternative.name}
                          </a>
                        </div>
                      )}
                      
                      {/* Descarga directa si existe */}
                      {directDownload && !alternative && (
                        <div className="font-direct-download">
                          <a 
                            href={directDownload.url} 
                            className="direct-download-btn"
                            title={`Descargar ${fontName} (ZIP)`}
                          >
                            <span className="material-icons">download</span>
                            Descargar de {directDownload.site}
                          </a>
                        </div>
                      )}
                      
                      {/* Links de búsqueda si no hay descarga directa ni alternativa */}
                      {!alternative && !directDownload && searchLinks && (
                        <div className="font-download-buttons">
                          <span className="search-label">Buscar en:</span>
                          <a href={searchLinks.googleFonts} target="_blank" rel="noopener noreferrer" className="download-btn google">Google</a>
                          <a href={searchLinks.dafont} target="_blank" rel="noopener noreferrer" className="download-btn dafont">DaFont</a>
                          <a href={searchLinks.fontSquirrel} target="_blank" rel="noopener noreferrer" className="download-btn fontsquirrel">FontSquirrel</a>
                          <a href={searchLinks['1001fonts']} target="_blank" rel="noopener noreferrer" className="download-btn fonts1001">1001Fonts</a>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <p className="font-note">
                <span className="material-icons">info</span>
                Descarga la fuente, descomprime el ZIP e instálala en tu sistema. Luego recarga la página.
              </p>
            </div>
          )}

          {/* Fuentes con alternativas en Google Fonts */}
          {availableOnline?.length > 0 && (
            <div className="font-section">
              <h4>
                <span className="material-icons">cloud_download</span>
                Alternativas disponibles en Google Fonts
              </h4>
              <ul className="font-list available">
                {availableOnline.map((font, idx) => (
                  <li key={idx}>
                    <span className="font-original">{font.original}</span>
                    <span className="font-arrow">→</span>
                    <span className="font-google">{font.googleFont}</span>
                    <a 
                      href={font.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-download-link"
                      title="Ver en Google Fonts"
                    >
                      <span className="material-icons">open_in_new</span>
                    </a>
                  </li>
                ))}
              </ul>
              
              {!fontsLoaded && (
                <button 
                  className="load-fonts-btn"
                  onClick={handleLoadFonts}
                  disabled={loadingFonts}
                >
                  {loadingFonts ? (
                    <>
                      <span className="material-icons spinning">sync</span>
                      Cargando fuentes...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">cloud_download</span>
                      Cargar fuentes de Google
                    </>
                  )}
                </button>
              )}
              
              {fontsLoaded && (
                <div className="fonts-loaded-message">
                  <span className="material-icons">check_circle</span>
                  Fuentes cargadas correctamente
                </div>
              )}
            </div>
          )}

          {/* Resumen */}
          <div className="font-summary">
            <div className="summary-item">
              <span className="material-icons">text_fields</span>
              <span>{summary.total} fuentes detectadas</span>
            </div>
            <div className="summary-item">
              <span className="material-icons">check</span>
              <span>{summary.system} del sistema</span>
            </div>
            <div className="summary-item">
              <span className="material-icons">cloud</span>
              <span>{summary.online} disponibles online</span>
            </div>
            <div className="summary-item warning">
              <span className="material-icons">warning</span>
              <span>{summary.missing} no disponibles</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FontWarning
