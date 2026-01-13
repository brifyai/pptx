# 🚨 Solución Urgente: PPTX Se Exporta Vacío

## 🔍 Diagnóstico Rápido

El PPTX se exporta vacío porque el contenido no se está aplicando. Hay 3 posibles causas:

### Causa 1: El contenido no llega al backend ❌
### Causa 2: El contenido llega pero no se mapea ❌  
### Causa 3: El template tiene estructura incompatible ❌

---

## ⚡ Solución Inmediata (5 minutos)

### Paso 1: Ejecuta el Diagnóstico

```bash
python diagnostico-export.py tu_template.pptx
```

**Si no tienes template a mano, busca uno**:
```bash
dir *.pptx
```

### Paso 2: Revisa los Logs

Busca esta línea en la salida:
```
📊 Total de reemplazos: X
```

**Si X = 0**: El problema está en la detección de tipos (ve al Paso 3)
**Si X > 0**: El problema está en otro lado (ve al Paso 4)

### Paso 3: Si Reemplazos = 0 (Problema de Detección)

El template no usa placeholders estándar. **Solución rápida**:

Edita `backend/pptx_xml_cloner.py` línea ~420:

```python
# BUSCA ESTA SECCIÓN:
def _detect_text_type(self, shape) -> str:
    # ... código existente ...
    
    # CAMBIA ESTOS VALORES:
    # ANTES:
    if y_pos < 2000000:
        return 'title'
    
    # DESPUÉS (más permisivo):
    if y_pos < 5000000:  # ← Aumenta este número
        return 'title'
    
    # ANTES:
    if size_pt > 32:
        return 'title'
    
    # DESPUÉS (más permisivo):
    if size_pt > 20:  # ← Reduce este número
        return 'title'
```

**Reinicia el backend** y prueba de nuevo.

### Paso 4: Si Reemplazos > 0 pero PPTX Vacío

El contenido se está aplicando pero no se guarda. Verifica:

1. **¿El archivo generado es muy pequeño?**
   ```bash
   # Debería ser > 50KB
   # Si es < 10KB, está vacío
   ```

2. **¿Se está usando el clonador XML?**
   
   Edita `backend/pptx_generator.py` línea ~15:
   ```python
   # Asegúrate que dice:
   XML_CLONER_AVAILABLE = True
   ```

---

## 🔧 Solución Alternativa: Modo Forzado

Si nada funciona, usa el modo "reemplazar todo sin verificar tipos":

Edita `backend/pptx_xml_cloner.py`, método `_smart_replace()` línea ~550:

```python
def _smart_replace(self, root, content: Dict[str, Any], 
                   slide_texts: List[TextLocation]) -> int:
    replacements = 0
    shapes = root.findall('.//p:sp', NAMESPACES)
    
    # MODO FORZADO: Reemplazar TODO el texto encontrado
    all_content = []
    if content.get('title'):
        all_content.append(content['title'])
    if content.get('subtitle'):
        all_content.append(content['subtitle'])
    if content.get('heading'):
        all_content.append(content['heading'])
    if content.get('bullets'):
        all_content.extend(content['bullets'])
    if content.get('body'):
        all_content.append(content['body'])
    
    content_idx = 0
    
    for shape in shapes:
        txBody = shape.find('.//p:txBody', NAMESPACES)
        if txBody is None:
            continue
        
        paragraphs = txBody.findall('.//a:p', NAMESPACES)
        for para in paragraphs:
            runs = para.findall('.//a:r', NAMESPACES)
            for run in runs:
                text_elem = run.find('.//a:t', NAMESPACES)
                if text_elem is not None and content_idx < len(all_content):
                    text_elem.text = all_content[content_idx]
                    content_idx += 1
                    replacements += 1
    
    logger.info(f"   📊 Total de reemplazos (modo forzado): {replacements}")
    return replacements
```

Este modo ignora los tipos y simplemente reemplaza todo el texto en orden.

---

## 🧪 Prueba Rápida desde la App

1. **Inicia el backend con logs visibles**:
   ```bash
   cd backend
   python main.py
   ```

2. **Abre la app** en el navegador

3. **Abre la consola del navegador** (F12)

4. **Exporta un PPTX**

5. **Revisa ambos logs**:
   - **Consola del navegador**: ¿Se envía el contenido?
   - **Terminal del backend**: ¿Se recibe el contenido?

### En la Consola del Navegador Deberías Ver:

```
📤 Exportando PPTX...
📤 Slides: 5
📤 Contenido de slides:
  Slide 1:
    - type: title
    - content: { title: "Mi Título", subtitle: "Mi Subtítulo" }
```

### En el Terminal del Backend Deberías Ver:

```
📤 Export PPTX - Template: template.pptx
📝 Slide 1 contenido:
   - title: Mi Título
   - subtitle: Mi Subtítulo
🔍 Encontrados 3 shapes en el slide
✅ Reemplazando TITLE: 'Original' -> 'Mi Título'
📊 Total de reemplazos: 2
```

---

## 🎯 Checklist de Verificación

- [ ] Backend está corriendo (`python backend/main.py`)
- [ ] Frontend está corriendo (`npm run dev`)
- [ ] Template está cargado en la app
- [ ] Slides tienen contenido (visible en la app)
- [ ] Consola del navegador muestra que se envía contenido
- [ ] Terminal del backend muestra que se recibe contenido
- [ ] Logs del backend muestran reemplazos > 0
- [ ] Archivo PPTX generado es > 50KB

---

## 🆘 Si Aún No Funciona

**Comparte esta información**:

1. **Logs de la consola del navegador** (al exportar)
2. **Logs del terminal del backend** (al exportar)
3. **Tamaño del archivo PPTX** generado
4. **Captura de un slide** en la app (para ver si tiene contenido)

Con eso puedo identificar exactamente dónde está el problema.

---

## 💡 Causa Más Común

El 90% de las veces el problema es:

**Los tipos detectados no coinciden con el contenido disponible**

Ejemplo:
- Template tiene un shape que se detecta como 'body'
- Contenido disponible es 'title'
- No hay coincidencia → No hay reemplazo → PPTX vacío

**Solución**: Usar el modo forzado (arriba) o ajustar las heurísticas de detección.

---

## 🚀 Solución Definitiva

Si quieres una solución permanente, necesito:

1. Tu template PPTX (para analizarlo)
2. Un ejemplo del contenido que generas
3. Los logs completos del diagnóstico

Con eso puedo crear una configuración específica para tu template que funcione siempre.
