# Backend - AI Presentation API

Backend en Python con FastAPI y python-pptx para analizar y generar presentaciones PowerPoint manteniendo el diseño original.

## 🚀 Instalación

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

## 🏃 Ejecutar

```bash
# Iniciar servidor
python main.py

# O con uvicorn directamente
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en `http://localhost:8000`

## 📡 Endpoints

### 1. Analizar Presentación
```bash
POST /api/analyze
Content-Type: multipart/form-data

file: archivo.pptx
```

**Respuesta:**
```json
{
  "success": true,
  "analysis": {
    "fileName": "archivo.pptx",
    "slideSize": { "width": 9144000, "height": 6858000 },
    "slides": [
      {
        "number": 1,
        "type": "title",
        "textAreas": [...],
        "imageAreas": [...],
        "shapes": [...]
      }
    ]
  }
}
```

### 2. Generar Presentación
```bash
POST /api/generate
Content-Type: multipart/form-data

file: archivo.pptx
content: {"slides": [...]}
```

**Respuesta:** Archivo .pptx generado

### 3. Health Check
```bash
GET /health
```

## 🔧 Características

- ✅ Lee diseño original al 100%
- ✅ Mantiene colores exactos
- ✅ Preserva fuentes originales
- ✅ Respeta posiciones precisas
- ✅ Conserva formato de texto
- ✅ Mantiene imágenes de fondo
- ✅ Preserva formas y gráficos

## 📦 Dependencias

- **FastAPI**: Framework web moderno
- **python-pptx**: Manipulación de PowerPoint
- **uvicorn**: Servidor ASGI
- **Pillow**: Procesamiento de imágenes

## 🧪 Testing

```bash
# Probar endpoint de análisis
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@test.pptx"

# Probar health check
curl http://localhost:8000/health
```

## 📝 Notas

- El servidor acepta CORS desde localhost:3006 (React app)
- Los archivos temporales se limpian automáticamente
- Soporta archivos .pptx (no .ppt legacy)
