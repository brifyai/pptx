# Detección de Tipos de Slides

## Cómo Funciona

El sistema detecta automáticamente el tipo de cada lámina usando múltiples criterios:

### 1. **Análisis del Layout Name**

PowerPoint asigna nombres a los layouts que indican su propósito:

```python
# Ejemplos de layout names:
"Title Slide"          → Portada
"Title Only"           → Portada simple
"Section Header"       → Separador de sección
"Title and Content"    → Contenido estándar
"Two Content"          → Dos columnas
"Comparison"           → Comparación
"Blank"                → En blanco
"Picture with Caption" → Enfocado en imagen
```

### 2. **Análisis de Placeholders**

Cada slide tiene placeholders con tipos específicos:

```python
Placeholder Types:
- Type 1  = Title
- Type 2  = Body/Content
- Type 3  = Center Title
- Type 13 = Subtitle
- Type 18 = Picture
```

**Patrones de Detección**:

| Placeholders | Tipo Detectado |
|--------------|----------------|
| Title + Subtitle (sin Content) | **Portada** |
| Title + Content | **Contenido** |
| Title solo (sin Subtitle ni Content) | **Separador de Sección** |
| Solo Pictures | **Slide de Imagen** |
| Ninguno | **En Blanco** |

### 3. **Posición en la Presentación**

- **Primera slide** (índice 0): Casi siempre es portada
- **Última slide**: A veces es cierre/contacto
- **Intermedias**: Contenido o separadores

### 4. **Metadata Adicional**

El sistema agrega campos extra:

```javascript
{
  "type": "title",              // Tipo detectado
  "layout": "Title Slide",      // Nombre original del layout
  "layoutType": "cover",        // Categoría general
  "isTitle": true,              // ¿Es tipo título?
  "isCover": true,              // ¿Es la portada? (primera slide)
  "number": 1                   // Posición
}
```

## Tipos de Slides Detectados

### 1. **title** (Portada)
- **Características**: Título + Subtítulo, sin contenido
- **Uso**: Portada principal de la presentación
- **Badge**: 🏠 (icono de casa) - Morado
- **Ejemplo**: "Presentación de Marketing 2026"

### 2. **section** (Separador de Sección)
- **Características**: Solo título, sin subtítulo ni contenido
- **Uso**: Dividir la presentación en secciones
- **Badge**: ⚡ (icono de segmento) - Rosa
- **Ejemplo**: "Capítulo 2: Estrategia"

### 3. **content** (Contenido Estándar)
- **Características**: Título + Bullets/Contenido
- **Uso**: Slides de contenido típico
- **Badge**: Ninguno (es el tipo más común)
- **Ejemplo**: Lista de puntos clave

### 4. **two_content** (Dos Columnas)
- **Características**: Dos áreas de contenido lado a lado
- **Uso**: Comparaciones, antes/después
- **Badge**: Ninguno
- **Ejemplo**: "Ventajas vs Desventajas"

### 5. **comparison** (Comparación)
- **Características**: Layout específico para comparar
- **Uso**: Comparar dos opciones
- **Badge**: Ninguno
- **Ejemplo**: "Opción A vs Opción B"

### 6. **picture** (Enfocado en Imagen)
- **Características**: Principalmente imágenes
- **Uso**: Mostrar fotos, gráficos grandes
- **Badge**: Ninguno
- **Ejemplo**: Foto de producto

### 7. **blank** (En Blanco)
- **Características**: Sin placeholders predefinidos
- **Uso**: Diseño completamente personalizado
- **Badge**: Ninguno
- **Ejemplo**: Slide con diseño libre

### 8. **quote** (Cita)
- **Características**: Layout para citas o testimonios
- **Uso**: Destacar frases importantes
- **Badge**: Ninguno
- **Ejemplo**: Testimonio de cliente

## Categorías de Layout

El campo `layoutType` agrupa layouts similares:

```javascript
{
  "cover": "Portadas y títulos principales",
  "title_slide": "Slides con título prominente",
  "section_header": "Separadores de sección",
  "content": "Contenido estándar",
  "two_column": "Dos columnas o comparación",
  "picture_focused": "Enfocado en imágenes",
  "blank": "En blanco",
  "other": "Otros tipos"
}
```

## Uso en el Frontend

### Badges Visuales

En el panel de thumbnails (izquierda), verás badges en:

**Portada** (🏠):
- Fondo morado degradado
- Aparece en la primera slide si es tipo "title"
- Indica que es la portada principal

**Separador de Sección** (⚡):
- Fondo rosa degradado
- Aparece en slides tipo "section"
- Indica inicio de nueva sección

### Filtrado y Organización

Puedes usar esta información para:

1. **Identificar rápidamente** qué slides son portadas vs contenido
2. **Organizar** la presentación por secciones
3. **Aplicar contenido diferente** según el tipo
4. **Validar estructura** (ej: asegurar que hay portada)

## Ejemplos de Detección

### Ejemplo 1: Presentación Corporativa

```
Slide 1: "Presentación Q1 2026"
  → type: "title"
  → layoutType: "cover"
  → isCover: true
  → Badge: 🏠 Portada

Slide 2: "Agenda"
  → type: "content"
  → layoutType: "content"
  → Badge: Ninguno

Slide 3: "Resultados Financieros"
  → type: "section"
  → layoutType: "section_header"
  → Badge: ⚡ Sección

Slide 4: "Ingresos por Trimestre"
  → type: "content"
  → layoutType: "content"
  → Badge: Ninguno
```

### Ejemplo 2: Presentación Educativa

```
Slide 1: "Introducción a Python"
  → type: "title"
  → isCover: true
  → Badge: 🏠

Slide 2: "Módulo 1: Fundamentos"
  → type: "section"
  → Badge: ⚡

Slide 3: "Variables y Tipos de Datos"
  → type: "content"
  → Badge: Ninguno

Slide 4: "Comparación: Python vs Java"
  → type: "comparison"
  → Badge: Ninguno
```

## Cómo Mejorar la Detección

Si el sistema no detecta correctamente el tipo:

### Opción 1: Usar Layouts Estándar
- PowerPoint tiene layouts predefinidos con nombres reconocibles
- Usa "Title Slide" para portadas
- Usa "Section Header" para separadores

### Opción 2: Nombrar Layouts Claramente
- Si creas layouts personalizados, usa nombres descriptivos
- Incluye palabras clave: "title", "section", "content", etc.

### Opción 3: Estructura de Placeholders
- Portada: Title + Subtitle (sin content)
- Sección: Solo Title
- Contenido: Title + Content

## API de Detección

### Backend (Python)

```python
def detect_slide_type(slide) -> str:
    """
    Retorna: 'title', 'section', 'content', 'blank', etc.
    """
    
def get_layout_category(layout_name: str) -> str:
    """
    Retorna: 'cover', 'section_header', 'content', etc.
    """
    
def is_title_slide(slide) -> bool:
    """
    Retorna: True si es portada/título
    """
```

### Frontend (JavaScript)

```javascript
// Acceder a la información
const slide = slides[0]

console.log(slide.type)        // "title"
console.log(slide.layoutType)  // "cover"
console.log(slide.isCover)     // true
console.log(slide.isTitle)     // true

// Filtrar por tipo
const coverSlides = slides.filter(s => s.isCover)
const sectionSlides = slides.filter(s => s.layoutType === 'section_header')
const contentSlides = slides.filter(s => s.type === 'content')
```

## Casos de Uso

### 1. Generar Contenido Diferenciado

```javascript
// En aiService.js
if (slide.isCover) {
  // Generar título impactante y subtítulo
  return {
    title: "Título Principal Impactante",
    subtitle: "Subtítulo descriptivo"
  }
} else if (slide.layoutType === 'section_header') {
  // Solo título de sección
  return {
    heading: "Nueva Sección"
  }
} else {
  // Contenido con bullets
  return {
    heading: "Título",
    bullets: ["Punto 1", "Punto 2", "Punto 3"]
  }
}
```

### 2. Validar Estructura

```javascript
// Verificar que hay portada
const hasCover = slides.some(s => s.isCover)
if (!hasCover) {
  console.warn('⚠️ La presentación no tiene portada')
}

// Contar secciones
const sectionCount = slides.filter(s => s.layoutType === 'section_header').length
console.log(`📊 La presentación tiene ${sectionCount} secciones`)
```

### 3. Navegación Inteligente

```javascript
// Saltar a la siguiente sección
function goToNextSection(currentIndex) {
  const nextSection = slides.findIndex((s, i) => 
    i > currentIndex && s.layoutType === 'section_header'
  )
  if (nextSection !== -1) {
    navigateToSlide(nextSection)
  }
}
```

## Resumen

✅ **Detección automática** basada en múltiples criterios
✅ **Badges visuales** para identificar rápidamente
✅ **Metadata rica** para uso programático
✅ **Categorización** en tipos generales
✅ **Identificación de portada** automática
✅ **Separadores de sección** detectados
✅ **Extensible** para nuevos tipos

El sistema ahora puede distinguir inteligentemente entre portadas, secciones y contenido, permitiendo un tratamiento diferenciado para cada tipo de lámina.
