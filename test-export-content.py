"""
Script de diagnóstico para verificar el flujo de exportación de contenido.
"""
import json
import sys

# Simular el contenido que se envía desde el frontend
test_slides = [
    {
        "id": "slide-1",
        "type": "title",
        "content": {
            "title": "ROSEN",
            "subtitle": "ECOSISTEMA DE ATENCIÓN VIRTUAL",
            "heading": "Estrategia de Transformación Digital en Retail & Punto de Venta"
        },
        "preview": "data:image/png;base64,..."
    },
    {
        "id": "slide-2",
        "type": "content",
        "content": {
            "heading": "El Desafío Inicial",
            "bullets": [
                "Punto 1 de contenido",
                "Punto 2 de contenido",
                "Punto 3 de contenido"
            ]
        },
        "preview": "data:image/png;base64,..."
    },
    {
        "id": "slide-3",
        "type": "content",
        "content": {
            "heading": "LÁMINA DE APERTURA",
            "bullets": []
        },
        "preview": "data:image/png;base64,..."
    },
    {
        "id": "slide-4",
        "type": "content",
        "content": {
            "heading": "SOLDES COMERCIO",
            "bullets": []
        },
        "preview": "data:image/png;base64,..."
    }
]

print("=" * 80)
print("DIAGNÓSTICO DE EXPORTACIÓN DE CONTENIDO")
print("=" * 80)

print(f"\n📊 Total de slides: {len(test_slides)}")

for idx, slide in enumerate(test_slides):
    print(f"\n--- Slide {idx + 1} ---")
    print(f"  ID: {slide['id']}")
    print(f"  Tipo: {slide['type']}")
    print(f"  Contenido:")
    
    content = slide.get('content', {})
    if content.get('title'):
        print(f"    ✓ title: {content['title']}")
    if content.get('subtitle'):
        print(f"    ✓ subtitle: {content['subtitle']}")
    if content.get('heading'):
        print(f"    ✓ heading: {content['heading']}")
    if content.get('bullets'):
        print(f"    ✓ bullets: {len(content['bullets'])} items")
        for i, bullet in enumerate(content['bullets'][:3]):
            print(f"        {i+1}. {bullet}")

# Simular lo que se envía al backend
ai_content = {
    'slides': [{'content': slide.get('content', {})} for slide in test_slides]
}

print("\n" + "=" * 80)
print("FORMATO ENVIADO AL BACKEND (ai_content)")
print("=" * 80)
print(json.dumps(ai_content, indent=2, ensure_ascii=False))

# Verificar que el formato es correcto
print("\n" + "=" * 80)
print("VERIFICACIÓN")
print("=" * 80)

for idx, slide_data in enumerate(ai_content['slides']):
    content = slide_data.get('content', {})
    has_content = any([
        content.get('title'),
        content.get('subtitle'),
        content.get('heading'),
        content.get('bullets')
    ])
    
    status = "✅ OK" if has_content else "❌ VACÍO"
    print(f"Slide {idx + 1}: {status}")
    if not has_content:
        print(f"  ⚠️ Este slide no tiene contenido!")

print("\n" + "=" * 80)
print("CONCLUSIÓN")
print("=" * 80)

total_with_content = sum(1 for s in ai_content['slides'] if any([
    s.get('content', {}).get('title'),
    s.get('content', {}).get('subtitle'),
    s.get('content', {}).get('heading'),
    s.get('content', {}).get('bullets')
]))

print(f"Slides con contenido: {total_with_content}/{len(ai_content['slides'])}")

if total_with_content == 0:
    print("❌ PROBLEMA: Ningún slide tiene contenido!")
    print("   El formato de datos está mal o el contenido no se está pasando correctamente.")
else:
    print(f"✅ {total_with_content} slides tienen contenido correctamente formateado")
