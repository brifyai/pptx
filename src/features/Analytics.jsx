import { useState, useEffect } from 'react'
import '../styles/Analytics.css'

// Lazy loaded: Se carga en background, no bloquea la UI
function Analytics({ slides, onInsight }) {
  const [metrics, setMetrics] = useState({
    timePerSlide: {},
    editCount: {},
    readabilityScore: {},
    engagement: 0
  })

  useEffect(() => {
    // Tracking de tiempo por diapositiva
    const startTime = Date.now()
    
    return () => {
      const duration = Date.now() - startTime
      setMetrics(prev => ({
        ...prev,
        timePerSlide: {
          ...prev.timePerSlide,
          [slides.length]: duration
        }
      }))
    }
  }, [slides])

  const analyzeReadability = (text) => {
    // Análisis simple de legibilidad
    const words = text.split(' ').length
    const sentences = text.split(/[.!?]/).length
    const avgWordsPerSentence = words / sentences
    
    if (avgWordsPerSentence > 20) return 'Difícil'
    if (avgWordsPerSentence > 15) return 'Moderado'
    return 'Fácil'
  }

  const generateInsights = () => {
    const insights = []
    
    // Detectar diapositivas con mucho texto
    slides.forEach((slide, index) => {
      if (slide.content.bullets && slide.content.bullets.length > 5) {
        insights.push({
          type: 'warning',
          slide: index + 1,
          message: 'Demasiados puntos. Considera dividir en 2 diapositivas.'
        })
      }
    })

    // Detectar falta de variedad
    const types = slides.map(s => s.type)
    if (types.every(t => t === 'content')) {
      insights.push({
        type: 'suggestion',
        message: 'Agrega variedad: incluye diapositivas de título o cierre.'
      })
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <div className="analytics-panel">
      <h4>
        <span className="material-icons">analytics</span>
        Analytics
      </h4>
      
      <div className="metric">
        <span>Total de diapositivas:</span>
        <strong>{slides.length}</strong>
      </div>

      <div className="metric">
        <span>Tiempo estimado de presentación:</span>
        <strong>{slides.length * 2} min</strong>
      </div>

      {insights.length > 0 && (
        <div className="insights">
          <h5>
            <span className="material-icons">lightbulb</span>
            Sugerencias
          </h5>
          {insights.map((insight, index) => (
            <div key={index} className={`insight ${insight.type}`}>
              {insight.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Analytics
