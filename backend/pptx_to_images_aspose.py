"""
Convierte slides de PowerPoint a imágenes usando Aspose.Slides
Trial gratuito de 30 días - Calidad profesional
"""
import io
import base64
from typing import List

def convert_pptx_to_images_aspose(pptx_path: str) -> List[str]:
    """
    Convierte cada slide del PPT a imagen base64 usando Aspose
    """
    try:
        import aspose.slides as slides
        
        print(f"📂 Abriendo presentación: {pptx_path}")
        
        # Cargar presentación
        pres = slides.Presentation(pptx_path)
        base64_images = []
        
        print(f"📊 Slides encontrados: {len(pres.slides)}")
        
        # Convertir cada slide a imagen
        for i, slide in enumerate(pres.slides):
            try:
                # Método 1: get_image (versión más reciente de Aspose)
                scale_x = 2.0
                scale_y = 2.0
                
                # Intentar get_image primero
                try:
                    bmp = slide.get_image(scale_x, scale_y)
                except AttributeError:
                    # Fallback a get_thumbnail para versiones anteriores
                    bmp = slide.get_thumbnail(scale_x, scale_y)
                
                # Guardar a bytes
                img_byte_arr = io.BytesIO()
                bmp.save(img_byte_arr, slides.export.ImageFormat.PNG)
                img_byte_arr.seek(0)
                
                # Convertir a base64
                img_str = base64.b64encode(img_byte_arr.getvalue()).decode()
                base64_images.append(f"data:image/png;base64,{img_str}")
                
                print(f"✅ Slide {i+1} convertido ({len(img_str)} chars)")
                
            except Exception as slide_error:
                print(f"⚠️ Error en slide {i+1}: {slide_error}")
                continue
        
        pres.dispose()
        return base64_images
        
    except ImportError as e:
        print(f"⚠️ Aspose.Slides no instalado: {e}")
        return []
    except Exception as e:
        print(f"❌ Error con Aspose: {e}")
        import traceback
        traceback.print_exc()
        return []
