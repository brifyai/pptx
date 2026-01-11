import { useState, useEffect, useMemo } from 'react'
import '../styles/Analytics.css'

// Servicio de analytics local
const analyticsStorage = {
  getStats: () => {
    try {
      return JSON.parse(localStorage.getItem('presentation_analytics') || '{}')
    } catch {
      return {}
    }
  },
  saveStats: (stats) => {
    localStorage.setItem('presentation_analytics', JSON.stringify(stats))
  },
  trackEvent: (event, data) => {
    const stats = analyticsStorage.getStats()
    if (!stats.events) stats.events = []
    stats.events.push({
      event,
      data,
      timestamp: Date.now()
    })
    // Mantener solo últimos 100 eventos
    if (stats.events.length > 100) {
      stats.events = stats.events.slice(-100)
    }
    analyticsStorage.saveStats(stats)
  }
}

function Analytics({ slides, currentSlide, isOpen, onClose, templateData }) {
  const [sessionStats, setSessionStats] = useState({
    startTime: Date.now(),
    slideViews: {},
    edits: 0,
    aiInteractions: 0
  })
  const [historicalStats, setHistoricalStats] = useState({})

  // Cargar estadísticas históricas
  useEffect(() => {
    const stats = analyticsStorage.getStats()
    setHistoricalStats(stats)
  }, [])

  // Trackear vista de slide
  useEffect(() => {
    if (currentSlide !== undefined) {
      setSessionStats(prev => ({
        ...prev,
        slideViews: {
          ...prev.slideViews,
          [currentSlide]: (prev.slideViews[currentSlide] || 0) + 1
        }
      }))
    }
  }, [currentSlide])

  // Calcular métricas de contenido
  const contentMetrics = useMemo(() => {
    if (!slides || slides.length === 0) return null

    let totalWords = 0
    let totalBullets = 0
    let slidesWithTooMuchText = 0
    let slidesWithImages = 0
    let emptySlides = 0

    slides.forEach(slide => {
      const content = slide.content || {}
      
      // Contar palabras
      const text = [
        content.title || '',
        content.subtitle || '',
        content.heading || '',
        ...(content.bullets || [])
      ].join(' ')
      
      const words = text.split(/\s+/).filter(w => w.length > 0).length
      totalWords += words

      // Contar bullets
      if (content.bullets) {
        totalBullets += content.bullets.length
        if (content.bullets.length > 5) {
          slidesWithTooMuchText++
        }
      }

      // Detectar slides vacíos
      if (words < 5) {
        emptySlides++
      }

      // Detectar imágenes
      if (slide.preview || content.image) {
        slidesWithImages++
      }
    })

    const avgWordsPerSlide = Math.round(totalWords / slides.length)
    const avgBulletsPerSlide = slides.length > 0 
      ? (totalBullets / slides.filter(s => s.content?.bullets).length).toFixed(1)
      : 0

    return {
      totalSlides: slides.length,
      totalWords,
      totalBullets,
      avgWordsPerSlide,
      avgBulletsPerSlide,
      slidesWithTooMuchText,
      slidesWithImages,
      emptySlides,
      estimatedDuration: Math.ceil(slides.length * 1.5) // 1.5 min por slide
    }
  }, [slides])

  // Calcular score de calidad
  const qualityScore = useMemo(() => {
    if (!contentMetrics) return 0

    let score = 100

    // Penalizar slides con demasiado texto
    score -= contentMetrics.slidesWithTooMuchText * 10

    // Penalizar slides vacíos
    score -= contentMetrics.emptySlides * 15

    // Penalizar si hay muy pocas o muchas palabras por slide
    if (contentMetrics.avgWordsPerSlide < 20) score -= 10
    if (contentMetrics.avgWordsPerSlide > 100) score -= 15

    // Bonus por tener imágenes
    const imageRatio = contentMetrics.slidesWithImages / contentMetrics.totalSlides
    if (imageRatio > 0.5) score += 10

    return Math.max(0, Math.min(100, score))
  }, [contentMetrics])

  // Generar insights
  const insights = useMemo(() => {
    if (!contentMetrics) return []

    const result = []

    // Slides con demasiado texto
    if (contentMetrics.slidesWithTooMuchText > 0) {
      result.push({
        type: 'warning',
        icon: 'warning',
        title: 'Demasiado texto',
        message: `${contentMetrics.slidesWithTooMuchText} slide(s) tienen más de 5 bullets. Considera dividirlos.`
      })
    }

    // Slides vacíos
    if (contentMetrics.emptySlides > 0) {
      result.push({
        type: 'error',
        icon: 'error',
        title: 'Slides vacíos',
        message: `${contentMetrics.emptySlides} slide(s) tienen poco contenido.`
      })
    }

    // Duración
    if (contentMetrics.estimatedDuration > 20) {
      result.push({
        type: 'info',
        icon: 'schedule',
        title: 'Presentación larga',
        message: `Duración estimada: ${contentMetrics.estimatedDuration} min. Considera reducir.`
      })
    }

    // Variedad de tipos
    const types = slides.map(s => s.type)
    const uniqueTypes = new Set(types)
    if (uniqueTypes.size === 1 && slides.length > 3) {
      result.push({
        type: 'suggestion',
        icon: 'lightbulb',
        title: 'Falta variedad',
        message: 'Todos los slides son del mismo tipo. Agrega variedad visual.'
      })
    }

    // Felicitaciones si todo está bien
    if (result.length === 0 && slides.length > 0) {
      result.push({
        type: 'success',
        icon: 'check_circle',
        title: '¡Excelente!',
        message: 'Tu presentación está bien estructurada.'
      })
    }

    return result
  }, [contentMetrics, slides])

  // Datos para gráfico de distribución
  const slideDistribution = useMemo(() => {
    if (!slides) return []

    const distribution = {}
    slides.forEach(slide => {
      const type = slide.type || 'content'
      distribution[type] = (distribution[type] || 0) + 1
    })

    return Object.entries(distribution).map(([type, count]) => ({
      type: type === 'title' ? 'Título' : type === 'content' ? 'Contenido' : type,
      count,
      percentage: Math.round((count / slides.length) * 100)
    }))
  }, [slides])

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  if (!isOpen) return null

  return (
    <div className="analytics-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={e => e.stopPropagation()}>
        <div className="analytics-header">
          <h3>
            <span className="material-icons">analytics</span>
            Analytics de Presentación
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="analytics-content">
          {/* Score de calidad */}
          <div className="quality-score-section">
            <div 
              className="score-circle"
              style={{ 
                '--score-color': getScoreColor(qualityScore),
                '--score-percent': qualityScore 
              }}
            >
              <span className="score-value">{qualityScore}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="score-info">
              <h4>Puntuación de Calidad</h4>
              <p>
                {qualityScore >= 80 ? 'Excelente presentación' :
                 qualityScore >= 60 ? 'Buena, con mejoras posibles' :
                 'Necesita mejoras'}
              </p>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="material-icons">slideshow</span>
              <div className="metric-value">{contentMetrics?.totalSlides || 0}</div>
              <div className="metric-label">Slides</div>
            </div>
            <div className="metric-card">
              <span className="material-icons">text_fields</span>
              <div className="metric-value">{contentMetrics?.totalWords || 0}</div>
              <div className="metric-label">Palabras</div>
            </div>
            <div className="metric-card">
              <span className="material-icons">schedule</span>
              <div className="metric-value">{contentMetrics?.estimatedDuration || 0}</div>
              <div className="metric-label">Min. estimados</div>
            </div>
            <div className="metric-card">
              <span className="material-icons">format_list_bulleted</span>
              <div className="metric-value">{contentMetrics?.avgBulletsPerSlide || 0}</div>
              <div className="metric-label">Bullets/slide</div>
            </div>
          </div>

          {/* Distribución de slides */}
          <div className="distribution-section">
            <h4>Distribución de Slides</h4>
            <div className="distribution-bars">
              {slideDistribution.map(item => (
                <div key={item.type} className="distribution-item">
                  <div className="dist-label">
                    <span>{item.type}</span>
                    <span>{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="dist-bar">
                    <div 
                      className="dist-fill"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="insights-section">
            <h4>
              <span className="material-icons">tips_and_updates</span>
              Insights y Sugerencias
            </h4>
            <div className="insights-list">
              {insights.map((insight, idx) => (
                <div key={idx} className={`insight-card ${insight.type}`}>
                  <span className="material-icons">{insight.icon}</span>
                  <div className="insight-content">
                    <strong>{insight.title}</strong>
                    <p>{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas de sesión */}
          <div className="session-stats">
            <h4>Estadísticas de Sesión</h4>
            <div className="session-grid">
              <div className="session-item">
                <span className="material-icons">visibility</span>
                <span>Slides vistos: {Object.keys(sessionStats.slideViews).length}</span>
              </div>
              <div className="session-item">
                <span className="material-icons">timer</span>
                <span>Tiempo: {Math.round((Date.now() - sessionStats.startTime) / 60000)} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Función para trackear eventos desde fuera
export function trackAnalyticsEvent(event, data) {
  analyticsStorage.trackEvent(event, data)
}

export default Analytics
