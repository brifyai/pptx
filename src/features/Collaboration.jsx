import { useState, useEffect, useCallback } from 'react'
import collaborationService from '../services/collaborationService'
import '../styles/Collaboration.css'

// Colores para usuarios
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
]

function getRandomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
}

function Collaboration({ 
  presentationId, 
  currentUser, 
  slides,
  onSlideUpdate,
  onUserJoined,
  onUserLeft,
  isOpen,
  onClose 
}) {
  const [activeUsers, setActiveUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [cursors, setCursors] = useState({})
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)

  // Conectar al WebSocket
  useEffect(() => {
    if (!presentationId || !currentUser) return

    const userWithColor = {
      ...currentUser,
      id: currentUser.id || currentUser.uid || Date.now().toString(),
      name: currentUser.name || currentUser.displayName || 'Usuario',
      color: currentUser.color || getRandomColor()
    }

    // Configurar listeners
    collaborationService.on('connected', () => {
      setIsConnected(true)
      setConnectionError(null)
      console.log('✅ Colaboración conectada')
    })

    collaborationService.on('disconnected', () => {
      setIsConnected(false)
      console.log('❌ Colaboración desconectada')
    })

    collaborationService.on('error', (error) => {
      setConnectionError('Error de conexión')
      console.error('Error de colaboración:', error)
    })

    collaborationService.on('user_joined', (data) => {
      setActiveUsers(prev => {
        if (prev.find(u => u.id === data.user?.id)) return prev
        const newUser = {
          id: data.user?.id || Date.now().toString(),
          name: data.user?.name || data.user || 'Usuario',
          color: data.user?.color || getRandomColor()
        }
        return [...prev, newUser]
      })
      onUserJoined?.(data.user)
    })

    collaborationService.on('user_left', (data) => {
      setActiveUsers(prev => prev.filter(u => u.name !== data.user))
      setCursors(prev => {
        const newCursors = { ...prev }
        delete newCursors[data.user]
        return newCursors
      })
      onUserLeft?.(data.user)
    })

    collaborationService.on('slide_updated', (data) => {
      if (data.user !== userWithColor.name) {
        onSlideUpdate?.(data.slideIndex, data.slideData)
      }
    })

    collaborationService.on('cursor_moved', (data) => {
      if (data.user !== userWithColor.name) {
        setCursors(prev => ({
          ...prev,
          [data.user]: {
            ...data.position,
            color: data.color || getRandomColor()
          }
        }))
      }
    })

    collaborationService.on('chat_message', (data) => {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: data.user,
        message: data.message,
        timestamp: new Date()
      }])
    })

    // Conectar
    collaborationService.connect(presentationId, userWithColor.name)

    // Agregar usuario actual a la lista
    setActiveUsers([userWithColor])

    return () => {
      collaborationService.disconnect()
      collaborationService.off('connected')
      collaborationService.off('disconnected')
      collaborationService.off('error')
      collaborationService.off('user_joined')
      collaborationService.off('user_left')
      collaborationService.off('slide_updated')
      collaborationService.off('cursor_moved')
      collaborationService.off('chat_message')
    }
  }, [presentationId, currentUser])

  // Enviar actualización de slide
  const broadcastSlideUpdate = useCallback((slideIndex, slideData) => {
    collaborationService.updateSlide(slideIndex, slideData)
  }, [])

  // Enviar posición del cursor
  const broadcastCursorMove = useCallback((position) => {
    collaborationService.moveCursor(position)
  }, [])

  // Enviar mensaje de chat
  const sendChatMessage = () => {
    if (!newMessage.trim()) return

    collaborationService.send({
      type: 'chat_message',
      user: currentUser?.name || 'Usuario',
      message: newMessage
    })

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      user: currentUser?.name || 'Tú',
      message: newMessage,
      timestamp: new Date(),
      isOwn: true
    }])

    setNewMessage('')
  }

  if (!isOpen) return null

  return (
    <div className="collaboration-overlay" onClick={onClose}>
      <div className="collaboration-panel" onClick={e => e.stopPropagation()}>
        <div className="collab-header">
          <h3>
            <span className="material-icons">groups</span>
            Colaboración en Tiempo Real
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Estado de conexión */}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span>{isConnected ? 'Conectado' : connectionError || 'Desconectado'}</span>
        </div>

        {/* Usuarios activos */}
        <div className="active-users-section">
          <h4>
            <span className="material-icons">person</span>
            Usuarios Activos ({activeUsers.length})
          </h4>
          <div className="users-list">
            {activeUsers.map(user => (
              <div key={user.id} className="user-item">
                <div 
                  className="user-avatar"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="user-name">{user.name}</span>
                {user.id === (currentUser?.id || currentUser?.uid) && (
                  <span className="you-badge">Tú</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="chat-section">
          <div className="chat-header" onClick={() => setShowChat(!showChat)}>
            <h4>
              <span className="material-icons">chat</span>
              Chat del Equipo
            </h4>
            <span className="material-icons">
              {showChat ? 'expand_less' : 'expand_more'}
            </span>
          </div>

          {showChat && (
            <>
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <p className="no-messages">No hay mensajes aún</p>
                ) : (
                  chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`chat-message ${msg.isOwn ? 'own' : ''}`}
                    >
                      <span className="msg-user">{msg.isOwn ? 'Tú' : msg.user}</span>
                      <p className="msg-text">{msg.message}</p>
                      <span className="msg-time">
                        {msg.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <button type="button" onClick={sendChatMessage}>
                  <span className="material-icons">send</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Información de la sesión */}
        <div className="session-info">
          <p>
            <span className="material-icons">link</span>
            ID de sesión: <code>{presentationId}</code>
          </p>
          <button 
            type="button" 
            className="copy-link-btn"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/collab/${presentationId}`
              )
            }}
          >
            <span className="material-icons">content_copy</span>
            Copiar enlace
          </button>
        </div>
      </div>
    </div>
  )
}

// Exportar función para broadcast desde fuera del componente
export function useBroadcastSlideUpdate() {
  return (slideIndex, slideData) => {
    collaborationService.updateSlide(slideIndex, slideData)
  }
}

export default Collaboration
