"""
PPTX XML Cloner - Clonación avanzada preservando TODOS los elementos visuales.

Este módulo manipula directamente el XML dentro del archivo PPTX para:
- Preservar animaciones y transiciones
- Preservar SmartArt
- Preservar gradientes y efectos de sombra
- Preservar efectos 3D
- Solo reemplazar el texto editable

Autor: Slide AI
Fecha: Enero 2026
"""

import zipfile
import os
import tempfile
import shutil
import re
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from lxml import etree
from copy import deepcopy
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Namespaces de PowerPoint Open XML
NAMESPACES = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'p14': 'http://schemas.microsoft.com/office/powerpoint/2010/main',
    'p15': 'http://schemas.microsoft.com/office/powerpoint/2012/main',
    'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
    'dgm': 'http://schemas.openxmlformats.org/drawingml/2006/diagram',
}

# Registrar namespaces para lxml
for prefix, uri in NAMESPACES.items():
    etree.register_namespace(prefix, uri)


class TextLocation:
    """Representa la ubicación de un texto en el XML"""
    def __init__(self, xpath: str, original_text: str, text_type: str, 
                 shape_id: Optional[int] = None, para_idx: int = 0, run_idx: int = 0):
        self.xpath = xpath
        self.original_text = original_text
        self.text_type = text_type  # 'title', 'subtitle', 'body', 'bullet'
        self.shape_id = shape_id
        self.para_idx = para_idx
        self.run_idx = run_idx
        self.is_placeholder = self._detect_placeholder()
    
    def _detect_placeholder(self) -> bool:
        """Detecta si el texto es un placeholder"""
        text_lower = self.original_text.lower().strip()
        placeholders = [
            'click to add', 'haga clic para', 'título', 'title',
            'subtitle', 'subtítulo', 'text', 'texto', 'add text',
            'agregar texto', 'bullet', 'punto', 'content'
        ]
        return any(p in text_lower for p in placeholders) or len(text_lower) == 0


class PPTXXMLCloner:
    """
    Clonador avanzado de PPTX que preserva TODOS los elementos visuales.
    
    Funciona extrayendo el PPTX (que es un ZIP), modificando solo los
    elementos de texto en el XML, y re-empaquetando el archivo.
    
    Esto preserva:
    - Animaciones (p:timing, p:anim*)
    - Transiciones (p:transition)
    - SmartArt (dgm:*)
    - Gradientes (a:gradFill)
    - Sombras (a:effectLst, a:outerShdw, a:innerShdw)
    - Efectos 3D (a:scene3d, a:sp3d)
    - Imágenes y sus efectos
    - Formas y sus propiedades
    """
    
    def __init__(self, template_path: str):
        """
        Inicializa el clonador con un template.
        
        Args:
            template_path: Ruta al archivo PPTX template
        """
        self.template_path = template_path
        self.temp_dir: Optional[str] = None
        self.text_map: List[List[TextLocation]] = []
        self.slide_count = 0
        
        # Analizar estructura del template
        self._analyze_template()
    
    def _analyze_template(self):
        """Analiza el template para construir el mapa de textos"""
        logger.info(f"📄 Analizando template: {self.template_path}")
        
        # Extraer temporalmente para análisis
        temp_dir = tempfile.mkdtemp()
        try:
            with zipfile.ZipFile(self.template_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Contar slides
            slides_dir = os.path.join(temp_dir, 'ppt', 'slides')
            if os.path.exists(slides_dir):
                slide_files = [f for f in os.listdir(slides_dir) 
                              if f.startswith('slide') and f.endswith('.xml')]
                self.slide_count = len(slide_files)
                
                # Analizar cada slide
                for i in range(1, self.slide_count + 1):
                    slide_path = os.path.join(slides_dir, f'slide{i}.xml')
                    if os.path.exists(slide_path):
                        slide_texts = self._analyze_slide(slide_path, i)
                        self.text_map.append(slide_texts)
                    else:
                        self.text_map.append([])
            
            logger.info(f"✅ Template analizado: {self.slide_count} slides")
            
        finally:
            shutil.rmtree(temp_dir)
    
    def _analyze_slide(self, slide_path: str, slide_num: int) -> List[TextLocation]:
        """Analiza un slide y extrae ubicaciones de texto"""
        texts = []
        
        try:
            tree = etree.parse(slide_path)
            root = tree.getroot()
            
            # Buscar todos los shapes con texto
            # sp = shape, graphicFrame = charts/tables/smartart
            shapes = root.findall('.//p:sp', NAMESPACES)
            
            for shape in shapes:
                shape_id = self._get_shape_id(shape)
                text_type = self._detect_text_type(shape)
                
                # Buscar text body
                txBody = shape.find('.//p:txBody', NAMESPACES)
                if txBody is None:
                    continue
                
                # Analizar párrafos
                paragraphs = txBody.findall('.//a:p', NAMESPACES)
                for para_idx, para in enumerate(paragraphs):
                    runs = para.findall('.//a:r', NAMESPACES)
                    for run_idx, run in enumerate(runs):
                        text_elem = run.find('.//a:t', NAMESPACES)
                        if text_elem is not None and text_elem.text:
                            xpath = self._build_xpath(shape, para_idx, run_idx)
                            texts.append(TextLocation(
                                xpath=xpath,
                                original_text=text_elem.text,
                                text_type=text_type,
                                shape_id=shape_id,
                                para_idx=para_idx,
                                run_idx=run_idx
                            ))
            
            logger.debug(f"   Slide {slide_num}: {len(texts)} textos encontrados")
            
        except Exception as e:
            logger.error(f"Error analizando slide {slide_num}: {e}")
        
        return texts
    
    def _get_shape_id(self, shape) -> Optional[int]:
        """Obtiene el ID del shape"""
        nvSpPr = shape.find('.//p:nvSpPr', NAMESPACES)
        if nvSpPr is not None:
            cNvPr = nvSpPr.find('.//p:cNvPr', NAMESPACES)
            if cNvPr is not None:
                return int(cNvPr.get('id', 0))
        return None
    
    def _detect_text_type(self, shape) -> str:
        """Detecta el tipo de texto basándose en el placeholder type"""
        nvSpPr = shape.find('.//p:nvSpPr', NAMESPACES)
        if nvSpPr is not None:
            nvPr = nvSpPr.find('.//p:nvPr', NAMESPACES)
            if nvPr is not None:
                ph = nvPr.find('.//p:ph', NAMESPACES)
                if ph is not None:
                    ph_type = ph.get('type', '')
                    if ph_type in ['title', 'ctrTitle']:
                        return 'title'
                    elif ph_type in ['subTitle']:
                        return 'subtitle'
                    elif ph_type in ['body']:
                        return 'body'
        return 'body'
    
    def _build_xpath(self, shape, para_idx: int, run_idx: int) -> str:
        """Construye un XPath aproximado para el elemento"""
        shape_id = self._get_shape_id(shape)
        return f"//p:sp[@id='{shape_id}']/p:txBody/a:p[{para_idx+1}]/a:r[{run_idx+1}]/a:t"

    
    def clone_with_content(self, content_by_slide: List[Dict[str, Any]]) -> str:
        """
        Clona el template reemplazando solo el texto.
        
        Args:
            content_by_slide: Lista de diccionarios con contenido por slide.
                Cada diccionario puede tener:
                - 'title': str
                - 'subtitle': str  
                - 'heading': str
                - 'bullets': List[str]
                - 'body': str
        
        Returns:
            Path al archivo PPTX generado
        """
        logger.info(f"🔄 Clonando template con {len(content_by_slide)} slides de contenido")
        
        # 1. Extraer PPTX a directorio temporal
        self.temp_dir = tempfile.mkdtemp()
        with zipfile.ZipFile(self.template_path, 'r') as zip_ref:
            zip_ref.extractall(self.temp_dir)
        
        logger.info(f"📦 Template extraído a: {self.temp_dir}")
        
        # 2. Modificar cada slide
        slides_dir = os.path.join(self.temp_dir, 'ppt', 'slides')
        
        for slide_idx in range(self.slide_count):
            slide_file = f'slide{slide_idx + 1}.xml'
            slide_path = os.path.join(slides_dir, slide_file)
            
            if os.path.exists(slide_path):
                content = content_by_slide[slide_idx] if slide_idx < len(content_by_slide) else {}
                self._modify_slide(slide_path, content, slide_idx)
        
        # 3. Re-empaquetar como PPTX
        output_path = tempfile.mktemp(suffix='.pptx')
        self._create_pptx(output_path)
        
        # 4. Limpiar
        shutil.rmtree(self.temp_dir)
        self.temp_dir = None
        
        logger.info(f"✅ PPTX generado: {output_path}")
        return output_path
    
    def _modify_slide(self, slide_path: str, content: Dict[str, Any], slide_idx: int):
        """
        Modifica el XML de un slide reemplazando textos.
        
        Preserva:
        - Todas las animaciones (p:timing)
        - Transiciones (p:transition)
        - Efectos visuales
        - SmartArt
        """
        logger.info(f"   📝 Modificando slide {slide_idx + 1}")
        
        # Leer el archivo original para preservar la declaración XML exacta
        with open(slide_path, 'rb') as f:
            original_content = f.read()
        
        # Parsear XML preservando namespaces y comentarios
        parser = etree.XMLParser(remove_blank_text=False, strip_cdata=False)
        tree = etree.parse(slide_path, parser)
        root = tree.getroot()
        
        # Verificar si hay animaciones antes de modificar
        timing_before = root.find('.//{http://schemas.openxmlformats.org/presentationml/2006/main}timing')
        if timing_before is not None:
            logger.info(f"   🎬 Slide {slide_idx + 1} tiene animaciones (p:timing)")
        
        # Preparar contenido a insertar
        content_queue = self._prepare_content_queue(content)
        
        if not content_queue:
            logger.debug(f"   Sin contenido para slide {slide_idx + 1}")
            return
        
        # Obtener mapa de textos para este slide
        slide_texts = self.text_map[slide_idx] if slide_idx < len(self.text_map) else []
        
        # Estrategia de reemplazo inteligente
        replacements_made = self._smart_replace(root, content, slide_texts)
        
        logger.info(f"   ✅ {replacements_made} reemplazos en slide {slide_idx + 1}")
        
        # Verificar que las animaciones se preservaron
        timing_after = root.find('.//{http://schemas.openxmlformats.org/presentationml/2006/main}timing')
        if timing_before is not None and timing_after is None:
            logger.warning(f"   ⚠️ ADVERTENCIA: Animaciones perdidas en slide {slide_idx + 1}")
        
        # Guardar cambios preservando formato XML y namespaces
        # Usar método que preserva todos los namespaces originales
        tree.write(slide_path, xml_declaration=True, encoding='UTF-8', standalone=True)
    
    def _prepare_content_queue(self, content: Dict[str, Any]) -> List[Tuple[str, str]]:
        """Prepara cola de contenido ordenada por tipo"""
        queue = []
        
        # Orden de prioridad
        if content.get('title'):
            queue.append(('title', content['title']))
        if content.get('subtitle'):
            queue.append(('subtitle', content['subtitle']))
        if content.get('heading'):
            queue.append(('heading', content['heading']))
        if content.get('body'):
            queue.append(('body', content['body']))
        if content.get('bullets'):
            for bullet in content['bullets']:
                queue.append(('bullet', bullet))
        
        return queue
    
    def _smart_replace(self, root, content: Dict[str, Any], 
                       slide_texts: List[TextLocation]) -> int:
        """
        Reemplazo inteligente basado en tipo de texto y posición.
        """
        replacements = 0
        
        # Buscar todos los shapes
        shapes = root.findall('.//p:sp', NAMESPACES)
        
        # Separar contenido por tipo
        title_content = content.get('title') or content.get('heading')
        subtitle_content = content.get('subtitle')
        bullets_content = content.get('bullets', [])
        body_content = content.get('body')
        
        bullet_idx = 0
        
        for shape in shapes:
            text_type = self._detect_text_type(shape)
            txBody = shape.find('.//p:txBody', NAMESPACES)
            
            if txBody is None:
                continue
            
            paragraphs = txBody.findall('.//a:p', NAMESPACES)
            
            for para_idx, para in enumerate(paragraphs):
                runs = para.findall('.//a:r', NAMESPACES)
                
                for run in runs:
                    text_elem = run.find('.//a:t', NAMESPACES)
                    if text_elem is None:
                        continue
                    
                    original_text = text_elem.text or ''
                    new_text = None
                    
                    # Decidir qué contenido usar basándose en el tipo
                    if text_type == 'title' and title_content:
                        if self._should_replace(original_text, 'title'):
                            new_text = title_content
                            title_content = None  # Usar solo una vez
                    
                    elif text_type == 'subtitle' and subtitle_content:
                        if self._should_replace(original_text, 'subtitle'):
                            new_text = subtitle_content
                            subtitle_content = None
                    
                    elif text_type == 'body':
                        # Para body, usar bullets o body content
                        if bullets_content and bullet_idx < len(bullets_content):
                            if self._should_replace(original_text, 'bullet'):
                                new_text = bullets_content[bullet_idx]
                                bullet_idx += 1
                        elif body_content:
                            if self._should_replace(original_text, 'body'):
                                new_text = body_content
                                body_content = None
                    
                    # Aplicar reemplazo
                    if new_text is not None:
                        text_elem.text = new_text
                        replacements += 1
                        logger.debug(f"      Reemplazado: '{original_text[:30]}...' -> '{new_text[:30]}...'")
        
        return replacements
    
    def _should_replace(self, original_text: str, expected_type: str) -> bool:
        """Determina si un texto debe ser reemplazado"""
        if not original_text:
            return True
        
        text_lower = original_text.lower().strip()
        
        # Siempre reemplazar placeholders
        placeholders = [
            'click to add', 'haga clic', 'add title', 'add text',
            'agregar', 'escriba aquí'
        ]
        if any(p in text_lower for p in placeholders):
            return True
        
        # NO reemplazar textos que parecen ser contenido real
        # (más de 5 palabras probablemente es contenido del template)
        word_count = len(original_text.split())
        if word_count > 5:
            logger.debug(f"      Preservando texto largo ({word_count} palabras): {original_text[:50]}...")
            return False
        
        # Reemplazar textos muy cortos (probablemente placeholders)
        if len(original_text.strip()) < 30:
            return True
        
        return False
    
    def _create_pptx(self, output_path: str):
        """Re-empaqueta el directorio como PPTX válido"""
        logger.info(f"📦 Empaquetando PPTX: {output_path}")
        
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(self.temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, self.temp_dir)
                    
                    # Usar compresión apropiada
                    if file.endswith(('.xml', '.rels')):
                        zipf.write(file_path, arcname, compress_type=zipfile.ZIP_DEFLATED)
                    else:
                        # Binarios (imágenes, etc.) sin compresión adicional
                        zipf.write(file_path, arcname, compress_type=zipfile.ZIP_STORED)
    
    def get_template_info(self) -> Dict[str, Any]:
        """Retorna información sobre el template analizado"""
        return {
            'slide_count': self.slide_count,
            'text_locations': [
                [{'type': t.text_type, 'text': t.original_text[:50], 'is_placeholder': t.is_placeholder}
                 for t in slide_texts]
                for slide_texts in self.text_map
            ]
        }


# ============================================
# FUNCIONES DE CONVENIENCIA
# ============================================

def clone_pptx_preserving_all(template_path: str, content_by_slide: List[Dict[str, Any]]) -> str:
    """
    Función principal para clonar un PPTX preservando todos los elementos visuales.
    
    Args:
        template_path: Ruta al archivo PPTX template
        content_by_slide: Lista de contenido por slide
            [
                {'title': 'Título', 'subtitle': 'Subtítulo'},
                {'heading': 'Sección 1', 'bullets': ['Punto 1', 'Punto 2']},
                ...
            ]
    
    Returns:
        Ruta al archivo PPTX generado
    
    Example:
        >>> output = clone_pptx_preserving_all(
        ...     'template.pptx',
        ...     [
        ...         {'title': 'Mi Presentación', 'subtitle': 'Por Juan'},
        ...         {'heading': 'Introducción', 'bullets': ['Punto A', 'Punto B']}
        ...     ]
        ... )
    """
    cloner = PPTXXMLCloner(template_path)
    return cloner.clone_with_content(content_by_slide)


def analyze_pptx_structure(pptx_path: str) -> Dict[str, Any]:
    """
    Analiza la estructura de un PPTX sin modificarlo.
    
    Útil para debugging y para entender qué textos se pueden reemplazar.
    
    Args:
        pptx_path: Ruta al archivo PPTX
    
    Returns:
        Diccionario con información de la estructura
    """
    cloner = PPTXXMLCloner(pptx_path)
    return cloner.get_template_info()


# ============================================
# TESTING
# ============================================

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python pptx_xml_cloner.py <template.pptx> [--analyze]")
        sys.exit(1)
    
    template_path = sys.argv[1]
    
    if '--analyze' in sys.argv:
        # Solo analizar
        info = analyze_pptx_structure(template_path)
        print(f"\n📊 Análisis de: {template_path}")
        print(f"   Slides: {info['slide_count']}")
        for i, slide_texts in enumerate(info['text_locations']):
            print(f"\n   Slide {i+1}:")
            for t in slide_texts:
                placeholder = "📌" if t['is_placeholder'] else "📝"
                print(f"      {placeholder} [{t['type']}] {t['text']}")
    else:
        # Clonar con contenido de prueba
        test_content = [
            {'title': 'Título de Prueba', 'subtitle': 'Subtítulo generado'},
            {'heading': 'Primera Sección', 'bullets': ['Punto uno', 'Punto dos', 'Punto tres']},
        ]
        
        output = clone_pptx_preserving_all(template_path, test_content)
        print(f"\n✅ PPTX generado: {output}")
