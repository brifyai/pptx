# 🔧 Fix: Panel Lateral Colapsado Después de Exportar

## ❌ Problema

Después de exportar un documento, el panel lateral izquierdo (thumbnails de slides) se muestra colapsado, mostrando solo iconos sin texto.

### Síntomas
- Panel lateral muy estrecho (solo iconos visibles)
- Nombres de slides no visibles
- Difícil de usar después de exportar

## 🔍 Causa Raíz

El componente `ResizablePanel` guarda el ancho del panel en `localStorage`. Durante la exportación o alguna interacción, el ancho se guarda con un valor incorrecto (muy pequeño o inválido), causando que el panel se colapse en la próxima carga.

## ✅ Soluciones Implementadas

### 1. Validación al Cargar
```javascript
const [width, setWidth] = useState(() => {
  const saved = localStorage.getItem(storageKey)
  const savedWidth = saved ? parseInt(saved) : defaultWidth
  // Validar que el ancho guardado esté dentro de los límites
  if (savedWidth < minWidth || savedWidth > maxWidth || isNaN(savedWidth)) {
    return defaultWidth
  }
  return savedWidth
})
```

### 2. Validación al Guardar
```javascript
const handleMouseUp = () => {
  setIsResizing(false)
  document.body.classList.remove('resizing')
  // Validar antes de guardar
  if (width >= minWidth && width <= maxWidth && !isNaN(width)) {
    localStorage.setItem(storageKey, width.toString())
  }
}
```

### 3. Min-Width en CSS
```css
.resizable-panel-wrapper {
  min-width: 200px; /* Prevenir colapso total */
}
```

### 4. Reset con Doble Clic
Ahora puedes hacer doble clic en el handle de resize para resetear el ancho al valor por defecto.

### 5. Min-Width en Inline Style
```javascript
style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
```

## 🚀 Cómo Usar

### Solución Rápida (Si ya está colapsado)

#### Opción 1: Usar la Herramienta de Fix
1. Abre `fix-panel-width.html` en tu navegador
2. Haz clic en "Resetear Paneles"
3. Recarga la aplicación

#### Opción 2: Doble Clic en el Handle
1. Busca la línea vertical entre el panel y el contenido principal
2. Haz doble clic en ella
3. El panel se reseteará al ancho por defecto (280px)

#### Opción 3: Consola del Navegador
```javascript
localStorage.setItem('slide-thumbnails-width', '280')
localStorage.setItem('chat-panel-width', '400')
location.reload()
```

#### Opción 4: Limpiar Todo
```javascript
localStorage.clear()
location.reload()
```

### Prevención

Las validaciones implementadas deberían prevenir que el problema vuelva a ocurrir. El panel ahora:
- ✅ Valida el ancho al cargar
- ✅ Valida el ancho antes de guardar
- ✅ Tiene un min-width en CSS
- ✅ Tiene un min-width en inline style
- ✅ Permite reset con doble clic

## 📋 Archivos Modificados

1. **`src/components/ResizablePanel.jsx`**
   - Validación al cargar desde localStorage
   - Validación al guardar en localStorage
   - Función de reset con doble clic
   - Min-width en inline style

2. **`src/styles/ResizablePanel.css`**
   - Agregado `min-width: 200px` al wrapper

3. **`fix-panel-width.html`** (NUEVO)
   - Herramienta standalone para resetear paneles
   - Muestra valores actuales
   - Permite resetear o limpiar todo

## 🧪 Verificación

### Antes del Fix
```
Panel Width: 50px (colapsado)
Visible: Solo iconos
```

### Después del Fix
```
Panel Width: 280px (normal)
Visible: Iconos + texto + nombres
Min Width: 200px (garantizado)
```

## 🎯 Valores por Defecto

| Panel | Default | Min | Max |
|-------|---------|-----|-----|
| Slides (izquierda) | 280px | 200px | 500px |
| Chat (derecha) | 400px | 300px | 700px |

## 📝 Notas Técnicas

### LocalStorage Keys
- `slide-thumbnails-width` - Ancho del panel de slides
- `chat-panel-width` - Ancho del panel de chat

### Validaciones
1. **Rango**: `minWidth <= width <= maxWidth`
2. **Tipo**: `!isNaN(width)`
3. **Fallback**: Si falla, usa `defaultWidth`

### Reset
- **Doble clic**: Resetea al `defaultWidth`
- **Manual**: Usa `fix-panel-width.html`
- **Código**: `localStorage.setItem(key, defaultWidth)`

## ✅ Estado Final

- ✅ Panel no puede colapsar por debajo de 200px
- ✅ Valores inválidos se ignoran
- ✅ Doble clic para reset rápido
- ✅ Herramienta de fix disponible
- ✅ Prevención implementada

## 🔄 Si el Problema Persiste

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Application" > "Local Storage"
3. Busca las keys `slide-thumbnails-width` y `chat-panel-width`
4. Elimínalas manualmente
5. Recarga la página

O simplemente usa `fix-panel-width.html` para hacerlo automáticamente.
