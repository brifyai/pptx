"""
Font Detector - Detecta fuentes usadas en PPTX y verifica disponibilidad.

Funcionalidades:
- Extrae todas las fuentes usadas en un PPTX
- Verifica cuáles están disponibles en el sistema
- Busca alternativas en Google Fonts
- Genera CSS para cargar fuentes web
"""

import zipfile
import tempfile
import os
import re
from typing import Dict, List, Set, Optional, Any
from lxml import etree
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Namespaces de PowerPoint
NAMESPACES = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
}

# Fuentes comunes del sistema (Windows + Mac + Linux)
SYSTEM_FONTS = {
    # Windows
    'arial', 'calibri', 'cambria', 'candara', 'comic sans ms', 'consolas',
    'constantia', 'corbel', 'courier new', 'georgia', 'impact', 'lucida console',
    'lucida sans unicode', 'palatino linotype', 'segoe ui', 'tahoma', 'times new roman',
    'trebuchet ms', 'verdana', 'wingdings', 'symbol',
    # Mac
    'helvetica', 'helvetica neue', 'avenir', 'avenir next', 'futura', 'gill sans',
    'optima', 'palatino', 'san francisco', 'sf pro',
    # Linux
    'dejavu sans', 'dejavu serif', 'liberation sans', 'liberation serif',
    'ubuntu', 'noto sans', 'noto serif', 'roboto', 'open sans',
    # Genéricas
    'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
}

# Mapeo de fuentes a Google Fonts equivalentes
GOOGLE_FONTS_MAP = {
    # Microsoft fonts -> Google equivalents
    'calibri': 'Carlito',
    'cambria': 'Caladea',
    'arial': 'Arimo',
    'times new roman': 'Tinos',
    'courier new': 'Cousine',
    'georgia': 'Gelasio',
    'verdana': 'Open Sans',
    'tahoma': 'PT Sans',
    'trebuchet ms': 'Fira Sans',
    'impact': 'Anton',
    'comic sans ms': 'Comic Neue',
    'palatino linotype': 'EB Garamond',
    'century gothic': 'Questrial',
    'franklin gothic': 'Libre Franklin',
    'garamond': 'EB Garamond',
    'book antiqua': 'Crimson Text',
    'rockwell': 'Rokkitt',
    'segoe ui': 'Source Sans Pro',
    # Fuentes populares que están en Google Fonts
    'roboto': 'Roboto',
    'open sans': 'Open Sans',
    'lato': 'Lato',
    'montserrat': 'Montserrat',
    'oswald': 'Oswald',
    'raleway': 'Raleway',
    'poppins': 'Poppins',
    'nunito': 'Nunito',
    'playfair display': 'Playfair Display',
    'merriweather': 'Merriweather',
    'source sans pro': 'Source Sans Pro',
    'ubuntu': 'Ubuntu',
    'pt sans': 'PT Sans',
    'noto sans': 'Noto Sans',
    'fira sans': 'Fira Sans',
    'work sans': 'Work Sans',
    'inter': 'Inter',
    'quicksand': 'Quicksand',
    'rubik': 'Rubik',
    'karla': 'Karla',
    'josefin sans': 'Josefin Sans',
    'dancing script': 'Dancing Script',
    'pacifico': 'Pacifico',
    'lobster': 'Lobster',
    'bebas neue': 'Bebas Neue',
}

# Lista de fuentes disponibles en Google Fonts (subset popular)
GOOGLE_FONTS_AVAILABLE = set(GOOGLE_FONTS_MAP.values()) | {
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway',
    'Poppins', 'Nunito', 'Playfair Display', 'Merriweather', 'Source Sans Pro',
    'Ubuntu', 'PT Sans', 'Noto Sans', 'Fira Sans', 'Work Sans', 'Inter',
    'Quicksand', 'Rubik', 'Karla', 'Josefin Sans', 'Dancing Script',
    'Pacifico', 'Lobster', 'Bebas Neue', 'Arimo', 'Tinos', 'Cousine',
    'Carlito', 'Caladea', 'Gelasio', 'Anton', 'Comic Neue', 'EB Garamond',
    'Questrial', 'Libre Franklin', 'Rokkitt', 'Crimson Text', 'Barlow',
    'Mulish', 'Cabin', 'Archivo', 'Manrope', 'DM Sans', 'Space Grotesk',
    'Outfit', 'Plus Jakarta Sans', 'Sora', 'Lexend'
}


class FontInfo:
    """Información sobre una fuente detectada"""
    def __init__(self, name: str):
        self.name = name
        self.name_lower = name.lower().strip()
        self.is_system_font = self.name_lower in SYSTEM_FONTS
        self.google_font_name = self._find_google_font()
        self.is_available_online = self.google_font_name is not None
        self.usage_count = 1
        self.slides_used = set()
    
    def _find_google_font(self) -> Optional[str]:
        """Busca equivalente en Google Fonts"""
        # Primero buscar mapeo directo
        if self.name_lower in GOOGLE_FONTS_MAP:
            return GOOGLE_FONTS_MAP[self.name_lower]
        
        # Buscar si el nombre exacto está en Google Fonts
        for gf in GOOGLE_FONTS_AVAILABLE:
            if gf.lower() == self.name_lower:
                return gf
        
        # Buscar coincidencia parcial
        for gf in GOOGLE_FONTS_AVAILABLE:
            if self.name_lower in gf.lower() or gf.lower() in self.name_lower:
                return gf
        
        return None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'isSystemFont': self.is_system_font,
            'isAvailableOnline': self.is_available_online,
            'googleFontName': self.google_font_name,
            'usageCount': self.usage_count,
            'slidesUsed': list(self.slides_used)
        }


def extract_fonts_from_pptx(pptx_path: str) -> Dict[str, FontInfo]:
    """
    Extrae todas las fuentes usadas en un archivo PPTX.
    
    Args:
        pptx_path: Ruta al archivo PPTX
    
    Returns:
        Diccionario de FontInfo por nombre de fuente
    """
    fonts: Dict[str, FontInfo] = {}
    
    temp_dir = tempfile.mkdtemp()
    try:
        # Extraer PPTX
        with zipfile.ZipFile(pptx_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
        
        # Buscar fuentes en slides
        slides_dir = os.path.join(temp_dir, 'ppt', 'slides')
        if os.path.exists(slides_dir):
            slide_files = sorted([f for f in os.listdir(slides_dir) 
                                 if f.startswith('slide') and f.endswith('.xml')])
            
            for slide_file in slide_files:
                slide_num = int(re.search(r'slide(\d+)', slide_file).group(1))
                slide_path = os.path.join(slides_dir, slide_file)
                slide_fonts = _extract_fonts_from_xml(slide_path)
                
                for font_name in slide_fonts:
                    if font_name not in fonts:
                        fonts[font_name] = FontInfo(font_name)
                    else:
                        fonts[font_name].usage_count += 1
                    fonts[font_name].slides_used.add(slide_num)
        
        # Buscar fuentes en theme
        theme_dir = os.path.join(temp_dir, 'ppt', 'theme')
        if os.path.exists(theme_dir):
            for theme_file in os.listdir(theme_dir):
                if theme_file.endswith('.xml'):
                    theme_path = os.path.join(theme_dir, theme_file)
                    theme_fonts = _extract_fonts_from_xml(theme_path)
                    for font_name in theme_fonts:
                        if font_name not in fonts:
                            fonts[font_name] = FontInfo(font_name)
        
        # Buscar fuentes en slideMasters
        masters_dir = os.path.join(temp_dir, 'ppt', 'slideMasters')
        if os.path.exists(masters_dir):
            for master_file in os.listdir(masters_dir):
                if master_file.endswith('.xml'):
                    master_path = os.path.join(masters_dir, master_file)
                    master_fonts = _extract_fonts_from_xml(master_path)
                    for font_name in master_fonts:
                        if font_name not in fonts:
                            fonts[font_name] = FontInfo(font_name)
        
        logger.info(f"📝 Fuentes detectadas: {len(fonts)}")
        for name, info in fonts.items():
            status = "✅" if info.is_system_font or info.is_available_online else "⚠️"
            logger.info(f"   {status} {name} (usado {info.usage_count}x)")
        
    finally:
        import shutil
        shutil.rmtree(temp_dir)
    
    return fonts


def _extract_fonts_from_xml(xml_path: str) -> Set[str]:
    """Extrae nombres de fuentes de un archivo XML"""
    fonts = set()
    
    try:
        tree = etree.parse(xml_path)
        root = tree.getroot()
        
        # Buscar elementos de fuente: <a:latin typeface="Arial"/>
        for elem in root.iter():
            # Fuentes latinas
            if elem.tag.endswith('}latin') or elem.tag == 'latin':
                typeface = elem.get('typeface')
                if typeface and not typeface.startswith('+'):
                    fonts.add(typeface)
            
            # Fuentes de Asia Oriental
            if elem.tag.endswith('}ea') or elem.tag == 'ea':
                typeface = elem.get('typeface')
                if typeface and not typeface.startswith('+'):
                    fonts.add(typeface)
            
            # Fuentes complejas (árabe, hebreo, etc.)
            if elem.tag.endswith('}cs') or elem.tag == 'cs':
                typeface = elem.get('typeface')
                if typeface and not typeface.startswith('+'):
                    fonts.add(typeface)
            
            # Fuentes en defRPr (default run properties)
            if 'rPr' in elem.tag:
                for child in elem:
                    if 'latin' in child.tag or 'ea' in child.tag or 'cs' in child.tag:
                        typeface = child.get('typeface')
                        if typeface and not typeface.startswith('+'):
                            fonts.add(typeface)
    
    except Exception as e:
        logger.warning(f"Error extrayendo fuentes de {xml_path}: {e}")
    
    return fonts


# Links directos de descarga para fuentes conocidas
# Formato: 'nombre_fuente_lower': {'url': 'link_directo', 'site': 'nombre_sitio'}
DIRECT_DOWNLOAD_LINKS = {
    # Google Fonts - links directos al ZIP
    'roboto': {'url': 'https://fonts.google.com/download?family=Roboto', 'site': 'Google Fonts'},
    'open sans': {'url': 'https://fonts.google.com/download?family=Open+Sans', 'site': 'Google Fonts'},
    'lato': {'url': 'https://fonts.google.com/download?family=Lato', 'site': 'Google Fonts'},
    'montserrat': {'url': 'https://fonts.google.com/download?family=Montserrat', 'site': 'Google Fonts'},
    'oswald': {'url': 'https://fonts.google.com/download?family=Oswald', 'site': 'Google Fonts'},
    'raleway': {'url': 'https://fonts.google.com/download?family=Raleway', 'site': 'Google Fonts'},
    'poppins': {'url': 'https://fonts.google.com/download?family=Poppins', 'site': 'Google Fonts'},
    'nunito': {'url': 'https://fonts.google.com/download?family=Nunito', 'site': 'Google Fonts'},
    'inter': {'url': 'https://fonts.google.com/download?family=Inter', 'site': 'Google Fonts'},
    'source sans pro': {'url': 'https://fonts.google.com/download?family=Source+Sans+Pro', 'site': 'Google Fonts'},
    'ubuntu': {'url': 'https://fonts.google.com/download?family=Ubuntu', 'site': 'Google Fonts'},
    'pt sans': {'url': 'https://fonts.google.com/download?family=PT+Sans', 'site': 'Google Fonts'},
    'noto sans': {'url': 'https://fonts.google.com/download?family=Noto+Sans', 'site': 'Google Fonts'},
    'work sans': {'url': 'https://fonts.google.com/download?family=Work+Sans', 'site': 'Google Fonts'},
    'quicksand': {'url': 'https://fonts.google.com/download?family=Quicksand', 'site': 'Google Fonts'},
    'rubik': {'url': 'https://fonts.google.com/download?family=Rubik', 'site': 'Google Fonts'},
    'fira sans': {'url': 'https://fonts.google.com/download?family=Fira+Sans', 'site': 'Google Fonts'},
    'dm sans': {'url': 'https://fonts.google.com/download?family=DM+Sans', 'site': 'Google Fonts'},
    'manrope': {'url': 'https://fonts.google.com/download?family=Manrope', 'site': 'Google Fonts'},
    'space grotesk': {'url': 'https://fonts.google.com/download?family=Space+Grotesk', 'site': 'Google Fonts'},
    'outfit': {'url': 'https://fonts.google.com/download?family=Outfit', 'site': 'Google Fonts'},
    'plus jakarta sans': {'url': 'https://fonts.google.com/download?family=Plus+Jakarta+Sans', 'site': 'Google Fonts'},
    'lexend': {'url': 'https://fonts.google.com/download?family=Lexend', 'site': 'Google Fonts'},
    
    # Alternativas gratuitas a fuentes de Microsoft
    'carlito': {'url': 'https://fonts.google.com/download?family=Carlito', 'site': 'Google Fonts', 'replaces': 'Calibri'},
    'caladea': {'url': 'https://fonts.google.com/download?family=Caladea', 'site': 'Google Fonts', 'replaces': 'Cambria'},
    'arimo': {'url': 'https://fonts.google.com/download?family=Arimo', 'site': 'Google Fonts', 'replaces': 'Arial'},
    'tinos': {'url': 'https://fonts.google.com/download?family=Tinos', 'site': 'Google Fonts', 'replaces': 'Times New Roman'},
    'cousine': {'url': 'https://fonts.google.com/download?family=Cousine', 'site': 'Google Fonts', 'replaces': 'Courier New'},
    'gelasio': {'url': 'https://fonts.google.com/download?family=Gelasio', 'site': 'Google Fonts', 'replaces': 'Georgia'},
}

# Mapeo de fuentes propietarias a sus alternativas gratuitas con descarga directa
PROPRIETARY_FONT_ALTERNATIVES = {
    'calibri': {'alternative': 'Carlito', 'url': 'https://fonts.google.com/download?family=Carlito'},
    'calibri light': {'alternative': 'Carlito', 'url': 'https://fonts.google.com/download?family=Carlito'},
    'cambria': {'alternative': 'Caladea', 'url': 'https://fonts.google.com/download?family=Caladea'},
    'arial': {'alternative': 'Arimo', 'url': 'https://fonts.google.com/download?family=Arimo'},
    'arial narrow': {'alternative': 'Arimo', 'url': 'https://fonts.google.com/download?family=Arimo'},
    'times new roman': {'alternative': 'Tinos', 'url': 'https://fonts.google.com/download?family=Tinos'},
    'courier new': {'alternative': 'Cousine', 'url': 'https://fonts.google.com/download?family=Cousine'},
    'georgia': {'alternative': 'Gelasio', 'url': 'https://fonts.google.com/download?family=Gelasio'},
    'verdana': {'alternative': 'Open Sans', 'url': 'https://fonts.google.com/download?family=Open+Sans'},
    'tahoma': {'alternative': 'PT Sans', 'url': 'https://fonts.google.com/download?family=PT+Sans'},
    'trebuchet ms': {'alternative': 'Fira Sans', 'url': 'https://fonts.google.com/download?family=Fira+Sans'},
    'impact': {'alternative': 'Anton', 'url': 'https://fonts.google.com/download?family=Anton'},
    'comic sans ms': {'alternative': 'Comic Neue', 'url': 'https://fonts.google.com/download?family=Comic+Neue'},
    'century gothic': {'alternative': 'Questrial', 'url': 'https://fonts.google.com/download?family=Questrial'},
    'segoe ui': {'alternative': 'Source Sans Pro', 'url': 'https://fonts.google.com/download?family=Source+Sans+Pro'},
    'segoe ui light': {'alternative': 'Source Sans Pro', 'url': 'https://fonts.google.com/download?family=Source+Sans+Pro'},
    'helvetica': {'alternative': 'Arimo', 'url': 'https://fonts.google.com/download?family=Arimo'},
    'helvetica neue': {'alternative': 'Inter', 'url': 'https://fonts.google.com/download?family=Inter'},
    'futura': {'alternative': 'Nunito', 'url': 'https://fonts.google.com/download?family=Nunito'},
    'gill sans': {'alternative': 'Lato', 'url': 'https://fonts.google.com/download?family=Lato'},
    'garamond': {'alternative': 'EB Garamond', 'url': 'https://fonts.google.com/download?family=EB+Garamond'},
    'palatino': {'alternative': 'EB Garamond', 'url': 'https://fonts.google.com/download?family=EB+Garamond'},
    'book antiqua': {'alternative': 'Crimson Text', 'url': 'https://fonts.google.com/download?family=Crimson+Text'},
    'rockwell': {'alternative': 'Rokkitt', 'url': 'https://fonts.google.com/download?family=Rokkitt'},
    'franklin gothic': {'alternative': 'Libre Franklin', 'url': 'https://fonts.google.com/download?family=Libre+Franklin'},
}


def generate_download_links(font_name: str) -> Dict[str, Any]:
    """
    Genera links de búsqueda/descarga para una fuente en varios sitios.
    Incluye link directo si está disponible.
    """
    font_lower = font_name.lower().strip()
    
    # Limpiar nombre para URLs
    search_name = font_name.replace(' ', '+')
    search_name_encoded = font_name.replace(' ', '%20')
    
    result = {
        'searchLinks': {
            'googleFonts': f"https://fonts.google.com/?query={search_name}",
            'dafont': f"https://www.dafont.com/search.php?q={search_name}",
            'fontSquirrel': f"https://www.fontsquirrel.com/fonts/list/find_fonts?q={search_name_encoded}",
            '1001fonts': f"https://www.1001fonts.com/search.html?search={search_name}",
        },
        'directDownload': None,
        'alternative': None
    }
    
    # Verificar si hay descarga directa disponible
    if font_lower in DIRECT_DOWNLOAD_LINKS:
        info = DIRECT_DOWNLOAD_LINKS[font_lower]
        result['directDownload'] = {
            'url': info['url'],
            'site': info['site'],
            'fontName': font_name
        }
    
    # Verificar si hay alternativa gratuita para fuente propietaria
    if font_lower in PROPRIETARY_FONT_ALTERNATIVES:
        alt = PROPRIETARY_FONT_ALTERNATIVES[font_lower]
        result['alternative'] = {
            'name': alt['alternative'],
            'downloadUrl': alt['url'],
            'message': f"'{font_name}' es propietaria. Usa '{alt['alternative']}' como alternativa gratuita."
        }
    
    return result


def analyze_fonts(pptx_path: str) -> Dict[str, Any]:
    """
    Analiza las fuentes de un PPTX y retorna información completa.
    
    Returns:
        {
            'fonts': [...],
            'missingFonts': [...],
            'availableOnline': [...],
            'googleFontsCSS': '...',
            'warnings': [...]
        }
    """
    fonts = extract_fonts_from_pptx(pptx_path)
    
    all_fonts = []
    missing_fonts = []
    available_online = []
    warnings = []
    
    for name, info in fonts.items():
        font_data = info.to_dict()
        # Agregar links de descarga a cada fuente
        font_data['downloadLinks'] = generate_download_links(name)
        all_fonts.append(font_data)
        
        if not info.is_system_font:
            if info.is_available_online:
                available_online.append({
                    'original': name,
                    'googleFont': info.google_font_name,
                    'downloadUrl': f"https://fonts.google.com/specimen/{info.google_font_name.replace(' ', '+')}",
                    'downloadLinks': generate_download_links(name)
                })
            else:
                missing_fonts.append({
                    'name': name,
                    'downloadLinks': generate_download_links(name)
                })
                warnings.append(f"Fuente '{name}' no disponible. El preview puede verse diferente.")
    
    # Generar CSS para Google Fonts
    google_fonts_css = generate_google_fonts_css(available_online)
    
    return {
        'fonts': all_fonts,
        'missingFonts': missing_fonts,
        'availableOnline': available_online,
        'googleFontsCSS': google_fonts_css,
        'googleFontsLink': generate_google_fonts_link(available_online),
        'warnings': warnings,
        'summary': {
            'total': len(fonts),
            'system': sum(1 for f in fonts.values() if f.is_system_font),
            'online': len(available_online),
            'missing': len(missing_fonts)
        }
    }


def generate_google_fonts_css(available_fonts: List[Dict]) -> str:
    """Genera CSS para importar fuentes de Google Fonts"""
    if not available_fonts:
        return ""
    
    css_rules = []
    for font in available_fonts:
        original = font['original']
        google = font['googleFont']
        
        # Crear regla CSS que mapea la fuente original a Google Font
        css_rules.append(f"""
/* Fallback: {original} -> {google} */
@font-face {{
    font-family: '{original}';
    src: local('{google}'), local('{original}');
    font-display: swap;
}}
""")
    
    return "\n".join(css_rules)


def generate_google_fonts_link(available_fonts: List[Dict]) -> str:
    """Genera link para cargar Google Fonts"""
    if not available_fonts:
        return ""
    
    font_families = set()
    for font in available_fonts:
        google_name = font['googleFont'].replace(' ', '+')
        font_families.add(f"family={google_name}:wght@400;700")
    
    families_str = "&".join(sorted(font_families))
    return f"https://fonts.googleapis.com/css2?{families_str}&display=swap"


# Testing
if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        result = analyze_fonts(sys.argv[1])
        import json
        print(json.dumps(result, indent=2, ensure_ascii=False))
