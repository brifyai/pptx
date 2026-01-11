"""
Test rápido para verificar que los cambios funcionan
"""
import sys
sys.path.insert(0, 'backend')

from pptx_analyzer import detect_animated_shapes
from pptx import Presentation

print("✅ Módulo cargado correctamente")
print("✅ Función detect_animated_shapes disponible")
print("\n📝 Para probar con un archivo real:")
print("   python backend/test_animation_detection.py path/to/template.pptx")
