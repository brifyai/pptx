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


# Patrones de placeholder compilados para mejor rendimiento
PLACEHOLDER_PATTERNS = [
    re.compile(r'^click\s+to\s+add', re.IGNORECASE),
    re.compile(r'^haga\s+clic\s+(para|aquí)', re.IGNORECASE),
    re.compile(r'^(add|insert|enter)\s+\w+', re.IGNORECASE),
    re.compile(r'^(agregar|insertar|escribir)', re.IGNORECASE),
    re.compile(r'^\[.+\]$'),
    re.compile(r'^<.+>$'),
    re.compile(r'^\{.+\}$'),
    re.compile(r'^lorem\s+ipsum', re.IGNORECASE),
]

PLACEHOLDER_PHRASES = frozenset([
    'click to add', 'add title', 'add subtitle', 'add text',
    'enter text', 'type here', 'your text here', 'placeholder',
    'haga clic', 'agregar título', 'agregar texto', 'escriba aquí',
    'su texto aquí', 'texto de ejemplo', 'título principal',
    'clique para', 'adicionar título', 'digite aqui',
    'cliquez pour', 'ajouter titre', 'ajouter texte',
])

GENERIC_WORDS = frozenset([
    'título', 'title', 'heading', 'subtitle', 'subtítulo',
    'bullet', 'punto', 'item', 'content', 'contenido',
    'text', 'texto', 'name', 'nombre', 'date', 'fecha',
])


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
        """Detecta si el texto es un placeholder usando análisis semántico"""
        if not self.original_text:
            return True
        
        text = self.original_text.strip()
        text_lower = text.lower()
        
        # Texto muy corto
        if len(text) < 3:
            return True
        
        # Patrones regex
        for pattern in PLACEHOLDER_PATTERNS:
            if pattern.match(text_lower):
                return True
        
        # Frases de placeholder
        if any(phrase in text_lower for phrase in PLACEHOLDER_PHRASES):
            return True
        
        # Palabra genérica exacta
        if text_lower in GENERIC_WORDS:
            return True
        
        # Texto largo probablemente es contenido real
        if len(text.split()) > 8:
            return False
        
        # Por defecto, textos cortos son placeholders
        return len(text) < 30


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
        self.fonts_used: set = set()  # Fuentes usadas en el template
        self.preservation_report: List[Dict] = []  # Reporte de preservación
        
        # Analizar estructura del template
        self._analyze_template()
    
    def _analyze_template(self):
        """Analiza el template para construir el mapa de textos y extraer fuentes"""
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
            
            # Extraer fuentes del template
            self._extract_fonts(temp_dir)
            
        finally:
            shutil.rmtree(temp_dir)
    
    def _extract_fonts(self, temp_dir: str):
        """Extrae todas las fuentes usadas en el template"""
        fonts = set()
        
        # Buscar en todos los slides
        slides_dir = os.path.join(temp_dir, 'ppt', 'slides')
        if os.path.exists(slides_dir):
            for slide_file in os.listdir(slides_dir):
                if slide_file.endswith('.xml'):
                    slide_path = os.path.join(slides_dir, slide_file)
                    fonts.update(self._extract_fonts_from_xml(slide_path))
        
        # Buscar en slide masters
        masters_dir = os.path.join(temp_dir, 'ppt', 'slideMasters')
        if os.path.exists(masters_dir):
            for master_file in os.listdir(masters_dir):
                if master_file.endswith('.xml'):
                    master_path = os.path.join(masters_dir, master_file)
                    fonts.update(self._extract_fonts_from_xml(master_path))
        
        # Buscar en slide layouts
        layouts_dir = os.path.join(temp_dir, 'ppt', 'slideLayouts')
        if os.path.exists(layouts_dir):
            for layout_file in os.listdir(layouts_dir):
                if layout_file.endswith('.xml'):
                    layout_path = os.path.join(layouts_dir, layout_file)
                    fonts.update(self._extract_fonts_from_xml(layout_path))
        
        # Buscar en theme
        theme_dir = os.path.join(temp_dir, 'ppt', 'theme')
        if os.path.exists(theme_dir):
            for theme_file in os.listdir(theme_dir):
                if theme_file.endswith('.xml'):
                    theme_path = os.path.join(theme_dir, theme_file)
                    fonts.update(self._extract_fonts_from_xml(theme_path))
        
        self.fonts_used = fonts
        if fonts:
            logger.info(f"🔤 Fuentes detectadas: {', '.join(sorted(fonts))}")
    
    def _extract_fonts_from_xml(self, xml_path: str) -> set:
        """Extrae nombres de fuentes de un archivo XML"""
        fonts = set()
        try:
            tree = etree.parse(xml_path)
            root = tree.getroot()
            
            # Buscar elementos de fuente en diferentes ubicaciones
            # a:latin, a:ea, a:cs (fuentes latinas, asiáticas, complejas)
            for font_elem in root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}latin'):
                typeface = font_elem.get('typeface')
                if typeface and not typeface.startswith('+'):  # Ignorar +mj-lt, +mn-lt (theme fonts)
                    fonts.add(typeface)
            
            for font_elem in root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}ea'):
                typeface = font_elem.get('typeface')
                if typeface and not typeface.startswith('+'):
                    fonts.add(typeface)
            
            for font_elem in root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}cs'):
                typeface = font_elem.get('typeface')
                if typeface and not typeface.startswith('+'):
                    fonts.add(typeface)
            
            # Buscar en theme fonts (majorFont, minorFont)
            for font_elem in root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}majorFont/{http://schemas.openxmlformats.org/drawingml/2006/main}latin'):
                typeface = font_elem.get('typeface')
                if typeface:
                    fonts.add(typeface)
            
            for font_elem in root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}minorFont/{http://schemas.openxmlformats.org/drawingml/2006/main}latin'):
                typeface = font_elem.get('typeface')
                if typeface:
                    fonts.add(typeface)
                    
        except Exception as e:
            logger.debug(f"Error extrayendo fuentes de {xml_path}: {e}")
        
        return fonts
    
    def get_fonts_used(self) -> List[str]:
        """Retorna lista de fuentes usadas en el template"""
        return sorted(list(self.fonts_used))
    
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
        
        # Capturar estado de elementos críticos ANTES de modificar
        preservation_state = self._capture_preservation_state(root, slide_idx)
        
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
        
        # Verificar preservación DESPUÉS de modificar
        self._verify_preservation(root, preservation_state, slide_idx)
        
        # Guardar cambios preservando formato XML y namespaces
        tree.write(slide_path, xml_declaration=True, encoding='UTF-8', standalone=True)
    
    def _capture_preservation_state(self, root, slide_idx: int) -> Dict[str, Any]:
        """
        Captura el estado de elementos críticos antes de modificar.
        Usado para verificar que no se perdieron durante la edición.
        """
        ns_p = '{http://schemas.openxmlformats.org/presentationml/2006/main}'
        ns_a = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
        
        state = {
            'slide_idx': slide_idx,
            'has_timing': root.find(f'.//{ns_p}timing') is not None,
            'has_transition': root.find(f'.//{ns_p}transition') is not None,
            'has_gradient': root.find(f'.//{ns_a}gradFill') is not None,
            'has_shadow': root.find(f'.//{ns_a}outerShdw') is not None or root.find(f'.//{ns_a}innerShdw') is not None,
            'has_3d': root.find(f'.//{ns_a}scene3d') is not None or root.find(f'.//{ns_a}sp3d') is not None,
            'has_smartart': root.find('.//{http://schemas.openxmlformats.org/drawingml/2006/diagram}*') is not None,
            'shape_count': len(root.findall(f'.//{ns_p}sp')),
            'image_count': len(root.findall(f'.//{ns_p}pic')),
        }
        
        if state['has_timing']:
            logger.info(f"   🎬 Slide {slide_idx + 1}: Animaciones detectadas")
        if state['has_transition']:
            logger.info(f"   🔄 Slide {slide_idx + 1}: Transición detectada")
        if state['has_gradient']:
            logger.info(f"   🎨 Slide {slide_idx + 1}: Gradientes detectados")
        if state['has_shadow']:
            logger.info(f"   🌑 Slide {slide_idx + 1}: Sombras detectadas")
        if state['has_3d']:
            logger.info(f"   📦 Slide {slide_idx + 1}: Efectos 3D detectados")
        if state['has_smartart']:
            logger.info(f"   📊 Slide {slide_idx + 1}: SmartArt detectado")
        
        return state
    
    def _verify_preservation(self, root, before_state: Dict[str, Any], slide_idx: int) -> bool:
        """
        Verifica que los elementos críticos se preservaron después de modificar.
        Registra warnings si algo se perdió.
        """
        ns_p = '{http://schemas.openxmlformats.org/presentationml/2006/main}'
        ns_a = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
        
        issues = []
        
        # Verificar animaciones
        if before_state['has_timing']:
            if root.find(f'.//{ns_p}timing') is None:
                issues.append("❌ ANIMACIONES PERDIDAS (p:timing)")
        
        # Verificar transiciones
        if before_state['has_transition']:
            if root.find(f'.//{ns_p}transition') is None:
                issues.append("❌ TRANSICIÓN PERDIDA (p:transition)")
        
        # Verificar gradientes
        if before_state['has_gradient']:
            if root.find(f'.//{ns_a}gradFill') is None:
                issues.append("❌ GRADIENTES PERDIDOS (a:gradFill)")
        
        # Verificar sombras
        if before_state['has_shadow']:
            has_shadow_after = root.find(f'.//{ns_a}outerShdw') is not None or root.find(f'.//{ns_a}innerShdw') is not None
            if not has_shadow_after:
                issues.append("❌ SOMBRAS PERDIDAS (a:outerShdw/innerShdw)")
        
        # Verificar 3D
        if before_state['has_3d']:
            has_3d_after = root.find(f'.//{ns_a}scene3d') is not None or root.find(f'.//{ns_a}sp3d') is not None
            if not has_3d_after:
                issues.append("❌ EFECTOS 3D PERDIDOS (a:scene3d/sp3d)")
        
        # Verificar SmartArt
        if before_state['has_smartart']:
            if root.find('.//{http://schemas.openxmlformats.org/drawingml/2006/diagram}*') is None:
                issues.append("❌ SMARTART PERDIDO (dgm:*)")
        
        # Verificar conteo de shapes
        shape_count_after = len(root.findall(f'.//{ns_p}sp'))
        if shape_count_after < before_state['shape_count']:
            issues.append(f"⚠️ SHAPES REDUCIDOS: {before_state['shape_count']} -> {shape_count_after}")
        
        # Reportar resultados
        if issues:
            logger.warning(f"   ⚠️ PROBLEMAS DE PRESERVACIÓN en slide {slide_idx + 1}:")
            for issue in issues:
                logger.warning(f"      {issue}")
            return False
        else:
            logger.info(f"   ✅ Preservación verificada en slide {slide_idx + 1}")
            return True
    
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
        """
        Determina si un texto debe ser reemplazado usando detección semántica avanzada.
        
        Estrategia:
        1. Texto vacío → reemplazar
        2. Placeholder explícito (regex) → reemplazar
        3. Placeholder por idioma (ES/EN/PT/FR) → reemplazar
        4. Patrón de marcador [texto] o <texto> → reemplazar
        5. Texto genérico de template → reemplazar
        6. Contenido real (>5 palabras con sentido) → preservar
        """
        if not original_text:
            return True
        
        text = original_text.strip()
        text_lower = text.lower()
        
        # 1. Patrones de placeholder explícitos (regex)
        placeholder_patterns = [
            r'^click\s+to\s+add',           # "Click to add title"
            r'^haga\s+clic\s+(para|aquí)',  # "Haga clic para agregar"
            r'^(add|insert|enter)\s+\w+',   # "Add title", "Insert text"
            r'^(agregar|insertar|escribir)', # Español
            r'^(adicionar|inserir)',         # Portugués
            r'^(ajouter|insérer)',           # Francés
            r'^\[.+\]$',                     # [Título aquí]
            r'^<.+>$',                       # <Insertar texto>
            r'^\{.+\}$',                     # {Placeholder}
            r'^_{2,}$',                      # _____ (líneas)
            r'^\.\.\.$',                     # ...
            r'^lorem\s+ipsum',              # Lorem ipsum
            r'^sample\s+text',              # Sample text
            r'^texto\s+de\s+(ejemplo|muestra)', # Texto de ejemplo
        ]
        
        for pattern in placeholder_patterns:
            if re.match(pattern, text_lower):
                logger.debug(f"      Placeholder detectado (regex): {text[:40]}...")
                return True
        
        # 2. Frases de placeholder por idioma
        placeholder_phrases = [
            # Inglés
            'click to add', 'add title', 'add subtitle', 'add text',
            'enter text', 'type here', 'your text here', 'insert text',
            'edit text', 'placeholder', 'sample', 'example text',
            # Español
            'haga clic', 'agregar título', 'agregar texto', 'escriba aquí',
            'su texto aquí', 'insertar texto', 'texto de ejemplo',
            'editar texto', 'título principal', 'subtítulo',
            # Portugués
            'clique para', 'adicionar título', 'adicionar texto',
            'digite aqui', 'seu texto aqui', 'inserir texto',
            # Francés
            'cliquez pour', 'ajouter titre', 'ajouter texte',
            'tapez ici', 'votre texte ici', 'insérer texte',
            # Alemán
            'klicken sie', 'text hinzufügen', 'titel hinzufügen',
        ]
        
        if any(phrase in text_lower for phrase in placeholder_phrases):
            logger.debug(f"      Placeholder detectado (frase): {text[:40]}...")
            return True
        
        # 3. Textos genéricos de templates corporativos
        generic_templates = [
            'título', 'title', 'heading', 'subtitle', 'subtítulo',
            'bullet point', 'punto', 'item', 'content', 'contenido',
            'description', 'descripción', 'text', 'texto',
            'nombre', 'name', 'fecha', 'date', 'autor', 'author',
        ]
        
        # Si el texto es exactamente una palabra genérica
        if text_lower in generic_templates:
            logger.debug(f"      Texto genérico detectado: {text}")
            return True
        
        # 4. Texto muy corto (< 3 caracteres) probablemente es placeholder
        if len(text) < 3:
            return True
        
        # 5. Análisis de contenido real
        word_count = len(text.split())
        
        # Textos con más de 8 palabras probablemente son contenido real del template
        # que el usuario quiere preservar (ej: disclaimer, copyright, etc.)
        if word_count > 8:
            logger.debug(f"      Preservando contenido largo ({word_count} palabras): {text[:50]}...")
            return False
        
        # 6. Detectar contenido que parece ser información real
        # (números de teléfono, emails, URLs, fechas específicas)
        real_content_patterns = [
            r'\d{2,4}[-/]\d{2}[-/]\d{2,4}',  # Fechas
            r'\+?\d{1,3}[-.\s]?\d{3,}',      # Teléfonos
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # Emails
            r'https?://\S+',                  # URLs
            r'www\.\S+',                      # URLs sin protocolo
            r'©|®|™',                         # Símbolos de copyright
            r'\d{4}\s*(©|copyright)',         # Año + copyright
        ]
        
        for pattern in real_content_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                logger.debug(f"      Preservando contenido real (patrón): {text[:50]}...")
                return False
        
        # 7. Por defecto, reemplazar textos cortos (< 30 chars) o con pocas palabras (< 5)
        if len(text) < 30 or word_count < 5:
            return True
        
        # 8. Caso ambiguo: preservar por seguridad
        logger.debug(f"      Caso ambiguo, preservando: {text[:50]}...")
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
            'fonts_used': self.get_fonts_used(),
            'text_locations': [
                [{'type': t.text_type, 'text': t.original_text[:50], 'is_placeholder': t.is_placeholder}
                 for t in slide_texts]
                for slide_texts in self.text_map
            ],
            'preservation_report': self.preservation_report
        }
    
    def get_preservation_summary(self) -> Dict[str, Any]:
        """Retorna resumen del reporte de preservación después de clonar"""
        if not self.preservation_report:
            return {'status': 'not_cloned', 'message': 'No se ha clonado aún'}
        
        total_slides = len(self.preservation_report)
        preserved = sum(1 for r in self.preservation_report if r.get('preserved', False))
        
        return {
            'status': 'success' if preserved == total_slides else 'warning',
            'total_slides': total_slides,
            'fully_preserved': preserved,
            'issues': [r for r in self.preservation_report if not r.get('preserved', False)]
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


def verify_fonts_available(pptx_path: str) -> Dict[str, Any]:
    """
    Verifica qué fuentes del template están disponibles en el sistema.
    
    Args:
        pptx_path: Ruta al archivo PPTX
    
    Returns:
        Diccionario con fuentes disponibles y faltantes
    """
    try:
        from font_detector import get_system_fonts, check_google_fonts_availability
    except ImportError:
        logger.warning("font_detector no disponible, usando verificación básica")
        get_system_fonts = None
        check_google_fonts_availability = None
    
    cloner = PPTXXMLCloner(pptx_path)
    fonts_used = cloner.get_fonts_used()
    
    result = {
        'fonts_in_template': fonts_used,
        'fonts_available': [],
        'fonts_missing': [],
        'fonts_in_google': [],
        'warnings': []
    }
    
    if get_system_fonts:
        system_fonts = get_system_fonts()
        system_fonts_lower = {f.lower() for f in system_fonts}
        
        for font in fonts_used:
            if font.lower() in system_fonts_lower:
                result['fonts_available'].append(font)
            else:
                result['fonts_missing'].append(font)
                result['warnings'].append(f"⚠️ Fuente '{font}' no instalada en el sistema")
        
        # Verificar disponibilidad en Google Fonts
        if check_google_fonts_availability and result['fonts_missing']:
            google_available = check_google_fonts_availability(result['fonts_missing'])
            result['fonts_in_google'] = google_available
            
            for font in google_available:
                result['warnings'].append(f"💡 '{font}' disponible en Google Fonts")
    else:
        # Sin font_detector, solo reportar las fuentes encontradas
        result['fonts_available'] = fonts_used
        result['warnings'].append("ℹ️ Verificación de fuentes del sistema no disponible")
    
    return result


def clone_with_font_check(
    template_path: str, 
    content_by_slide: List[Dict[str, Any]],
    warn_on_missing_fonts: bool = True
) -> Tuple[str, Dict[str, Any]]:
    """
    Clona un PPTX con verificación de fuentes previa.
    
    Args:
        template_path: Ruta al template
        content_by_slide: Contenido por slide
        warn_on_missing_fonts: Si True, registra warnings para fuentes faltantes
    
    Returns:
        Tupla de (ruta_pptx_generado, reporte_fuentes)
    """
    # Verificar fuentes primero
    font_report = verify_fonts_available(template_path)
    
    if warn_on_missing_fonts and font_report['fonts_missing']:
        logger.warning(f"⚠️ Fuentes faltantes: {', '.join(font_report['fonts_missing'])}")
        for warning in font_report['warnings']:
            logger.warning(f"   {warning}")
    
    # Clonar
    output_path = clone_pptx_preserving_all(template_path, content_by_slide)
    
    return output_path, font_report


# ============================================
# TESTING
# ============================================

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Uso: python pptx_xml_cloner.py <template.pptx> [--analyze] [--fonts]")
        sys.exit(1)
    
    template_path = sys.argv[1]
    
    if '--fonts' in sys.argv:
        # Verificar fuentes
        font_info = verify_fonts_available(template_path)
        print(f"\n🔤 Fuentes en template: {', '.join(font_info['fonts_in_template'])}")
        print(f"✅ Disponibles: {', '.join(font_info['fonts_available'])}")
        if font_info['fonts_missing']:
            print(f"❌ Faltantes: {', '.join(font_info['fonts_missing'])}")
        if font_info['fonts_in_google']:
            print(f"🌐 En Google Fonts: {', '.join(font_info['fonts_in_google'])}")
        sys.exit(0)
    
    if '--analyze' in sys.argv:
        # Solo analizar
        info = analyze_pptx_structure(template_path)
        print(f"\n📊 Análisis de: {template_path}")
        print(f"   Slides: {info['slide_count']}")
        print(f"   Fuentes: {', '.join(info['fonts_used'])}")
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
