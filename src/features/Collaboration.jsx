import { useState, useEffect } from 'react'
import '../styles/Collaboration.css'

// Lazy loaded: Solo se carga si hay múltiples usuarios
function Collaboration({ presentationId, currentUser, onUpdate }) {
  const [activeUsers, setActiveUsers] = useState([])
  const [ws, setWs] = useState(null)

  useEffect(() => {
    // Conectar WebSocket solo si hay colaboración activa
    const websocket = new WebSocket(`wss://your-server.com/collab/${presentationId}`)
    
    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'join',
        user: currentUser
      }))
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch(data.type) {
        case 'user_joined':
          setActiveUsers(prev => [...prev, data.user])
          break
        case 'user_left':
          setActiveUsers(prev => prev.filter(u => u.id !== data.user.id))
          break
        case 'slide_update':
          onUpdate(data.slideId, data.content)
          break
        case 'cursor_move':
          // Mostrar cursor de otro usuario
          break
      }
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [presentationId])

  const broadcastChange = (slideId, content) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'slide_update',
        slideId,
        content,
        user: currentUser
      }))
    }
  }

  return (
    <div className="collaboration-panel">
      <div className="active-users">
        <span>👥 Colaboradores ({activeUsers.length})</span>
        <div className="user-avatars">
          {activeUsers.map(user => (
            <div 
              key={user.id} 
              className="user-avatar"
              title={user.name}
              style={{ background: user.color }}
            >
              {user.name[0]}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Collaboration
