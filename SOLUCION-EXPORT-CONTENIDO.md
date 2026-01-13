# 🔧 Solución: Contenido No Se Exporta a PPTX

## 📋 Problema

Cuando descargas el PPTX o PDF, solo se genera el diseño del template pero **NO se traspasa el contenido** generado por el chat de IA.

## 🔍 Diagnóstico

El problema está en el método `_smart_replace()` del archivo `backend/pptx_xml_cloner.py`. El contenido SÍ llega al backend, pero no se está mapeando correctamente a los shapes del template porque:

1. **Detección de tipos incorrecta**: El método `_detect_text_type()` solo detectaba placeholders estándar de PowerPoint, pero muchos templates no los usan
2. **Falta de logging**: No había forma de ver qué estaba pasando durante el reemplazo
3. **Heurísticas limitadas**: Solo se basaba en el atributo `placeholder type`, ignorando posición y tamaño de fuente

## ✅ Solución Implementada

### 1. Logging Detallado en `_smart_replace()`

Ahora el método muestra:
- Cuántos shapes se encontraron
- Qué contenido está disponible (title, subtitle, bullets, body)
- Para cada shape: ID, tipo detectado, número de párrafos y runs
- Qué reemplazos se están haciendo
- Total de reemplazos al final

### 2. Detección Mejorada de Tipos de Texto

El método `_detect_text_type()` ahora usa **3 heurísticas**:

1. **Placeholder type** (más confiable si existe)
   - `title`, `ctrTitle` → 'title'
   - `subTitle` → 'subtitle'
   - `body` → 'body'

2. **Posición en el slide**
   - Si está en el tercio superior (y < 2,000,000 EMUs) → 'title'

3. **Tamaño de fuente**
   - > 32pt → 'title'
   - > 24pt → 'subtitle'
   - Resto → 'body'

## 🧪 Cómo Probar

### Opción 1: Script de Debug (RECOMENDADO)

```bash
python test-export-debug.py tu_template.pptx
```

Este script:
1. Analiza tu template y muestra qué textos tiene
2. Intenta clonar con contenido de prueba
3. Muestra logs detallados de todo el proceso
4. Te dice exactamente dónde está el problema

### Opción 2: Desde la App

1. **Inicia el backend** con logging visible:
   ```bash
   cd backend
   python main.py
   ```

2. **Usa la app normalmente**:
   - Sube tu template
   - Genera contenido con el chat
   - Aplica cambios a los slides
   - Exporta a PPTX

3. **Revisa los logs del backend** para ver:
   ```
   📝 Contenido disponible:
      - title: Mi Título de Prueba
      - subtitle: N/A
      - bullets: 3 items
   
   📦 Shape 1 (ID: 2): tipo detectado = 'title'
      📄 1 párrafos encontrados
         Párrafo 1: 1 runs
            Run 1: 'Título Original'
      ✅ Reemplazando TITLE: 'Título Original' -> 'Mi Título de Prueba'
   
   📊 Total de reemplazos: 1
   ```

## 🎯 Qué Buscar en los Logs

### ✅ Caso Exitoso
```
📦 Shape 1 (ID: 2): tipo detectado = 'title'
✅ Reemplazando TITLE: 'Título Original' -> 'Mi Nuevo Título'
📊 Total de reemplazos: 3
```

### ❌ Caso Problemático
```
📦 Shape 1 (ID: 2): tipo detectado = 'body'
⏭️ No hay contenido para tipo 'body' o ya fue usado
📊 Total de reemplazos: 0
```

**Problema**: El shape se detectó como 'body' pero el contenido disponible es 'title'.

## 🔧 Soluciones Según el Problema

### Problema 1: "Total de reemplazos: 0"

**Causa**: Los tipos detectados no coinciden con el contenido disponible.

**Solución**: Ajustar las heurísticas en `_detect_text_type()`:

```python
# Si tu template tiene títulos en posiciones inusuales
if y_pos < 3000000:  # Aumentar el umbral
    return 'title'

# Si usa fuentes más pequeñas para títulos
if size_pt > 24:  # Reducir el umbral
    return 'title'
```

### Problema 2: "Shape sin txBody"

**Causa**: El shape no tiene texto (puede ser una imagen o forma decorativa).

**Solución**: Normal, estos shapes se saltan automáticamente.

### Problema 3: Tipos detectados incorrectamente

**Ejemplo**: Un título se detecta como 'body'.

**Solución A - Temporal**: Cambiar el contenido para que coincida:
```javascript
// En lugar de:
content: { title: 'Mi Título' }

// Usar:
content: { heading: 'Mi Título' }  // heading también se mapea a 'body'
```

**Solución B - Permanente**: Mejorar `_detect_text_type()` para tu template específico.

### Problema 4: Template sin placeholders estándar

Algunos templates corporativos no usan placeholders de PowerPoint.

**Solución**: La detección mejorada ahora usa posición y tamaño de fuente como fallback.

## 📝 Mejoras Adicionales Posibles

Si el problema persiste, podemos implementar:

### 1. Mapeo Manual por Coordenadas
```python
# Mapear contenido a shapes específicos por posición exacta
content_map = {
    'slide_1_shape_2': 'title',
    'slide_1_shape_3': 'bullets'
}
```

### 2. Análisis de Contenido Original
```python
# Si el texto original contiene ciertas palabras, asumir tipo
if 'título' in original_text.lower():
    return 'title'
```

### 3. Modo "Reemplazar Todo"
```python
# Reemplazar TODOS los textos en orden, sin importar el tipo
# Útil para templates muy personalizados
```

## 🚀 Próximos Pasos

1. **Ejecuta el script de debug**: `python test-export-debug.py tu_template.pptx`
2. **Revisa los logs** para entender qué tipos se detectan
3. **Compara** con el contenido que estás generando
4. **Ajusta** las heurísticas si es necesario
5. **Prueba** desde la app con el backend corriendo

## 📞 Si Aún No Funciona

Comparte:
1. Los logs completos del script de debug
2. Una captura del template (para ver la estructura)
3. El contenido que estás intentando aplicar

Con esa información podemos crear una solución específica para tu template.

---

## 🎓 Entendiendo el Flujo

```
1. Usuario aplica cambios desde el chat
   ↓
2. Frontend envía a /api/export/pptx:
   {
     slides: [
       { content: { title: 'X', bullets: ['A', 'B'] } }
     ]
   }
   ↓
3. Backend llama generate_presentation()
   ↓
4. generate_presentation() llama PPTXXMLCloner.clone_with_content()
   ↓
5. clone_with_content() extrae el PPTX y modifica cada slide
   ↓
6. _modify_slide() llama _smart_replace() para cada slide
   ↓
7. _smart_replace():
   - Busca todos los shapes con texto
   - Detecta el tipo de cada shape (title/subtitle/body)
   - Mapea el contenido disponible a cada tipo
   - Reemplaza el texto en el XML
   ↓
8. Re-empaqueta el PPTX y lo devuelve
```

El problema estaba en el **paso 7**: la detección de tipos no funcionaba bien, por lo que el mapeo fallaba.
