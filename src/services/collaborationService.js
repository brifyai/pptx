const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
const WS_URL = BACKEND_URL.replace('http', 'ws')

class CollaborationService {
  constructor() {
    this.ws = null
    this.presentationId = null
    this.user = null
    this.listeners = {}
  }

  // Crear presentación compartida
  async createSharedPresentation(owner, title, templateData, slidesData, extractedAssets) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/presentations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          title,
          templateData,
          slidesData,
          extractedAssets,
          permissions: {
            view: ['anyone'],
            edit: [owner]
          }
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear presentación compartida')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating shared presentation:', error)
      throw error
    }
  }

  // Obtener presentación compartida
  async getSharedPresentation(presentationId) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/presentations/${presentationId}`)

      if (!response.ok) {
        throw new Error('Presentación no encontrada')
      }

      const data = await response.json()
      return data.presentation
    } catch (error) {
      console.error('Error getting shared presentation:', error)
      throw error
    }
  }

  // Actualizar presentación
  async updateSharedPresentation(presentationId, user, slidesData) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/presentations/${presentationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          slidesData
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar presentación')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating shared presentation:', error)
      throw error
    }
  }

  // Conectar WebSocket para colaboración en tiempo real
  connect(presentationId, user) {
    if (this.ws) {
      this.disconnect()
    }

    this.presentationId = presentationId
    this.user = user

    this.ws = new WebSocket(`${WS_URL}/ws/${presentationId}`)

    this.ws.onopen = () => {
      console.log('✅ WebSocket conectado')
      this.send({
        type: 'user_joined',
        user: this.user
      })
      this.emit('connected')
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('📨 Mensaje recibido:', data)
      this.emit(data.type, data)
    }

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      this.emit('error', error)
    }

    this.ws.onclose = () => {
      console.log('❌ WebSocket desconectado')
      this.emit('disconnected')
    }
  }

  // Desconectar WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  // Enviar mensaje por WebSocket
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  // Actualizar slide en tiempo real
  updateSlide(slideIndex, slideData) {
    this.send({
      type: 'slide_update',
      user: this.user,
      slideIndex,
      slideData
    })
  }

  // Mover cursor (para mostrar a otros usuarios)
  moveCursor(position) {
    this.send({
      type: 'cursor_move',
      user: this.user,
      position
    })
  }

  // Sistema de eventos
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  // Actualizar permisos
  async updatePermissions(presentationId, user, permissions) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/presentations/${presentationId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          permissions
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar permisos')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating permissions:', error)
      throw error
    }
  }
}

export default new CollaborationService()
