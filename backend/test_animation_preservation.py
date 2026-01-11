"""
Test para verificar que las animaciones se preservan en la clonación XML.
"""
import zipfile
import os
import sys
from lxml import etree

# Namespaces de PowerPoint
NAMESPACES = {
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'p14': 'http://schemas.microsoft.com/office/powerpoint/2010/main',
}

def check_animations_in_pptx(pptx_path: str) -> dict:
    """
    Verifica si un PPTX contiene animaciones.
    
    Returns:
        dict con información de animaciones por slide
    """
    results = {
        'file': pptx_path,
        'has_animations': False,
        'slides': []
    }
    
    try:
        with zipfile.ZipFile(pptx_path, 'r') as zf:
            # Listar archivos de slides
            slide_files = [f for f in zf.namelist() 
                          if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
            
            for slide_file in sorted(slide_files):
                slide_num = int(slide_file.replace('ppt/slides/slide', '').replace('.xml', ''))
                
                # Leer XML del slide
                xml_content = zf.read(slide_file)
                root = etree.fromstring(xml_content)
                
                # Buscar elementos de animación
                timing = root.find('.//p:timing', NAMESPACES)
                transitions = root.find('.//p:transition', NAMESPACES)
                
                # Buscar animaciones específicas
                anim_elements = root.findall('.//*[starts-with(local-name(), "anim")]')
                
                slide_info = {
                    'slide_num': slide_num,
                    'has_timing': timing is not None,
                    'has_transition': transitions is not None,
                    'animation_elements': len(anim_elements),
                    'timing_xml': etree.tostring(timing, pretty_print=True).decode() if timing is not None else None
                }
                
                if timing is not None or transitions is not None or anim_elements:
                    results['has_animations'] = True
                
                results['slides'].append(slide_info)
                
    except Exception as e:
        results['error'] = str(e)
    
    return results


def test_cloner_preserves_animations(template_path: str):
    """
    Prueba que el clonador XML preserve las animaciones.
    """
    print(f"\n{'='*60}")
    print(f"🔍 ANÁLISIS DE ANIMACIONES")
    print(f"{'='*60}")
    
    # 1. Verificar animaciones en template original
    print(f"\n📄 Analizando template original: {template_path}")
    original_results = check_animations_in_pptx(template_path)
    
    print(f"\n   ✅ Tiene animaciones: {original_results['has_animations']}")
    for slide in original_results['slides']:
        status = "🎬" if slide['has_timing'] or slide['has_transition'] else "📝"
        print(f"   {status} Slide {slide['slide_num']}: timing={slide['has_timing']}, transition={slide['has_transition']}, anim_elements={slide['animation_elements']}")
        if slide['timing_xml']:
            # Mostrar primeras líneas del timing XML
            lines = slide['timing_xml'].split('\n')[:5]
            for line in lines:
                print(f"      {line}")
    
    # 2. Clonar con el XML cloner
    print(f"\n🔄 Clonando con XML Cloner...")
    
    try:
        from pptx_xml_cloner import clone_pptx_preserving_all
        
        # Contenido de prueba
        test_content = [
            {'title': 'Título de Prueba', 'subtitle': 'Subtítulo'},
            {'heading': 'Sección 1', 'bullets': ['Punto 1', 'Punto 2']},
            {'heading': 'Sección 2', 'bullets': ['Punto A', 'Punto B']},
            {'heading': 'Sección 3', 'bullets': ['Item X', 'Item Y']},
            {'heading': 'Conclusión', 'bullets': ['Final 1', 'Final 2']},
        ]
        
        output_path = clone_pptx_preserving_all(template_path, test_content)
        print(f"   ✅ Archivo generado: {output_path}")
        
        # 3. Verificar animaciones en archivo clonado
        print(f"\n📄 Analizando archivo clonado...")
        cloned_results = check_animations_in_pptx(output_path)
        
        print(f"\n   ✅ Tiene animaciones: {cloned_results['has_animations']}")
        for slide in cloned_results['slides']:
            status = "🎬" if slide['has_timing'] or slide['has_transition'] else "📝"
            print(f"   {status} Slide {slide['slide_num']}: timing={slide['has_timing']}, transition={slide['has_transition']}, anim_elements={slide['animation_elements']}")
        
        # 4. Comparar resultados
        print(f"\n{'='*60}")
        print(f"📊 COMPARACIÓN")
        print(f"{'='*60}")
        
        original_anim_count = sum(s['animation_elements'] for s in original_results['slides'])
        cloned_anim_count = sum(s['animation_elements'] for s in cloned_results['slides'])
        
        print(f"\n   Original: {original_anim_count} elementos de animación")
        print(f"   Clonado:  {cloned_anim_count} elementos de animación")
        
        if original_anim_count == cloned_anim_count:
            print(f"\n   ✅ ÉXITO: Animaciones preservadas correctamente")
        elif cloned_anim_count > 0:
            print(f"\n   ⚠️ PARCIAL: Algunas animaciones se preservaron ({cloned_anim_count}/{original_anim_count})")
        else:
            print(f"\n   ❌ ERROR: Animaciones perdidas")
        
        # Limpiar archivo temporal
        os.unlink(output_path)
        
    except ImportError as e:
        print(f"   ❌ Error importando clonador: {e}")
    except Exception as e:
        print(f"   ❌ Error en clonación: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python test_animation_preservation.py <template.pptx>")
        print("\nEjemplo:")
        print("  python test_animation_preservation.py ../uploads/Plantilla_Origenv4.pptx")
        sys.exit(1)
    
    template_path = sys.argv[1]
    
    if not os.path.exists(template_path):
        print(f"❌ Archivo no encontrado: {template_path}")
        sys.exit(1)
    
    test_cloner_preserves_animations(template_path)
