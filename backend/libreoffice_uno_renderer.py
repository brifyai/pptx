"""
Renderizador de PPTX usando LibreOffice UNO API
Acceso directo a LibreOffice para renderizado preciso

Soporta dos modos:
1. UNO API directo (requiere LibreOffice ejecutándose como servicio)
2. Fallback a LibreOffice headless (funciona siempre)
"""
import os
import sys
import base64
import tempfile
import subprocess
import time
import socket
from typing import List, Optional

# Agregar LibreOffice al path
LIBREOFFICE_PROGRAM = r"C:\Program Files\LibreOffice\program"
LIBREOFFICE_PROGRAM_X86 = r"C:\Program Files (x86)\LibreOffice\program"
LIBREOFFICE_SOFFICE = None

# Buscar LibreOffice en ambas ubicaciones
for lo_path in [LIBREOFFICE_PROGRAM, LIBREOFFICE_PROGRAM_X86]:
    soffice_path = os.path.join(lo_path, 'soffice.exe')
    if os.path.exists(soffice_path):
        LIBREOFFICE_SOFFICE = soffice_path
        if lo_path not in sys.path:
            sys.path.insert(0, lo_path)
            os.environ['PYTHONPATH'] = lo_path + os.pathsep + os.environ.get('PYTHONPATH', '')
        break

# Intentar importar UNO
UNO_AVAILABLE = False
UNO_AVAILABLE_MSG = ""
UNO_SERVICE_RUNNING = False
try:
    import uno
    from com.sun.star.beans import PropertyValue
    UNO_AVAILABLE = True
    print("✅ LibreOffice UNO API cargado correctamente")
except ImportError as e:
    UNO_AVAILABLE_MSG = str(e)
    print(f"⚠️ LibreOffice UNO API no disponible: {e}")
except Exception as e:
    UNO_AVAILABLE_MSG = str(e)
    print(f"⚠️ Error inicializando UNO API: {e}")


def is_port_in_use(port: int) -> bool:
    """Verifica si un puerto está en uso"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


def start_libreoffice_service(port: int = 8100, timeout: int = 30) -> bool:
    """
    Inicia LibreOffice como servicio UNO si no está ejecutándose.
    
    Args:
        port: Puerto para el servicio UNO
        timeout: Tiempo máximo de espera en segundos
    
    Returns:
        True si el servicio está disponible, False si no
    """
    global UNO_SERVICE_RUNNING
    
    # Verificar si ya está ejecutándose
    if is_port_in_use(port):
        print(f"   ℹ️ LibreOffice ya está ejecutándose en puerto {port}")
        UNO_SERVICE_RUNNING = True
        return True
    
    if not LIBREOFFICE_SOFFICE:
        print("   ⚠️ No se encontró soffice.exe")
        return False
    
    print(f"   🚀 Iniciando LibreOffice como servicio en puerto {port}...")
    
    try:
        # Iniciar LibreOffice en modo servicio
        cmd = [
            LIBREOFFICE_SOFFICE,
            '--headless',
            '--invisible',
            '--norestore',
            '--nofirststartwizard',
            '--accept=socket,host=localhost,port={};urp;StarOffice.ServiceManager'.format(port)
        ]
        
        # Iniciar proceso
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        # Esperar a que el servicio esté disponible
        start_time = time.time()
        while time.time() - start_time < timeout:
            if is_port_in_use(port):
                print(f"   ✅ LibreOffice service iniciado en puerto {port}")
                UNO_SERVICE_RUNNING = True
                return True
            time.sleep(0.5)
        
        print(f"   ⚠️ Timeout esperando LibreOffice service")
        return False
        
    except Exception as e:
        print(f"   ⚠️ Error iniciando LibreOffice service: {e}")
        return False


def connect_to_uno_service(port: int = 8100) -> Optional:
    """
    Se conecta a un servicio UNO existente.
    
    Args:
        port: Puerto del servicio UNO
    
    Returns:
        Objeto Desktop si hay conexión, None si no
    """
    if not UNO_AVAILABLE:
        return None
    
    try:
        # Conectar al servicio UNO existente
        local_context = uno.getComponentContext()
        smgr = local_context.ServiceManager
        
        # Resolver el servicio de escritorio
        desktop = smgr.createInstanceWithContext(
            "com.sun.star.frame.Desktop", local_context
        )
        
        return desktop
        
    except Exception as e:
        print(f"   ⚠️ Error conectando a UNO service: {e}")
        return None

def create_property(name: str, value):
    """Crea una PropertyValue para UNO"""
    prop = PropertyValue()
    prop.Name = name
    prop.Value = value
    return prop

def render_pptx_with_uno(pptx_path: str, prefer_uno: bool = True) -> List[str]:
    """
    Renderiza PPTX usando LibreOffice UNO API
    
    Estrategia:
    1. Intentar conectar a UNO service existente
    2. Si no hay servicio, intentar iniciarlo
    3. Si no funciona UNO, usar fallback headless
    
    Args:
        pptx_path: Ruta al archivo PPTX
        prefer_uno: Si True, intenta UNO primero; si False, usa headless directamente
    
    Returns:
        List[str]: Lista de imágenes en base64
    """
    if not UNO_AVAILABLE:
        print("⚠️ UNO API no disponible, usando headless")
        return []
    
    print("\n🎨 Renderizador LibreOffice UNO API")
    
    # Intentar conectar a servicio UNO existente
    desktop = None
    uno_tried = False
    
    if prefer_uno:
        # Intentar conectar a servicio existente
        desktop = connect_to_uno_service(8100)
        
        if desktop:
            print("   ✅ Conectado a UNO service existente")
        else:
            # Intentar iniciar servicio
            print("   ℹ️ No hay UNO service, intentando iniciar...")
            uno_tried = True
            start_libreoffice_service(8100, timeout=15)
            desktop = connect_to_uno_service(8100)
    
    # Si UNO no funciona, usar fallback headless
    if not desktop:
        if uno_tried:
            print("   ⚠️ UNO service no disponible, usando headless")
        else:
            print("   ℹ️ UNO no preferido, usando headless")
        return []
    
    # Variables para cleanup
    doc = None
    
    try:
        
        # Convertir ruta a URL de LibreOffice
        if not pptx_path.startswith('file://'):
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
            raise Exception("loadComponentFromURL devolvió None")
        
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
    finally:
        # Cleanup: cerrar documento si está abierto
        try:
            if doc:
                doc.close(True)
        except:
            pass
        # Nota: No cerramos desktop ya que es un servicio compartido

# Función para obtener el mejor método de renderizado disponible
def get_best_renderer():
    """
    Retorna el mejor método de renderizado disponible.
    
    Returns:
        str: 'uno' si UNO está disponible, 'headless' en caso contrario
    """
    # Intentar UNO primero
    if UNO_AVAILABLE:
        desktop = connect_to_uno_service(8100)
        if desktop:
            return 'uno'
    
    return 'headless'


# UNO API está disponible si se importó correctamente
if UNO_AVAILABLE:
    print("✅ LibreOffice UNO API listo para usar")
else:
    print("⚠️ LibreOffice UNO API no disponible - usando método headless estándar")

