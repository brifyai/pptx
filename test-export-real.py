"""
Test real de exportación - simula exactamente lo que hace el frontend
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from pptx_generator import generate_presentation
import tempfile
import shutil

# Contenido de prueba (exactamente como lo envía el frontend)
ai_content = {
    'slides': [
        {
            'content': {
                'title': 'ROSEN',
                'subtitle': 'ECOSISTEMA DE ATENCIÓN VIRTUAL',
                'heading': 'Estrategia de Transformación Digital en Retail & Punto de Venta'
            }
        },
        {
            'content': {
                'heading': 'El Desafío Inicial',
                'bullets': [
                    'Punto 1 de contenido real',
                    'Punto 2 de contenido real',
                    'Punto 3 de contenido real'
                ]
            }
        },
        {
            'content': {
                'heading': 'LÁMINA DE APERTURA',
                'bullets': []
            }
        },
        {
            'content': {
                'heading': 'SOLDES COMERCIO',
                'bullets': []
            }
        }
    ]
}

print("=" * 80)
print("TEST DE EXPORTACIÓN REAL")
print("=" * 80)

# Buscar un template de prueba
template_files = [
    'template.pptx',
    'plantilla.pptx',
    'test.pptx'
]

template_path = None
for tf in template_files:
    if os.path.exists(tf):
        template_path = tf
        break

if not template_path:
    print("❌ No se encontró ningún template de prueba")
    print("   Coloca un archivo template.pptx en el directorio raíz")
    sys.exit(1)

print(f"✅ Template encontrado: {template_path}")
print(f"📊 Slides a generar: {len(ai_content['slides'])}")

# Mostrar contenido
for idx, slide_data in enumerate(ai_content['slides']):
    content = slide_data.get('content', {})
    print(f"\n--- Slide {idx + 1} ---")
    if content.get('title'):
        print(f"  title: {content['title']}")
    if content.get('subtitle'):
        print(f"  subtitle: {content['subtitle']}")
    if content.get('heading'):
        print(f"  heading: {content['heading']}")
    if content.get('bullets'):
        print(f"  bullets: {len(content['bullets'])} items")
        for i, bullet in enumerate(content['bullets']):
            print(f"    {i+1}. {bullet}")

print("\n" + "=" * 80)
print("GENERANDO PRESENTACIÓN...")
print("=" * 80)

try:
    # Preparar contenido en el formato que espera generate_presentation
    content_by_slide = [slide['content'] for slide in ai_content['slides']]
    
    # Generar presentación
    output_path = generate_presentation(template_path, {'slides': ai_content['slides']})
    
    print(f"\n✅ ÉXITO: Presentación generada")
    print(f"📄 Archivo: {output_path}")
    print(f"📏 Tamaño: {os.path.getsize(output_path)} bytes")
    
    # Copiar a un nombre más amigable
    output_friendly = 'presentacion_test.pptx'
    shutil.copy(output_path, output_friendly)
    print(f"📋 Copiado a: {output_friendly}")
    
    print("\n" + "=" * 80)
    print("VERIFICACIÓN")
    print("=" * 80)
    print("Abre el archivo 'presentacion_test.pptx' y verifica:")
    print("  1. ¿Tiene 4 slides?")
    print("  2. ¿El slide 1 tiene el título 'ROSEN'?")
    print("  3. ¿El slide 2 tiene 3 bullets con contenido real?")
    print("  4. ¿Los slides mantienen el diseño del template?")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
