"""
Shape Matcher Module

Vincula detecciones de Gemini Vision con shapes reales del PPTX.
Implementa el algoritmo de matching basado en distancia Manhattan
y clasificación por geometría.
"""

from typing import Dict, List, Optional, Any


class ShapeMatcher:
    """
    Vincula detecciones de Gemini con shapes reales del PPTX.
    
    Attributes:
        slide_width: Ancho del slide en EMUs
        slide_height: Alto del slide en EMUs
        MATCH_THRESHOLD: Umbral de distancia para considerar un match (10% del ancho)
    """
    
    # Umbral del 10% del ancho del slide para validar matches
    MATCH_THRESHOLD = 0.10
    
    # Tipos válidos de elementos
    VALID_ELEMENT_TYPES = frozenset([
        'TITLE', 'SUBTITLE', 'BODY', 'FOOTER', 
        'IMAGE_HOLDER', 'CHART_AREA', 'UNKNOWN'
    ])
    
    def __init__(self, slide_width: int, slide_height: int):
        """
        Inicializa el ShapeMatcher con las dimensiones del slide.
        
        Args:
            slide_width: Ancho del slide en EMUs (English Metric Units)
            slide_height: Alto del slide en EMUs
        """
        if slide_width <= 0 or slide_height <= 0:
            raise ValueError("Slide dimensions must be positive")
        
        self.slide_width = slide_width
        self.slide_height = slide_height
    
    def normalize_to_emu(self, coord: int, dimension: int) -> int:
        """
        Convierte coordenada normalizada (0-1000) a EMUs.
        
        Fórmula: (coord / 1000) * dimension
        
        Args:
            coord: Coordenada normalizada en rango [0, 1000]
            dimension: Dimensión del slide en EMUs (width o height)
            
        Returns:
            Coordenada convertida a EMUs
        """
        return int((coord / 1000) * dimension)
    
    def calculate_distance(self, shape: Any, detection: dict) -> float:
        """
        Calcula distancia Manhattan entre un shape y una detección de Gemini.
        
        La distancia Manhattan es la suma de las diferencias absolutas
        de las coordenadas (|x1-x2| + |y1-y2|).
        
        Args:
            shape: Objeto shape de python-pptx con atributos left y top en EMUs
            detection: Diccionario con coordenadas normalizadas (0-1000)
                       {'left': int, 'top': int, 'width': int, 'height': int}
            
        Returns:
            Distancia Manhattan en EMUs
        """
        # Convertir coordenadas de detección (0-1000) a EMUs
        target_left = self.normalize_to_emu(detection['left'], self.slide_width)
        target_top = self.normalize_to_emu(detection['top'], self.slide_height)
        
        # Obtener coordenadas del shape (ya en EMUs)
        shape_left = getattr(shape, 'left', 0)
        shape_top = getattr(shape, 'top', 0)
        
        # Calcular distancia Manhattan
        return abs(shape_left - target_left) + abs(shape_top - target_top)

    def match_detections_to_shapes(
        self, 
        shapes: List[Any], 
        detections: List[dict]
    ) -> Dict[str, int]:
        """
        Genera mapping de tipo de contenido a shape_id.
        
        Algoritmo:
        1. Para cada detección de Gemini, calcular distancia a todos los shapes
        2. Seleccionar el shape con menor distancia
        3. Validar que la distancia esté dentro del umbral (10% del ancho)
        4. Si múltiples detecciones coinciden con el mismo shape, priorizar la más cercana
        
        Args:
            shapes: Lista de objetos shape de python-pptx
            detections: Lista de detecciones de Gemini con formato:
                       [{'id': str, 'type': str, 'coordinates': {...}}, ...]
            
        Returns:
            Diccionario {tipo_contenido: shape_id} para matches válidos
        """
        # Umbral máximo de distancia en EMUs (10% del ancho del slide)
        max_distance = self.slide_width * self.MATCH_THRESHOLD
        
        # Resultado: tipo -> shape_id
        result: Dict[str, int] = {}
        
        # Track de shapes ya asignados para evitar duplicados
        assigned_shapes: Dict[int, tuple] = {}  # shape_id -> (tipo, distancia)
        
        for detection in detections:
            # Extraer coordenadas de la detección
            coords = detection.get('coordinates', detection)
            if 'coordinates' in detection:
                coords = detection['coordinates']
            
            detection_type = detection.get('type', 'UNKNOWN')
            
            # Encontrar el shape más cercano
            best_shape = None
            best_distance = float('inf')
            best_shape_id = None
            
            for shape in shapes:
                # Obtener shape_id (puede ser shape_id o id dependiendo del objeto)
                shape_id = getattr(shape, 'shape_id', None)
                if shape_id is None:
                    shape_id = getattr(shape, 'id', id(shape))
                
                # Calcular distancia
                distance = self.calculate_distance(shape, coords)
                
                # Verificar si está dentro del umbral y es mejor que el actual
                if distance < max_distance and distance < best_distance:
                    best_shape = shape
                    best_distance = distance
                    best_shape_id = shape_id
            
            # Si encontramos un match válido
            if best_shape_id is not None:
                # Verificar si este shape ya fue asignado a otro tipo
                if best_shape_id in assigned_shapes:
                    prev_type, prev_distance = assigned_shapes[best_shape_id]
                    # Solo reemplazar si la nueva detección está más cerca
                    if best_distance < prev_distance:
                        # Remover asignación anterior
                        if prev_type in result:
                            del result[prev_type]
                        # Asignar nuevo
                        result[detection_type] = best_shape_id
                        assigned_shapes[best_shape_id] = (detection_type, best_distance)
                else:
                    # Asignar directamente
                    result[detection_type] = best_shape_id
                    assigned_shapes[best_shape_id] = (detection_type, best_distance)
        
        return result

    def classify_by_geometry(self, shape: Any) -> str:
        """
        Clasifica un shape por su posición y tamaño cuando no tiene metadata nativa.
        
        Reglas de clasificación basadas en posición relativa:
        - top < 20% del alto → TITLE
        - top entre 20% y 35% del alto, ancho > 50% → SUBTITLE
        - bottom > 80% del alto → FOOTER
        - Área grande en zona central → BODY
        - Área cuadrada o casi cuadrada → IMAGE_HOLDER
        - Resto → UNKNOWN
        
        Args:
            shape: Objeto shape de python-pptx con atributos left, top, width, height
            
        Returns:
            Tipo de elemento clasificado (TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, UNKNOWN)
        """
        # Obtener coordenadas del shape
        shape_left = getattr(shape, 'left', 0)
        shape_top = getattr(shape, 'top', 0)
        shape_width = getattr(shape, 'width', 0)
        shape_height = getattr(shape, 'height', 0)
        
        # Calcular posiciones relativas (0-1)
        relative_top = shape_top / self.slide_height if self.slide_height > 0 else 0
        relative_bottom = (shape_top + shape_height) / self.slide_height if self.slide_height > 0 else 0
        relative_width = shape_width / self.slide_width if self.slide_width > 0 else 0
        relative_height = shape_height / self.slide_height if self.slide_height > 0 else 0
        
        # Calcular área relativa
        relative_area = relative_width * relative_height
        
        # Regla 1: Elementos en la parte superior (top < 20%) → TITLE
        if relative_top < 0.20:
            # Si es ancho (> 50% del slide), es título
            if relative_width > 0.50:
                return 'TITLE'
        
        # Regla 2: Elementos justo debajo del título (20-35%) con buen ancho → SUBTITLE
        if 0.20 <= relative_top < 0.35 and relative_width > 0.50:
            return 'SUBTITLE'
        
        # Regla 3: Elementos en la parte inferior (bottom > 80%) → FOOTER
        if relative_bottom > 0.80 and relative_height < 0.15:
            return 'FOOTER'
        
        # Regla 4: Elementos cuadrados o casi cuadrados → IMAGE_HOLDER
        # Ratio de aspecto entre 0.7 y 1.4 se considera "cuadrado"
        if shape_height > 0:
            aspect_ratio = shape_width / shape_height
            if 0.7 <= aspect_ratio <= 1.4 and relative_area > 0.05:
                return 'IMAGE_HOLDER'
        
        # Regla 5: Áreas grandes en zona central → BODY
        if relative_area > 0.10 and 0.15 < relative_top < 0.70:
            return 'BODY'
        
        # Por defecto
        return 'UNKNOWN'
    
    def classify_shape(self, shape: Any) -> str:
        """
        Clasifica un shape usando metadata nativa si está disponible,
        o heurísticas geométricas como fallback.
        
        Args:
            shape: Objeto shape de python-pptx
            
        Returns:
            Tipo de elemento clasificado
        """
        # Intentar obtener placeholder_type de metadata nativa
        placeholder_type = None
        
        # python-pptx usa placeholder_format.type para placeholders
        if hasattr(shape, 'placeholder_format') and shape.placeholder_format:
            try:
                ph_type = shape.placeholder_format.type
                if ph_type is not None:
                    # Mapear tipos de placeholder de PowerPoint a nuestros tipos
                    placeholder_mapping = {
                        1: 'TITLE',      # PP_PLACEHOLDER.TITLE
                        2: 'BODY',       # PP_PLACEHOLDER.BODY
                        3: 'SUBTITLE',   # PP_PLACEHOLDER.CENTER_TITLE (usado como subtitle)
                        4: 'SUBTITLE',   # PP_PLACEHOLDER.SUBTITLE
                        5: 'FOOTER',     # PP_PLACEHOLDER.FOOTER
                        6: 'FOOTER',     # PP_PLACEHOLDER.SLIDE_NUMBER
                        7: 'FOOTER',     # PP_PLACEHOLDER.DATE
                        18: 'IMAGE_HOLDER',  # PP_PLACEHOLDER.PICTURE
                        19: 'CHART_AREA',    # PP_PLACEHOLDER.CHART
                    }
                    # ph_type puede ser un enum o int
                    type_value = ph_type.value if hasattr(ph_type, 'value') else ph_type
                    placeholder_type = placeholder_mapping.get(type_value)
            except (AttributeError, TypeError):
                pass
        
        # Si encontramos metadata, usarla
        if placeholder_type:
            return placeholder_type
        
        # Fallback a clasificación geométrica
        return self.classify_by_geometry(shape)
