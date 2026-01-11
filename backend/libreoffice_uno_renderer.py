"""
Renderizador de PPTX usando LibreOffice UNO API
Acceso directo a LibreOffice para renderizado preciso
"""
import os
import sys
import base64
import tempfile
from typing import List

# Agregar LibreOffice al path
LIBREOFFICE_PROGRAM = r"C:\Program Files\LibreOffice\program"
if os.path.exists(LIBREOFFICE_PROGRAM) and LIBREOFFICE_PROGRAM not in sys.path:
    sys.path.insert(0, LIBREOFFICE_PROGRAM)

# Intentar importar UNO
try:
    import uno
    from com.sun.star.beans import PropertyValue
    UNO_AVAILABLE = True
    print("✅ LibreOffice UNO API cargado correctamente")
except ImportError as e:
    UNO_AVAILABLE = False
    print(f"⚠️ LibreOffice UNO API no disponible: {e}")

def create_property(name: str, value):
    """Crea una PropertyValue para UNO"""
    prop = PropertyValue()
    prop.Name = name
    prop.Value = value
    return prop

def render_pptx_with_uno(pptx_path: str) -> List[str]:
    """
    Renderiza PPTX usando LibreOffice UNO API
    Usa contexto local sin necesidad de servidor
    """
    if not UNO_AVAILABLE:
        return []
    
    print("\n🎨 Renderizador LibreOffice UNO API")
    
    try:
        # Usar contexto local
        local_context = uno.getComponentContext()
        smgr = local_context.ServiceManager
        desktop = smgr.createInstanceWithContext(
            "com.sun.star.frame.Desktop", local_context
        )
        
        # Convertir ruta a URL de LibreOffice
        if not pptx_path.startswith('file:///'):
            pptx_url = uno.systemPathToFileUrl(os.path.abspath(pptx_path))
        else:
            pptx_url = pptx_path
        
        print(f"   📂 Abriendo: {pptx_url}")
        
        # Propiedades para abrir el documento
        properties = (
            create_property("Hidden", True),
            create_property("ReadOnly", True),
        )
        
        # Abrir documento
        doc = desktop.loadComponentFromURL(pptx_url, "_blank", 0, properties)
        
        if not doc:
            raise Exception("No se pudo abrir el documento")
        
        # Obtener slides
        slides = doc.getDrawPages()
        slide_count = slides.getCount()
        
        print(f"   📊 Total slides: {slide_count}")
        
        images = []
        
        # Renderizar cada slide
        for i in range(slide_count):
            slide = slides.getByIndex(i)
            print(f"   📄 Renderizando slide {i + 1}...")
            
            # Crear directorio temporal para la imagen
            with tempfile.TemporaryDirectory() as temp_dir:
                output_path = os.path.join(temp_dir, f"slide_{i}.png")
                output_url = uno.systemPathToFileUrl(output_path)
                
                # Configurar exportación a PNG con alta calidad
                export_props = (
                    create_property("URL", output_url),
                    create_property("FilterName", "impress_png_Export"),
                    create_property("Overwrite", True),
                    create_property("PixelWidth", 1920),
                    create_property("PixelHeight", 1080),
                    create_property("Quality", 100),
                )
                
                # Seleccionar el slide actual
                controller = doc.getCurrentController()
                controller.setCurrentPage(slide)
                
                # Exportar slide a PNG
                doc.storeToURL(output_url, export_props)
                
                # Leer imagen y convertir a base64
                if os.path.exists(output_path):
                    with open(output_path, 'rb') as f:
                        img_data = f.read()
                        img_str = base64.b64encode(img_data).decode()
                        images.append(f"data:image/png;base64,{img_str}")
                        print(f"   ✅ Slide {i + 1} renderizado ({len(img_data)} bytes)")
                else:
                    print(f"   ⚠️ No se generó imagen para slide {i + 1}")
        
        # Cerrar documento
        doc.close(True)
        
        print(f"\n✅ {len(images)} slides renderizados con UNO API\n")
        return images
        
    except Exception as e:
        print(f"❌ Error con UNO API: {e}")
        import traceback
        traceback.print_exc()
        return []

# UNO API está disponible si se importó correctamente
if UNO_AVAILABLE:
    print("✅ LibreOffice UNO API listo para usar")
else:
    print("⚠️ LibreOffice UNO API no disponible - usando método headless estándar")

