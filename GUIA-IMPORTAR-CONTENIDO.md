# 📥 Guía: Importar Contenido desde Otro PPTX

## 🎯 ¿Qué es esta funcionalidad?

Te permite:
1. **Mantener el diseño** de un template (PPTX #1)
2. **Importar el contenido** de otro PPTX (PPTX #2)
3. **Mapear** qué slide va a qué slide
4. **Aplicar** el contenido al diseño

**Caso de uso típico**:
- Tienes un template corporativo con diseño profesional
- Recibes un PPTX generado por Gemini/GPT con buen contenido pero diseño básico
- Quieres combinar: diseño del template + contenido de la IA

---

## 🚀 Cómo Usar

### Paso 1: Sube tu Template (Diseño)

1. Abre la app
2. Sube tu template PPTX con el diseño que quieres mantener
3. Espera a que se analice

### Paso 2: Abre el Importador de Contenido

1. Haz clic en el **menú hamburguesa** (☰) en la esquina superior
2. Selecciona **"Importar Contenido"**
3. Se abrirá el modal de importación

### Paso 3: Sube el PPTX con Contenido

1. Haz clic en **"Seleccionar PPTX"**
2. Elige el archivo con el contenido que quieres importar
3. Espera a que se extraiga el contenido

### Paso 4: Mapea los Slides

Verás una lista de mapeos:

```
Slide 1 (Fuente)  →  Lámina 1 (Título)
Slide 2 (Fuente)  →  Lámina 2 (Contenido)
Slide 3 (Fuente)  →  Lámina 3 (Contenido)
```

Para cada slide fuente:
- **Selecciona** a qué lámina de tu template quieres mapear el contenido
- **O elige "No mapear"** si no quieres usar ese slide

### Paso 5: Aplica el Contenido

1. Haz clic en **"Aplicar Contenido"**
2. El contenido se aplicará a los slides mapeados
3. Verás el contenido en la vista previa
4. Ahora puedes exportar con el diseño + contenido

---

## 🔍 Cómo Funciona Internamente

### Frontend (`src/components/ContentImporter.jsx`)

1. **Sube el PPTX** al endpoint `/api/extract-content`
2. **Recibe** la estructura JSON con el contenido extraído
3. **Crea mapeo automático** (slide 1 → lámina 1, etc.)
4. **Permite ajustar** el mapeo manualmente
5. **Aplica** el contenido a los slides del template

### Backend (`backend/routes/analysis.py`)

Endpoint: `POST /api/extract-content`

1. **Recibe** el archivo PPTX
2. **Extrae** todo el texto usando python-pptx
3. **Detecta tipos**:
   - Placeholder type 1 → 'title'
   - Placeholder type 2 → 'subtitle'
   - Texto con saltos de línea → 'bullets'
   - Resto → 'body'
4. **Retorna** JSON con la estructura:
   ```json
   {
     "success": true,
     "fileName": "contenido.pptx",
     "slideCount": 5,
     "slides": [
       {
         "slideNumber": 1,
         "type": "title",
         "texts": [
           { "type": "title", "content": "Mi Título" },
           { "type": "subtitle", "content": "Subtítulo" }
         ]
       },
       {
         "slideNumber": 2,
         "type": "content",
         "texts": [
           { "type": "bullets", "content": ["Punto 1", "Punto 2"] }
         ]
       }
     ]
   }
   ```

---

## 🧪 Probar la Funcionalidad

### Test Manual

1. **Prepara dos PPTX**:
   - `template.pptx`: Tu diseño (puede estar vacío o con placeholders)
   - `contenido.pptx`: PPTX con el contenido (puede ser generado por IA)

2. **Sube el template** a la app

3. **Importa el contenido**:
   - Menú → "Importar Contenido"
   - Sube `contenido.pptx`
   - Mapea los slides
   - Aplica

4. **Verifica**:
   - El contenido debe aparecer en los slides
   - El diseño del template debe mantenerse
   - Exporta y abre el PPTX para confirmar

### Test con cURL (Backend)

```bash
# Extraer contenido de un PPTX
curl -X POST http://localhost:8000/api/extract-content \
  -F "file=@contenido.pptx" \
  | jq .
```

**Respuesta esperada**:
```json
{
  "success": true,
  "fileName": "contenido.pptx",
  "slideCount": 3,
  "slides": [...]
}
```

---

## 🔧 Solución de Problemas

### Problema 1: "Error al extraer contenido"

**Causa**: El archivo no es un PPTX válido o está corrupto.

**Solución**:
- Verifica que el archivo sea `.pptx` (no `.ppt` antiguo)
- Intenta abrir el archivo en PowerPoint para confirmar que funciona
- Revisa los logs del backend para más detalles

### Problema 2: Contenido no se extrae correctamente

**Causa**: El PPTX tiene una estructura inusual.

**Solución**:
Revisa el código en `backend/routes/analysis.py` línea 251-320:

```python
# Mejorar la detección de tipos
if shape.is_placeholder:
    placeholder_type = shape.placeholder_format.type
    # Agregar más tipos si es necesario
```

### Problema 3: Mapeo automático incorrecto

**Causa**: El mapeo automático asume 1:1 (slide 1 → lámina 1).

**Solución**:
- Ajusta el mapeo manualmente en la UI
- O modifica la lógica en `ContentImporter.jsx`:
  ```javascript
  // Crear mapeo más inteligente
  const autoMapping = data.slides.map((sourceSlide, index) => {
    // Lógica personalizada aquí
    const targetIndex = determineTargetIndex(sourceSlide, slides)
    return { sourceIndex: index, targetIndex, ... }
  })
  ```

### Problema 4: Contenido se aplica pero no se exporta

**Causa**: Mismo problema que TASK 9 (tipos no coinciden).

**Solución**:
- Sigue la guía de `GUIA-RAPIDA-EXPORT.md`
- Ejecuta `test-export-debug.py` para diagnosticar
- Ajusta las heurísticas de detección de tipos

---

## 💡 Tips y Mejores Prácticas

### ✅ Hacer

- **Usa templates con estructura clara** (título, subtítulo, bullets)
- **Verifica el contenido extraído** antes de aplicar
- **Ajusta el mapeo manualmente** si el automático no es correcto
- **Prueba con un slide primero** antes de aplicar todo

### ❌ Evitar

- **No uses PPTX con macros** (pueden causar problemas)
- **No mezcles slides muy diferentes** (título con contenido)
- **No esperes que funcione con SmartArt complejo** (se extrae como texto plano)

---

## 🎓 Casos de Uso Avanzados

### Caso 1: Combinar Múltiples Fuentes

1. Importa contenido de `fuente1.pptx` → slides 1-3
2. Importa contenido de `fuente2.pptx` → slides 4-6
3. Edita manualmente si es necesario
4. Exporta el resultado final

### Caso 2: Actualizar Contenido Existente

1. Ya tienes una presentación con diseño y contenido
2. Recibes contenido actualizado en otro PPTX
3. Importas solo los slides que cambiaron
4. Mantienes el resto intacto

### Caso 3: Plantilla Reutilizable

1. Creas un template corporativo perfecto
2. Cada vez que necesitas una presentación:
   - Generas contenido con IA (Gemini/GPT)
   - Importas el contenido al template
   - Exportas con diseño corporativo

---

## 🔄 Flujo Completo

```
1. Usuario sube template.pptx (diseño)
   ↓
2. Usuario abre "Importar Contenido"
   ↓
3. Usuario sube contenido.pptx
   ↓
4. Frontend → POST /api/extract-content
   ↓
5. Backend extrae texto con python-pptx
   ↓
6. Backend retorna JSON con contenido
   ↓
7. Frontend muestra mapeo automático
   ↓
8. Usuario ajusta mapeo si es necesario
   ↓
9. Usuario hace clic en "Aplicar"
   ↓
10. Frontend actualiza slides con nuevo contenido
   ↓
11. Usuario exporta PPTX
   ↓
12. Backend clona template + aplica contenido
   ↓
13. Usuario descarga PPTX final
```

---

## 📊 Verificación de Funcionamiento

### ✅ Checklist

- [ ] Endpoint `/api/extract-content` responde correctamente
- [ ] Contenido se extrae con tipos correctos
- [ ] UI muestra el mapeo de slides
- [ ] Contenido se aplica a los slides
- [ ] Contenido es visible en la vista previa
- [ ] Contenido se exporta al PPTX final

### 🧪 Test Rápido

```bash
# 1. Inicia el backend
cd backend
python main.py

# 2. Prueba el endpoint
curl -X POST http://localhost:8000/api/extract-content \
  -F "file=@test.pptx"

# 3. Verifica que retorna JSON con slides
```

---

## 🚀 Mejoras Futuras Posibles

1. **Vista previa del contenido** antes de aplicar
2. **Mapeo inteligente** basado en similitud de contenido
3. **Importar solo texto específico** (no todo el slide)
4. **Soporte para tablas y gráficos**
5. **Historial de importaciones**

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs del backend** cuando importes
2. **Verifica que el endpoint funciona** con cURL
3. **Comparte**:
   - El PPTX que intentas importar
   - Los logs del backend
   - Capturas de la UI

Con esa información se puede diagnosticar y solucionar el problema.
