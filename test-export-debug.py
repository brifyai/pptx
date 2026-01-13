"""
Script de prueba para debuggear el problema de exportación de contenido.
Este script simula el flujo completo de exportación con logging detallado.
"""

import sys
import os

# Agregar backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from pptx_xml_cloner import PPTXXMLCloner, clone_pptx_preserving_all
import logging

# Configurar logging detallado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(levelname)s - %(message)s'
)

def test_export(template_path: str):
    """
    Prueba la exportación con contenido de ejemplo.
    """
    print("=" * 80)
    print("🧪 TEST DE EXPORTACIÓN CON LOGGING DETALLADO")
    print("=" * 80)
    
    # Contenido de prueba (similar al que genera el chat)
    test_content = [
        {
            'title': 'Título de Prueba para Slide 1',
            'subtitle': 'Subtítulo de prueba'
        },
        {
            'heading': 'Sección Principal',
            'bullets': [
                'Primer punto importante',
                'Segundo punto clave',
                'Tercer punto relevante'
            ]
        },
        {
            'title': 'Otro Título',
            'body': 'Contenido de cuerpo de texto para este slide'
        }
    ]
    
    print(f"\n📄 Template: {template_path}")
    print(f"📝 Contenido de prueba: {len(test_content)} slides\n")
    
    # Analizar template primero
    print("=" * 80)
    print("PASO 1: ANÁLISIS DEL TEMPLATE")
    print("=" * 80)
    
    cloner = PPTXXMLCloner(template_path)
    info = cloner.get_template_info()
    
    print(f"\n✅ Template analizado:")
    print(f"   - Slides: {info['slide_count']}")
    print(f"   - Fuentes: {', '.join(info['fonts_used'])}")
    
    for i, slide_texts in enumerate(info['text_locations']):
        print(f"\n   📄 Slide {i+1}:")
        for t in slide_texts:
            placeholder = "📌" if t['is_placeholder'] else "📝"
            print(f"      {placeholder} [{t['type']}] {t['text']}")
    
    # Clonar con contenido
    print("\n" + "=" * 80)
    print("PASO 2: CLONACIÓN CON CONTENIDO")
    print("=" * 80)
    
    try:
        output_path = clone_pptx_preserving_all(template_path, test_content)
        print(f"\n✅ ÉXITO: PPTX generado en: {output_path}")
        print(f"\n💡 Abre el archivo y verifica si el contenido se aplicó correctamente.")
        print(f"   Si no ves el contenido, revisa los logs arriba para ver qué tipos")
        print(f"   de texto se detectaron y si coinciden con el contenido disponible.")
        
        return output_path
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python test-export-debug.py <ruta_al_template.pptx>")
        print("\nEjemplo:")
        print("  python test-export-debug.py mi_template.pptx")
        sys.exit(1)
    
    template_path = sys.argv[1]
    
    if not os.path.exists(template_path):
        print(f"❌ Error: No se encuentra el archivo: {template_path}")
        sys.exit(1)
    
    output = test_export(template_path)
    
    if output:
        print("\n" + "=" * 80)
        print("🎯 SIGUIENTE PASO:")
        print("=" * 80)
        print(f"\n1. Abre el archivo generado: {output}")
        print(f"2. Verifica si el contenido se aplicó correctamente")
        print(f"3. Si NO se aplicó, revisa los logs arriba:")
        print(f"   - ¿Qué tipos de texto se detectaron? (title, subtitle, body)")
        print(f"   - ¿Coinciden con el contenido disponible?")
        print(f"   - ¿Se hicieron reemplazos? (busca '✅ Reemplazando')")
        print(f"\n4. Si los tipos no coinciden, el problema está en _detect_text_type()")
        print(f"   - Puede que tu template no use placeholders estándar")
        print(f"   - Necesitamos mejorar la detección por posición/tamaño de fuente")
