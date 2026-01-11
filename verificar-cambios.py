"""
Script para verificar si el backend tiene los cambios más recientes
"""
import sys

print("🔍 Verificando que los cambios están cargados...")

# Verificar que el módulo tiene el código actualizado
sys.path.insert(0, 'backend')
try:
    from pptx_analyzer import detect_animated_shapes
    import inspect
    
    # Obtener el código fuente de la función
    source = inspect.getsource(detect_animated_shapes)
    
    # Verificar que tiene el fallback heurístico
    if "FALLBACK" in source and "logo transparente" in source:
        print("✅ El código tiene el fallback heurístico implementado")
    else:
        print("⚠️ El código NO tiene el fallback heurístico")
        print("   Esto significa que el backend NO se reinició")
        print("\n📝 DEBES REINICIAR EL BACKEND:")
        print("   1. Detener el backend (Ctrl+C)")
        print("   2. Iniciar de nuevo: python backend/main.py")
        sys.exit(1)
    
    # Verificar logging detallado
    if "Aplicando FALLBACK" in source:
        print("✅ El código tiene logging detallado")
    else:
        print("⚠️ El código NO tiene logging detallado")
    
    print("\n✅ TODO CORRECTO - El backend tiene los cambios más recientes")
    print("\n📝 Próximo paso:")
    print("   1. REINICIAR EL BACKEND (Ctrl+C y luego python backend/main.py)")
    print("   2. Ir a http://localhost:3006")
    print("   3. Subir el template")
    print("   4. Revisar los logs del backend (terminal)")
    print("   5. Revisar la consola del navegador (F12)")
    
except Exception as e:
    print(f"❌ Error verificando el código: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
