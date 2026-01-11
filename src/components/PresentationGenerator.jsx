import { useState, useEffect } from 'react'
import { generateContent } from '../services/aiService'
import { exportPresentation } from '../services/exportService'

function PresentationGenerator({ template, analysis, prompt, onComplete }) {
  const [status, setStatus] = useState('generating')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const generate = async () => {
      try {
        setStatus('generating')
        setProgress(20)

        // Generar contenido con IA
        const content = await generateContent(prompt, analysis)
        setProgress(60)

        // Exportar a PowerPoint
        const url = await exportPresentation(template, analysis, content)
        setProgress(100)
        
        setDownloadUrl(url)
        setStatus('complete')
        onComplete(content)
      } catch (err) {
        setError(err.message)
        setStatus('error')
      }
    }

    generate()
  }, [])

  if (status === 'generating') {
    return (
      <div className="generation-status">
        <div className="spinner"></div>
        <h3>Generando tu presentación...</h3>
        <div style={{ 
          width: '100%', 
          height: '10px', 
          background: '#f0f0f0', 
          borderRadius: '5px',
          margin: '20px 0',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'width 0.3s'
          }}></div>
        </div>
        <p>{progress}% completado</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="error-message">
        <h3>Error al generar</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="generation-status">
      <div className="success-message">
        <h3>✅ ¡Presentación lista!</h3>
        <p>Tu presentación ha sido generada exitosamente manteniendo tu diseño original</p>
      </div>

      <button 
        className="download-btn"
        onClick={() => {
          const a = document.createElement('a')
          a.href = downloadUrl
          a.download = 'presentacion-generada.pptx'
          a.click()
        }}
      >
        📥 Descargar Presentación
      </button>

      <div style={{ marginTop: '30px', textAlign: 'left' }}>
        <h4>Próximos pasos:</h4>
        <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
          <li>Abre el archivo en PowerPoint o Google Slides</li>
          <li>Revisa y ajusta el contenido según necesites</li>
          <li>El diseño y formato original se mantienen intactos</li>
        </ul>
      </div>
    </div>
  )
}

export default PresentationGenerator
