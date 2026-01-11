import { useState, useEffect } from 'react'
import { suggestContentImprovements } from '../services/aiService'
import '../styles/ContentSuggestions.css'

function ContentSuggestions({ slide, onApplySuggestion, onClose }) {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set())

  useEffect(() => {
    analyzContent()
  }, [slide])

  const analyzContent = async () => {
    setLoading(true)
    try {
      const result = await suggestContentImprovements(slide.content)
      setSuggestions(result)
    } catch (error) {
      console.error('Error analyzing content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyGrammarFix = (issue) => {
    const newContent = { ...slide.content }
    
    // Buscar y reemplazar en todos los campos
    Object.keys(newContent).forEach(key => {
      if (typeof newContent[key] === 'string') {
        newContent[key] = newContent[key].replace(issue.original, issue.suggestion)
      } else if (Array.isArray(newContent[key])) {
        newContent[key] = newContent[key].map(item => 
          typeof item === 'string' ? item.replace(issue.original, issue.suggestion) : item
        )
      }
    })
    
    onApplySuggestion(newContent)
    setAppliedSuggestions(prev => new Set([...prev, issue.original]))
  }

  const handleApplyTitle = (newTitle) => {
    const newContent = { ...slide.content }
    if (slide.type === 'title') {
      newContent.title = newTitle
    } else {
      newContent.heading = newTitle
    }
    onApplySuggestion(newContent)
  }

  const handleApplyBullet = (improvement) => {
    const newContent = { ...slide.content }
    if (newContent.bullets) {
      newContent.bullets = newContent.bullets.map(b => 
        b === improvement.original ? improvement.improved : b
      )
      onApplySuggestion(newContent)
      setAppliedSuggestions(prev => new Set([...prev, improvement.original]))
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return '#00b894'
    if (score >= 6) return '#feca57'
    return '#ff6b6b'
  }

  return (
    <div className="suggestions-overlay">
      <div className="suggestions-modal">
        <div className="suggestions-header">
          <h3>
            <span className="material-icons">lightbulb</span>
            Sugerencias de Mejora
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <p>Analizando contenido...</p>
          </div>
        ) : suggestions ? (
          <div className="suggestions-content">
            {/* Score */}
            <div className="score-section">
              <div 
                className="score-circle"
                style={{ borderColor: getScoreColor(suggestions.overallScore) }}
              >
                <span className="score-value">{suggestions.overallScore}</span>
                <span className="score-label">/10</span>
              </div>
              <p className="score-summary">{suggestions.summary}</p>
            </div>

            {/* Grammar Issues */}
            {suggestions.grammarIssues?.length > 0 && (
              <div className="suggestion-section">
                <h4>
                  <span className="material-icons">spellcheck</span>
                  Correcciones Gramaticales
                </h4>
                <div className="suggestion-list">
                  {suggestions.grammarIssues.map((issue, idx) => (
                    <div 
                      key={idx} 
                      className={`suggestion-item ${appliedSuggestions.has(issue.original) ? 'applied' : ''}`}
                    >
                      <div className="issue-content">
                        <p className="original">
                          <span className="label">Original:</span> 
                          <span className="strikethrough">{issue.original}</span>
                        </p>
                        <p className="suggestion">
                          <span className="label">Sugerencia:</span> 
                          <span className="highlight">{issue.suggestion}</span>
                        </p>
                        {issue.reason && <p className="reason">{issue.reason}</p>}
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleApplyGrammarFix(issue)}
                        disabled={appliedSuggestions.has(issue.original)}
                      >
                        {appliedSuggestions.has(issue.original) ? (
                          <span className="material-icons">check</span>
                        ) : (
                          <span className="material-icons">auto_fix_high</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title Suggestions */}
            {suggestions.titleSuggestions?.length > 0 && (
              <div className="suggestion-section">
                <h4>
                  <span className="material-icons">title</span>
                  Títulos Alternativos
                </h4>
                <div className="title-suggestions">
                  {suggestions.titleSuggestions.map((title, idx) => (
                    <div key={idx} className="title-option">
                      <p>{title}</p>
                      <button type="button" onClick={() => handleApplyTitle(title)}>
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Improvements */}
            {suggestions.bulletImprovements?.length > 0 && (
              <div className="suggestion-section">
                <h4>
                  <span className="material-icons">format_list_bulleted</span>
                  Mejoras en Bullets
                </h4>
                <div className="suggestion-list">
                  {suggestions.bulletImprovements.map((improvement, idx) => (
                    <div 
                      key={idx} 
                      className={`suggestion-item ${appliedSuggestions.has(improvement.original) ? 'applied' : ''}`}
                    >
                      <div className="issue-content">
                        <p className="original">
                          <span className="label">Original:</span> {improvement.original}
                        </p>
                        <p className="suggestion">
                          <span className="label">Mejorado:</span> 
                          <span className="highlight">{improvement.improved}</span>
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleApplyBullet(improvement)}
                        disabled={appliedSuggestions.has(improvement.original)}
                      >
                        {appliedSuggestions.has(improvement.original) ? (
                          <span className="material-icons">check</span>
                        ) : (
                          <span className="material-icons">auto_fix_high</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Tips */}
            {suggestions.generalTips?.length > 0 && (
              <div className="suggestion-section tips-section">
                <h4>
                  <span className="material-icons">tips_and_updates</span>
                  Consejos Generales
                </h4>
                <ul className="tips-list">
                  {suggestions.generalTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <button type="button" className="refresh-btn" onClick={analyzContent}>
              <span className="material-icons">refresh</span>
              Analizar de nuevo
            </button>
          </div>
        ) : (
          <div className="error-section">
            <span className="material-icons">error</span>
            <p>No se pudieron obtener sugerencias</p>
            <button type="button" onClick={analyzContent}>Reintentar</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentSuggestions
