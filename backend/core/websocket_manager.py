"""
WebSocket connection manager for real-time collaboration.
"""
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """Manages WebSocket connections for real-time collaboration."""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, presentation_id: str):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        if presentation_id not in self.active_connections:
            self.active_connections[presentation_id] = []
        self.active_connections[presentation_id].append(websocket)
        print(f"✅ Cliente conectado a presentación {presentation_id}")
    
    def disconnect(self, websocket: WebSocket, presentation_id: str):
        """Remove a WebSocket connection."""
        if presentation_id in self.active_connections:
            if websocket in self.active_connections[presentation_id]:
                self.active_connections[presentation_id].remove(websocket)
            if not self.active_connections[presentation_id]:
                del self.active_connections[presentation_id]
        print(f"❌ Cliente desconectado de presentación {presentation_id}")
    
    async def broadcast(self, presentation_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast a message to all connections for a presentation."""
        if presentation_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[presentation_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except:
                        disconnected.append(connection)
            
            # Clean up dead connections
            for conn in disconnected:
                self.disconnect(conn, presentation_id)


# Singleton instance
manager = ConnectionManager()
