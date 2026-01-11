"""
Renderizador de PPTX usando LibreOffice UNO API
Acceso directo a LibreOffice para renderizado preciso
"""
import uno
from com.sun.star.beans import PropertyValue
from com.sun.star.view.PaperFormat import USER
import base64
import os
import tempfile
from typing import List

def create_property(name: str, value):
    """Crea una PropertyValue para UNO"""
    prop = PropertyValue()
    prop.Name = name
    prop.Value = value
    return prop

def render_pptx_with_uno(pptx_path: str) -> List[str]:
    """
    Renderiza PPTX usando LibreOffice UNO API
    Acceso directo a LibreOffice para máximo control
    """
    print("\n🎨 Renderizador LibreOffice UNO API")
    
    try:
        # Conectar a LibreOffice
        local_context = uno.getComponentContext()
        resolver = local_context.ServiceManager.createInstanceWithContext(
            "com.sun.star.bridge.UnoUrlResolver", local_context
        )
        
        # Intentar conectar a instancia existente o iniciar nueva
        try:
            ctx = resolver.resolve(
                "uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext"
            )
            smgr = ctx.ServiceManager
            desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
        except:
            # Si no hay instancia, usar contexto local
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
            print(f"\n   📄 Renderizando slide {i + 1}...")
            
            # Crear directorio temporal para la imagen
            with tempfile.TemporaryDirectory() as temp_dir:
                output_path = os.path.join(temp_dir, f"slide_{i}.png")
                output_url = uno.systemPathToFileUrl(output_path)
                
                # Configurar exportación a PNG
                export_props = (
                    create_property("URL", output_url),
                    create_property("FilterName", "impress_png_Export"),
                    create_property("Overwrite", True),
                    create_property("PixelWidth", 1920),
                    create_property("PixelHeight", 1080),
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
                        print(f"   ✅ Slide {i + 1} renderizado")
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


def start_libreoffice_server():
    """
    Inicia LibreOffice en modo servidor para UNO
    Ejecutar una vez al inicio de la aplicación
    """
    import subprocess
    import time
    
    try:
        # Buscar LibreOffice
        possible_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            "/usr/bin/libreoffice",
            "/Applications/LibreOffice.app/Contents/MacOS/soffice"
        ]
        
        soffice_path = None
        for path in possible_paths:
            if os.path.exists(path):
                soffice_path = path
                break
        
        if not soffice_path:
            print("⚠️ LibreOffice no encontrado")
            return False
        
        # Iniciar en modo servidor
        cmd = [
            soffice_path,
            "--headless",
            "--invisible",
            "--nocrashreport",
            "--nodefault",
            "--nofirststartwizard",
            "--nolockcheck",
            "--nologo",
            "--norestore",
            f"--accept=socket,host=localhost,port=2002;urp;StarOffice.ServiceManager"
        ]
        
        print("🚀 Iniciando LibreOffice en modo servidor...")
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Esperar a que inicie
        time.sleep(3)
        print("✅ LibreOffice servidor iniciado")
        return True
        
    except Exception as e:
        print(f"⚠️ Error iniciando servidor: {e}")
        return False


# Intentar iniciar servidor al importar el módulo
# (solo si UNO está disponible)
try:
    import uno
    UNO_AVAILABLE = True
    print("✅ LibreOffice UNO API disponible")
except ImportError:
    UNO_AVAILABLE = False
    print("⚠️ LibreOffice UNO API no disponible (instalar: pip install pyuno)")
