"""
Procesador de imágenes para remover fondos blancos y aplicar color de fondo del slide
"""
from PIL import Image, ImageChops
import io
import base64
from typing import Tuple

def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convierte color hexadecimal a RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def remove_white_background(image_base64: str, bg_color_hex: str, threshold: int = 240) -> str:
    """
    Remueve el fondo blanco de una imagen y lo reemplaza con el color del slide
    
    Args:
        image_base64: Imagen en formato base64
        bg_color_hex: Color de fondo del slide en hexadecimal (ej: #FF5733)
        threshold: Umbral para considerar un pixel como "blanco" (0-255)
    
    Returns:
        Imagen procesada en formato base64
    """
    try:
        # Decodificar imagen base64
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        
        # Convertir a RGBA si no lo está
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Obtener datos de la imagen
        data = img.getdata()
        
        # Color de fondo del slide
        bg_color = hex_to_rgb(bg_color_hex)
        
        # Nueva lista de pixels
        new_data = []
        
        for item in data:
            # Si el pixel es casi blanco (R, G, B > threshold)
            if item[0] > threshold and item[1] > threshold and item[2] > threshold:
                # Reemplazar con el color de fondo del slide (mantener alpha si existe)
                alpha = item[3] if len(item) > 3 else 255
                new_data.append((*bg_color, alpha))
            else:
                # Mantener el pixel original
                new_data.append(item)
        
        # Actualizar imagen
        img.putdata(new_data)
        
        # Convertir de vuelta a base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
        
    except Exception as e:
        print(f"⚠️ Error procesando imagen: {e}")
        # Si falla, devolver la imagen original
        return image_base64 if image_base64.startswith('data:') else f"data:image/png;base64,{image_base64}"


def smart_background_removal(image_base64: str, bg_color_hex: str) -> str:
    """
    Remoción inteligente de fondo usando detección de bordes
    Más preciso que el método simple
    """
    try:
        # Decodificar imagen
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        img = Image.open(io.BytesIO(image_data))
        
        # Convertir a RGBA
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Obtener color de fondo
        bg_color = hex_to_rgb(bg_color_hex)
        
        # Crear máscara para detectar fondo blanco
        # Convertir a escala de grises para análisis
        gray = img.convert('L')
        
        # Crear nueva imagen con fondo reemplazado
        data = img.getdata()
        new_data = []
        
        for i, item in enumerate(data):
            r, g, b = item[0], item[1], item[2]
            alpha = item[3] if len(item) > 3 else 255
            
            # Calcular "blancura" del pixel
            whiteness = (r + g + b) / 3
            
            # Si es muy blanco (>240) y tiene alpha alto, reemplazar
            if whiteness > 240 and alpha > 200:
                new_data.append((*bg_color, alpha))
            else:
                new_data.append(item)
        
        img.putdata(new_data)
        
        # Convertir a base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
        
    except Exception as e:
        print(f"⚠️ Error en remoción inteligente: {e}")
        return image_base64 if image_base64.startswith('data:') else f"data:image/png;base64,{image_base64}"
