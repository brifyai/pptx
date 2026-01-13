# ✅ Checklist: Arreglar el Chat

## 🎯 Objetivo
Hacer que el chat **realmente haga** lo que dice hacer.

---

## 🔴 CRÍTICO (Hacer Primero)

### 1. Búsqueda Web Real
- [ ] **Backend**: Crear `backend/routes/search.py`
- [ ] **Backend**: Instalar `duckduckgo-search`
- [ ] **Backend**: Implementar endpoint `/api/search`
- [ ] **Frontend**: Modificar `webSearchService.js`
- [ ] **Frontend**: Conectar con backend
- [ ] **Testing**: Probar comando `/buscar`
- [ ] **Testing**: Probar detección automática de búsqueda

**Archivos a modificar**:
- `backend/routes/search.py` (nuevo)
- `backend/main.py` (agregar router)
- `src/services/webSearchService.js`

**Tiempo estimado**: 4-6 horas

---

### 2. Historial Contextual
- [ ] **aiService**: Eliminar `conversationHistory = []` en init
- [ ] **aiService**: Agregar función `clearConversationHistory()`
- [ ] **aiService**: Pasar historial a `callChutesAI()`
- [ ] **aiService**: Mantener últimos 20 mensajes
- [ ] **ChatPanel**: Agregar botón "Limpiar historial"
- [ ] **ChatPanel**: Mostrar contador de mensajes
- [ ] **Testing**: Verificar que IA recuerda mensajes

**Archivos a modificar**:
- `src/services/aiService.js`
- `src/components/ChatPanel.jsx`

**Tiempo estimado**: 3-4 horas

---

### 3. Conectar Funciones Avanzadas
- [ ] **ChatPanel**: Agregar comando `/variantes`
- [ ] **ChatPanel**: Agregar comando `/sugerencias`
- [ ] **ChatPanel**: Agregar comando `/estructurar`
- [ ] **ChatPanel**: Crear modal para variantes
- [ ] **ChatPanel**: Crear modal para sugerencias
- [ ] **ChatPanel**: Crear modal para contenido estructurado
- [ ] **Testing**: Probar cada comando

**Archivos a modificar**:
- `src/components/ChatPanel.jsx`
- `src/styles/ChatPanel.css`

**Tiempo estimado**: 3-4 horas

---

## 🟡 IMPORTANTE (Hacer Después)

### 4. Arreglar Modo Sticky
- [ ] **ChatPanel**: Agregar estado `stickyMode`
- [ ] **ChatPanel**: Agregar checkbox "Mantener modo"
- [ ] **ChatPanel**: Modificar `finally` para respetar sticky
- [ ] **ChatPanel**: Agregar tooltip explicativo
- [ ] **CSS**: Estilos para checkbox
- [ ] **Testing**: Verificar que modo se mantiene

**Archivos a modificar**:
- `src/components/ChatPanel.jsx`
- `src/styles/ChatPanel.css`

**Tiempo estimado**: 1-2 horas

---

### 5. Validación Inteligente
- [ ] **aiService**: Crear función `smartTruncate()`
- [ ] **aiService**: Usar IA para acortar contenido
- [ ] **aiService**: Agregar warnings cuando se ajusta
- [ ] **ChatPanel**: Mostrar notificación de ajuste
- [ ] **Testing**: Probar con contenido largo

**Archivos a modificar**:
- `src/services/aiService.js`
- `src/components/ChatPanel.jsx`

**Tiempo estimado**: 2-3 horas

---

### 6. Mejorar Detección de Intención
- [ ] **aiService**: Crear función `detectUserIntent()`
- [ ] **aiService**: Usar IA para detectar intención
- [ ] **ChatPanel**: Mostrar confirmación antes de ejecutar
- [ ] **ChatPanel**: Agregar sugerencias de acción
- [ ] **Testing**: Probar con diferentes mensajes

**Archivos a modificar**:
- `src/services/aiService.js`
- `src/components/ChatPanel.jsx`

**Tiempo estimado**: 3-4 horas

---

## 🟢 MEJORAS (Hacer Al Final)

### 7. Preview con Diff
- [ ] **ChatPanel**: Crear componente `ContentDiff`
- [ ] **ChatPanel**: Mostrar antes/después lado a lado
- [ ] **ChatPanel**: Resaltar cambios
- [ ] **CSS**: Estilos para comparación
- [ ] **Testing**: Verificar visualización

**Archivos a modificar**:
- `src/components/ChatPanel.jsx`
- `src/styles/ChatPanel.css`

**Tiempo estimado**: 2-3 horas

---

### 8. Comandos Adicionales
- [ ] **ChatPanel**: Agregar `/traducir [idioma]`
- [ ] **ChatPanel**: Agregar `/tono [formal|casual]`
- [ ] **ChatPanel**: Agregar `/resumir`
- [ ] **ChatPanel**: Agregar `/expandir`
- [ ] **ChatPanel**: Agregar autocompletado
- [ ] **Testing**: Probar cada comando

**Archivos a modificar**:
- `src/components/ChatPanel.jsx`
- `src/services/aiService.js`

**Tiempo estimado**: 4-5 horas

---

### 9. Progress Bar Real
- [ ] **ChatPanel**: Agregar estado `progress`
- [ ] **ChatPanel**: Actualizar progreso durante generación
- [ ] **ChatPanel**: Mostrar slide actual procesando
- [ ] **ChatPanel**: Agregar botón cancelar
- [ ] **CSS**: Estilos para progress bar
- [ ] **Testing**: Verificar actualización en tiempo real

**Archivos a modificar**:
- `src/components/ChatPanel.jsx`
- `src/services/aiService.js`
- `src/styles/ChatPanel.css`

**Tiempo estimado**: 2-3 horas

---

### 10. Tooltips y Ayuda
- [ ] **ChatPanel**: Agregar tooltips a botones de modo
- [ ] **ChatPanel**: Agregar ayuda contextual
- [ ] **ChatPanel**: Agregar ejemplos de uso
- [ ] **ChatPanel**: Agregar shortcuts de teclado
- [ ] **CSS**: Estilos para tooltips
- [ ] **Testing**: Verificar que se muestran correctamente

**Archivos a modificar**:
- `src/components/ChatPanel.jsx`
- `src/styles/ChatPanel.css`

**Tiempo estimado**: 2-3 horas

---

## 📊 PROGRESO GENERAL

### Fase 1: Crítico (10-14 horas)
- [ ] Búsqueda web real (4-6h)
- [ ] Historial contextual (3-4h)
- [ ] Funciones avanzadas (3-4h)

### Fase 2: Importante (6-10 horas)
- [ ] Modo sticky (1-2h)
- [ ] Validación inteligente (2-3h)
- [ ] Detección de intención (3-4h)

### Fase 3: Mejoras (10-14 horas)
- [ ] Preview con diff (2-3h)
- [ ] Comandos adicionales (4-5h)
- [ ] Progress bar (2-3h)
- [ ] Tooltips (2-3h)

**Total estimado**: 26-38 horas (3-5 días de trabajo)

---

## 🔧 CÓDIGO RÁPIDO DE REFERENCIA

### Búsqueda Web (Backend)
```python
# backend/routes/search.py
from fastapi import APIRouter
from duckduckgo_search import DDGS

router = APIRouter()

@router.post("/api/search")
async def search_web(query: str):
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=5))
    return {'results': results}
```

### Búsqueda Web (Frontend)
```javascript
// src/services/webSearchService.js
export async function searchWebReal(query) {
  const response = await fetch('http://localhost:8000/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  return await response.json()
}
```

### Historial Contextual
```javascript
// src/services/aiService.js
export function initializePresentationContext(slides, templateAnalysis) {
  // NO limpiar historial
  if (conversationHistory.length === 0) {
    conversationHistory.push({
      role: 'system',
      content: `Presentación con ${slides.length} slides`
    })
  }
}

export function clearConversationHistory() {
  conversationHistory = []
}
```

### Modo Sticky
```javascript
// src/components/ChatPanel.jsx
const [stickyMode, setStickyMode] = useState(false)

finally {
  setIsTyping(false)
  setAiStatus(null)
  if (!stickyMode) {
    setMode('chat')
  }
}
```

### Comando Variantes
```javascript
// src/components/ChatPanel.jsx
case 'variantes':
  const variants = await generateContentVariants(
    slides[currentSlide].content,
    parseInt(args) || 3
  )
  setShowVariantsModal(true)
  setVariantsData(variants)
  break
```

---

## 🎯 ORDEN RECOMENDADO

### Día 1 (8 horas)
1. ✅ Búsqueda web backend (3h)
2. ✅ Búsqueda web frontend (2h)
3. ✅ Historial contextual (3h)

### Día 2 (8 horas)
4. ✅ Conectar funciones avanzadas (4h)
5. ✅ Modo sticky (2h)
6. ✅ Validación inteligente (2h)

### Día 3 (8 horas)
7. ✅ Detección de intención (4h)
8. ✅ Preview con diff (3h)
9. ✅ Testing general (1h)

### Día 4 (Opcional - 8 horas)
10. ✅ Comandos adicionales (4h)
11. ✅ Progress bar (2h)
12. ✅ Tooltips (2h)

---

## ✅ TESTING CHECKLIST

### Búsqueda Web
- [ ] Comando `/buscar` funciona
- [ ] Detección automática funciona
- [ ] Resultados se muestran correctamente
- [ ] URLs se extraen del contenido
- [ ] Manejo de errores funciona

### Historial
- [ ] IA recuerda mensajes anteriores
- [ ] Referencias "como antes" funcionan
- [ ] Botón limpiar historial funciona
- [ ] Límite de 20 mensajes se respeta
- [ ] Historial persiste entre slides

### Funciones Avanzadas
- [ ] `/variantes` genera alternativas
- [ ] `/sugerencias` analiza contenido
- [ ] `/estructurar` organiza texto
- [ ] Modales se muestran correctamente
- [ ] Aplicar cambios funciona

### Modo Sticky
- [ ] Checkbox funciona
- [ ] Modo se mantiene cuando sticky=true
- [ ] Modo se resetea cuando sticky=false
- [ ] Tooltip explica funcionalidad
- [ ] Estado persiste entre mensajes

### Validación
- [ ] Contenido largo se ajusta
- [ ] IA re-genera en vez de truncar
- [ ] Warning se muestra al usuario
- [ ] Contenido ajustado es coherente
- [ ] Límites se respetan

---

## 📝 NOTAS IMPORTANTES

### Dependencias Nuevas
```bash
# Backend
pip install duckduckgo-search

# Frontend
# (No se necesitan nuevas dependencias)
```

### Variables de Entorno (Opcional)
```bash
# .env
GOOGLE_SEARCH_API_KEY=tu_api_key  # Opcional
GOOGLE_SEARCH_CX=tu_cx_id         # Opcional
```

### Archivos Nuevos a Crear
- `backend/routes/search.py`

### Archivos a Modificar
- `backend/main.py`
- `src/services/aiService.js`
- `src/services/webSearchService.js`
- `src/components/ChatPanel.jsx`
- `src/styles/ChatPanel.css`

---

## 🚀 EMPEZAR AHORA

### Paso 1: Crear rama
```bash
git checkout -b fix/chat-improvements
```

### Paso 2: Instalar dependencias
```bash
cd backend
pip install duckduckgo-search
```

### Paso 3: Crear archivo de búsqueda
```bash
# Crear backend/routes/search.py con el código de arriba
```

### Paso 4: Modificar main.py
```python
# backend/main.py
from routes import search

app.include_router(search.router)
```

### Paso 5: Testing
```bash
# Terminal 1
cd backend
python main.py

# Terminal 2
cd frontend
npm run dev

# Probar en el chat:
/buscar tendencias IA 2026
```

---

## 📚 DOCUMENTOS RELACIONADOS

- `RESUMEN-GAPS-CHAT.md` - Resumen ejecutivo
- `ANALISIS-MEJORAS-CHAT.md` - Análisis detallado
- `PLAN-MEJORAS-CHAT-INMEDIATAS.md` - Plan con código
- `EJEMPLOS-PROBLEMAS-CHAT.md` - Ejemplos visuales

---

## ✅ COMPLETADO

Marca aquí cuando termines cada fase:

- [ ] **Fase 1 Completa** (Crítico)
- [ ] **Fase 2 Completa** (Importante)
- [ ] **Fase 3 Completa** (Mejoras)
- [ ] **Testing Completo**
- [ ] **Documentación Actualizada**
- [ ] **PR Creado**
- [ ] **Merge a Main**

