# 🏗️ Arquitectura del Sistema - Slide AI

## 📊 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUARIO FINAL                              │
│                    (Navegador Web - Chrome/Firefox)                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/WebSocket
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                         │
│                      Puerto: 5173                                    │
├──────────────────────────────────────────────────────────────────────┤
│  Componentes UI:                                                     │
│  ├─ App.jsx (Principal)                                              │
│  ├─ SlideViewer.jsx (Visualización)                                  │
│  ├─ ChatPanel.jsx (Chat con IA)                                      │
│  ├─ TemplateUploader.jsx (Carga)                                     │
│  └─ Features/* (Lazy loaded)                                         │
│                                                                       │
│  Hooks (Custom):                                                     │
│  ├─ useSlideManagement.js (CRUD slides)                              │
│  ├─ useModals.js (16+ estados de modales)                            │
│  ├─ useAuth.js (autenticación)                                       │
│  ├─ useActivityLog.js (logging)                                      │
│  └─ useTemplateManager.js (templates)                                │
│                                                                       │
│  Servicios:                                                          │
│  ├─ aiService.js ────────────────┐                                   │
│  ├─ visionService.js             │                                   │
│  ├─ exportService.js             │                                   │
│  ├─ collaborationService.js      │                                   │
│  ├─ chutesService.js ────────────┼──────────────┐                    │
│  ├─ geminiVisionService.js ──────┼──────────┐   │                    │
│  └─ webSearchService.js          │          │   │                    │
└──────────────────────────────────┼──────────┼───┼────────────────────┘
                                   │          │   │
                    ┌──────────────┘          │   │
                    │                         │   │
                    │ HTTP POST               │   │ HTTP POST
                    │ /api/*                  │   │ API Calls
                    │                         │   │
┌───────────────────▼─────────────────────────┼───┼────────────────────┐
│              BACKEND (Python + FastAPI)     │   │                    │
│              Puerto: 8000 - v2.0.0          │   │                    │
├─────────────────────────────────────────────┼───┼────────────────────┤
│  main.py (72 líneas - Entry Point)          │   │                    │
│  ├─ Configuración CORS                      │   │                    │
│  ├─ Registro de routers                     │   │                    │
│  └─ WebSocket endpoint                      │   │                    │
│                                              │   │                    │
│  routes/ (Endpoints por dominio):           │   │                    │
│  ├─ analysis.py (análisis PPTX)             │   │                    │
│  ├─ export.py (exportación + cola async)    │   │                    │
│  ├─ templates.py (gestión templates)        │   │                    │
│  └─ collaboration.py (WebSocket, CRUD)      │   │                    │
│                                              │   │                    │
│  services/ (Lógica de negocio):             │   │                    │
│  ├─ gemini_vision.py (análisis visual)      │   │                    │
│  └─ slide_converter.py (conversión)         │   │                    │
│                                              │   │                    │
│  core/ (Componentes compartidos):           │   │                    │
│  ├─ websocket_manager.py (conexiones WS)    │   │                    │
│  └─ task_queue.py (cola async 4 workers)    │   │                    │
│                                              │   │                    │
│  schemas/ (Validación):                     │   │                    │
│  └─ requests.py (Pydantic models)           │   │                    │
│                                              │   │                    │
│  utils/ (Utilidades):                       │   │                    │
│  └─ logging_utils.py                        │   │                    │
│                                              │   │                    │
│  Módulos especializados:                    │   │                    │
│  ├─ pptx_xml_cloner.py (★ Moat técnico)     │   │                    │
│  ├─ pptx_analyzer.py                        │   │                    │
│  ├─ pptx_generator.py                       │   │                    │
│  ├─ pptx_to_images.py                       │   │                    │
│  └─ database.py (SQLite WAL mode)           │   │                    │
└─────────────────────────────────────────────┼───┼────────────────────┘
                                              │   │
                    ┌─────────────────────────┘   │
                    │                             │
                    │ HTTPS API Calls             │ HTTPS API Calls
                    │                             │
┌───────────────────▼─────────────────────────────▼────────────────────┐
│                      SERVICIOS EXTERNOS                               │
├───────────────────────────────────────────────────────────────────────┤
│  Chutes AI                    │  Google Gemini Vision                │
│  - Modelo: MiniMax-M2.1       │  - Modelo: gemini-1.5-flash          │
│  - Generación de contenido    │  - Análisis de diseño visual         │
│  - Chat conversacional         │  - Detección de colores/fuentes      │
│  - URL: llm.chutes.ai         │  - URL: generativelanguage.google... │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Estructura Backend Modular (v2.0.0)

```
backend/
├── main.py                    # Entry point (72 líneas)
├── routes/                    # Endpoints por dominio
│   ├── analysis.py            # POST /api/analyze, /api/analyze-template
│   ├── export.py              # POST /api/export/pptx, /pdf, /async
│   ├── templates.py           # GET/POST /api/templates
│   └── collaboration.py       # CRUD presentaciones + WebSocket
├── services/                  # Lógica de negocio
│   ├── gemini_vision.py       # Análisis visual con Gemini
│   └── slide_converter.py     # Conversión de slides
├── core/                      # Componentes compartidos
│   ├── websocket_manager.py   # Gestión conexiones WS
│   └── task_queue.py          # Cola async (4 workers)
├── schemas/                   # Validación de datos
│   └── requests.py            # Modelos Pydantic
├── utils/                     # Utilidades
│   └── logging_utils.py       # Logging estructurado
├── pptx_xml_cloner.py         # ★ XML Cloner (moat técnico)
├── pptx_analyzer.py           # Análisis de PPTX
├── pptx_generator.py          # Generación de PPTX
├── pptx_to_images.py          # Conversión a imágenes
└── database.py                # SQLite con WAL mode
```

### Cola de Tareas Asíncronas

Para operaciones pesadas (generación PPTX, procesamiento IA), se implementó una cola ligera:

```python
# core/task_queue.py
- ThreadPoolExecutor con 4 workers
- asyncio.Semaphore para limitar concurrencia
- Endpoints:
  - POST /api/export/pptx/async  → Inicia tarea
  - GET  /api/task/{id}          → Estado de tarea
  - GET  /api/task/{id}/download → Descarga resultado
  - GET  /api/queue/status       → Estado de la cola
```

### SQLite Optimizado (WAL Mode)

```python
# database.py - Configuración para ~100 usuarios concurrentes
PRAGMA journal_mode=WAL
PRAGMA busy_timeout=5000
PRAGMA synchronous=NORMAL
PRAGMA cache_size=-64000
PRAGMA temp_store=MEMORY
```

---

## 🔄 Flujo de Datos Detallado

### 1. Carga y Análisis de Plantilla

```
Usuario
  │
  │ 1. Arrastra/selecciona archivo .pptx
  ▼
TemplateUploader.jsx
  │
  │ 2. Crea FormData con archivo
  ▼
visionService.js
  │
  │ 3. POST /api/analyze
  │    FormData: { file: archivo.pptx }
  ▼
Backend: main.py
  │
  │ 4. Guarda archivo temporal
  ▼
pptx_analyzer.py
  │
  │ 5. Analiza con python-pptx:
  │    - Estructura de slides
  │    - Áreas de texto
  │    - Posiciones y tamaños
  │    - Colores y fuentes
  ▼
pptx_to_images.py
  │
  │ 6. Convierte slides a imágenes PNG (base64)
  ▼
Backend: main.py
  │
  │ 7. Retorna JSON:
  │    {
  │      slides: [...],
  │      slideImages: [base64, ...],
  │      extractedAssets: {...}
  │    }
  ▼
visionService.js
  │
  │ 8. Transforma al formato del frontend
  ▼
App.jsx
  │
  │ 9. Inicializa slides con previews
  ▼
SlideViewer.jsx
  │
  │ 10. Muestra slides con imágenes de fondo
  ▼
Usuario ve la presentación analizada
```

### 2. Generación de Contenido con IA

```
Usuario
  │
  │ 1. Escribe en el chat: "Genera presentación sobre IA"
  ▼
ChatPanel.jsx
  │
  │ 2. Captura mensaje
  ▼
aiService.js
  │
  │ 3. Prepara contexto:
  │    - Slide actual
  │    - Todos los slides
  │    - Tipo de slide
  ▼
chutesService.js
  │
  │ 4. POST https://llm.chutes.ai/v1/chat/completions
  │    {
  │      model: "MiniMaxAI/MiniMax-M2.1-TEE",
  │      messages: [
  │        { role: "system", content: "Eres un asistente..." },
  │        { role: "user", content: "Genera presentación..." }
  │      ]
  │    }
  ▼
Chutes AI
  │
  │ 5. Genera contenido estructurado
  ▼
chutesService.js
  │
  │ 6. Retorna respuesta JSON:
  │    {
  │      message: "He generado...",
  │      slideUpdates: [
  │        { slideIndex: 0, content: { title: "...", subtitle: "..." } },
  │        { slideIndex: 1, content: { heading: "...", bullets: [...] } }
  │      ]
  │    }
  ▼
aiService.js
  │
  │ 7. Parsea y valida JSON
  ▼
ChatPanel.jsx
  │
  │ 8. Aplica actualizaciones a slides
  ▼
App.jsx
  │
  │ 9. Actualiza estado de slides
  ▼
SlideViewer.jsx
  │
  │ 10. Re-renderiza con nuevo contenido
  ▼
Usuario ve el contenido generado
```

### 3. Exportación a PowerPoint

```
Usuario
  │
  │ 1. Clic en "Exportar" → "PowerPoint"
  ▼
ExportOptions.jsx
  │
  │ 2. Llama a exportService
  ▼
exportService.js
  │
  │ 3. POST /api/export/pptx
  │    {
  │      slides: [
  │        { type: "title", content: {...} },
  │        { type: "content", content: {...} }
  │      ]
  │    }
  ▼
Backend: main.py
  │
  │ 4. Recibe datos de slides
  ▼
pptx_generator.py
  │
  │ 5. Crea presentación con python-pptx:
  │    - Crea slides
  │    - Aplica diseño original
  │    - Inserta contenido
  │    - Mantiene formato
  ▼
Backend: main.py
  │
  │ 6. Guarda archivo temporal
  │
  │ 7. Retorna FileResponse
  ▼
exportService.js
  │
  │ 8. Recibe blob
  │
  │ 9. Crea URL temporal
  │
  │ 10. Trigger descarga
  ▼
Usuario descarga presentacion.pptx
```

### 4. Colaboración en Tiempo Real

```
Usuario A                          Usuario B
  │                                   │
  │ 1. Clic "Compartir"               │
  ▼                                   │
ShareModal.jsx                        │
  │                                   │
  │ 2. POST /api/presentations/create │
  ▼                                   │
Backend: database.py                  │
  │                                   │
  │ 3. Crea en SQLite                 │
  │    Retorna ID: "abc123"           │
  ▼                                   │
ShareModal.jsx                        │
  │                                   │
  │ 4. Muestra link:                  │
  │    /editor/abc123                 │
  │                                   │
  │ 5. Usuario B abre link ──────────▶│
  │                                   ▼
  │                          App.jsx (Usuario B)
  │                                   │
  │                          GET /api/presentations/abc123
  │                                   ▼
  │                          Backend: database.py
  │                                   │
  │                          Retorna datos de presentación
  │                                   ▼
  │                          SlideViewer.jsx
  │                                   │
  │ 6. Ambos conectan WebSocket       │
  ▼                                   ▼
collaborationService.js      collaborationService.js
  │                                   │
  │ WS /ws/abc123                     │ WS /ws/abc123
  ▼                                   ▼
Backend: WebSocket Manager
  │
  │ 7. Mantiene conexiones activas
  │
  │ Usuario A edita slide
  ▼
SlideViewer.jsx (A)
  │
  │ 8. WS send: { type: "slide_update", ... }
  ▼
Backend: WebSocket Manager
  │
  │ 9. Broadcast a otros usuarios
  ▼
collaborationService.js (B)
  │
  │ 10. WS receive: { type: "slide_updated", ... }
  ▼
SlideViewer.jsx (B)
  │
  │ 11. Actualiza slide automáticamente
  ▼
Usuario B ve cambios en tiempo real
```

---

## 🗄️ Estructura de Datos

### Slide Object (Frontend)

```javascript
{
  id: 1,                          // ID único
  type: "title" | "content",      // Tipo de slide
  content: {                      // Contenido
    // Para tipo "title":
    title: "Título Principal",
    subtitle: "Subtítulo"
    
    // Para tipo "content":
    heading: "Encabezado",
    bullets: ["Punto 1", "Punto 2", "Punto 3"]
  },
  preview: "data:image/png;base64,...",  // Imagen de fondo
  layout: {                       // Layout original
    number: 1,
    type: "title",
    textAreas: [...],
    imageAreas: [...]
  },
  slideWidth: 13.333,             // Ancho en pulgadas
  slideHeight: 7.5                // Alto en pulgadas
}
```

### Analysis Object (Backend → Frontend)

```javascript
{
  fileName: "plantilla.pptx",
  slideSize: {
    width: 9144000,               // EMUs
    height: 6858000
  },
  slides: [
    {
      number: 1,
      type: "title",
      layout: "Title Slide",
      preview: "data:image/png;base64,...",
      textAreas: [
        {
          id: "title",
          type: "title",
          position: {
            x: 914400,            // EMUs
            y: 1371600,
            width: 7315200,
            height: 1143000
          },
          text: "",
          formatting: {
            font: "Calibri",
            size: 44,
            bold: true,
            color: "#000000"
          }
        }
      ],
      imageAreas: []
    }
  ],
  extractedAssets: {
    logos: [...],
    backgrounds: [...]
  }
}
```

### Presentation Object (Database)

```javascript
{
  id: "abc123xyz",                // ID único
  owner: "user_123",              // Propietario
  title: "Mi Presentación",       // Título
  templateData: {                 // Datos del template
    fileName: "plantilla.pptx",
    analysis: {...}
  },
  slidesData: [                   // Datos de slides
    { id: 1, type: "title", content: {...} }
  ],
  extractedAssets: {...},         // Assets extraídos
  permissions: {                  // Permisos
    view: ["anyone"],
    edit: ["user_123", "user_456"]
  },
  createdAt: "2026-01-10T...",    // Fecha creación
  lastModified: "2026-01-10T..."  // Última modificación
}
```

---

## 🔌 Tecnologías y Librerías

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.2.0 | Framework UI |
| Vite | 5.0.0 | Build tool |
| pptxgenjs | 3.12.0 | Generación PPTX local |
| chart.js | 4.5.1 | Gráficos |
| react-chartjs-2 | 5.3.1 | Wrapper React para Chart.js |
| react-draggable | 4.5.0 | Drag & drop |
| react-router-dom | 7.12.0 | Routing |

### Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| FastAPI | 0.104.1 | Framework web |
| uvicorn | 0.24.0 | Servidor ASGI |
| python-pptx | 0.6.23 | Manipulación PPTX |
| Pillow | 10.1.0 | Procesamiento imágenes |
| pydantic | 2.5.0 | Validación datos |
| SQLite | 3.x | Base de datos |

### Servicios Externos

| Servicio | Uso | Requerido |
|----------|-----|-----------|
| Chutes AI | Generación de contenido | ✅ Sí |
| Google Gemini | Análisis de diseño | ⚠️ Opcional |

---

## 🔒 Seguridad

### API Keys
- Almacenadas en `.env` (no versionado)
- Nunca expuestas en el código
- Prefijo `VITE_` para variables del frontend

### CORS
- Configurado en backend para permitir frontend
- Puertos permitidos: 3006, 3007, 3008, 5173

### WebSockets
- Autenticación por presentación ID
- Verificación de permisos antes de broadcast

### Base de Datos
- SQLite local (no expuesta)
- Validación de permisos en cada operación

---

## 📈 Escalabilidad

### Actual (v2.0.0)
- Backend: Modular architecture, async task queue (4 workers)
- Base de datos: SQLite WAL mode (~100 usuarios concurrentes)
- WebSockets: In-memory con manager dedicado
- Concurrencia: Semaphore + ThreadPoolExecutor

### Futuro (Producción)
- Backend: Multiple workers (Gunicorn)
- Base de datos: PostgreSQL
- WebSockets: Redis pub/sub
- Storage: AWS S3 / Google Cloud Storage
- CDN: CloudFlare
- Load balancer: Nginx
- Task queue: Celery + Redis (si se requiere mayor escala)

---

## 🎯 Patrones de Diseño

### Frontend
- **Component-based**: React components
- **Service layer**: Separación de lógica de negocio
- **Lazy loading**: Features cargadas bajo demanda
- **Context API**: Estado global (AlertProvider)
- **Custom hooks**: Reutilización de lógica (useSlideManagement, useModals, etc.)

### Backend (v2.0.0)
- **Modular architecture**: Separación por dominio (routes/, services/, core/)
- **REST API**: Endpoints estándar organizados por router
- **WebSocket**: Comunicación bidireccional (websocket_manager.py)
- **Repository pattern**: database.py con WAL mode
- **Service layer**: Lógica de negocio en services/
- **Dependency injection**: FastAPI
- **Async task queue**: ThreadPoolExecutor para operaciones pesadas
- **Pydantic validation**: Schemas tipados en schemas/

---

## ⭐ Moat Técnico: XML Cloner

El `pptx_xml_cloner.py` es la tecnología diferenciadora del proyecto:

### Capacidades
- Preserva animaciones (`p:timing`)
- Preserva transiciones (`p:transition`)
- Preserva gradientes (`a:gradFill`)
- Preserva sombras (`a:effectLst`)
- Preserva efectos 3D (`a:scene3d`, `a:sp3d`)
- Preserva SmartArt (`dgm:`)

### Detección Semántica de Placeholders
```python
# Patrones multi-idioma (ES/EN/PT/FR/DE)
PLACEHOLDER_PATTERNS = [
    r'\[.*?\]',           # [texto]
    r'<.*?>',             # <texto>
    r'\{.*?\}',           # {texto}
    r'lorem ipsum',       # Lorem ipsum
    r'click to add',      # Click to add
    r'haga clic',         # Haga clic para añadir
]
```

### Validación de Fuentes
```python
# Antes de exportar, verifica fuentes disponibles
get_fonts_used()           # Extrae fuentes del template
verify_fonts_available()   # Compara con sistema
clone_with_font_check()    # Clona con verificación
```

### QA Logging
```python
# Verificación de preservación post-clonado
_capture_preservation_state()  # Estado antes
_verify_preservation()         # Verifica después, logs warnings
```

---

## 📊 Métricas de Rendimiento

### Tiempos de Respuesta

| Operación | Tiempo | Optimización |
|-----------|--------|--------------|
| Carga inicial | < 3s | Code splitting |
| Análisis PPTX | < 10s | Procesamiento paralelo |
| Generación IA | < 5s | Streaming (futuro) |
| Actualización slide | < 100ms | Virtual DOM |
| Exportación PPTX | < 3s | Generación en backend |
| WebSocket latency | < 50ms | Conexión directa |

### Tamaño de Bundle

| Componente | Tamaño | Optimización |
|------------|--------|--------------|
| Vendor (React, etc) | ~150KB | Tree shaking |
| App code | ~80KB | Minificación |
| Features (lazy) | ~40KB | Code splitting |
| Total inicial | ~230KB | Gzip compression |

---

## 🔄 Ciclo de Vida de una Presentación

```
1. CREACIÓN
   Usuario sube plantilla → Backend analiza → Frontend inicializa

2. EDICIÓN
   Usuario chatea/edita → IA genera → Frontend actualiza → (Opcional) WebSocket sync

3. COLABORACIÓN (Opcional)
   Usuario comparte → Otros se unen → Edición simultánea → Sync en tiempo real

4. EXPORTACIÓN
   Usuario exporta → Backend genera → Usuario descarga

5. ALMACENAMIENTO (Opcional)
   Usuario guarda → SQLite persiste → Recuperable después
```

---

**Última actualización:** Enero 2026  
**Versión:** 2.0.0
