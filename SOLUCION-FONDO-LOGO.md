# Solución: Logo con Fondo Blanco en Láminas de Color

## Problema Identificado

El logo animado aparecía con fondo blanco en la app, mientras que la lámina tenía un color de fondo diferente. Esto ocurría porque:

1. **LibreOffice captura el estado estático** antes de que las animaciones se ejecuten
2. **El logo tiene fondo blanco** (no transparente) 
3. **La función `extract_background()` NO estaba extrayendo el color real** del fondo de las láminas
4. Siempre devolvía `#FFFFFF` (blanco), por lo que el procesador de imágenes no hacía nada

## Solución Implementada

### 1. Extracción de Color de Fondo desde XML

Modifiqué la función `extract_background()` en `backend/pptx_analyzer.py` para:

- **Leer directamente el XML del slide** usando `lxml`
- Buscar el elemento `p:cSld/p:bg` que contiene el fondo real
- Extraer colores de:
  - **Fills sólidos** (`a:solidFill/a:srgbClr`)
  - **Esquemas de color** (`a:solidFill/a:schemeClr`) con mapeo de colores comunes
  - **Gradientes** (`a:gradFill`)
- Si no encuentra en el slide, busca en el **layout**
- Fallback a blanco si todo falla

### 2. Procesamiento de Imágenes

El procesador de imágenes (`backend/image_processor.py`) ahora recibe el color correcto y:

- Detecta pixels blancos (R, G, B > 240)
- Los reemplaza con el color de fondo del slide
- Preserva el canal alpha si existe

### 3. Aplicación en Frontend

El componente `ExtractedAssetOverlay` en `SlideViewer.jsx`:

- Recibe el `backgroundColor` del asset
- Lo aplica como fondo del contenedor
- La imagen procesada se muestra encima

## Cómo Probar

### 1. Reiniciar el Backend (YA HECHO)

El backend ya fue reiniciado automáticamente y está corriendo en puerto 8000.

### 2. Recargar la App en el Navegador

1. Ve a tu navegador donde está la app (http://localhost:3006)
2. Presiona **Ctrl + Shift + R** (recarga forzada) o **F5**

### 3. Subir el Template

1. Sube tu archivo `Plantilla_Origenv4.pptx`
2. Observa los logs en la consola del navegador

### 4. Verificar en los Logs del Backend

Deberías ver mensajes como:

```
🔍 Analizando slide 2 para detectar animaciones...
   🎨 Color de fondo del slide: #4472C4  <-- COLOR REAL EXTRAÍDO
   🎨 Procesando imagen para aplicar fondo #4472C4...
   ✅ Imagen procesada con nuevo fondo
```

### 5. Verificar Visualmente

- **Lámina 1**: Si tiene fondo blanco, el logo se verá normal
- **Lámina 2**: Si tiene fondo de color (ej: azul), el logo ahora debería tener ese mismo color de fondo en lugar de blanco

## Qué Esperar

### ✅ Funcionará Correctamente Si:

- El PPTX usa colores sólidos o esquemas de color estándar
- El logo tiene fondo blanco uniforme (R, G, B > 240)
- El color de fondo del slide es diferente a blanco

### ⚠️ Limitaciones Conocidas:

- **Fondos con imágenes**: Si el fondo es una imagen, no se puede extraer un color sólido
- **Gradientes complejos**: Solo se extrae el primer color del gradiente
- **Esquemas personalizados**: Colores de esquema no estándar pueden no mapearse correctamente

## Archivos Modificados

- `backend/pptx_analyzer.py` - Función `extract_background()` reescrita para leer XML
- `backend/image_processor.py` - Ya existía, ahora recibe colores correctos
- `src/components/SlideViewer.jsx` - Ya aplicaba backgroundColor

## Próximos Pasos

1. **Probar con tu PPTX real** y verificar los logs
2. Si el color no se extrae correctamente, revisar el XML del slide manualmente
3. Si necesitas soporte para fondos con imágenes, podríamos implementar detección de color dominante

## Comandos Útiles

```bash
# Ver logs del backend en tiempo real
# (Ya está corriendo, solo observa la terminal)

# Si necesitas reiniciar manualmente:
cd backend
python -m uvicorn main:app --reload --port 8000
```

---

**Estado**: ✅ Implementado y backend reiniciado
**Siguiente acción**: Probar subiendo el template en la app
