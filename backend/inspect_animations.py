"""
Script para inspeccionar animaciones en un PPTX
"""
import sys
import zipfile
from lxml import etree

def inspect_pptx_animations(pptx_path):
    """Inspecciona todas las animaciones en un PPTX"""
    print(f"\n{'='*60}")
    print(f"INSPECCIONANDO ANIMACIONES EN: {pptx_path}")
    print(f"{'='*60}\n")
    
    with zipfile.ZipFile(pptx_path, 'r') as zf:
        # Listar todos los archivos
        all_files = zf.namelist()
        
        # Buscar archivos de slides
        slide_files = [f for f in all_files if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        
        print(f"📄 Encontrados {len(slide_files)} slides\n")
        
        for slide_file in sorted(slide_files):
            slide_num = slide_file.replace('ppt/slides/slide', '').replace('.xml', '')
            print(f"\n{'─'*60}")
            print(f"SLIDE {slide_num}: {slide_file}")
            print(f"{'─'*60}")
            
            # Leer XML
            xml_content = zf.read(slide_file)
            root = etree.fromstring(xml_content)
            
            # Buscar elementos de timing/animación
            # Probar diferentes namespaces
            namespaces_to_try = [
                {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'},
                {'p': 'http://schemas.microsoft.com/office/powerpoint/2006/main'},
                {},  # Sin namespace
            ]
            
            found_timing = False
            
            for ns in namespaces_to_try:
                if ns:
                    timing = root.find('.//p:timing', ns)
                else:
                    # Buscar sin namespace
                    timing = root.find('.//*[local-name()="timing"]')
                
                if timing is not None:
                    found_timing = True
                    print(f"\n✅ Encontrado elemento timing con namespace: {ns}")
                    
                    # Mostrar el XML del timing
                    timing_xml = etree.tostring(timing, pretty_print=True, encoding='unicode')
                    lines = timing_xml.split('\n')[:30]  # Primeras 30 líneas
                    print("\nXML del timing:")
                    print("─" * 60)
                    for line in lines:
                        print(line)
                    if len(timing_xml.split('\n')) > 30:
                        print("... (truncado)")
                    print("─" * 60)
                    
                    # Buscar shape IDs
                    if ns:
                        targets = timing.findall('.//*[@spid]', ns)
                    else:
                        targets = timing.findall('.//*[@spid]')
                    
                    if targets:
                        print(f"\n🎯 Shape IDs animados:")
                        for target in targets:
                            spid = target.get('spid')
                            print(f"   - Shape ID: {spid}")
                    
                    break
            
            if not found_timing:
                print("❌ No se encontró elemento timing en este slide")
                
                # Buscar cualquier elemento que contenga "anim"
                anim_elements = root.findall('.//*[contains(local-name(), "anim")]')
                if anim_elements:
                    print(f"\n⚠️ Pero se encontraron {len(anim_elements)} elementos con 'anim' en el nombre:")
                    for elem in anim_elements[:5]:
                        print(f"   - {elem.tag}")
                
                # Mostrar todos los elementos hijos del root
                print(f"\n📋 Elementos principales del slide:")
                for child in root:
                    tag_name = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                    print(f"   - {tag_name}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python inspect_animations.py <template.pptx>")
        sys.exit(1)
    
    pptx_path = sys.argv[1]
    inspect_pptx_animations(pptx_path)
