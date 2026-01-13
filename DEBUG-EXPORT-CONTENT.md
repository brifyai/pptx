# Debug: Contenido No Se Exporta a PPTX

## Problema Reportado
El usuario reporta que cuando descarga el PPTX o PDF, solo se genera el diseño del template pero no el contenido generado por la IA.

## Análisis Realizado

### 1. Flujo de Contenido Verificado
✅ **Frontend → AI Service**: El contenido se genera correctamente
✅ **AI Service → ChatPanel**: Los `slideUpdates` se reciben correctamente  
✅ **ChatPanel → Preview**: El preview muestra los cambios correctamente
✅ **Preview → Slides State**: El contenido se aplica a los slides mediante `onBatchSlideUpdate`
❓ **Slides State → Export**: NECESITA VERIFICACIÓN
❓ **Export → Backend**: NECESITA VERIFICACIÓN
❓ **Backend → PPTX File**: NECESITA VERIFICACIÓN

### 2. Logging Agregado

He agregado logging detallado en los siguientes puntos:

#### Frontend:
1. **`src/features/ExportOptions.jsx`** (línea 28-50):
   - Log completo del contenido de cada slide antes de exportar
   - Muestra title, subtitle, heading, bullets de cada slide

2. **`src/services/exportService.js`** (línea 14-18):
   - Log del contenido de slides que se envía al backend
   - Muestra estructura JSON completa

#### Backend:
3. **`backend/pptx_generator.py`** (línea 48-60):
   - Log detallado del contenido recibido por el backend
   - Muestra title, subtitle, heading, bullets de cada slide

4. **`backend/pptx_xml_cloner.py`** (línea 550-620):
   - Log de cada reemplazo de texto que se hace
   - Muestra qué texto original se reemplaza y con qué

## Instrucciones para el Usuario

### Paso 1: Reiniciar Backend
```bash
# Detener el backend si está corriendo
# Luego iniciar con logs visibles:
python backend/main.py
```

### Paso 2: Abrir DevTools en el Navegador
1. Presiona F12 para abrir DevTools
2. Ve a la pestaña "Console"
3. Limpia la consola (botón 🚫 o Ctrl+L)

### Paso 3: Generar Contenido con IA
1. En el chat, escribe: `@todo genera una presentación sobre inteligencia artificial`
2. Espera a que aparezca el preview
3. Haz clic en "Aplicar Cambios"
4. **VERIFICA EN LA CONSOLA**: Deberías ver logs como:
   ```
   🔧 applyPreviewChanges llamado con: ...
   📝 Aplicando cambios a múltiples slides
   ✅ Usando onBatchSlideUpdate
   ```

### Paso 4: Verificar Contenido en Slides
1. Navega por los slides usando las flechas
2. Verifica que el contenido se muestra en el overlay (texto sobre el slide)
3. **IMPORTANTE**: El contenido debe ser visible en el overlay, no solo en el preview

### Paso 5: Exportar y Revisar Logs
1. Haz clic en "Exportar" (botón de descarga)
2. Selecciona formato PPTX
3. Haz clic en "Exportar"
4. **REVISA LOS LOGS EN ESTE ORDEN**:

#### A. Logs del Frontend (DevTools Console):
```
🚀 INICIANDO EXPORTACIÓN
📊 Total de slides: 5
📄 Template file: template.pptx
📝 Contenido de cada slide:
  Slide 1:
    - type: title
    - content: {...}
      • title: [DEBE MOSTRAR EL TÍTULO GENERADO]
      • subtitle: [DEBE MOSTRAR EL SUBTÍTULO GENERADO]
```

**❓ PREGUNTA CRÍTICA**: ¿Los slides tienen contenido aquí?
- **SI**: El problema está en el backend
- **NO**: El problema está en el frontend (contenido no se guardó)

#### B. Logs del Backend (Terminal):
```
📤 Export PPTX - Template: template.pptx
📤 Slides parseados: 5
🚀 Usando clonador XML avanzado
   📝 Slide 1 contenido:
      - title: [DEBE MOSTRAR EL TÍTULO]
      - subtitle: [DEBE MOSTRAR EL SUBTÍTULO]
      - bullets: 0 items
```

**❓ PREGUNTA CRÍTICA**: ¿El backend recibe el contenido?
- **SI**: El problema está en el clonador XML
- **NO**: El problema está en cómo se envía desde el frontend

#### C. Logs del Clonador XML (Terminal):
```
   📝 Modificando slide 1
      ✅ Reemplazando TITLE: 'Click to add title...' -> 'Inteligencia Artificial...'
      ✅ Reemplazando SUBTITLE: 'Click to add subtitle...' -> 'Una Revolución Tecnológica...'
   📊 Total de reemplazos: 2
```

**❓ PREGUNTA CRÍTICA**: ¿Se están haciendo reemplazos?
- **SI**: El PPTX debería tener el contenido
- **NO**: El problema está en la lógica de detección de texto

### Paso 6: Abrir el PPTX Descargado
1. Abre el archivo `presentacion.pptx` en PowerPoint
2. Verifica si el contenido está presente
3. **COMPARA** con lo que viste en los logs

## Posibles Problemas y Soluciones

### Problema 1: Contenido NO está en los slides (Frontend)
**Síntoma**: Los logs del Paso 5A muestran `content: {}` o `title: N/A`

**Causa**: El contenido no se guardó correctamente en el estado de React

**Solución**:
- Verificar que `handleBatchSlideUpdate` se está llamando
- Verificar que `useSlideManagement.js` está actualizando el estado correctamente

### Problema 2: Contenido NO llega al backend
**Síntoma**: Los logs del Paso 5A muestran contenido, pero 5B muestra vacío

**Causa**: El contenido no se está serializando correctamente en el FormData

**Solución**:
- Verificar que `JSON.stringify({ slides })` incluye el contenido
- Verificar que el backend está parseando correctamente el FormData

### Problema 3: Backend NO reemplaza el texto
**Síntoma**: Los logs del Paso 5B muestran contenido, pero 5C muestra 0 reemplazos

**Causa**: El clonador XML no está detectando correctamente las áreas de texto

**Solución**:
- Verificar que `_detect_text_type()` está identificando correctamente los tipos
- Verificar que `_smart_replace()` está usando los flags correctamente
- Puede ser necesario ajustar la lógica de detección

### Problema 4: PPTX tiene contenido pero no es visible
**Síntoma**: Los logs muestran reemplazos, pero el PPTX parece vacío

**Causa**: El texto puede estar con color blanco o fuera del área visible

**Solución**:
- Abrir el PPTX en PowerPoint
- Seleccionar todo (Ctrl+A) en cada slide
- Verificar si hay texto seleccionado (aunque no sea visible)
- Cambiar el color del texto a negro para verificar

## Próximos Pasos

1. **EJECUTAR LOS PASOS 1-6** y copiar TODOS los logs
2. **REPORTAR** qué paso falló (5A, 5B, 5C, o 6)
3. **COMPARTIR** los logs completos de ese paso

Con esta información podré identificar exactamente dónde está el problema y proporcionar una solución específica.

## Archivos Modificados

- ✅ `src/features/ExportOptions.jsx` - Logging detallado antes de exportar
- ✅ `src/services/exportService.js` - Logging del contenido enviado al backend
- ✅ `backend/pptx_generator.py` - Logging del contenido recibido y procesado
- ✅ `backend/pptx_xml_cloner.py` - Ya tenía logging de reemplazos (sin cambios)

## Notas Técnicas

### Estructura de Contenido Esperada
```javascript
{
  slides: [
    {
      id: 1,
      type: 'title',
      content: {
        title: 'Título Principal',
        subtitle: 'Subtítulo'
      },
      preview: 'data:image/png;base64,...'
    },
    {
      id: 2,
      type: 'content',
      content: {
        heading: 'Primera Sección',
        bullets: ['Punto 1', 'Punto 2', 'Punto 3']
      },
      preview: 'data:image/png;base64,...'
    }
  ]
}
```

### Flujo de Reemplazo en el Backend
1. `export.py` recibe el FormData con template y data
2. `pptx_generator.py` llama a `generate_with_xml_cloner()`
3. `pptx_xml_cloner.py` usa `clone_pptx_preserving_all()`
4. Para cada slide, llama a `_modify_slide()`
5. `_smart_replace()` busca áreas de texto y las reemplaza
6. Usa flags (`title_used`, `subtitle_used`) para evitar duplicados
7. Reemplaza SIEMPRE que hay contenido disponible (no verifica si es placeholder)

### Cambio Importante en TASK 7
En TASK 7 se modificó `_smart_replace()` para que SIEMPRE reemplace el contenido cuando está disponible, sin importar si el texto original parece placeholder o no. Esto se hizo usando flags para rastrear qué contenido ya se usó.

**Antes**: Solo reemplazaba si `_should_replace()` retornaba True (texto parecía placeholder)
**Ahora**: Reemplaza SIEMPRE si hay contenido disponible y no se ha usado aún
