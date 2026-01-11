import { useState } from 'react'

function PromptInput({ analysis, onSubmit }) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt)
    }
  }

  const examples = [
    "Estrategia de marketing digital para una cafetería orgánica",
    "Plan de ventas Q1 2026 para software B2B",
    "Presentación de producto innovador para inversores"
  ]

  return (
    <div className="prompt-section">
      <h3>Describe el contenido que necesitas</h3>
      <p style={{ marginBottom: '15px', color: '#666' }}>
        La IA generará contenido específico para cada diapositiva de tu plantilla
      </p>

      <textarea
        className="prompt-input"
        placeholder="Ejemplo: Necesito una presentación sobre estrategia de marketing digital para una startup de tecnología educativa. Incluye análisis de mercado, propuesta de valor, canales digitales y métricas clave..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
          💡 Ejemplos:
        </p>
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setPrompt(example)}
            style={{
              background: '#f0f0f0',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '15px',
              margin: '5px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {example}
          </button>
        ))}
      </div>

      <button 
        className="generate-btn"
        onClick={handleSubmit}
        disabled={!prompt.trim()}
      >
        Generar Presentación 🚀
      </button>
    </div>
  )
}

export default PromptInput
