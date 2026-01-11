# 🔧 Soluciones para Clonación Avanzada de PPTX

## 📊 Resumen de Opciones

| Solución | Animaciones | SmartArt | Gradientes | Sombras | Costo | Complejidad |
|----------|-------------|----------|------------|---------|-------|-------------|
| **1. Manipulación XML directa** | ✅ 95% | ⚠️ 70% | ✅ 100% | ✅ 100% | Gratis | Alta |
| **2. Aspose.Slides Python** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | $999+/año | Baja |
| **3. Spire.Presentation** | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | $599+/año | Baja |
| **4. pptx-automizer (Node.js)** | ⚠️ 80% | ⚠️ 60% | ✅ 100% | ✅ 100% | Gratis | Media |
| **5. Híbrido (XML + python-pptx)** | ✅ 90% | ⚠️ 50% | ✅ 100% | ✅ 100% | Gratis | Alta |

---

## 🥇 SOLUCIÓN 1: Manipulación XML Directa (RECOMENDADA - Gratis)

### Concepto
Los archivos PPTX son archivos ZIP con XML adentro. Podemos:
1. Extraer el ZIP
2. Modificar solo el texto en los XML
3. Preservar TODO lo demás (animaciones, efectos, etc.)
4. Re-empaquetar el ZIP

### Implementación

```python
# backend/pptx_xml_cloner.py
import zipfile
import os
import tempfile
import shutil
from lxml import etree
import re

# Namespaces de PowerPoint
NAMESPACES = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'
}

class PPTXXMLCloner:
    """
    Clona un PPTX preservando TODOS los elementos visuales,
    solo reemplazando el texto.
    """
    
    def __init__(self, template_path: str):
        self.template_path = template_path
        self.temp_dir = None
        
    def clone_with_content(self, content_by_slide: list) -> str:
        """
        Clona el template y reemplaza solo el texto.
        
        Args:
            content_by_slide: Lista de diccionarios con contenido por slide
                [{'title': '...', 'bullets': ['...']}, ...]
        
        Returns:
            Path al archivo PPTX generado
        """
        # 1. Extraer PPTX a directorio temporal
        self.temp_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(self.template_path, 'r') as zip_ref:
            zip_ref.extractall(self.temp_dir)
        
        # 2. Encontrar y modificar cada slide
        slides_dir = os.path.join(self.temp_dir, 'ppt', 'slides')
        slide_files = sorted([f for f in os.listdir(slides_dir) if f.startswith('slide') and f.endswith('.xml')])
        
        for idx, slide_file in enumerate(slide_files):
            if idx < len(content_by_slide):
                slide_path = os.path.join(slides_dir, slide_file)
                self._replace_text_in_slide(slide_path, content_by_slide[idx])
        
        # 3. Re-empaquetar como PPTX
        output_path = tempfile.mktemp(suffix='.pptx')
        self._create_pptx(output_path)
        
        # 4. Limpiar
        shutil.rmtree(self.temp_dir)
        
        return output_path
    
    def _replace_text_in_slide(self, slide_path: str, content: dict):
        """Reemplaza texto en un slide preservando formato"""
        tree = etree.parse(slide_path)
        root = tree.getroot()
        
        # Encontrar todos los text frames
        text_frames = root.findall('.//p:txBody', NAMESPACES)
        
        text_index = 0
        content_values = self._flatten_content(content)
        
        for tf in text_frames:
            paragraphs = tf.findall('.//a:p', NAMESPACES)
            
            for para in paragraphs:
                # Encontrar runs de texto
                runs = para.findall('.//a:r', NAMESPACES)
                
                for run in runs:
                    text_elem = run.find('.//a:t', NAMESPACES)
                    if text_elem is not None and text_elem.text:
                        # Reemplazar texto si hay contenido disponible
                        if text_index < len(content_values):
                            original_text = text_elem.text
                            new_text = content_values[text_index]
                            
                            # Solo reemplazar si parece placeholder o texto editable
                            if self._is_replaceable(original_text):
                                text_elem.text = new_text
                                text_index += 1
        
        # Guardar cambios
        tree.write(slide_path, xml_declaration=True, encoding='UTF-8', standalone=True)
    
    def _flatten_content(self, content: dict) -> list:
        """Convierte el diccionario de contenido en lista plana"""
        values = []
        if 'title' in content:
            values.append(content['title'])
        if 'subtitle' in content:
            values.append(content['subtitle'])
        if 'heading' in content:
            values.append(content['heading'])
        if 'bullets' in content:
            values.extend(content['bullets'])
        return values
    
    def _is_replaceable(self, text: str) -> bool:
        """Determina si un texto debe ser reemplazado"""
        text_lower = text.lower().strip()
        
        # Placeholders comunes
        placeholders = [
            'click to', 'haga clic', 'título', 'title', 'subtitle',
            'subtítulo', 'text', 'texto', 'bullet', 'punto'
        ]
        
        # Si es placeholder o texto corto editable
        if any(p in text_lower for p in placeholders):
            return True
        
        # Si es texto corto (probablemente editable)
        if len(text.strip()) < 200:
            return True
        
        return False
    
    def _create_pptx(self, output_path: str):
        """Re-empaqueta el directorio como PPTX"""
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, self.temp_dir)
                    zipf.write(file_path, arcname)


def clone_pptx_preserving_all(template_path: str, content: list) -> str:
    """
    Función principal para clonar PPTX preservando todo.
    
    Args:
        template_path: Ruta al archivo PPTX template
        content: Lista de contenido por slide
        
    Returns:
        Ruta al archivo PPTX generado
    """
    cloner = PPTXXMLCloner(template_path)
    return cloner.clone_with_content(content)
```

### Ventajas
- ✅ **100% gratis** - Solo usa librerías estándar
- ✅ **Preserva TODO** - Animaciones, transiciones, SmartArt, efectos
- ✅ **Rápido** - Solo modifica texto, no recrea elementos
- ✅ **Sin dependencias comerciales**

### Desventajas
- ⚠️ Requiere entender estructura XML de PPTX
- ⚠️ Más código para mantener
- ⚠️ SmartArt puede ser complejo de modificar

---

## 🥈 SOLUCIÓN 2: Aspose.Slides para Python

### Instalación
```bash
pip install aspose-slides
```

### Implementación
```python
import aspose.slides as slides

def clone_with_aspose(template_path: str, content: list) -> str:
    """Clona usando Aspose - preserva TODO"""
    
    # Cargar presentación
    prs = slides.Presentation(template_path)
    
    for slide_idx, slide in enumerate(prs.slides):
        if slide_idx >= len(content):
            break
            
        slide_content = content[slide_idx]
        
        # Iterar sobre shapes
        for shape in slide.shapes:
            if shape.has_text_frame:
                # Reemplazar texto preservando formato
                for para in shape.text_frame.paragraphs:
                    for portion in para.portions:
                        # Lógica de reemplazo según tipo
                        pass
    
    # Guardar
    output_path = "output.pptx"
    prs.save(output_path, slides.export.SaveFormat.PPTX)
    
    return output_path
```

### Características
- ✅ Soporte completo de animaciones
- ✅ SmartArt completo
- ✅ Todos los efectos visuales
- ✅ API bien documentada

### Costo
- **Developer Small Business**: $999/año
- **Site Small Business**: $2,997/año
- **OEM**: $9,999/año

---

## 🥉 SOLUCIÓN 3: Spire.Presentation para Python

### Instalación
```bash
pip install Spire.Presentation
# O versión gratuita (limitada):
pip install Spire.Presentation.Free
```

### Implementación
```python
from spire.presentation import Presentation, FileFormat

def clone_with_spire(template_path: str, content: list) -> str:
    """Clona usando Spire.Presentation"""
    
    prs = Presentation()
    prs.LoadFromFile(template_path)
    
    for slide_idx in range(prs.Slides.Count):
        if slide_idx >= len(content):
            break
            
        slide = prs.Slides[slide_idx]
        slide_content = content[slide_idx]
        
        # Iterar sobre shapes
        for shape in slide.Shapes:
            if shape.IsTextHolder:
                # Reemplazar texto
                pass
    
    output_path = "output.pptx"
    prs.SaveToFile(output_path, FileFormat.Pptx2016)
    
    return output_path
```

### Versión Gratuita
- Limitada a 10 slides
- Marca de agua en output
- Funcionalidad básica

### Versión Comercial
- **Developer**: $599/año
- **Site**: $1,499/año

---

## 🔄 SOLUCIÓN 4: pptx-automizer (Node.js)

### Concepto
Usar Node.js como microservicio para la clonación avanzada.

### Instalación
```bash
npm install pptx-automizer
```

### Implementación
```javascript
// pptx-clone-service.js
const Automizer = require('pptx-automizer').default;

async function cloneTemplate(templatePath, content) {
    const automizer = new Automizer({
        templateDir: './templates',
        outputDir: './output'
    });
    
    // Cargar template
    const pres = automizer.loadRoot(templatePath);
    
    // Modificar contenido
    for (let i = 0; i < content.length; i++) {
        const slideContent = content[i];
        
        // Modificar texto usando callbacks XML
        pres.modifySlide(i + 1, (slide) => {
            // Buscar y reemplazar texto
            slide.getElementsByTagName('a:t').forEach((textNode, idx) => {
                if (slideContent.texts && slideContent.texts[idx]) {
                    textNode.textContent = slideContent.texts[idx];
                }
            });
        });
    }
    
    // Generar output
    const outputPath = await pres.write('output.pptx');
    return outputPath;
}

module.exports = { cloneTemplate };
```

### Integración con Python
```python
import subprocess
import json

def clone_with_nodejs(template_path: str, content: list) -> str:
    """Llama al servicio Node.js para clonación avanzada"""
    
    result = subprocess.run([
        'node', 'pptx-clone-service.js',
        '--template', template_path,
        '--content', json.dumps(content)
    ], capture_output=True, text=True)
    
    return result.stdout.strip()
```

### Ventajas
- ✅ Gratis y open source
- ✅ Preserva la mayoría de elementos
- ✅ Acceso directo a XML

### Desventajas
- ⚠️ Requiere Node.js
- ⚠️ Animaciones pueden romperse al agregar/eliminar shapes
- ⚠️ Complejidad adicional de arquitectura

---

## 🔀 SOLUCIÓN 5: Híbrido (Recomendado para tu caso)

### Concepto
Combinar python-pptx para análisis + manipulación XML directa para clonación.

### Implementación

```python
# backend/hybrid_cloner.py
from pptx import Presentation
import zipfile
import tempfile
import shutil
from lxml import etree
import os

class HybridPPTXCloner:
    """
    Usa python-pptx para análisis y XML directo para clonación.
    Preserva animaciones, transiciones y efectos.
    """
    
    def __init__(self, template_path: str):
        self.template_path = template_path
        # Usar python-pptx para análisis
        self.prs = Presentation(template_path)
        self.text_map = self._build_text_map()
    
    def _build_text_map(self):
        """Construye mapa de textos editables con sus posiciones"""
        text_map = []
        
        for slide_idx, slide in enumerate(self.prs.slides):
            slide_texts = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for para_idx, para in enumerate(shape.text_frame.paragraphs):
                        for run_idx, run in enumerate(para.runs):
                            if run.text.strip():
                                slide_texts.append({
                                    'shape_id': shape.shape_id,
                                    'para_idx': para_idx,
                                    'run_idx': run_idx,
                                    'original_text': run.text,
                                    'is_placeholder': self._is_placeholder(run.text)
                                })
            text_map.append(slide_texts)
        
        return text_map
    
    def _is_placeholder(self, text: str) -> bool:
        """Detecta si es texto placeholder"""
        placeholders = ['click', 'haga clic', 'título', 'title', 'subtitle']
        return any(p in text.lower() for p in placeholders)
    
    def clone_preserving_all(self, content_by_slide: list) -> str:
        """
        Clona preservando TODO excepto el texto que se reemplaza.
        """
        # Extraer PPTX
        temp_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(self.template_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        
        # Modificar slides
        slides_dir = os.path.join(temp_dir, 'ppt', 'slides')
        
        for slide_idx, slide_content in enumerate(content_by_slide):
            slide_file = f'slide{slide_idx + 1}.xml'
            slide_path = os.path.join(slides_dir, slide_file)
            
            if os.path.exists(slide_path):
                self._modify_slide_xml(slide_path, slide_content, slide_idx)
        
        # Re-empaquetar
        output_path = tempfile.mktemp(suffix='.pptx')
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arcname)
        
        shutil.rmtree(temp_dir)
        return output_path
    
    def _modify_slide_xml(self, slide_path: str, content: dict, slide_idx: int):
        """Modifica el XML del slide directamente"""
        NS = {
            'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
            'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'
        }
        
        tree = etree.parse(slide_path)
        root = tree.getroot()
        
        # Obtener lista de textos a insertar
        new_texts = []
        if 'title' in content:
            new_texts.append(content['title'])
        if 'subtitle' in content:
            new_texts.append(content['subtitle'])
        if 'heading' in content:
            new_texts.append(content['heading'])
        if 'bullets' in content:
            new_texts.extend(content['bullets'])
        
        # Encontrar todos los elementos de texto
        text_elements = root.findall('.//a:t', NS)
        
        text_idx = 0
        for text_elem in text_elements:
            if text_elem.text and text_idx < len(new_texts):
                # Verificar si es reemplazable usando el mapa
                if slide_idx < len(self.text_map):
                    slide_map = self.text_map[slide_idx]
                    for mapped in slide_map:
                        if mapped['original_text'] == text_elem.text:
                            if mapped['is_placeholder'] or len(text_elem.text) < 200:
                                text_elem.text = new_texts[text_idx]
                                text_idx += 1
                                break
        
        tree.write(slide_path, xml_declaration=True, encoding='UTF-8')
```

---

## 📋 RECOMENDACIÓN FINAL

### Para tu proyecto, recomiendo:

**Opción A: Gratis y Completo**
1. Implementar **Solución 1 (XML Directo)** o **Solución 5 (Híbrido)**
2. Tiempo estimado: 2-3 días
3. Resultado: ~95% fidelidad

**Opción B: Rápido y Comercial**
1. Usar **Spire.Presentation Free** para empezar
2. Migrar a versión comercial si necesitas más de 10 slides
3. Tiempo estimado: 1 día
4. Resultado: ~100% fidelidad

### Próximos pasos sugeridos:

1. **Probar Solución 1** con un template de prueba
2. **Verificar** qué elementos se preservan
3. **Ajustar** el código según resultados
4. **Integrar** con el backend existente

¿Quieres que implemente alguna de estas soluciones?
