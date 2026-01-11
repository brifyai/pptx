# 🎨 AI Presentation Studio

App profesional que permite subir plantillas de PowerPoint personalizadas y generar contenido con IA **manteniendo el diseño original al 100%**.

> **✅ INTEGRACIÓN COMPLETA END-TO-END** - Todos los componentes están conectados y funcionando

**[📖 Leer en Español](LEEME.md)** | **[🚀 Quick Start](INICIO-RAPIDO.md)** | **[📊 Status](STATUS.md)** | **[🎉 Welcome](WELCOME.txt)**

## 🎯 Problema que Resuelve

Las apps de IA actuales (ChatGPT, Claude, Gamma) generan contenido pero **NO respetan diseños corporativos**. Esta app:

✅ Lee tu plantilla PPT original  
✅ Extrae colores, fuentes, posiciones exactas  
✅ Genera contenido con IA  
✅ Coloca el contenido manteniendo el diseño 100%  
✅ Exporta listo para usar

**Powered by:**
- 🤖 Chutes AI (MiniMax-M2.1) - Generación de contenido
- 🔍 Google Gemini Vision - Análisis avanzado de diseño (opcional)
- 🐍 python-pptx - Análisis y generación de PPT con fidelidad total
- ⚛️ React + Vite - UI moderna y rápida
- 🔌 WebSockets - Colaboración en tiempo real  

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
copy .env.example .env

# Edita .env y agrega tus API keys:
# - VITE_CHUTES_API_KEY (requerido)
# - VITE_GEMINI_API_KEY (opcional)
```

### 2. Verificar Integración

```bash
# Ejecuta el script de verificación
node check-integration.js
```

### 3. Iniciar la Aplicación

**Opción A: Inicio Automático (Windows)**
```bash
START-APP.bat
```

**Opción B: Manual**

Terminal 1 - Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```

Terminal 2 - Frontend:
```bash
npm install
npm run dev
```

### 4. Abrir la Aplicación

Abre http://localhost:5173 en tu navegador

## 📦 Requisitos

- **Python 3.8+** (para backend)
- **Node.js 18+** (para frontend)
- **API Keys**:
  - Chutes AI (requerido) - https://chutes.ai
  - Google Gemini (opcional) - https://makersuite.google.com/app/apikey
- **LibreOffice** (opcional, para exportar a PDF)
- Windows/Mac/Linux

## 🎯 Uso

1. **Abre** http://localhost:5173
2. **Sube** tu plantilla .pptx (con tu branding)
3. **Describe** el contenido en el chat: "Genera una presentación sobre inteligencia artificial"
4. **Edita** con el chat IA o directamente en los slides
5. **Exporta** a PPTX, PDF o imágenes - ¡Mantiene tu diseño 100%!

### Flujo Completo

```
Usuario → Sube PPTX → Backend analiza → Frontend muestra slides
   ↓
Usuario → Chatea con IA → Chutes AI genera contenido → Slides se actualizan
   ↓
Usuario → Exporta → Backend genera PPTX → Descarga archivo
```

## 🏗️ Arquitectura

```
├── frontend/              # React App
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── features/     # Lazy loaded features
│   │   └── services/     # API clients
│   └── package.json
│
├── backend/              # Python API
│   ├── main.py          # FastAPI server
│   ├── pptx_analyzer.py # Analiza PPT
│   ├── pptx_generator.py # Genera PPT
│   └── requirements.txt
│
└── START-APP.bat        # Inicio automático
```

## 🔧 Características

### Backend (Python + python-pptx)
- ✅ Lee diseño original al 100%
- ✅ Mantiene colores exactos (RGB, temas)
- ✅ Preserva fuentes originales
- ✅ Respeta posiciones precisas
- ✅ Conserva formato de texto (bold, italic, tamaño)
- ✅ Mantiene imágenes de fondo
- ✅ Preserva formas y gráficos

### Frontend (React + Material Design)
- ✅ Visor de slides (75% pantalla)
- ✅ Chat con IA (25% pantalla)
- ✅ Edición inline en tiempo real
- ✅ Comandos de voz
- ✅ Historial de versiones
- ✅ Biblioteca de assets
- ✅ Temas personalizables
- ✅ Exportación múltiple

## 🤖 APIs y Servicios

### Chutes AI (Requerido)
- **Modelo**: MiniMaxAI/MiniMax-M2.1-TEE
- **Uso**: Generación de contenido inteligente
- **Configuración**: `VITE_CHUTES_API_KEY` en `.env`
- **Obtener key**: https://chutes.ai

### Google Gemini Vision (Opcional)
- **Modelo**: gemini-1.5-flash
- **Uso**: Análisis avanzado de diseño visual
- **Configuración**: `VITE_GEMINI_API_KEY` en `.env`
- **Obtener key**: https://makersuite.google.com/app/apikey

### Backend Python (FastAPI)
- **Puerto**: 8000
- **Base de datos**: SQLite (presentations.db)
- **Endpoints principales**:
  - `POST /api/analyze` - Analiza estructura de PPTX
  - `POST /api/generate` - Genera PPTX con contenido IA
  - `POST /api/export/pptx` - Exporta a PowerPoint
  - `POST /api/export/pdf` - Exporta a PDF
  - `POST /api/extract-content` - Extrae texto de PPTX
  - `POST /api/presentations/create` - Crea presentación compartida
  - `GET /api/presentations/{id}` - Obtiene presentación
  - `WS /ws/{id}` - WebSocket para colaboración
  - `GET /health` - Health check

### Frontend (React + Vite)
- **Puerto**: 5173
- **Servicios**:
  - `aiService.js` - Integración con Chutes AI
  - `visionService.js` - Análisis de plantillas (backend)
  - `geminiVisionService.js` - Análisis avanzado (Gemini)
  - `exportService.js` - Exportación múltiple
  - `collaborationService.js` - Colaboración en tiempo real
  - `webSearchService.js` - Búsqueda web integrada

## 📊 Ventaja Competitiva

| Feature | Gamma.app | Beautiful.ai | ChatGPT | **Tu App** |
|---------|-----------|--------------|---------|------------|
| Usa tu plantilla | ❌ | ❌ | ❌ | ✅ |
| Mantiene colores | ❌ | ❌ | ❌ | ✅ |
| Mantiene fuentes | ❌ | ❌ | ❌ | ✅ |
| IA generativa | ✅ | ✅ | ✅ | ✅ |
| Edición en tiempo real | ✅ | ✅ | ❌ | ✅ |
| Costo | $20/mes | $12/mes | $20/mes | **Gratis** |

## 🎨 Casos de Uso

- **Agencias**: Usar plantillas de cada cliente automáticamente
- **Corporativos**: Mantener brand guidelines sin esfuerzo
- **Consultoras**: Generar propuestas con formato estándar
- **Educación**: Usar formatos institucionales
- **Startups**: Pitch decks rápidos con tu branding

## 📝 Comandos del Chat

- "Mejora el título" → Optimiza el título actual
- "Agrega más puntos" → Añade bullets relevantes
- "Hazlo más profesional" → Ajusta el tono
- "Dame ideas" → Sugerencias de mejora

## ✨ Características Implementadas

### Core
- ✅ Análisis automático de plantillas PPTX
- ✅ Generación de contenido con IA (Chutes AI)
- ✅ Preservación del diseño original al 100%
- ✅ Chat interactivo con IA
- ✅ Edición en tiempo real

### Exportación
- ✅ Exportar a PowerPoint (.pptx)
- ✅ Exportar a PDF
- ✅ Exportar como imágenes PNG
- ✅ Exportar a Google Slides (importación)
- ✅ Exportar a Figma (JSON)

### Colaboración
- ✅ Presentaciones compartidas
- ✅ Colaboración en tiempo real (WebSockets)
- ✅ Gestión de permisos
- ✅ Historial de cambios

### Features Avanzadas
- ✅ Historial de versiones
- ✅ Biblioteca de assets (gráficos, iconos)
- ✅ Personalización de temas
- ✅ Comandos de voz
- ✅ Analytics de presentación
- ✅ Importación de contenido desde PPTX
- ✅ Búsqueda web integrada
- ✅ Análisis con Gemini Vision (opcional)

## 🚧 Roadmap Futuro

- [ ] Autenticación con OAuth
- [ ] Cloud storage (AWS S3, Google Drive)
- [ ] Plantillas predefinidas
- [ ] Marketplace de plantillas
- [ ] Comentarios en slides
- [ ] Notificaciones en tiempo real
- [ ] Mobile app (React Native)
- [ ] Plugin para PowerPoint
- [ ] API pública

## 📝 Licencia

MIT

## 📚 Documentación Completa

### 🚀 Inicio Rápido
- **[INICIO-RAPIDO.md](INICIO-RAPIDO.md)** - Tutorial completo en español (5 minutos)
- **[DOCS-INDEX.md](DOCS-INDEX.md)** - Índice completo de documentación

### 🔧 Integración
- **[INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md)** - Guía completa de integración end-to-end
- **[RESUMEN-INTEGRACION.md](RESUMEN-INTEGRACION.md)** - Resumen ejecutivo del estado
- **[CHECKLIST-INTEGRACION.md](CHECKLIST-INTEGRACION.md)** - Checklist de verificación

### 🐛 Soporte
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solución de problemas comunes
- **[backend/README.md](backend/README.md)** - Documentación del backend
- **[INSTALL-ASPOSE.md](INSTALL-ASPOSE.md)** - Instalación de Aspose (opcional)

## 🤝 Soporte

### Verificación Rápida

```bash
# 1. Verificar integración
node check-integration.js

# 2. Verificar backend
curl http://localhost:8000/health

# 3. Verificar configuración
# Abre la consola del navegador en http://localhost:5173
# Debe mostrar: "🤖 Chutes AI Configuration: { isConfigured: true }"
```

### Problemas Comunes

1. **Backend no disponible**
   - Verifica que Python esté instalado: `python --version`
   - Verifica que el backend esté corriendo: `curl http://localhost:8000/health`
   - Revisa `VITE_BACKEND_URL` en `.env`

2. **Chutes AI no configurado**
   - Verifica que `.env` existe (no `.env.example`)
   - Verifica que `VITE_CHUTES_API_KEY` tiene un valor válido
   - Reinicia el servidor: `npm run dev`

3. **Error al analizar PPTX**
   - Verifica que el archivo sea `.pptx` (no `.ppt`)
   - Verifica que `python-pptx` esté instalado: `pip list | grep python-pptx`

Para más detalles, consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
