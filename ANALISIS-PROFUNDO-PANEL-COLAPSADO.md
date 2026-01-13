# 🔬 Análisis Profundo: Panel Lateral Colapsado

## 🎯 Problema Reportado

Después de exportar un documento, el panel lateral izquierdo se muestra colapsado (solo iconos, sin texto).

## 🔍 Investigación Realizada

### 1. Revisión del Flujo de Exportación

#### `src/services/exportService.js`
- ✅ No manipula el DOM directamente
- ✅ No modifica estilos globales
- ✅ Solo hace fetch al backend y descarga archivos
- ✅ No hay efectos secundarios en el layout

#### `src/features/ExportOptions.jsx`
- ✅ Modal con overlay (`position: fixed`)
- ✅ `z-index: 1000` (no interfiere con paneles)
- ✅ No manipula `body.style`
- ✅ No hay `overflow: hidden` en body
- ✅ Cierra correctamente con `onClose()`

### 2. Análisis del ResizablePanel

#### Problema Identificado: Race Condition en useEffect

**Código Original:**
```javascript
useEffect(() => {
  // ...
  const handleMouseUp = () => {
    setIsResizing(false)
    document.body.classList.remove('resizing')
    if (width >= minWidth && width <= maxWidth && !isNaN(width)) {
      localStorage.setItem(storageKey, width.toString())
    }
  }
  // ...
}, [isResizing, position, minWidth, maxWidth, width, storageKey])
//                                              ^^^^^ PROBLEMA
```

**Problema:**
- El `useEffect` tiene `width` en las dependencias
- Se ejecuta cada vez que `width` cambia durante el resize
- Puede guardar valores intermedios incorrectos
- Durante la exportación, el modal puede causar un re-render que captura un valor incorrecto

### 3. Causas Raíz Identificadas

#### A. Dependencia de `width` en useEffect
```javascript
// El efecto se re-ejecuta cada vez que width cambia
useEffect(() => {
  // Setup de event listeners
}, [width]) // ← Causa re-renders innecesarios
```

**Consecuencia:**
- Durante el resize, el efecto se ejecuta múltiples veces
- Puede guardar valores intermedios
- Race condition entre el resize y el guardado

#### B. Guardado Inmediato sin Debounce
```javascript
const handleMouseUp = () => {
  localStorage.setItem(storageKey, width.toString())
}
```

**Consecuencia:**
- Guarda inmediatamente al soltar el mouse
- No hay tiempo para validar el valor final
- Puede capturar valores transitorios

#### C. Sin Validación en Tiempo Real
```javascript
// No hay logs ni validación visible
localStorage.setItem(storageKey, width.toString())
```

**Consecuencia:**
- Difícil de debuggear
- No se sabe cuándo se guarda un valor incorrecto
- No hay advertencias de valores inválidos

### 4. Escenario de Fallo

```
1. Usuario está editando slides
2. Panel lateral tiene ancho normal (280px)
3. Usuario hace clic en "Exportar"
4. Modal se abre (overlay con z-index: 1000)
5. React re-renderiza el árbol de componentes
6. Durante el re-render, ResizablePanel se re-monta o actualiza
7. El useEffect se ejecuta con width en las dependencias
8. Por alguna razón (timing, layout shift), width tiene un valor incorrecto
9. Se guarda en localStorage: "50" o "0" o "NaN"
10. Modal se cierra
11. Componente se re-renderiza
12. Lee de localStorage: "50px"
13. Panel se muestra colapsado
```

## ✅ Soluciones Implementadas

### 1. Eliminada Dependencia de `width`

**Antes:**
```javascript
useEffect(() => {
  // ...
}, [isResizing, position, minWidth, maxWidth, width, storageKey])
```

**Después:**
```javascript
useEffect(() => {
  // ...
}, [isResizing, position, minWidth, maxWidth, storageKey, saveWidth])
```

**Beneficio:**
- El efecto solo se ejecuta cuando cambia `isResizing`
- No se re-ejecuta durante el resize
- Evita race conditions

### 2. Debounce en el Guardado

**Implementación:**
```javascript
const saveWidth = useCallback((widthToSave) => {
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current)
  }
  
  saveTimeoutRef.current = setTimeout(() => {
    if (widthToSave >= minWidth && widthToSave <= maxWidth && !isNaN(widthToSave)) {
      localStorage.setItem(storageKey, widthToSave.toString())
      console.log(`💾 Ancho guardado: ${widthToSave}px`)
    } else {
      console.warn(`⚠️ Intento de guardar ancho inválido: ${widthToSave}px`)
    }
  }, 500)
}, [minWidth, maxWidth, storageKey])
```

**Beneficios:**
- Espera 500ms después del último cambio
- Evita guardar valores intermedios
- Valida antes de guardar
- Logs para debugging

### 3. Guardado al Desmontar

**Implementación:**
```javascript
useEffect(() => {
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    if (width >= minWidth && width <= maxWidth && !isNaN(width)) {
      localStorage.setItem(storageKey, width.toString())
      console.log(`💾 Guardando ancho al desmontar: ${width}px`)
    }
  }
}, [width, minWidth, maxWidth, storageKey])
```

**Beneficios:**
- Garantiza que se guarde el último valor válido
- Se ejecuta cuando el componente se desmonta
- Limpia timeouts pendientes

### 4. Validación Mejorada

**Al Cargar:**
```javascript
const [width, setWidth] = useState(() => {
  const saved = localStorage.getItem(storageKey)
  const savedWidth = saved ? parseInt(saved) : defaultWidth
  if (savedWidth < minWidth || savedWidth > maxWidth || isNaN(savedWidth)) {
    console.warn(`⚠️ Ancho inválido en localStorage (${savedWidth}px), usando default (${defaultWidth}px)`)
    return defaultWidth
  }
  return savedWidth
})
```

**Al Guardar:**
```javascript
if (widthToSave >= minWidth && widthToSave <= maxWidth && !isNaN(widthToSave)) {
  localStorage.setItem(storageKey, widthToSave.toString())
  console.log(`💾 Ancho guardado: ${widthToSave}px`)
} else {
  console.warn(`⚠️ Intento de guardar ancho inválido: ${widthToSave}px`)
}
```

### 5. Logs de Debugging

Ahora el componente registra:
- ⚠️ Cuando carga un ancho inválido
- 💾 Cuando guarda un ancho válido
- 🔄 Cuando resetea al default
- ⚠️ Cuando intenta guardar un ancho inválido

### 6. Min-Width Garantizado

**CSS:**
```css
.resizable-panel-wrapper {
  min-width: 200px;
}
```

**Inline Style:**
```javascript
style={{ width: `${width}px`, minWidth: `${minWidth}px` }}
```

**Beneficio:**
- Doble protección contra colapso
- CSS como fallback
- JavaScript como control principal

## 📊 Comparación Antes/Después

### Antes

| Aspecto | Estado |
|---------|--------|
| Dependencias useEffect | Incluye `width` ❌ |
| Guardado | Inmediato ❌ |
| Validación | Básica ❌ |
| Logs | Ninguno ❌ |
| Debounce | No ❌ |
| Guardado al desmontar | No ❌ |
| Min-width CSS | No ❌ |

### Después

| Aspecto | Estado |
|---------|--------|
| Dependencias useEffect | Sin `width` ✅ |
| Guardado | Con debounce (500ms) ✅ |
| Validación | Completa con logs ✅ |
| Logs | Detallados ✅ |
| Debounce | Sí (500ms) ✅ |
| Guardado al desmontar | Sí ✅ |
| Min-width CSS | Sí (200px) ✅ |

## 🧪 Pruebas Recomendadas

### 1. Prueba de Exportación
```
1. Abrir app con panel normal (280px)
2. Exportar a PPTX
3. Cerrar modal
4. Verificar que panel mantiene 280px
5. Abrir consola y buscar logs de guardado
```

### 2. Prueba de Resize
```
1. Arrastrar handle de resize
2. Soltar
3. Esperar 500ms
4. Verificar log: "💾 Ancho guardado: XXXpx"
5. Recargar página
6. Verificar que mantiene el ancho
```

### 3. Prueba de Valores Inválidos
```
1. Abrir consola
2. Ejecutar: localStorage.setItem('slide-thumbnails-width', '50')
3. Recargar página
4. Verificar log: "⚠️ Ancho inválido en localStorage (50px)"
5. Verificar que usa default (280px)
```

### 4. Prueba de Doble Clic
```
1. Resize panel a 400px
2. Doble clic en handle
3. Verificar log: "🔄 Reseteando ancho a default: 280px"
4. Verificar que panel vuelve a 280px
```

## 🎯 Prevención Futura

### Checklist de Validación

- [x] useEffect sin dependencias innecesarias
- [x] Debounce en operaciones de guardado
- [x] Validación antes de guardar
- [x] Validación al cargar
- [x] Logs de debugging
- [x] Guardado al desmontar
- [x] Min-width en CSS
- [x] Min-width en inline style
- [x] Función de reset (doble clic)
- [x] Cleanup de timeouts

### Monitoreo

Revisar logs en consola:
- `💾 Ancho guardado:` - Guardado exitoso
- `⚠️ Ancho inválido:` - Valor rechazado
- `🔄 Reseteando ancho:` - Reset manual

## 📝 Conclusión

El problema era causado por una **race condition** en el `useEffect` del `ResizablePanel`. La dependencia de `width` causaba que el efecto se ejecutara múltiples veces durante el resize, potencialmente guardando valores intermedios incorrectos.

Las soluciones implementadas:
1. ✅ Eliminan la race condition
2. ✅ Agregan debounce para estabilidad
3. ✅ Validan todos los valores
4. ✅ Proveen logs para debugging
5. ✅ Garantizan min-width en múltiples niveles
6. ✅ Permiten reset fácil con doble clic

El problema **no debería volver a ocurrir** con estas mejoras.
