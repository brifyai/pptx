"""
Collaboration routes - Shared presentations and real-time sync.
"""
from fastapi import APIRouter, HTTPException, Body, WebSocket, WebSocketDisconnect
from typing import Dict, Any

from database import PresentationDB
from core.websocket_manager import manager

router = APIRouter(prefix="/api", tags=["collaboration"])
db = PresentationDB()


@router.post("/presentations/create")
async def create_shared_presentation(data: Dict[str, Any] = Body(...)):
    """Crear presentación compartida."""
    try:
        owner = data.get('owner', 'anonymous')
        title = data.get('title', 'Presentación sin título')
        template_data = data.get('templateData', {})
        slides_data = data.get('slidesData', [])
        extracted_assets = data.get('extractedAssets')
        permissions = data.get('permissions')
        
        presentation_id = db.create_presentation(
            owner=owner,
            title=title,
            template_data=template_data,
            slides_data=slides_data,
            extracted_assets=extracted_assets,
            permissions=permissions
        )
        
        return {
            "success": True,
            "presentationId": presentation_id,
            "shareUrl": f"/editor/{presentation_id}"
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al crear presentación: {str(e)}")


@router.get("/presentations/{presentation_id}")
async def get_shared_presentation(presentation_id: str):
    """Obtener presentación compartida."""
    try:
        presentation = db.get_presentation(presentation_id)
        
        if not presentation:
            raise HTTPException(status_code=404, detail="Presentación no encontrada")
        
        return {"success": True, "presentation": presentation}
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener presentación: {str(e)}")


@router.put("/presentations/{presentation_id}")
async def update_shared_presentation(presentation_id: str, data: Dict[str, Any] = Body(...)):
    """Actualizar presentación compartida."""
    try:
        user = data.get('user', 'anonymous')
        slides_data = data.get('slidesData', [])
        
        if not db.check_permission(presentation_id, user, 'edit'):
            raise HTTPException(status_code=403, detail="No tienes permiso para editar")
        
        success = db.update_presentation(presentation_id, slides_data, user)
        
        if not success:
            raise HTTPException(status_code=404, detail="Presentación no encontrada")
        
        await manager.broadcast(presentation_id, {
            "type": "presentation_updated",
            "user": user,
            "slidesData": slides_data
        })
        
        return {"success": True, "message": "Presentación actualizada"}
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al actualizar presentación: {str(e)}")


@router.put("/presentations/{presentation_id}/permissions")
async def update_presentation_permissions(presentation_id: str, data: Dict[str, Any] = Body(...)):
    """Actualizar permisos de presentación."""
    try:
        user = data.get('user', 'anonymous')
        permissions = data.get('permissions', {})
        
        success = db.update_permissions(presentation_id, permissions, user)
        
        if not success:
            raise HTTPException(status_code=403, detail="Solo el propietario puede cambiar permisos")
        
        return {"success": True, "message": "Permisos actualizados"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar permisos: {str(e)}")


# WebSocket endpoint needs to be registered separately in main.py
async def websocket_collaboration(websocket: WebSocket, presentation_id: str):
    """
    WebSocket para colaboración en tiempo real.
    Soporta: slide_update, cursor_move, user_joined, chat_message
    """
    await manager.connect(websocket, presentation_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get('type')
            user = data.get('user', 'anonymous')
            
            if message_type == 'slide_update':
                slide_index = data.get('slideIndex')
                slide_data = data.get('slideData')
                
                db.update_slide(presentation_id, slide_index, slide_data, user)
                
                await manager.broadcast(presentation_id, {
                    "type": "slide_updated",
                    "user": user,
                    "slideIndex": slide_index,
                    "slideData": slide_data
                }, exclude=websocket)
            
            elif message_type == 'cursor_move':
                await manager.broadcast(presentation_id, {
                    "type": "cursor_moved",
                    "user": user,
                    "position": data.get('position'),
                    "color": data.get('color')
                }, exclude=websocket)
            
            elif message_type == 'user_joined':
                await manager.broadcast(presentation_id, {
                    "type": "user_joined",
                    "user": user
                }, exclude=websocket)
            
            elif message_type == 'chat_message':
                await manager.broadcast(presentation_id, {
                    "type": "chat_message",
                    "user": user,
                    "message": data.get('message'),
                    "timestamp": data.get('timestamp')
                }, exclude=websocket)
            
            elif message_type == 'typing':
                await manager.broadcast(presentation_id, {
                    "type": "typing",
                    "user": user
                }, exclude=websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, presentation_id)
        await manager.broadcast(presentation_id, {"type": "user_left", "user": "unknown"})
    except Exception as e:
        print(f"❌ Error en WebSocket: {e}")
        manager.disconnect(websocket, presentation_id)
