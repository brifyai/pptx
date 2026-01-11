import { useState } from 'react'
import collaborationService from '../services/collaborationService'
import '../styles/ShareModal.css'

function ShareModal({ isOpen, onClose, templateData, slides, extractedAssets, currentUser }) {
  const [sharing, setSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    try {
      const title = templateData?.fileName || 'Presentación sin título'
      
      const result = await collaborationService.createSharedPresentation(
        currentUser,
        title,
        templateData,
        slides,
        extractedAssets
      )

      const fullUrl = `${window.location.origin}${result.shareUrl}`
      setShareUrl(fullUrl)
    } catch (error) {
      alert('Error al compartir: ' + error.message)
    } finally {
      setSharing(false)
    }
  }

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h3>
            <span className="material-icons">share</span>
            Compartir Presentación
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="share-content">
          {!shareUrl ? (
            <>
              <div className="share-info">
                <span className="material-icons">info</span>
                <p>
                  Genera un link para compartir esta presentación.
                  Otros usuarios podrán verla y editarla en tiempo real.
                </p>
              </div>

              <div className="share-features">
                <div className="feature-item">
                  <span className="material-icons">visibility</span>
                  <div>
                    <strong>Vista compartida</strong>
                    <p>Cualquiera con el link puede ver</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="material-icons">edit</span>
                  <div>
                    <strong>Edición colaborativa</strong>
                    <p>Edita en tiempo real con otros</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="material-icons">sync</span>
                  <div>
                    <strong>Sincronización automática</strong>
                    <p>Los cambios se guardan al instante</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-share"
                onClick={handleShare}
                disabled={sharing}
              >
                <span className="material-icons">
                  {sharing ? 'hourglass_empty' : 'link'}
                </span>
                {sharing ? 'Generando link...' : 'Generar Link de Compartir'}
              </button>
            </>
          ) : (
            <>
              <div className="share-success">
                <div className="success-icon">
                  <span className="material-icons">check_circle</span>
                </div>
                <h4>¡Link generado!</h4>
                <p>Comparte este link con otros usuarios</p>
              </div>

              <div className="share-link-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-link-input"
                />
                <button
                  type="button"
                  className="btn-copy"
                  onClick={handleCopy}
                >
                  <span className="material-icons">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <div className="share-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShareUrl(null)
                    setCopied(false)
                  }}
                >
                  Generar nuevo link
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareModal
