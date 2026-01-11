# 🔍 Auditoría Completa - Slide AI

**Fecha:** Enero 2026  
**Versión:** 1.0.0

---

## 📋 Resumen Ejecutivo

**Slide AI** es una aplicación web que permite a usuarios aplicar sus templates corporativos de PowerPoint a contenido generado por IA (propio o de ChatGPT/Claude/Gemini). La app preserva el diseño visual del template y solo reemplaza el texto.

---

## 🏗️ Arquitectura

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React + Vite | React 18.2, Vite 5.0 |
| Backend | Python + FastAPI | FastAPI 0.104.1 |
| Base de Datos | SQLite | (colaboración) |
| IA Principal | Chutes AI (MiniMax) | MiniMax-M2.1-TEE |
| IA Visión | Google Gemini | gemini-1.5-flash |
| PPTX Processing | python-pptx | 0.6.23 |

---

## 🤖 Modelos de IA Utilizados

### 1. Chutes AI - MiniMax M2.1 (Principal)
- **Uso:** Generación de contenido, variantes, sugerencias
- **Endpoint:** `https://llm.chutes.ai/v1/chat/completions`
- **Modelo:** `MiniMaxAI/MiniMax-M2.1-TEE`
- **Funciones:**
  - Generar contenido para slides
  - Crear variantes de texto
  - Sugerir mejoras gramaticales
  - Estructurar texto plano en slides
  - Chat interactivo con el usuario

### 2. Google Gemini Vision (Opcional)
- **Uso:** Análisis avanzado de diseño de slides
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models`
- **Modelo:** `gemini-1.5-flash`
- **Funciones:**
  - Detectar áreas de texto por coordenadas
  - Identificar fuentes y colores
  - Analizar estilo visual

### 3. OpenAI GPT-4 Vision (Alternativo)
- **Uso:** Análisis de templates (código presente pero no activo)
- **Modelo:** `gpt-4-vision-preview`

---

## 🔌 API Endpoints (Backend Python)

### Análisis y Generación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Info de la API |
| GET | `/health` | Health check |
| POST | `/api/analyze` | Analiza PPTX y extrae estructura |
| POST | `/api/generate` | Genera PPTX con contenido IA |
| POST | `/api/extract-content` | Extrae solo texto de PPTX |

### Exportación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/export/pptx` | Exporta a PowerPoint |
| POST | `/api/export/pdf` | Exporta a PDF (requiere LibreOffice) |

### Colaboración

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/presentations/create` | Crear presentación compartida |
| GET | `/api/presentations/{id}` | Obtener presentación |
| PUT | `/api/presentations/{id}` | Actualizar presentación |
| PUT | `/api/presentations/{id}/permissions` | Actualizar permisos |
| WS | `/ws/{presentation_id}` | WebSocket tiempo real |

---

## 📦 Componentes Frontend

### Componentes Principales (22)

| Componente | Archivo | Función |
|------------|---------|---------|
| App | `App.jsx` | Componente raíz, gestión de estado global |
| SlideViewer | `SlideViewer.jsx` | Visualización y edición de slides |
| ChatPanel | `ChatPanel.jsx` | Chat con IA para editar contenido |
| TemplateUploader | `TemplateUploader.jsx` | Subir templates PPTX |
| ContentMapper | `ContentMapper.jsx` | Mapear contenido a áreas del template |
| ProfilePanel | `ProfilePanel.jsx` | Perfil de usuario, templates guardados |
| TemplateLibrary | `TemplateLibrary.jsx` | Biblioteca de templates guardados |
| PresentationHistory | `PresentationHistory.jsx` | Historial de presentaciones |
| TextImporter | `TextImporter.jsx` | Importar texto desde ChatGPT/Claude |
| ContentImporter | `ContentImporter.jsx` | Importar contenido desde PPTX |
| VariantGenerator | `VariantGenerator.jsx` | Generar variantes de contenido |
| ContentSuggestions | `ContentSuggestions.jsx` | Sugerencias de mejora IA |
| TextOnlyMode | `TextOnlyMode.jsx` | Convertir texto plano a slides |
| OnboardingTour | `OnboardingTour.jsx` | Tutorial para nuevos usuarios |
| KeyboardShortcutsHelp | `KeyboardShortcutsHelp.jsx` | Ayuda de atajos de teclado |
| HeaderDropdown | `HeaderDropdown.jsx` | Menús desplegables del header |
| ShareModal | `ShareModal.jsx` | Compartir presentación |
| ChartEditor | `ChartEditor.jsx` | Editor de gráficos |
| ChartRenderer | `ChartRenderer.jsx` | Renderizar gráficos |
| CustomAlert | `CustomAlert.jsx` | Alertas personalizadas |
| PromptInput | `PromptInput.jsx` | Input para prompts de IA |
| TemplateAnalyzer | `TemplateAnalyzer.jsx` | Analizar templates |

### Features Avanzadas (7)

| Feature | Archivo | Función |
|---------|---------|---------|
| ExportOptions | `ExportOptions.jsx` | Opciones de exportación PPTX/PDF |
| ThemeCustomizer | `ThemeCustomizer.jsx` | Personalizar temas |
| AssetLibrary | `AssetLibrary.jsx` | Biblioteca de imágenes/iconos |
| VersionHistory | `VersionHistory.jsx` | Historial de versiones |
| VoiceCommands | `VoiceCommands.jsx` | Comandos de voz |
| Analytics | `Analytics.jsx` | Estadísticas de presentación |
| Collaboration | `Collaboration.jsx` | Colaboración en tiempo real |

---

## 🔧 Servicios Frontend (8)

| Servicio | Archivo | Función |
|----------|---------|---------|
| aiService | `aiService.js` | Generación de contenido IA |
| chutesService | `chutesService.js` | Conexión con Chutes AI API |
| visionService | `visionService.js` | Análisis de templates |
| geminiVisionService | `geminiVisionService.js` | Análisis con Gemini Vision |
| exportService | `exportService.js` | Exportación PPTX/PDF |
| templateCacheService | `templateCacheService.js` | Cache de análisis |
| collaborationService | `collaborationService.js` | Colaboración WebSocket |
| webSearchService | `webSearchService.js` | Búsqueda web |

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+S` | Guardar presentación |
| `Ctrl+E` | Exportar |
| `Ctrl+O` | Abrir historial |
| `Ctrl+T` | Biblioteca de templates |
| `Ctrl+I` | Importar texto |
| `←` / `→` | Navegar slides |
| `Esc` | Cerrar modal |
| `?` | Mostrar ayuda |

---

## 💾 Almacenamiento Local (localStorage)

| Clave | Contenido |
|-------|-----------|
| `userProfile` | Datos del perfil (nombre, email, etc.) |
| `savedTemplates` | Templates guardados |
| `presentationHistory` | Historial de presentaciones |
| `templateAnalysisCache` | Cache de análisis de templates |
| `presentationTheme` | Tema personalizado |
| `hasSeenOnboarding` | Flag de tutorial completado |

---

## 🎨 Funcionalidades Principales

### 1. Gestión de Templates
- ✅ Subir templates PPTX
- ✅ Analizar estructura (áreas de texto, imágenes)
- ✅ Guardar en biblioteca
- ✅ Cache de análisis (evita re-analizar)

### 2. Generación de Contenido
- ✅ Chat con IA para generar contenido
- ✅ Generar presentación completa por tema
- ✅ Variantes de contenido (3 versiones)
- ✅ Sugerencias de mejora gramatical
- ✅ Modo solo texto (estructurar automáticamente)

### 3. Importación
- ✅ Importar desde PPTX existente
- ✅ Pegar texto desde ChatGPT/Claude/Gemini
- ✅ Detectar estructura automáticamente

### 4. Exportación
- ✅ Exportar a PPTX con template clonado
- ✅ Exportar a PDF (requiere LibreOffice)
- ✅ Preview antes de exportar

### 5. Edición
- ✅ Editar contenido inline
- ✅ Reordenar slides (drag & drop)
- ✅ Duplicar/eliminar slides
- ✅ Insertar imágenes/iconos
- ✅ Personalizar temas

### 6. Colaboración
- ✅ Compartir presentación por link
- ✅ Edición en tiempo real (WebSocket)
- ✅ Permisos (ver/editar)

### 7. Usuario
- ✅ Perfil editable (nombre, email, teléfono, empresa)
- ✅ Avatar personalizado
- ✅ Historial de presentaciones
- ✅ Templates guardados

### 8. UX
- ✅ Onboarding tutorial (7 pasos)
- ✅ Atajos de teclado
- ✅ Comandos de voz
- ✅ Alertas personalizadas

---

## 📁 Estructura de Archivos

```
ai-presentation-app/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── pptx_analyzer.py     # Análisis de PPTX
│   ├── pptx_generator.py    # Generación/clonación PPTX
│   ├── database.py          # SQLite para colaboración
│   ├── pptx_to_images.py    # Conversión a imágenes
│   └── requirements.txt
├── src/
│   ├── components/          # 22 componentes React
│   ├── features/            # 7 features avanzadas
│   ├── hooks/               # Custom hooks
│   ├── services/            # 8 servicios
│   ├── styles/              # 23 archivos CSS
│   ├── App.jsx              # Componente principal
│   └── index.jsx            # Entry point
├── .env.example             # Variables de entorno
├── package.json             # Dependencias npm
└── vite.config.js           # Configuración Vite
```

---

## 🔐 Variables de Entorno Requeridas

```env
# Requerido
VITE_CHUTES_API_KEY=xxx        # API key de Chutes AI
VITE_BACKEND_URL=http://localhost:8000

# Opcional
VITE_GEMINI_API_KEY=xxx        # Para análisis avanzado
VITE_CHUTES_MODEL=MiniMaxAI/MiniMax-M2.1-TEE
```

---

## 📊 Dependencias

### Frontend (npm)
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^7.12.0
- pptxgenjs: ^3.12.0 (exportación local)
- chart.js: ^4.5.1
- react-chartjs-2: ^5.3.1
- react-draggable: ^4.5.0
- openai: ^4.20.0

### Backend (pip)
- fastapi: 0.104.1
- uvicorn: 0.24.0
- python-pptx: 0.6.23
- python-multipart: 0.0.6
- Pillow: 10.1.0
- pydantic: 2.5.0

---

## 🚀 Comandos de Ejecución

```bash
# Frontend
npm install
npm run dev          # Puerto 5173

# Backend
cd backend
pip install -r requirements.txt
python main.py       # Puerto 8000
```

---

## 📈 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Componentes React | 29 |
| Servicios | 8 |
| Endpoints API | 11 |
| Archivos CSS | 23 |
| Modelos IA | 3 |
| Atajos de teclado | 8 |
| Funcionalidades principales | 30+ |

---

## ⚠️ Limitaciones Conocidas

1. **Clonación de gráficos:** Soporte limitado en python-pptx
2. **Imágenes de fondo:** No se clonan completamente
3. **SmartArt:** No soportado
4. **PDF:** Requiere LibreOffice instalado
5. **Colaboración:** Requiere backend activo

---

## 🔮 Posibles Mejoras Futuras

1. Soporte para más formatos (Google Slides, Keynote)
2. Integración directa con Google Drive/OneDrive
3. Más modelos de IA (Claude, GPT-4)
4. Templates prediseñados incluidos
5. Exportación a video
6. Modo presentación en vivo
