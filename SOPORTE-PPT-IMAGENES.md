# 🖼️ Soporte para PPT Construidos 100% con Imágenes

**Fecha:** Enero 11, 2026  
**Estado:** ⚠️ SOPORTE PARCIAL

---

## 📊 SITUACIÓN ACTUAL

### ✅ Lo que SÍ funciona

#### 1. Detección y Extracción de Imágenes
La app **SÍ puede detectar y extraer** imágenes de slides:

```python
# backend/pptx_analyzer.py - línea 165
elif shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
    image_area = extract_image_area(shape)
    slide_data["imageAreas"].append(image_area)
```

**Características:**
- ✅ Detecta todas las imágenes en cada slide
- ✅ Extrae posición exacta (x, y, width, height)
- ✅ Preserva formato original (PNG, JPEG, GIF, SVG)
- ✅ Detecta transparencia en PNG
- ✅ Identifica posibles logos (imágenes < 25% del slide)
- ✅ Convierte a base64 para el frontend
- ✅ Mantiene calidad original

#### 2. Renderizado de Slides
La app genera previews de slides completos:

**Métodos disponibles (en orden de prioridad):**
1. **LibreOffice UNO API** (máxima calidad) ✅
2. **LibreOffice headless** ✅
3. **Renderizador completo** ✅
4. **Placeholder** (fallback)

**Resultado:**
- Los slides se ven correctamente en el viewer
- Las imágenes se muestran en su posición original
- El preview es una captura del slide completo

---

### ⚠️ Lo que NO funciona completamente

#### 1. Extracción de Texto desde Imágenes (OCR)
**Problema:** Si el texto está "quemado" en la imagen (no es texto editable), la app NO puede extraerlo.

**Ejemplo:**
```
Slide con imagen que contiene texto:
┌─────────────────────────┐
│  [IMAGEN]               │
│  "Título en la imagen"  │  ← Este texto NO se extrae
│  "Contenido..."         │  ← Este texto NO se extrae
└─────────────────────────┘
```

**Razón:**
- `pptx_analyzer.py` solo detecta `shape.has_text_frame` (texto editable)
- No hay OCR implementado para extraer texto de imágenes

#### 2. Mapeo de Contenido en Slides de Solo Imágenes
**Problema:** El sistema de mapeo preciso (`textAreas`) no funciona si no hay texto editable.

```python
# backend/pptx_analyzer.py - línea 161
for shape in slide.shapes:
    if shape.has_text_frame:  # ← Solo detecta texto editable
        text_area = extract_text_area(shape)
        slide_data["textAreas"].append(text_area)
```

**Resultado:**
- `textAreas` estará vacío
- No hay áreas editables detectadas
- El usuario no puede editar el contenido con IA

#### 3. Análisis de Diseño con Gemini Vision
**Limitación:** Gemini Vision está configurado para detectar **placeholders** (contenedores), no para hacer OCR.

```javascript
// src/services/geminiVisionService.js
const TEMPLATE_ANALYSIS_PROMPT = `
Identifica todos los contenedores de contenido (placeholders).
Tipos: TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, CHART_AREA
`
```

**No hace:**
- ❌ OCR de texto en imágenes
- ❌ Extracción de contenido textual
- ❌ Reconocimiento de texto "quemado"

---

## 🎯 CASOS DE USO

### Caso 1: PPT con Imágenes Decorativas
**Escenario:** Template corporativo con logo e imágenes de fondo

```
Slide:
- Texto editable: "Título del Proyecto"
- Imagen: Logo corporativo (PNG con transparencia)
- Imagen: Fondo decorativo
```

**Resultado:** ✅ **FUNCIONA PERFECTAMENTE**
- El texto se detecta y es editable
- Las imágenes se preservan
- El mapeo funciona correctamente

---

### Caso 2: PPT con Imágenes que Contienen Texto
**Escenario:** Infografía exportada como imagen

```
Slide:
- Imagen única que contiene:
  * Título: "Ventas 2024"
  * Gráfico de barras
  * Texto: "Crecimiento del 45%"
```

**Resultado:** ⚠️ **FUNCIONA PARCIALMENTE**
- ✅ La imagen se muestra correctamente
- ✅ El preview se ve bien
- ❌ El texto NO es editable
- ❌ No hay áreas de mapeo detectadas
- ❌ La IA no puede modificar el contenido

---

### Caso 3: PPT 100% Imágenes (Capturas de Pantalla)
**Escenario:** Presentación hecha con capturas de pantalla

```
Slide 1: Captura de dashboard
Slide 2: Captura de reporte
Slide 3: Captura de gráfico
```

**Resultado:** ⚠️ **FUNCIONA COMO VISOR**
- ✅ Los slides se muestran correctamente
- ✅ Se puede navegar entre slides
- ✅ Se puede exportar el PPTX
- ❌ NO se puede editar contenido
- ❌ NO hay mapeo de áreas
- ❌ La IA no puede generar contenido

---

## 💡 PROPUESTA DE MEJORA

### Opción 1: OCR con Tesseract (Básico)
**Implementación:** Agregar OCR para extraer texto de imágenes

```python
# backend/ocr_processor.py (NUEVO)
import pytesseract
from PIL import Image

def extract_text_from_image(image_bytes):
    """Extrae texto de una imagen usando OCR"""
    img = Image.open(BytesIO(image_bytes))
    text = pytesseract.image_to_string(img, lang='spa+eng')
    return text
```

**Ventajas:**
- ✅ Gratis y open source
- ✅ Soporta múltiples idiomas
- ✅ Fácil de integrar

**Desventajas:**
- ❌ Precisión limitada (~70-80%)
- ❌ No detecta layout/posiciones
- ❌ Lento para muchas imágenes

---

### Opción 2: Google Cloud Vision API (Avanzado)
**Implementación:** Usar Vision API para OCR + detección de layout

```python
# backend/vision_ocr.py (NUEVO)
from google.cloud import vision

def analyze_image_with_vision(image_bytes):
    """Analiza imagen con Google Cloud Vision"""
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=image_bytes)
    
    # OCR con detección de layout
    response = client.document_text_detection(image=image)
    
    # Extraer texto y posiciones
    text_areas = []
    for page in response.full_text_annotation.pages:
        for block in page.blocks:
            text = ''.join([
                symbol.text 
                for paragraph in block.paragraphs 
                for word in paragraph.words 
                for symbol in word.symbols
            ])
            
            vertices = block.bounding_box.vertices
            text_areas.append({
                'text': text,
                'position': {
                    'x': vertices[0].x,
                    'y': vertices[0].y,
                    'width': vertices[2].x - vertices[0].x,
                    'height': vertices[2].y - vertices[0].y
                }
            })
    
    return text_areas
```

**Ventajas:**
- ✅ Precisión alta (~95%+)
- ✅ Detecta layout y posiciones
- ✅ Soporta múltiples idiomas
- ✅ Detecta tablas, gráficos, etc.

**Desventajas:**
- ❌ Requiere API key de Google Cloud
- ❌ Costo por uso ($1.50 por 1000 imágenes)
- ❌ Requiere configuración adicional

---

### Opción 3: Gemini Vision con OCR (Recomendado)
**Implementación:** Extender el prompt de Gemini para hacer OCR

```javascript
// src/services/geminiVisionService.js
const OCR_ANALYSIS_PROMPT = `
Analiza la imagen adjunta y extrae TODO el texto visible.

Para cada bloque de texto, identifica:
1. El texto exacto
2. Su posición aproximada (top, left, width, height en escala 0-1000)
3. Su tipo (TITLE, SUBTITLE, BODY, FOOTER, LABEL, etc.)
4. Estilo visual (color, tamaño relativo, alineación)

Formato de salida: JSON puro.

{
  "text_blocks": [
    {
      "id": "text_1",
      "text": "Ventas 2024",
      "type": "TITLE",
      "coordinates": {"top": 50, "left": 100, "width": 800, "height": 100},
      "style": {"color": "#2C3E50", "align": "center", "size": "large"}
    }
  ]
}
`
```

**Ventajas:**
- ✅ Ya tenemos Gemini integrado
- ✅ Sin costo adicional (mismo API key)
- ✅ Precisión alta
- ✅ Detecta layout y contexto
- ✅ Entiende el diseño visual

**Desventajas:**
- ❌ Requiere modificar el servicio existente
- ❌ Puede ser más lento que OCR dedicado

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Detección de Slides con Solo Imágenes (1 hora)

```python
# backend/pptx_analyzer.py
def detect_image_only_slide(slide):
    """Detecta si un slide es 100% imágenes"""
    has_text = False
    has_images = False
    
    for shape in slide.shapes:
        if shape.has_text_frame and shape.text.strip():
            has_text = True
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            has_images = True
    
    return has_images and not has_text

# En analyze_presentation()
slide_data["isImageOnly"] = detect_image_only_slide(slide)
```

---

### Fase 2: OCR con Gemini Vision (2 horas)

```python
# backend/gemini_ocr.py (NUEVO)
import requests
import base64

def extract_text_from_image_with_gemini(image_bytes, api_key):
    """Extrae texto de imagen usando Gemini Vision"""
    
    # Convertir imagen a base64
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    # Prompt para OCR
    prompt = """
    Analiza esta imagen y extrae TODO el texto visible.
    
    Para cada bloque de texto, devuelve:
    - text: El texto exacto
    - type: TITLE, SUBTITLE, BODY, FOOTER, LABEL
    - coordinates: {top, left, width, height} en escala 0-1000
    - style: {color, align, size}
    
    Formato: JSON puro, sin explicaciones.
    """
    
    # Llamar a Gemini Vision API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": img_base64
                    }
                }
            ]
        }]
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    # Parsear respuesta
    text_content = result['candidates'][0]['content']['parts'][0]['text']
    
    # Extraer JSON
    import json
    import re
    json_match = re.search(r'\{.*\}', text_content, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    
    return {"text_blocks": []}
```

---

### Fase 3: Integración en Analyzer (1 hora)

```python
# backend/pptx_analyzer.py
def analyze_presentation(pptx_path: str, enable_ocr: bool = True) -> Dict[str, Any]:
    """
    Analiza un archivo PowerPoint
    Si enable_ocr=True, extrae texto de imágenes
    """
    prs = Presentation(pptx_path)
    
    # ... código existente ...
    
    for slide_idx, slide in enumerate(prs.slides):
        slide_data = {
            # ... datos existentes ...
            "isImageOnly": False,
            "ocrTextAreas": []  # Nuevo: áreas de texto extraídas por OCR
        }
        
        # Detectar si es slide de solo imágenes
        is_image_only = detect_image_only_slide(slide)
        slide_data["isImageOnly"] = is_image_only
        
        # Si es solo imágenes y OCR está habilitado
        if is_image_only and enable_ocr and slide_images[slide_idx]:
            print(f"🔍 Slide {slide_idx + 1} es solo imágenes, aplicando OCR...")
            
            # Extraer texto con Gemini Vision
            image_base64 = slide_images[slide_idx]
            image_bytes = base64.b64decode(image_base64.split(',')[1])
            
            ocr_result = extract_text_from_image_with_gemini(
                image_bytes, 
                os.getenv('GEMINI_API_KEY')
            )
            
            # Agregar áreas de texto detectadas por OCR
            slide_data["ocrTextAreas"] = ocr_result.get("text_blocks", [])
            print(f"✅ Extraídos {len(slide_data['ocrTextAreas'])} bloques de texto")
        
        analysis["slides"].append(slide_data)
    
    return analysis
```

---

### Fase 4: UI para Slides de Solo Imágenes (2 horas)

```jsx
// src/components/ImageOnlySlideEditor.jsx (NUEVO)
function ImageOnlySlideEditor({ slide, onTextUpdate }) {
  const [ocrAreas, setOcrAreas] = useState(slide.ocrTextAreas || [])
  
  return (
    <div className="image-only-editor">
      <div className="editor-header">
        <span className="material-icons">image</span>
        <h3>Slide con Imagen</h3>
        <span className="badge">OCR Detectado</span>
      </div>
      
      {/* Preview de la imagen */}
      <div className="image-preview">
        <img src={slide.preview} alt="Slide" />
        
        {/* Overlays de texto detectado */}
        {ocrAreas.map((area, idx) => (
          <div
            key={idx}
            className="ocr-text-overlay"
            style={{
              left: `${area.coordinates.left / 10}%`,
              top: `${area.coordinates.top / 10}%`,
              width: `${area.coordinates.width / 10}%`,
              height: `${area.coordinates.height / 10}%`
            }}
          >
            <textarea
              value={area.text}
              onChange={(e) => {
                const newAreas = [...ocrAreas]
                newAreas[idx].text = e.target.value
                setOcrAreas(newAreas)
                onTextUpdate(newAreas)
              }}
              className="ocr-text-input"
            />
          </div>
        ))}
      </div>
      
      <div className="editor-info">
        <p>💡 Texto extraído automáticamente con OCR</p>
        <p>Puedes editar el texto y regenerar la imagen con IA</p>
      </div>
    </div>
  )
}
```

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | Tesseract | Google Vision | Gemini Vision |
|----------------|-----------|---------------|---------------|
| **Precisión** | 70-80% | 95%+ | 90-95% |
| **Costo** | Gratis | $1.50/1000 | Incluido |
| **Velocidad** | Lento | Rápido | Medio |
| **Layout Detection** | No | Sí | Sí |
| **Idiomas** | Sí | Sí | Sí |
| **Integración** | Media | Alta | Baja |
| **Configuración** | Fácil | Media | Fácil |

**Recomendación:** **Gemini Vision** (ya está integrado, sin costo adicional)

---

## ✅ RESUMEN

### Estado Actual
- ✅ La app **SÍ detecta y muestra** slides con imágenes
- ✅ Los previews se ven correctamente
- ⚠️ El texto "quemado" en imágenes **NO es editable**
- ❌ No hay OCR implementado

### Solución Propuesta
1. Detectar slides de solo imágenes
2. Aplicar OCR con Gemini Vision
3. Extraer texto y posiciones
4. Permitir edición del texto detectado
5. Regenerar imagen con IA (opcional)

### Tiempo de Implementación
- **Total: 6 horas**
  - Fase 1: 1 hora
  - Fase 2: 2 horas
  - Fase 3: 1 hora
  - Fase 4: 2 horas

### Beneficios
- ✅ Soporte completo para PPT de solo imágenes
- ✅ Texto editable extraído por OCR
- ✅ Sin costo adicional (usa Gemini existente)
- ✅ Mejora significativa de UX

---

## 🎯 CONCLUSIÓN

**Respuesta corta:** La app **SÍ puede reconocer** PPT construidos 100% con imágenes, pero **NO puede extraer el texto** que está "quemado" en las imágenes.

**Solución:** Implementar OCR con Gemini Vision (6 horas de desarrollo) para extraer y hacer editable el texto de las imágenes.

¿Quieres que implemente esta funcionalidad? 🚀
