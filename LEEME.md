# 🎨 Slide AI

**Aplicación profesional para generar presentaciones PowerPoint con IA manteniendo tu diseño original al 100%**

> ✅ **INTEGRACIÓN COMPLETA** - Todos los componentes están conectados y funcionando

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Configurar API Key

```bash
# Copia el archivo de ejemplo
copy .env.example .env
```

Edita `.env` y agrega tu API key de Chutes AI:
```env
VITE_CHUTES_API_KEY=tu_api_key_aqui
```

**Obtener API key:** https://chutes.ai → Sign up → API Keys

### 2. Instalar Dependencias

```bash
# Backend
cd backend
pip install -r requirements.txt
cd ..

# Frontend
npm install
```

### 3. Iniciar Aplicación

**Windows (Automático):**
```bash
START-APP.bat
```

**Manual:**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
npm run dev
```

### 4. ¡Usar!

Abre http://localhost:5173 en tu navegador

---

## 🎯 ¿Qué hace esta aplicación?

### El Problema
Las herramientas de IA actuales (ChatGPT, Gamma, Beautiful.ai) generan contenido pero **NO respetan tu diseño corporativo**.

### La Solución
Esta aplicación:
1. ✅ Lee tu plantilla PowerPoint original
2. ✅ Extrae colores, fuentes y posiciones exactas
3. ✅ Genera contenido con IA (Chutes AI)
4. ✅ Coloca el contenido manteniendo el diseño 100%
5. ✅ Exporta listo para usar

---

## ✨ Características

### Core
- 🎨 **Mantiene tu diseño al 100%** - Colores, fuentes, posiciones exactas
- 🤖 **IA conversacional** - Chat natural para generar contenido
- ⚡ **Edición en tiempo real** - Modifica directamente en los slides
- 📤 **Exportación múltiple** - PPTX, PDF, PNG, Google Slides, Figma

### Avanzadas
- 👥 **Colaboración en tiempo real** - Edita con tu equipo simultáneamente
- 📚 **Historial de versiones** - Recupera cambios anteriores
- 🎨 **Biblioteca de assets** - Gráficos, iconos, imágenes
- 🎤 **Comandos de voz** - Controla con tu voz
- 📊 **Analytics** - Métricas de tu presentación
- 🔍 **Búsqueda web** - Información actualizada en el chat

---

## 📖 Uso Básico

### 1. Subir Plantilla
Arrastra tu archivo `.pptx` con tu branding corporativo

### 2. Generar Contenido
Escribe en el chat:
```
Genera una presentación sobre inteligencia artificial
```

### 3. Editar
- **Con el chat:** "Mejora el título del slide 2"
- **Directamente:** Haz clic y edita

### 4. Exportar
Haz clic en "Exportar" → Elige formato → Descarga

---

## 🏗️ Arquitectura

```
Usuario
  ↓
Frontend (React + Vite)
  ↓
Backend (Python + FastAPI)
  ↓
Chutes AI (Generación de contenido)
```

**Tecnologías:**
- Frontend: React 18, Vite 5, Material Icons
- Backend: Python 3.8+, FastAPI, python-pptx
- IA: Chutes AI (MiniMax-M2.1)
- Base de datos: SQLite
- Colaboración: WebSockets

---

## 📚 Documentación

### 🚀 Para Empezar
- **[INICIO-RAPIDO.md](INICIO-RAPIDO.md)** ⭐ Tutorial completo en español
- **[STATUS.md](STATUS.md)** - Estado actual del sistema
- **[DOCS-INDEX.md](DOCS-INDEX.md)** - Índice de toda la documentación

### 🔧 Para Desarrolladores
- **[INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md)** - Guía completa de integración
- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Diagramas técnicos detallados
- **[backend/README.md](backend/README.md)** - Documentación del backend

### 🐛 Solución de Problemas
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problemas comunes
- **[CHECKLIST-INTEGRACION.md](CHECKLIST-INTEGRACION.md)** - Verificación completa

---

## 🔧 Comandos Útiles

```bash
# Verificar configuración
npm run check

# Tests de integración
npm run test:integration

# Verificar backend
curl http://localhost:8000/health

# Modo desarrollo
npm run dev

# Build producción
npm run build
```

---

## 💡 Ejemplos de Uso

### Presentación Corporativa
```
Usuario: Genera una presentación sobre resultados Q4 2025
IA: [Genera 5 slides con métricas, logros y próximos pasos]
Usuario: Agrega números específicos al slide 3
IA: [Agrega datos concretos]
```

### Pitch Deck
```
Usuario: Crea un pitch deck para una startup de IA
IA: [Genera estructura: Problema, Solución, Mercado, Producto, Equipo]
Usuario: Hazlo más convincente
IA: [Mejora el tono y agrega datos impactantes]
```

### Presentación Educativa
```
Usuario: Genera una clase sobre fotosíntesis
IA: [Crea contenido educativo paso a paso]
Usuario: Simplifica el lenguaje
IA: [Adapta para el nivel apropiado]
```

---

## 🎯 Casos de Uso

- **Agencias** - Usa plantillas de cada cliente automáticamente
- **Corporativos** - Mantén brand guidelines sin esfuerzo
- **Consultoras** - Genera propuestas con formato estándar
- **Educación** - Usa formatos institucionales
- **Startups** - Pitch decks rápidos con tu branding

---

## 📊 Ventaja Competitiva

| Feature | Gamma.app | Beautiful.ai | ChatGPT | **Esta App** |
|---------|-----------|--------------|---------|--------------|
| Usa tu plantilla | ❌ | ❌ | ❌ | ✅ |
| Mantiene colores | ❌ | ❌ | ❌ | ✅ |
| Mantiene fuentes | ❌ | ❌ | ❌ | ✅ |
| IA generativa | ✅ | ✅ | ✅ | ✅ |
| Edición en tiempo real | ✅ | ✅ | ❌ | ✅ |
| Colaboración | ✅ | ✅ | ❌ | ✅ |
| Costo | $20/mes | $12/mes | $20/mes | **Gratis** |

---

## 🔐 Requisitos

- **Python 3.8+** (para backend)
- **Node.js 18+** (para frontend)
- **API Key de Chutes AI** (gratis en https://chutes.ai)
- **LibreOffice** (opcional, para exportar a PDF)

---

## 🐛 Problemas Comunes

### Backend no disponible
```bash
# Verifica que esté corriendo
curl http://localhost:8000/health

# Si no responde, inicia:
cd backend
python main.py
```

### Chutes AI no configurado
```bash
# Verifica que .env existe
type .env

# Verifica que tiene la API key
# Debe tener: VITE_CHUTES_API_KEY=tu_key_aqui

# Reinicia el frontend
npm run dev
```

### Error al analizar PPTX
- Verifica que el archivo sea `.pptx` (no `.ppt`)
- Intenta con otra plantilla
- Revisa los logs del backend

**Más soluciones:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎉 Estado del Proyecto

**Versión:** 1.0.0  
**Estado:** ✅ Producción Ready  
**Última actualización:** Enero 2026

### Completado (100%)
- ✅ Backend Python con FastAPI
- ✅ Frontend React con Vite
- ✅ Integración con Chutes AI
- ✅ Análisis de plantillas PPTX
- ✅ Generación con IA
- ✅ Edición en tiempo real
- ✅ Exportación múltiple
- ✅ Colaboración en tiempo real
- ✅ Features avanzadas (historial, assets, temas, voz, analytics)
- ✅ Documentación completa

---

## 📞 Soporte

### Verificación Rápida
```bash
npm run check  # Verifica toda la configuración
```

### Documentación
- 📖 [DOCS-INDEX.md](DOCS-INDEX.md) - Índice completo
- 🚀 [INICIO-RAPIDO.md](INICIO-RAPIDO.md) - Tutorial paso a paso
- 🐛 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solución de problemas

### Recursos
- **Chutes AI:** https://chutes.ai
- **Documentación Chutes:** https://docs.chutes.ai
- **Python-PPTX:** https://python-pptx.readthedocs.io

---

## 📝 Licencia

MIT

---

## 🚀 ¡Empieza Ahora!

```bash
# 1. Configura
copy .env.example .env
# Edita .env y agrega tu VITE_CHUTES_API_KEY

# 2. Instala
cd backend && pip install -r requirements.txt && cd ..
npm install

# 3. Verifica
npm run check

# 4. Inicia
START-APP.bat

# 5. Usa
# Abre http://localhost:5173
```

**¿Necesitas ayuda?** Lee [INICIO-RAPIDO.md](INICIO-RAPIDO.md) 📖

---

**¡Crea presentaciones profesionales con IA en minutos!** 🎉
