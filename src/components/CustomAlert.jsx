import { useState, useEffect, useRef, createContext, useContext } from 'react'
import '../styles/CustomAlert.css'

// Context para las alertas
const AlertContext = createContext(null)

// Hook para usar alertas
export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert debe usarse dentro de AlertProvider')
  }
  return context
}

// Provider de alertas
export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])
  const [confirmDialog, setConfirmDialog] = useState(null)

  const addAlert = (alert) => {
    const id = Date.now()
    setAlerts(prev => [...prev, { ...alert, id }])
    
    // Auto-cerrar después de 3 segundos para toasts
    if (alert.type === 'toast') {
      setTimeout(() => {
        removeAlert(id)
      }, 3000)
    }
  }

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  // Funciones de alerta
  const showSuccess = (title, message) => {
    addAlert({ type: 'toast', icon: 'success', title, message })
  }

  const showError = (title, message) => {
    addAlert({ type: 'toast', icon: 'error', title, message })
  }

  const showWarning = (title, message) => {
    addAlert({ type: 'modal', icon: 'warning', title, message })
  }

  const showInfo = (title, message) => {
    addAlert({ type: 'modal', icon: 'info', title, message })
  }

  const showToast = (message, icon = 'success') => {
    addAlert({ type: 'toast', icon, title: message })
  }

  const showConfirm = (title, message, onConfirm, onCancel) => {
    setConfirmDialog({ title, message, onConfirm, onCancel })
  }

  const showDeleteConfirm = (itemName, onConfirm) => {
    setConfirmDialog({
      title: '¿Estás seguro?',
      message: `Se eliminará "${itemName}". Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      confirmColor: 'danger',
      onConfirm,
      onCancel: () => setConfirmDialog(null)
    })
  }

  const handleConfirm = () => {
    if (confirmDialog?.onConfirm) {
      confirmDialog.onConfirm()
    }
    setConfirmDialog(null)
  }

  const handleCancel = () => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel()
    }
    setConfirmDialog(null)
  }

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    showConfirm,
    showDeleteConfirm
  }

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {alerts.filter(a => a.type === 'toast').map(alert => (
          <Toast key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>

      {/* Modal Alerts */}
      {alerts.filter(a => a.type === 'modal').map(alert => (
        <AlertModal key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
      ))}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          {...confirmDialog}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </AlertContext.Provider>
  )
}

// Componente Toast
function Toast({ alert, onClose }) {
  const [isExiting, setIsExiting] = useState(false)
  const timerRef = useRef(null)

  const handleClose = () => {
    if (isExiting) return // Prevenir doble cierre
    setIsExiting(true)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setTimeout(onClose, 200)
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      handleClose()
    }, 3000)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }

  return (
    <div className={`toast ${alert.icon} ${isExiting ? 'exit' : ''}`}>
      <span className="material-icons toast-icon">{icons[alert.icon]}</span>
      <div className="toast-content">
        <span className="toast-title">{alert.title}</span>
        {alert.message && <span className="toast-message">{alert.message}</span>}
      </div>
      <button type="button" className="toast-close" onClick={handleClose}>
        <span className="material-icons">close</span>
      </button>
      <div className="toast-progress" />
    </div>
  )
}

// Componente Modal Alert
function AlertModal({ alert, onClose }) {
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  }

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={e => e.stopPropagation()}>
        <div className={`alert-icon ${alert.icon}`}>
          <span className="material-icons">{icons[alert.icon]}</span>
        </div>
        <h3 className="alert-title">{alert.title}</h3>
        {alert.message && <p className="alert-message">{alert.message}</p>}
        <button type="button" className="alert-btn primary" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  )
}

// Componente Confirm Dialog
function ConfirmDialog({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', confirmColor = 'primary', onConfirm, onCancel }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div className="alert-overlay" onClick={onCancel}>
      <div className="alert-modal confirm" onClick={e => e.stopPropagation()}>
        <div className="alert-icon warning">
          <span className="material-icons">help_outline</span>
        </div>
        <h3 className="alert-title">{title}</h3>
        <p className="alert-message">{message}</p>
        <div className="alert-actions">
          <button type="button" className="alert-btn secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className={`alert-btn ${confirmColor}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertProvider
