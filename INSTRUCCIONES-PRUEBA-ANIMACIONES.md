# Instrucciones para Probar la Solución de Animaciones

## Paso 1: Reiniciar el Backend

El backend necesita reiniciarse para cargar los cambios en `pptx_analyzer.py`.

### Opción A: Usando los scripts de inicio
```bash
# Detener el backend actual (Ctrl+C en la terminal donde está corriendo)
# Luego ejecutar:
start-backend.bat
```

### Opción B: Manualmente
```bash
cd backend
python main.py
```

## Paso 2: Verificar que el Backend Está Corriendo

Abrir en el navegador: http://localhost:8000

Deberías ver:
```json
{
  "message": "AI Presentation Generator API",
  "status": "running"
}
```

## Paso 3: Probar con el Template

1. **Abrir la app**: http://localhost:3006
2. **Subir el template** con el logo animado (Plantilla_Origenv4.pptx)
3. **Observar la consola del navegador** (F12 → Console)

### Qué Buscar en la Consola:

**ANTES (problema)**:
```
📦 Assets extraídos: 1 total (0 logos, 1 transparentes, 0 animados, 0 imágenes)
```

**DESPUÉS (solución)**:
```
📦 Assets extraídos: 1 total (0 logos, 0 transparentes, 1 animados, 0 imágenes)
🎬 Shape 123 detectado como posible animación (logo transparente)
```

## Paso 4: Verificar Visualmente en la App

En el visor de slides, deberías ver:

1. ✅ **Logo con animación CSS** - Se mueve continuamente (slide in/out)
2. ✅ **Badge animado** - Ícono de "animation" rotando en la esquina
3. ✅ **Fondo transparente** - El logo mantiene su transparencia
4. ✅ **Tooltip explicativo** - Al pasar el mouse: "Elemento con animación (se verá en movimiento en el PPTX)"

### Botón de Toggle

- Hay un botón con ícono de ojo para mostrar/ocultar los assets extraídos
- Debe mostrar un badge con el número "1" (1 elemento animado)
- Al hacer clic, el logo debe aparecer/desaparecer

## Paso 5: Verificar Exportación

1. **Exportar a PPTX** desde la app
2. **Abrir el PPTX exportado** en PowerPoint
3. **Reproducir la presentación** (F5)
4. ✅ **Verificar que la animación REAL funciona** (no la CSS, sino la del PPTX)

## Logs del Backend

Al subir el template, el backend debería mostrar:

```
📄 Archivo guardado en: /tmp/tmpXXXXXX.pptx
🎨 Usando LibreOffice para generar previews...
✅ Generadas 5 imágenes con LibreOffice

SLIDE 1
────────────────────────────────────────────────────────────
   ℹ️ Slide no tiene animaciones detectadas en XML
   🎬 Shape 123 detectado como posible animación (logo transparente)

📦 Assets extraídos: 1 total (0 logos, 0 transparentes, 1 animados, 0 imágenes)
🎬 Elemento animado extraído: slide 1, shape_id=123

✅ Análisis completado: 5 slides
```

## Troubleshooting

### Problema: No se ve la animación CSS

**Verificar**:
1. ¿El backend se reinició correctamente?
2. ¿La consola muestra "1 animados"?
3. ¿El botón de toggle está activado (ojo abierto)?
4. ¿Hay errores en la consola del navegador?

**Solución**:
- Refrescar la página (Ctrl+F5)
- Volver a subir el template
- Verificar que no hay errores en la consola

### Problema: Sigue mostrando "0 animados"

**Verificar**:
1. ¿El logo es pequeño (<25% del slide)?
2. ¿El logo tiene fondo transparente (PNG con alpha)?
3. ¿El backend se reinició?

**Solución**:
- Revisar logs del backend
- Ejecutar script de prueba:
  ```bash
  python backend/test_animation_detection.py path/to/template.pptx
  ```

### Problema: El PPTX exportado no tiene animación

**Esto NO debería pasar** porque el XML cloner preserva las animaciones.

**Verificar**:
1. ¿El template original tiene animación?
2. ¿Se está usando el endpoint correcto de exportación?
3. ¿Los logs muestran "usando clonación con template"?

## Script de Prueba Diagnóstica

Si algo no funciona, ejecutar:

```bash
python backend/test_animation_detection.py path/to/Plantilla_Origenv4.pptx
```

Este script mostrará:
- Qué shapes se detectaron
- Cuáles tienen animación
- Tamaño y características de cada imagen
- Resumen de assets extraídos

## Resultado Esperado Final

✅ **En la App**:
- Logo se ve con animación CSS continua
- Badge de animación rotando
- Experiencia visual mejorada

✅ **En el PPTX Exportado**:
- Animación real de PowerPoint funciona
- Logo aparece con el timing correcto
- Diseño y formato preservados

✅ **Sin Confusión**:
- Usuario entiende que hay animación
- No se pregunta "¿dónde está el logo?"
- Confianza en la herramienta

## Notas Finales

- La animación CSS es **indicativa**, no replica exactamente la del PPTX
- El objetivo es **mejorar la UX** en la app
- La **animación real** está en el PPTX exportado
- Esta solución funciona **sin modificar LibreOffice**

---

**¿Listo para probar?** 🚀

1. Reinicia el backend
2. Sube el template
3. Observa el logo animado
4. Exporta y verifica

**¿Problemas?** Revisa los logs y ejecuta el script de diagnóstico.
