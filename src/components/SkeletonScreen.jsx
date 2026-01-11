import '../styles/SkeletonScreen.css'

/**
 * Componente de Skeleton Screen para estados de carga
 * Mejora la percepción de velocidad mostrando placeholders
 */

// Skeleton básico
export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  )
}

// Skeleton para thumbnail de slide
export function SlideThumbnailSkeleton() {
  return (
    <div className="thumbnail-skeleton">
      <Skeleton width="100%" height="120px" borderRadius="8px" />
      <Skeleton width="80%" height="14px" style={{ marginTop: '8px' }} />
    </div>
  )
}

// Skeleton para slide viewer
export function SlideViewerSkeleton() {
  return (
    <div className="slide-viewer-skeleton">
      <div className="thumbnails-skeleton">
        {[...Array(5)].map((_, i) => (
          <SlideThumbnailSkeleton key={i} />
        ))}
      </div>
      <div className="main-slide-skeleton">
        <Skeleton width="100%" height="100%" borderRadius="12px" />
      </div>
      <div className="chat-skeleton">
        <Skeleton width="100%" height="40px" style={{ marginBottom: '16px' }} />
        <Skeleton width="90%" height="60px" style={{ marginBottom: '12px' }} />
        <Skeleton width="85%" height="60px" style={{ marginBottom: '12px' }} />
        <Skeleton width="95%" height="60px" />
      </div>
    </div>
  )
}

// Skeleton para chat message
export function ChatMessageSkeleton() {
  return (
    <div className="chat-message-skeleton">
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div className="message-content-skeleton">
        <Skeleton width="30%" height="14px" style={{ marginBottom: '8px' }} />
        <Skeleton width="100%" height="16px" style={{ marginBottom: '4px' }} />
        <Skeleton width="90%" height="16px" />
      </div>
    </div>
  )
}

// Skeleton para template card
export function TemplateCardSkeleton() {
  return (
    <div className="template-card-skeleton">
      <Skeleton width="100%" height="180px" borderRadius="8px" />
      <Skeleton width="70%" height="18px" style={{ marginTop: '12px' }} />
      <Skeleton width="50%" height="14px" style={{ marginTop: '8px' }} />
    </div>
  )
}

// Skeleton para grid de templates
export function TemplateGridSkeleton({ count = 6 }) {
  return (
    <div className="template-grid-skeleton">
      {[...Array(count)].map((_, i) => (
        <TemplateCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton para modal
export function ModalSkeleton() {
  return (
    <div className="modal-skeleton">
      <Skeleton width="60%" height="28px" style={{ marginBottom: '24px' }} />
      <Skeleton width="100%" height="200px" borderRadius="8px" style={{ marginBottom: '16px' }} />
      <Skeleton width="100%" height="40px" borderRadius="8px" />
    </div>
  )
}

export default Skeleton
