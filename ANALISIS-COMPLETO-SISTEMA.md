# Análisis Completo del Sistema Slide AI

## 1. ARQUITECTURA GENERAL

### 1.1 Stack Tecnológico
- **Frontend**: React + Vite + PptxGenJS
- **Backend**: FastAPI (Python) + python-pptx
- **Renderizado**: LibreOffice UNO API (fallback: python-pptx nativo)
- **Base de datos**: SQLite (presentations.db)

### 1.2 Flujo de Datos Principal

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   Archivos      │
│   (React)       │     │   (FastAPI)     │     │   (.pptx)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│   Export        │     │   Análisis      │
│   Service       │◀────│   (pptx_analyzer│
└─────────────────┘     └─────────────────┘
```

---

## 2. MÓDULO DE ANÁLISIS (pptx_analyzer.py)

### 2.1 Función Principal: `analyze_presentation(pptx_path)`

**Propósito**: Analiza un archivo PowerPoint y extrae toda su estructura de diseño.

**Proceso**:
1. Genera previews de slides (prioridad: UNO API > LibreOffice > Full Renderer > Placeholder)
2. Extrae todos los assets (imágenes, logos, elementos animados)
3. Analiza cada slide extrayendo textAreas, imageAreas y shapes

**Salida**:
```python
{
    "fileName": "presentacion.pptx",
    "slideSize": {"width": 9144000, "height": 6858000},  # EMUs
    "slides": [
        {
            "number": 1,
            "type": "title",  # title, content, section, picture, etc.
            "layout": "Title Slide",
            "layoutType": "cover",  # cover, title_slide, section_header, etc.
            "isTitle": True,
            "isCover": True,
            "background": {
                "type": "solid",  # solid, gradient
                "color": "#FFFFFF"
            },
            "preview": "data:image/png;base64,...",
            "textAreas": [...],  # Ver sección 2.2
            "imageAreas": [...],  # Ver sección 2.3
            "shapes": [...]
        }
    ],
    "slideImages": [...],  # Previews de cada slide
    "extractedAssets": {
        "logos": [...],
        "images": [...],
        "transparentImages": [...],
        "animatedElements": [...]
    },
    "renderMethod": "uno"  # uno, libreoffice, aspose, placeholder
}
```

### 2.2 Estructura de textAreas

```python
{
    "id": 1,  # shape_id
    "type": "title",  # title, subtitle, bullets, body
    "position": {
        "x": 914400,  # EMUs
        "y": 685800,
        "width": 6858000,
        "height": 1143000,
        "x_percent": 10.0,  # Porcentaje del slide
        "y_percent": 10.0,
        "width_percent": 75.0,
        "height_percent": 16.67
    },
    "text": "Título de la presentación",
    "formatting": {
        "font": "Arial",
        "size": 44,  # puntos
        "color": "#000000",
        "bold": True,
        "italic": False,
        "alignment": "PP_ALIGN.CENTER"
    },
    "maxChars": 500,  # Estimación
    "alignment": "PP_ALIGN.CENTER",
    "canEdit": True
}
```

### 2.3 Detección de Tipos de Slide

**Función**: `detect_slide_type(slide)`

| Layout Name | Tipo Detectado |
|-------------|----------------|
| "Title Slide" | title |
| "Title Only" | title |
| "Section Header" | section |
| "Title and Content" | content |
| "Two Content" | two_content |
| "Picture with Caption" | picture |
| "Blank" | blank |
| "Comparison" | comparison |

**Heurísticas adicionales**:
- Primera slide → title (portada)
- Título + subtítulo sin contenido → title
- Título + contenido → content

### 2.4 Extracción de Fondos

**Función**: `extract_background(slide)`

Proceso:
1. Lee el XML del slide directamente
2. Busca `p:cSld/p:bg`
3. Detecta tipo: solid, gradient
4. Resuelve colores del tema (schemeClr) a colores reales

**Colores del tema resueltos**:
```python
{
    'bg1': '#FFFFFF',  # Fondo principal
    'bg2': '#F2F2F2',  # Fondo secundario
    'tx1': '#000000',  # Texto principal
    'tx2': '#1F1F1F',  # Texto secundario
    'accent1': '#4472C4',
    'accent2': '#ED7D31',
    'accent3': '#A5A5A5',
    'accent4': '#FFC000',
    'accent5': '#5B9BD5',
    'accent6': '#70AD47'
}
```

### 2.5 Detección de Animaciones

**Función**: `detect_animated_shapes(slide, prs)`

**Estrategia**:
1. Lee el XML del slide buscando `p:timing`
2. Extrae `spid` de elementos animados
3. **Fallback mejorado**: Solo marca elementos con alta probabilidad
   - ALTA: imagen pequeña (<15%) + transparencia + posición en esquina
   - MEDIA: imagen pequeña (<15%) + transparencia

**NO marca**: Imágenes grandes o sin transparencia

### 2.6 Extracción de Assets

**Función**: `extract_all_assets(prs)`

Clasificación:
- **logos**: Imágenes pequeñas (<25% del slide)
- **transparentImages**: PNGs con canal alpha
- **animatedElements**: Elementos con animación detectada
- **images**: Imágenes regulares

**Procesamiento**: Aplica `smart_background_removal` para integrar imágenes con el fondo del slide.

---

## 3. RUTAS DE ANÁLISIS (routes/analysis.py)

### 3.1 Endpoint: POST /api/analyze

**Propósito**: Analiza un archivo PPTX o PDF

**Request**:
- `file`: UploadFile (.pptx, .ppt, .pdf)

**Response**:
```json
{
    "success": true,
    "analysis": { ... },  // Estructura de analyze_presentation
    "message": "Análisis completado: X diapositivas detectadas"
}
```

### 3.2 Endpoint: POST /api/analyze-fonts

**Propósito**: Analiza las fuentes usadas en un PPTX

**Response**:
```json
{
    "success": true,
    "fileName": "presentacion.pptx",
    "fonts_in_template": ["Arial", "Calibri", "Times New Roman"],
    "fonts_available": ["Arial", "Calibri"],
    "fonts_missing": ["Times New Roman"],
    "fonts_in_google": ["Times New Roman"],
    "warnings": [...]
}
```

### 3.3 Endpoint: POST /api/extract-content

**Propósito**: Extrae solo el contenido de texto (sin diseño)

**Response**:
```json
{
    "success": true,
    "fileName": "presentacion.pptx",
    "slideCount": 10,
    "slides": [
        {
            "slideNumber": 1,
            "type": "title",
            "texts": [
                {"type": "title", "content": "Título principal"},
                {"type": "subtitle", "content": "Subtítulo"}
            ]
        }
    ]
}
```

---

## 4. CLONADOR XML AVANZADO (pptx_xml_cloner.py)

### 4.1 Clase Principal: `PPTXXMLCloner`

**Propósito**: Clona un PPTX preservando TODOS los elementos visuales mediante manipulación directa del XML.

**Elementos preservados**:
- ✅ Animaciones (p:timing, p:anim*)
- ✅ Transiciones (p:transition)
- ✅ SmartArt (dgm:*)
- ✅ Gradientes (a:gradFill)
- ✅ Sombras (a:effectLst, a:outerShdw, a:innerShdw)
- ✅ Efectos 3D (a:scene3d, a:sp3d)
- ✅ Imágenes y sus efectos
- ✅ Formas y sus propiedades
- ✅ Macros VBA (vbaProject.bin)

### 4.2 Función Principal: `clone_pptx_preserving_all()`

```python
def clone_pptx_preserving_all(
    template_path: str,
    content_by_slide: List[Dict[str, Any]],
    text_areas_by_slide: List[List[Dict]] = None
) -> str:
```

**Parámetros**:
- `template_path`: Ruta al archivo PPTX template
- `content_by_slide`: Contenido generado por IA
  ```python
  [
      {'title': 'Título', 'subtitle': 'Subtítulo'},
      {'heading': 'Sección', 'bullets': ['Punto 1', 'Punto 2']},
      ...
  ]
  ```
- `text_areas_by_slide`: Lista de textAreas por slide (del análisis)
  ```python
  [
      [{'id': 1, 'type': 'title', 'position': {...}, 'text': '...'}, ...],
      ...
  ]
  ```

**Proceso**:
1. Extrae el PPTX a directorio temporal
2. Analiza la estructura de textos
3. Detecta y extrae macros VBA (si existen)
4. Modifica cada slide reemplazando texto
5. Restaura macros VBA
6. Re-empaqueta como PPTX

### 4.3 Reemplazo de Texto: `_replace_with_text_areas()`

**Estrategia de reemplazo preciso**:
1. Recibe textAreas con coordenadas del análisis
2. Busca shapes por `shape_id` que coincidan
3. Reemplaza texto basándose en el tipo (title, subtitle, bullets)
4. **Fallback**: Si no hay textAreas, usa detección automática por tipo

**Flujo de reemplazo**:
```
textAreas disponibles?
    ├── SÍ → Usar coordenadas para reemplazo preciso
    └── NO → Usar _smart_replace() con detección automática
```

### 4.4 Detección de Placeholders

**Función**: `_should_replace(original_text, expected_type)`

**Patrones detectados**:
```python
# Regex
r'^click\s+to\s+add'
r'^haga\s+clic\s+(para|aquí)'
r'^\[.+\]$'  # [Título aquí]
r'^lorem\s+ipsum'

# Frases
'click to add', 'add title', 'haga clic',
'título principal', 'texto de ejemplo'
```

**Lógica**:
- Texto vacío → reemplazar
- Placeholder explícito → reemplazar
- Texto genérico (< 30 chars) → reemplazar
- Contenido real (> 8 palabras) → preservar

### 4.5 Preservación de Macros VBA

**Proceso**:
1. Al analizar, busca `ppt/vbaProject.bin`
2. Extrae y almacena los bytes del proyecto VBA
3. Al clonar, restaura el archivo en el directorio temporal
4. El PPTX generado mantiene las macros

---

## 5. GENERADOR DE PRESENTACIONES (pptx_generator.py)

### 5.1 Función Principal: `generate_presentation()`

```python
def generate_presentation(
    original_path: str,
    ai_content: Optional[Dict] = None,
    use_xml_cloner: bool = True,
    text_areas_by_slide: List[List[Dict]] = None
) -> str:
```

**Flujo**:
```
ai_content disponible?
    ├── SÍ → Usar XML Cloner (preserva animaciones, etc.)
    └── NO → Usar método legacy (python-pptx directo)
```

### 5.2 Generación con XML Cloner

```python
def generate_with_xml_cloner(
    original_path: str,
    ai_content: Dict,
    text_areas_by_slide: List[List[Dict]] = None
) -> str:
```

**Pasos**:
1. Prepara `content_by_slide` del ai_content
2. Pasa `text_areas_by_slide` al clonador
3. Genera PPTX con preservación total

---

## 6. RUTAS DE EXPORTACIÓN (routes/export.py)

### 6.1 Endpoint: POST /api/export/pptx

**Propósito**: Exporta contenido generado a PPTX

**Request (con template)**:
```multipart/form-data
template: File (.pptx)
data: JSON string
```

**data JSON**:
```json
{
    "slides": [
        {
            "type": "title",
            "content": {
                "title": "Título generado",
                "subtitle": "Subtítulo generado"
            },
            "textAreas": [
                {"id": 1, "type": "title", "position": {...}},
                {"id": 2, "type": "subtitle", "position": {...}}
            ]
        }
    ]
}
```

**Proceso**:
1. Guarda template temporal
2. Extrae `text_areas_by_slide` del request
3. Genera contenido con IA (si no viene)
4. Llama a `generate_presentation()` con textAreas
5. Retorna PPTX como blob

---

## 7. SERVICIO DE EXPORTACIÓN FRONTEND (exportService.js)

### 7.1 Función Principal: `exportToPowerPoint()`

```javascript
export async function exportToPowerPoint(slides, templateFile = null)
```

**Con template**:
1. Prepara `exportData` incluyendo `textAreas` de cada slide
2. Envía FormData al endpoint `/api/export/pptx`
3. Descarga el PPTX generado

**Sin template**:
1. Usa endpoint JSON simple
2. Genera PPTX básico con PptxGenJS

### 7.2 Datos Enviados al Backend

```javascript
const exportData = {
    slides: slides.map((slide, index) => ({
        type: slide.type,
        content: slide.content,
        textAreas: slide.layout?.textAreas || slide.textAreas || []
    }))
}
```

---

## 8. INTEGRACIÓN COMPLETA DEL FLUJO

### 8.1 Flujo de Análisis y Exportación

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                                │
└─────────────────────────────────────────────────────────────────┘

1. ANÁLISIS DEL TEMPLATE
   ┌──────────────┐
   │ Upload PPTX  │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ analyze_     │◀── pptx_analyzer.py
   │ presentation │
   └──────┬───────┘
          ▼
   ┌────────────────────────────────────────┐
   │ {                                      │
   │   slides: [{                           │
   │     textAreas: [{                      │
   │       id: 1,                           │
   │       type: "title",                   │
   │       position: {x, y, width, height}  │
   │     }]                                 │
   │   }]                                   │
   │ }                                      │
   └────────────────────────────────────────┘

2. GENERACIÓN DE CONTENIDO IA
   ┌────────────────────────────────────────┐
   │ Chutes AI / Gemini Vision              │
   │ Genera contenido basado en análisis    │
   └──────┬─────────────────────────────────┘
          ▼
   ┌────────────────────────────────────────┐
   │ {                                      │
   │   slides: [{                           │
   │     type: "title",                     │
   │     content: {                         │
   │       title: "Título generado",        │
   │       subtitle: "Subtítulo"            │
   │     }                                  │
   │   }]                                   │
   │ }                                      │
   └────────────────────────────────────────┘

3. EXPORTACIÓN CON PRESERVACIÓN
   ┌────────────────────────────────────────┐
   │ exportService.js                       │
   │ Combina:                               │
   │ - Contenido generado                   │
   │ - textAreas del análisis (coordenadas) │
   └──────┬─────────────────────────────────┘
          ▼
   ┌────────────────────────────────────────┐
   │ POST /api/export/pptx                  │
   │ {                                      │
   │   slides: [{                           │
   │     type,                              │
   │     content,                           │
   │     textAreas                          │
   │   }]                                   │
   │ }                                      │
   └──────┬─────────────────────────────────┘
          ▼
   ┌────────────────────────────────────────┐
   │ routes/export.py                       │
   │ Extrae text_areas_by_slide             │
   └──────┬─────────────────────────────────┘
          ▼
   ┌────────────────────────────────────────┐
   │ pptx_generator.py                      │
   │ generate_presentation(                 │
   │   text_areas_by_slide=text_areas       │
   │ )                                      │
   └──────┬─────────────────────────────────┘
          ▼
   ┌────────────────────────────────────────┐
   │ pptx_xml_cloner.py                     │
   │ clone_pptx_preserving_all(             │
   │   text_areas_by_slide=text_areas       │
   │ )                                      │
   └──────┬─────────────────────────────────┘
          ▼
   ┌────────────────────────────────────────┐
   │ _replace_with_text_areas()             │
   │ Reemplazo preciso por coordenadas      │
   └──────┬─────────────────────────────────┘
          ▼
   ┌──────────────┐
   │ PPTX con     │
   │ diseño       │
   │ preservado   │
   └──────────────┘
```

### 8.2 Puntos de Integración Críticos

| Componente | Entrada | Salida | Integración |
|------------|---------|--------|-------------|
| pptx_analyzer.py | PPTX | analysis + textAreas | Base del sistema |
| analysis.py | UploadFile | JSON análisis | API endpoint |
| pptx_xml_cloner.py | template + content | PPTX clonado | Preservación total |
| pptx_generator.py | template + content | PPTX | Orquestador |
| export.py | FormData | PPTX blob | API endpoint |
| exportService.js | slides + template | Fetch request | Frontend |

---

## 9. ESTADO ACTUAL Y MEJORAS

### 9.1 Funcionalidades Implementadas ✅

1. **Análisis completo de PPTX**
   - Extracción de textAreas con coordenadas
   - Detección de tipos de slide
   - Extracción de fondos y colores del tema
   - Detección de animaciones (XML + fallback)
   - Extracción de assets (logos, imágenes, transparentes)

2. **Generación con preservación**
   - Clonación XML avanzada
   - Preservación de animaciones
   - Preservación de gradientes y efectos
   - Preservación de macros VBA
   - Reemplazo preciso por coordenadas (textAreas)

3. **API completa**
   - Análisis de archivos
   - Análisis de fuentes
   - Extracción de contenido
   - Exportación a PPTX

### 9.2 Limitaciones Conocidas ⚠️

1. **Renderizado de previews**
   - UNO API puede fallar en algunos sistemas
   - Fallback a placeholders si no hay renderizador

2. **SmartArt**
   - Se preserva en XML pero no se analiza su contenido interno
   - El texto dentro de SmartArt no se extrae como textArea

3. **Gráficos y tablas**
   - Se preservan pero no se modifican
   - No hay análisis de datos internos

### 9.3 Mejoras Futuras 📋

1. **Análisis de SmartArt**
   - Extraer texto de diagramas
   - Preservar estructura jerárquica

2. **Modificación de gráficos**
   - Analizar datos de gráficos
   - Actualizar datos con contenido IA

3. **Renderizado más robusto**
   - Mejor manejo de errores UNO
   - Más opciones de fallback

4. **Preview en tiempo real**
   - Actualizar previews mientras se edita contenido

---

## 10. CONFIGURACIÓN DE ENTORNO

### 10.1 Variables de Entorno

```env
# Backend
VITE_BACKEND_URL=http://localhost:8000

# LibreOffice (para UNO API)
LIBREOFFICE_PROGRAM=C:\Program Files\LibreOffice\program

# Base de datos
DATABASE_URL=sqlite:///presentations.db
```

### 10.2 Dependencias Principales

```txt
# requirements.txt
python-pptx>=0.18.0
fastapi>=0.100.0
uvicorn>=0.22.0
lxml>=4.9.0
Pillow>=9.0.0
pymupdf>=1.22.0  # Opcional: para PDF
pdf2image>=1.16.0  # Opcional: para PDF (requiere Poppler)
```

---

## 11. PRUEBAS Y VERIFICACIÓN

### 11.1 Verificar Análisis

```bash
# Endpoint de análisis
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@template.pptx"
```

### 11.2 Verificar Exportación

```bash
# Endpoint de exportación
curl -X POST http://localhost:8000/api/export/pptx \
  -F "template=@template.pptx" \
  -F "data=@data.json"
```

### 11.3 Verificar en Frontend

1. Abrir aplicación en http://localhost:5173
2. Subir un template
3. Verificar que aparecen las textAreas marcadas
4. Generar contenido
5. Exportar y verificar preservación de diseño

---

## 12. CONCLUSIONES

El sistema Slide AI tiene una arquitectura bien definida para:

1. **Análisis profundo** de presentaciones PPTX
2. **Generación inteligente** de contenido con IA
3. **Exportación con preservación** del diseño original

La integración de `text_areas_by_slide` permite reemplazo preciso de texto usando coordenadas del análisis, mejorando significativamente la precisión del reemplazo en templates complejos.

**Próximo paso recomendado**: Testear con templates reales que contengan animaciones, SmartArt y macros VBA para verificar la preservación completa.