"""
Script de diagnóstico simple para verificar por qué el PPTX se exporta vacío.
"""

import sys
import os

# Agregar backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("=" * 80)
print("🔍 DIAGNÓSTICO DE EXPORTACIÓN")
print("=" * 80)

# Test 1: Verificar que los módulos se importan correctamente
print("\n1️⃣ Verificando imports...")
try:
    from pptx_xml_cloner import PPTXXMLCloner
    print("   ✅ PPTXXMLCloner importado")
except Exception as e:
    print(f"   ❌ Error importando PPTXXMLCloner: {e}")
    sys.exit(1)

try:
    from pptx_generator import generate_presentation
    print("   ✅ generate_presentation importado")
except Exception as e:
    print(f"   ❌ Error importando generate_presentation: {e}")
    sys.exit(1)

# Test 2: Verificar que hay un template
print("\n2️⃣ Buscando template...")
template_path = None
for file in os.listdir('.'):
    if file.endswith('.pptx') and 'template' in file.lower():
        template_path = file
        break

if not template_path:
    print("   ⚠️ No se encontró template automáticamente")
    if len(sys.argv) > 1:
        template_path = sys.argv[1]
        print(f"   📄 Usando template del argumento: {template_path}")
    else:
        print("\n   💡 Uso: python diagnostico-export.py tu_template.pptx")
        sys.exit(1)

if not os.path.exists(template_path):
    print(f"   ❌ Template no existe: {template_path}")
    sys.exit(1)

print(f"   ✅ Template encontrado: {template_path}")

# Test 3: Analizar el template
print("\n3️⃣ Analizando template...")
try:
    cloner = PPTXXMLCloner(template_path)
    info = cloner.get_template_info()
    
    print(f"   ✅ Template analizado:")
    print(f"      - Slides: {info['slide_count']}")
    print(f"      - Fuentes: {', '.join(info['fonts_used']) if info['fonts_used'] else 'ninguna'}")
    
    for i, slide_texts in enumerate(info['text_locations']):
        print(f"\n      📄 Slide {i+1}: {len(slide_texts)} textos")
        for t in slide_texts[:3]:  # Solo primeros 3
            print(f"         • [{t['type']}] {t['text'][:40]}...")
        if len(slide_texts) > 3:
            print(f"         ... y {len(slide_texts) - 3} más")
    
except Exception as e:
    print(f"   ❌ Error analizando template: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 4: Probar clonación con contenido simple
print("\n4️⃣ Probando clonación con contenido...")

# Contenido de prueba MUY SIMPLE
test_content = []
for i in range(min(3, info['slide_count'])):
    if i == 0:
        test_content.append({
            'title': f'Título de Prueba {i+1}',
            'subtitle': f'Subtítulo de prueba {i+1}'
        })
    else:
        test_content.append({
            'heading': f'Sección {i+1}',
            'bullets': [
                f'Punto {i+1}.1',
                f'Punto {i+1}.2',
                f'Punto {i+1}.3'
            ]
        })

print(f"   📝 Contenido de prueba preparado: {len(test_content)} slides")
for i, content in enumerate(test_content):
    print(f"      Slide {i+1}: {list(content.keys())}")

try:
    output_path = cloner.clone_with_content(test_content)
    print(f"\n   ✅ PPTX generado: {output_path}")
    
    # Verificar tamaño
    size = os.path.getsize(output_path)
    print(f"   📊 Tamaño del archivo: {size:,} bytes")
    
    if size < 10000:
        print(f"   ⚠️ ADVERTENCIA: Archivo muy pequeño, probablemente vacío")
    else:
        print(f"   ✅ Tamaño parece correcto")
    
    print(f"\n   💡 Abre el archivo y verifica si tiene contenido:")
    print(f"      {output_path}")
    
except Exception as e:
    print(f"   ❌ Error en clonación: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Verificar qué se loggeó
print("\n5️⃣ Resumen de logs:")
print("   📋 Revisa los logs arriba para ver:")
print("      - ¿Se encontraron shapes en cada slide?")
print("      - ¿Se detectaron tipos correctamente?")
print("      - ¿Se hicieron reemplazos?")
print("      - ¿Cuántos reemplazos en total?")

print("\n" + "=" * 80)
print("✅ DIAGNÓSTICO COMPLETADO")
print("=" * 80)
print("\nSi el archivo está vacío, revisa los logs arriba.")
print("Busca líneas como:")
print("  - '📊 Total de reemplazos: X'")
print("  - '✅ Reemplazando TITLE: ...'")
print("\nSi no ves reemplazos, el problema está en la detección de tipos.")
