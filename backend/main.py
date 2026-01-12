"""
AI Presentation API - Main Application Entry Point

Refactored modular architecture:
- routes/: API endpoints by domain
- services/: Business logic (Gemini Vision, converters)
- schemas/: Pydantic models for validation
- core/: WebSocket manager, shared components
- utils/: Logging, helpers
"""
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers
from routes.analysis import router as analysis_router
from routes.export import router as export_router
from routes.templates import router as templates_router
from routes.collaboration import router as collaboration_router, websocket_collaboration

# Create FastAPI app
app = FastAPI(
    title="AI Presentation API",
    description="Slide AI - Generador de presentaciones con IA",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3006", 
        "http://localhost:3007", 
        "http://localhost:3008", 
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(analysis_router)
app.include_router(export_router)
app.include_router(templates_router)
app.include_router(collaboration_router)


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Presentation API",
        "version": "2.0.0",
        "endpoints": {
            "analyze": "POST /api/analyze - Analiza un PPT y extrae su diseño",
            "generate": "POST /api/generate - Genera PPT con contenido de IA",
            "export_pptx": "POST /api/export/pptx - Exporta a PowerPoint",
            "export_pdf": "POST /api/export/pdf - Exporta a PDF",
            "analyze_template": "POST /api/analyze-template - Análisis con Gemini Vision",
            "templates": "GET /api/templates - Lista templates en caché"
        }
    }


# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Presentation API"}


# WebSocket endpoint (must be registered directly, not via router)
@app.websocket("/ws/{presentation_id}")
async def websocket_endpoint(websocket: WebSocket, presentation_id: str):
    await websocket_collaboration(websocket, presentation_id)


if __name__ == "__main__":
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        limit_concurrency=100,
        timeout_keep_alive=30
    )
