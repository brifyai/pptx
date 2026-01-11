# 🚀 Guía de Integración End-to-End

## 📋 Resumen del Sistema

**Slide AI** es una aplicación completa para generar presentaciones PowerPoint con IA, manteniendo el diseño original de tus plantillas.

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  - Vite + React 18                                       │
│  - Componentes: SlideViewer, ChatPanel, etc.            │
│  - Servicios: aiService, visionService, exportService   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTP/WebSocket
                 │
┌────────────────▼────────────────────────────────────────┐
│                  BACKEND (Python/FastAPI)                │
│  - Análisis de PPTX (python-pptx)                       │
│  - Generación de presentaciones                          │
│  - Conversión PPTX → Imágenes                           │
│  - WebSockets para colaboración                          │
│  - SQLite para almacenamiento                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ API Calls
                 │
┌────────────────▼────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                    │
│  - Chutes AI (generación de contenido)                  │
│  - Google Gemini Vision (análisis de diseño)            │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Estado Actual de Integración

### ✅ Completamente Integrado

1. **Backend FastAPI**
   - ✅ Análisis de plantillas PPTX (`/api/analyze`)
   - ✅ Generación de presentaciones (`/api/generate`)
   - ✅ Exportación a PPTX (`/api/export/pptx`)
   - ✅ Exportación a PDF (`/api/export/pdf`)
   - ✅ Extracción de contenido (`/api/extract-content`)
   - ✅ WebSockets para colaboración (`/ws/{presentation_id}`)
   - ✅ Base de datos SQLite para presentaciones compartidas

2. **Frontend React**
   - ✅ Carga y análisis de plantillas
   - ✅ Editor de slides con preview
   - ✅ Chat con IA (Chutes AI)
   - ✅ Exportación múltiple (PPTX, PDF, imágenes)
   - ✅ Colaboración en tiempo real
   - ✅ Historial de versiones
   - ✅ Biblioteca de assets
   - ✅ Personalización de temas
   - ✅ Comandos de voz
   - ✅ Analytics

3. **Servicios de IA**
   - ✅ Chutes AI para generación de contenido
   - ✅ Búsqueda web integrada
   - ✅ Gemini Vision para análisis de diseño (opcional)

---

## 🔧 Configuración Paso a Paso

### 1. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

Edita `.env` y completa tus API keys:

```env
# REQUERIDO
VITE_CHUTES_API_KEY=tu_chutes_api_key_aqui
VITE_BACKEND_URL=http://localhost:8000

# OPCIONAL (para análisis avanzado)
VITE_GEMINI_API_KEY=tu_gemini_api_key_aqui
```

**Obtener API Keys:**
- **Chutes AI**: https://chutes.ai → Sign up → API Keys
- **Gemini**: https://makersuite.google.com/app/apikey

### 2. Instalar Dependencias

**Backend (Python):**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend (Node.js):**
```bash
npm install
```

### 3. Iniciar Servicios

**Opción A: Usar scripts automáticos (Windows)**
```bash
# Iniciar todo
START-APP.bat

# O iniciar por separado
start-backend.bat
start-frontend.bat
```

**Opción B: Manual**

Terminal 1 - Backend:
```bash
cd backend
python main.py
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### 4. Verificar Integración

1. Abre http://localhost:5173
2. Verifica en la consola del navegador:
   ```
   🤖 Chutes AI Configuration: { isConfigured: true, ... }
   ```
3. Sube una plantilla PPTX
4. Verifica en la consola:
   ```
   🔗 Conectando al backend: http://localhost:8000
   ✅ Backend disponible
   📊 Análisis recibido: ...
   ```

---

## 🔄 Flujo End-to-End

### Flujo Completo de Usuario

```
1. Usuario sube plantilla PPTX
   ↓
2. Frontend → Backend: POST /api/analyze
   ↓
3. Backend analiza estructura (python-pptx)
   ↓
4. Backend convierte slides a imágenes (preview)
   ↓
5. Frontend recibe análisis + previews
   ↓
6. Usuario chatea con IA para generar contenido
   ↓
7. Frontend → Chutes AI: Genera contenido
   ↓
8. IA devuelve contenido estructurado (JSON)
   ↓
9. Frontend actualiza slides con contenido
   ↓
10. Usuario exporta presentación
    ↓
11. Frontend → Backend: POST /api/export/pptx
    ↓
12. Backend genera PPTX con diseño original
    ↓
13. Usuario descarga archivo final
```

### Ejemplo de Código

**1. Subir y Analizar Plantilla:**
```javascript
// src/services/visionService.js
const formData = new FormData()
formData.append('file', file)

const response = await fetch(`${BACKEND_URL}/api/analyze`, {
  method: 'POST',
  body: formData
})

const data = await response.json()
// data.analysis contiene estructura completa
```

**2. Generar Contenido con IA:**
```javascript
// src/services/aiService.js
const result = await generateFullPresentation(topic, allSlides)
// result.slideUpdates contiene contenido para cada slide
```

**3. Exportar Presentación:**
```javascript
// src/services/exportService.js
await exportToPowerPoint(slides)
// Descarga automática del archivo PPTX
```

---

## 🧪 Testing de Integración

### Test 1: Backend Disponible
```bash
curl http://localhost:8000/health
# Debe devolver: {"status":"healthy","service":"AI Presentation API"}
```

### Test 2: Análisis de Plantilla
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@tu_plantilla.pptx"
# Debe devolver JSON con análisis completo
```

### Test 3: Chutes AI
Abre la consola del navegador en http://localhost:5173 y ejecuta:
```javascript
import { getChutesConfig } from './services/chutesService'
console.log(getChutesConfig())
// Debe mostrar: { isConfigured: true, ... }
```

### Test 4: Flujo Completo
1. Sube una plantilla PPTX
2. Escribe en el chat: "Genera una presentación sobre inteligencia artificial"
3. Verifica que los slides se actualicen
4. Exporta a PPTX
5. Abre el archivo descargado en PowerPoint

---

## 🐛 Troubleshooting

### Problema: Backend no disponible

**Síntomas:**
```
⚠️ Backend no disponible, usando análisis simulado
```

**Solución:**
1. Verifica que el backend esté corriendo: `curl http://localhost:8000/health`
2. Revisa `VITE_BACKEND_URL` en `.env`
3. Verifica que el puerto 8000 no esté ocupado

### Problema: Chutes AI no configurado

**Síntomas:**
```
⚠️ Chutes AI no está configurado. Verifica tu archivo .env
```

**Solución:**
1. Verifica que `.env` existe (no `.env.example`)
2. Verifica que `VITE_CHUTES_API_KEY` tiene un valor válido
3. Reinicia el servidor de desarrollo: `npm run dev`

### Problema: Error al analizar PPTX

**Síntomas:**
```
❌ Error al analizar: ...
```

**Solución:**
1. Verifica que el archivo sea `.pptx` (no `.ppt`)
2. Verifica que `python-pptx` esté instalado: `pip list | grep python-pptx`
3. Revisa los logs del backend en la terminal

### Problema: Exportación falla

**Síntomas:**
- No se descarga el archivo
- Error 500 del servidor

**Solución:**
1. Verifica que tienes contenido en los slides
2. Para PDF: Verifica que LibreOffice esté instalado
3. Usa exportación local (PptxGenJS) como fallback

---

## 📚 Endpoints del Backend

### Análisis
- `POST /api/analyze` - Analiza plantilla PPTX
  - Input: FormData con archivo
  - Output: JSON con estructura completa

### Generación
- `POST /api/generate` - Genera PPTX con contenido IA
  - Input: FormData (archivo + contenido JSON)
  - Output: Archivo PPTX

### Exportación
- `POST /api/export/pptx` - Exporta a PowerPoint
  - Input: JSON con slides
  - Output: Archivo PPTX

- `POST /api/export/pdf` - Exporta a PDF
  - Input: JSON con slides
  - Output: Archivo PDF

### Contenido
- `POST /api/extract-content` - Extrae texto de PPTX
  - Input: FormData con archivo
  - Output: JSON con contenido extraído

### Colaboración
- `POST /api/presentations/create` - Crea presentación compartida
- `GET /api/presentations/{id}` - Obtiene presentación
- `PUT /api/presentations/{id}` - Actualiza presentación
- `WS /ws/{id}` - WebSocket para colaboración en tiempo real

---

## 🎯 Próximos Pasos

### Mejoras Sugeridas

1. **Autenticación**
   - Implementar login con OAuth
   - Gestión de usuarios y permisos

2. **Cloud Storage**
   - Guardar presentaciones en la nube
   - Sincronización entre dispositivos

3. **Plantillas Predefinidas**
   - Biblioteca de plantillas profesionales
   - Marketplace de plantillas

4. **Análisis Avanzado**
   - Usar Gemini Vision para detectar colores exactos
   - Reconocimiento de fuentes personalizadas

5. **Colaboración Mejorada**
   - Comentarios en slides
   - Historial de cambios detallado
   - Notificaciones en tiempo real

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa `TROUBLESHOOTING.md`
2. Verifica los logs del backend y frontend
3. Consulta la documentación de cada servicio:
   - Backend: `backend/README.md`
   - Chutes AI: https://docs.chutes.ai
   - Gemini: https://ai.google.dev/docs

---

## ✨ Características Implementadas

- ✅ Análisis automático de plantillas PPTX
- ✅ Generación de contenido con IA (Chutes AI)
- ✅ Preservación del diseño original
- ✅ Chat interactivo con IA
- ✅ Exportación múltiple (PPTX, PDF, imágenes)
- ✅ Colaboración en tiempo real (WebSockets)
- ✅ Historial de versiones
- ✅ Biblioteca de assets (gráficos, iconos)
- ✅ Personalización de temas
- ✅ Comandos de voz
- ✅ Analytics de presentación
- ✅ Importación de contenido desde PPTX
- ✅ Búsqueda web integrada

---

**¡Tu aplicación está completamente integrada y lista para usar!** 🎉
