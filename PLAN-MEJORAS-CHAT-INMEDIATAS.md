# Plan de Mejoras Inmediatas para el Chat

## 🎯 Objetivo
Implementar las mejoras más críticas en **1-2 semanas** para que el chat haga realmente lo que promete.

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Fase 1A: Arreglos Rápidos (1-2 días)

- [ ] **1. Arreglar reset de modo**
  - Archivo: `src/components/ChatPanel.jsx`
  - Cambio: No resetear modo a 'chat' automáticamente
  - Tiempo: 30 min

- [ ] **2. Conectar funciones avanzadas existentes**
  - Archivos: `ChatPanel.jsx`, `aiService.js`
  - Agregar comandos: `/variantes`, `/sugerencias`, `/estructurar`
  - Tiempo: 2 horas

- [ ] **3. Mejorar mensajes de error**
  - Archivo: `ChatPanel.jsx`
  - Ser honesto sobre limitaciones
  - Tiempo: 1 hora

- [ ] **4. Agregar tooltips explicativos**
  - Archivo: `ChatPanel.jsx`, `ChatPanel.css`
  - Explicar qué hace cada modo
  - Tiempo: 1 hora

### ✅ Fase 1B: Historial Contextual (2-3 días)

- [ ] **5. Implementar historial persistente**
  - Archivo: `src/services/aiService.js`
  - Mantener contexto entre mensajes
  - Tiempo: 4 horas

- [ ] **6. Pasar historial a la IA**
  - Archivo: `aiService.js`
  - Incluir últimos 10 mensajes en llamadas
  - Tiempo: 2 horas

- [ ] **7. Agregar botón "Limpiar historial"**
  - Archivo: `ChatPanel.jsx`
  - Permitir resetear conversación
  - Tiempo: 1 hora

### ✅ Fase 1C: Búsqueda Web Real (3-5 días)

- [ ] **8. Backend: Endpoint de búsqueda**
  - Archivo: `backend/routes/search.py` (nuevo)
  - Implementar búsqueda con API o scraping
  - Tiempo: 6 horas

- [ ] **9. Frontend: Integrar búsqueda**
  - Archivo: `src/services/webSearchService.js`
  - Conectar con backend
  - Tiempo: 2 horas

- [ ] **10. Agregar indicador de búsqueda**
  - Archivo: `ChatPanel.jsx`
  - Mostrar "Buscando en web..."
  - Tiempo: 1 hora

### ✅ Fase 1D: Mejoras UX (2-3 días)

- [ ] **11. Preview con diff**
  - Archivo: `ChatPanel.jsx`
  - Mostrar antes/después
  - Tiempo: 4 horas

- [ ] **12. Validación inteligente**
  - Archivo: `aiService.js`
  - Re-generar en vez de truncar
  - Tiempo: 3 horas

- [ ] **13. Progress bar real**
  - Archivo: `ChatPanel.jsx`
  - Mostrar progreso de generación
  - Tiempo: 2 horas

---

## 🔧 CÓDIGO LISTO PARA IMPLEMENTAR

### 1. Arreglar Reset de Modo

```javascript
// src/components/ChatPanel.jsx

// ❌ ANTES:
finally {
  setIsTyping(false)
  setAiStatus(null)
  setMode('chat') // Siempre resetea
}

// ✅ DESPUÉS:
finally {
  setIsTyping(false)
  setAiStatus(null)
  // Solo resetear si no es modo sticky
  if (!stickyMode) {
    setMode('chat')
  }
}

// Agregar toggle de modo sticky
const [stickyMode, setStickyMode] = useState(false)

// En el UI:
<div className="mode-options">
  <label>
    <input 
      type="checkbox" 
      checked={stickyMode}
      onChange={(e) => setStickyMode(e.target.checked)}
    />
    Mantener modo activo
  </label>
</div>
```

### 2. Conectar Funciones Avanzadas

```javascript
// src/components/ChatPanel.jsx

// Agregar en handleCommand():
case 'variantes':
  const numVariants = parseInt(args) || 3
  setIsTyping(true)
  try {
    const variants = await generateContentVariants(
      slides[currentSlide].content,
      numVariants
    )
    setShowVariantsModal(true)
    setVariantsData(variants)
    onMessage(`/variantes ${args}`, 
      `He generado ${variants.length} variantes del contenido actual.`)
  } catch (error) {
    onMessage(`/variantes ${args}`, 
      'Error generando variantes. Intenta de nuevo.')
  } finally {
    setIsTyping(false)
  }
  setInput('')
  break

case 'sugerencias':
case 'mejorar':
  setIsTyping(true)
  try {
    const suggestions = await suggestContentImprovements(
      slides[currentSlide].content
    )
    setShowSuggestionsModal(true)
    setSuggestionsData(suggestions)
    onMessage(`/${command}`, 
      `He analizado el contenido. Puntuación: ${suggestions.overallScore}/10`)
  } catch (error) {
    onMessage(`/${command}`, 
      'Error analizando contenido. Intenta de nuevo.')
  } finally {
    setIsTyping(false)
  }
  setInput('')
  break

case 'estructurar':
  if (!args) {
    onMessage(`/${command}`, 
      'Uso: /estructurar [texto largo a estructurar]')
    setInput('')
    return
  }
  setIsTyping(true)
  try {
    const structured = await structureTextToSlides(args, slides.length)
    setShowStructuredPreview(true)
    setStructuredData(structured)
    onMessage(`/estructurar`, 
      `He estructurado el texto en ${structured.length} slides.`)
  } catch (error) {
    onMessage(`/estructurar`, 
      'Error estructurando texto. Intenta de nuevo.')
  } finally {
    setIsTyping(false)
  }
  setInput('')
  break
```

### 3. Historial Contextual

```javascript
// src/services/aiService.js

// ❌ ANTES:
let conversationHistory = []

export function initializePresentationContext(slides, templateAnalysis) {
  conversationHistory = [] // Se limpia siempre
}

// ✅ DESPUÉS:
let conversationHistory = []
const MAX_HISTORY = 20 // Mantener últimos 20 mensajes

export function initializePresentationContext(slides, templateAnalysis) {
  // NO limpiar historial automáticamente
  // Solo agregar contexto inicial si está vacío
  if (conversationHistory.length === 0) {
    conversationHistory.push({
      role: 'system',
      content: `Presentación inicializada con ${slides.length} slides`,
      timestamp: Date.now()
    })
  }
}

export function clearConversationHistory() {
  conversationHistory = []
  console.log('🗑️ Historial de conversación limpiado')
}

export function getConversationHistory() {
  return [...conversationHistory]
}

export async function generateAIResponse(userMessage, currentSlide, allSlides = []) {
  try {
    const slideIndex = allSlides.indexOf(currentSlide)
    
    // Agregar mensaje del usuario al historial
    conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      context: {
        slideIndex,
        slideType: currentSlide?.type,
        totalSlides: allSlides.length
      }
    })
    
    // Mantener solo últimos MAX_HISTORY mensajes
    if (conversationHistory.length > MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY)
    }
    
    // Detectar si necesita búsqueda web
    const needsWebSearch = detectWebSearchIntent(userMessage)
    let webContext = ''
    
    if (needsWebSearch) {
      console.log('🌐 Detectada necesidad de búsqueda web...')
      webContext = await performWebSearch(userMessage)
    }
    
    const slideInfo = `Slide ${slideIndex + 1} de ${allSlides.length}, tipo: ${currentSlide?.type || 'content'}`
    
    const systemPrompt = `Eres un asistente de IA para crear presentaciones profesionales.
${slideInfo}

Contenido actual: ${JSON.stringify(currentSlide?.content || {})}

${webContext ? `INFORMACIÓN DE INTERNET:\n${webContext}\n\n` : ''}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory.slice(-5).map(h => 
  `${h.role}: ${h.content.substring(0, 100)}...`
).join('\n')}

REGLAS:
1. Usa el historial para mantener contexto
2. Si el usuario dice "como antes" o "lo mismo", referencia mensajes anteriores
3. Si pide editar/mejorar: genera contenido mejorado
4. Si hace pregunta general: responde normalmente

FORMATO DE RESPUESTA:
{"message": "tu respuesta", "updates": {...} o null}`

    // Pasar últimos 10 mensajes a la IA
    const recentMessages = conversationHistory.slice(-10).map(h => ({
      role: h.role === 'system' ? 'user' : h.role,
      content: h.content
    }))
    
    recentMessages.push({ role: 'user', content: userMessage })

    const aiContent = await callChutesAI(recentMessages, { 
      systemPrompt, 
      maxTokens: 2000 
    })
    
    console.log('📄 Respuesta de IA:', aiContent)
    
    // Agregar respuesta al historial
    conversationHistory.push({
      role: 'assistant',
      content: aiContent,
      timestamp: Date.now()
    })
    
    // Parsear respuesta...
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const cleanJson = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F]/g, '')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
        
        const parsed = JSON.parse(cleanJson)
        return {
          message: parsed.message || aiContent,
          updates: parsed.updates || null,
          slideUpdates: parsed.updates ? [{ 
            slideIndex: allSlides.indexOf(currentSlide), 
            content: parsed.updates 
          }] : null
        }
      }
    } catch (e) {
      console.warn('⚠️ No se pudo parsear JSON:', e.message)
    }

    return { message: aiContent, updates: null, slideUpdates: null }

  } catch (error) {
    console.error('Error en IA:', error)
    return handleFallback(userMessage, currentSlide)
  }
}
```

### 4. Búsqueda Web Real (Backend)

```python
# backend/routes/search.py (NUEVO ARCHIVO)

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import os
from typing import List, Optional

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    num_results: Optional[int] = 5

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    content: str

@router.post("/api/search", response_model=dict)
async def search_web(request: SearchRequest):
    """
    Búsqueda web real usando Google Custom Search API
    o DuckDuckGo como fallback
    """
    try:
        # Opción 1: Google Custom Search (requiere API key)
        google_api_key = os.getenv('GOOGLE_SEARCH_API_KEY')
        google_cx = os.getenv('GOOGLE_SEARCH_CX')
        
        if google_api_key and google_cx:
            results = search_google(request.query, google_api_key, google_cx, request.num_results)
        else:
            # Opción 2: DuckDuckGo (sin API key)
            results = search_duckduckgo(request.query, request.num_results)
        
        # Enriquecer resultados con contenido
        enriched_results = []
        for result in results:
            content = fetch_page_content(result['url'])
            enriched_results.append({
                'title': result['title'],
                'url': result['url'],
                'snippet': result['snippet'],
                'content': content[:2000]  # Primeros 2000 chars
            })
        
        return {
            'query': request.query,
            'results': enriched_results,
            'count': len(enriched_results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def search_google(query: str, api_key: str, cx: str, num: int) -> List[dict]:
    """Búsqueda usando Google Custom Search API"""
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        'key': api_key,
        'cx': cx,
        'q': query,
        'num': num
    }
    
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    
    results = []
    for item in data.get('items', []):
        results.append({
            'title': item.get('title', ''),
            'url': item.get('link', ''),
            'snippet': item.get('snippet', '')
        })
    
    return results

def search_duckduckgo(query: str, num: int) -> List[dict]:
    """Búsqueda usando DuckDuckGo (sin API key)"""
    from duckduckgo_search import DDGS
    
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=num):
            results.append({
                'title': r.get('title', ''),
                'url': r.get('href', ''),
                'snippet': r.get('body', '')
            })
    
    return results

def fetch_page_content(url: str) -> str:
    """Extraer contenido de una página web"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remover elementos no deseados
        for element in soup(['script', 'style', 'nav', 'footer', 'header']):
            element.decompose()
        
        # Extraer texto
        text = soup.get_text(separator=' ', strip=True)
        
        # Limpiar espacios múltiples
        text = ' '.join(text.split())
        
        return text
        
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

# Agregar router al main.py
# from routes import search
# app.include_router(search.router)
```

```bash
# Instalar dependencias
pip install duckduckgo-search beautifulsoup4
```

### 5. Búsqueda Web Real (Frontend)

```javascript
// src/services/webSearchService.js

// Agregar función de búsqueda real
export async function searchWebReal(query, numResults = 5) {
  try {
    console.log('🔍 Realizando búsqueda web real:', query)
    
    const response = await fetch('http://localhost:8000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        num_results: numResults
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Resultados de búsqueda:', data.count)
    
    return {
      query: data.query,
      results: data.results,
      content: formatSearchResultsDetailed(data.results),
      count: data.count
    }
    
  } catch (error) {
    console.error('❌ Error en búsqueda web:', error)
    return {
      error: true,
      message: 'No se pudo realizar la búsqueda web',
      query: query
    }
  }
}

function formatSearchResultsDetailed(results) {
  if (!results || results.length === 0) {
    return 'No se encontraron resultados.'
  }
  
  let formatted = `
═══════════════════════════════════════════════════
RESULTADOS DE BÚSQUEDA WEB (${results.length})
═══════════════════════════════════════════════════\n\n`
  
  results.forEach((result, index) => {
    formatted += `${index + 1}. ${result.title}\n`
    formatted += `   URL: ${result.url}\n`
    formatted += `   ${result.snippet}\n\n`
    
    if (result.content) {
      formatted += `   CONTENIDO:\n`
      formatted += `   ${result.content.substring(0, 500)}...\n\n`
    }
    
    formatted += `───────────────────────────────────────────────────\n\n`
  })
  
  return formatted
}

// Modificar searchWeb para usar búsqueda real
export async function searchWeb(query) {
  try {
    console.log('🔍 Buscando en web:', query)
    
    // Extraer URL si existe
    const urlMatch = query.match(/https?:\/\/[^\s]+/)
    
    if (urlMatch) {
      const url = urlMatch[0]
      console.log('🌐 URL detectada:', url)
      
      if (isSocialMediaUrl(url)) {
        console.log('📱 URL de red social detectada')
        return await analyzeSocialMedia(url)
      }
      
      return await fetchWebsite(url)
    }
    
    // Buscar dominio sin protocolo
    const domainMatch = query.match(/([a-zA-Z0-9-]+\.(com|net|org|io|ai|co|es|mx)[^\s]*)/i)
    
    if (domainMatch) {
      const url = `https://${domainMatch[0]}`
      console.log('🌐 Dominio detectado:', url)
      
      if (isSocialMediaUrl(url)) {
        return await analyzeSocialMedia(url)
      }
      
      return await fetchWebsite(url)
    }
    
    // Si no hay URL, hacer búsqueda web REAL
    console.log('🔎 Realizando búsqueda web real...')
    return await searchWebReal(query)
    
  } catch (error) {
    console.error('❌ Error en búsqueda web:', error)
    return {
      error: true,
      message: 'No se pudo obtener información de la web',
      query: query
    }
  }
}
```

### 6. Preview con Diff

```javascript
// src/components/ChatPanel.jsx

// Agregar componente de comparación
function ContentDiff({ before, after, field }) {
  const hasChanged = before !== after
  
  return (
    <div className={`content-diff ${hasChanged ? 'changed' : ''}`}>
      <div className="diff-field">
        <label>{field}:</label>
      </div>
      
      {hasChanged ? (
        <div className="diff-comparison">
          <div className="diff-before">
            <span className="diff-label">Antes:</span>
            <p>{before || '(vacío)'}</p>
          </div>
          <div className="diff-arrow">
            <span className="material-icons">arrow_forward</span>
          </div>
          <div className="diff-after">
            <span className="diff-label">Después:</span>
            <p>{after}</p>
          </div>
        </div>
      ) : (
        <div className="diff-unchanged">
          <p>{after}</p>
          <span className="unchanged-badge">Sin cambios</span>
        </div>
      )}
    </div>
  )
}

// Usar en preview modal
{previewChanges.type === 'slide' && (
  <div className="change-item">
    <div className="change-header">
      <span className="material-icons">edit</span>
      <strong>Lámina {previewChanges.slideIndex + 1}</strong>
    </div>
    <div className="change-details">
      {previewChanges.updates.title && (
        <ContentDiff
          before={slides[previewChanges.slideIndex].content.title}
          after={previewChanges.updates.title}
          field="Título"
        />
      )}
      {previewChanges.updates.subtitle && (
        <ContentDiff
          before={slides[previewChanges.slideIndex].content.subtitle}
          after={previewChanges.updates.subtitle}
          field="Subtítulo"
        />
      )}
      {/* ... más campos ... */}
    </div>
  </div>
)}
```

```css
/* src/styles/ChatPanel.css */

.content-diff {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--bg-light, #f9fafb);
  border-radius: 8px;
}

.content-diff.changed {
  border-left: 3px solid var(--primary, #667eea);
}

.diff-field label {
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin-bottom: 0.5rem;
  display: block;
}

.diff-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
}

.diff-before,
.diff-after {
  padding: 0.75rem;
  border-radius: 6px;
}

.diff-before {
  background: #fee;
  border: 1px solid #fcc;
}

.diff-after {
  background: #efe;
  border: 1px solid #cfc;
}

.diff-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.25rem;
}

.diff-arrow {
  color: var(--text-secondary, #6b7280);
}

.diff-unchanged {
  padding: 0.75rem;
  background: var(--bg-secondary, #f3f4f6);
  border-radius: 6px;
  position: relative;
}

.unchanged-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: var(--text-secondary, #6b7280);
  color: white;
  border-radius: 4px;
}
```

---

## 📊 MÉTRICAS DE ÉXITO

Después de implementar estas mejoras, el chat debería:

1. ✅ **Búsqueda web funcional**
   - Comando `/buscar` funciona
   - Detecta automáticamente necesidad de búsqueda
   - Muestra resultados relevantes

2. ✅ **Contexto mantenido**
   - IA recuerda mensajes anteriores
   - Puede hacer referencias ("como antes")
   - Historial visible para el usuario

3. ✅ **Funciones avanzadas accesibles**
   - `/variantes` genera alternativas
   - `/sugerencias` analiza contenido
   - `/estructurar` organiza texto

4. ✅ **UX mejorada**
   - Preview muestra diff claro
   - Progress bars reales
   - Mensajes honestos sobre limitaciones

5. ✅ **Modo sticky**
   - Usuario puede mantener modo activo
   - No se resetea automáticamente
   - Feedback visual claro

---

## 🚀 SIGUIENTE PASO

**Empezar con Fase 1A** (arreglos rápidos de 1-2 días):
1. Arreglar reset de modo
2. Conectar funciones avanzadas
3. Mejorar mensajes
4. Agregar tooltips

Esto dará resultados visibles inmediatos y mejorará la experiencia del usuario significativamente.

