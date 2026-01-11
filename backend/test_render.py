import sys
sys.path.insert(0, '.')

from pptx_analyzer import analyze_presentation
import json

# Buscar el archivo PPT
import os
pptx_files = [f for f in os.listdir('..') if f.endswith('.pptx')]
if not pptx_files:
    print("No se encontró archivo PPTX")
    sys.exit(1)

pptx_path = os.path.join('..', pptx_files[0])
print(f"Analizando: {pptx_path}")

result = analyze_presentation(pptx_path)

print(f"\n✅ Slides encontrados: {len(result['slides'])}")
print(f"✅ Método de render: {result['renderMethod']}")
print(f"✅ Imágenes generadas: {len(result['slideImages'])}")

for i, slide in enumerate(result['slides']):
    has_preview = 'preview' in slide and slide['preview'] is not None
    preview_len = len(slide['preview']) if has_preview else 0
    print(f"  Slide {i+1}: preview={'✅' if has_preview else '❌'} ({preview_len} chars)")
