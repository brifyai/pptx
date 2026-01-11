# 🔄 REINICIAR BACKEND - URGENTE

## El backend DEBE reiniciarse para aplicar los cambios

### Paso 1: Detener el Backend Actual

Busca la terminal donde está corriendo el backend y presiona:
```
Ctrl + C
```

O si no la encuentras, mata el proceso:
```powershell
# Encontrar el proceso
Get-Process -Id 24760 -ErrorAction SilentlyContinue | Stop-Process -Force

# O buscar por nombre
Get-Process python | Where-Object {$_.Path -like "*marketing-ai-app*"} | Stop-Process -Force
```

### Paso 2: Iniciar el Backend con los Nuevos Cambios

```bash
# Opción A: Usar el script
start-backend.bat

# Opción B: Manual
cd backend
python main.py
```

### Paso 3: Verificar que Está Corriendo

Abrir en navegador: http://localhost:8000

Deberías ver:
```json
{
  "message": "AI Presentation Generator API",
  "status": "running"
}
```

### Paso 4: Probar con el Template

1. Ir a http://localhost:3006
2. Subir el template (Plantilla_Origenv4.pptx)
3. **IMPORTANTE**: Abrir la consola del navegador (F12)
4. **IMPORTANTE**: Abrir la terminal del backend

### Qué Buscar en los Logs del Backend:

Deberías ver algo como esto:

```
🔍 Analizando slide 1 para detectar animaciones...
   ℹ️ Slide no tiene animaciones detectadas en XML
   🔍 Aplicando FALLBACK: detectar logos transparentes como posibles animaciones...
   📏 Dimensiones del slide: 9144000 x 6858000 EMUs
   📷 Imagen encontrada: shape_id=123
      Tamaño: 15.0% x 12.0% del slide
      ¿Es pequeña? True
      Formato: image/png
      Modo de imagen: RGBA
      ✅ Tiene transparencia!
      ¿Tiene transparencia? True
   🎬 ✅ Shape 123 detectado como posible animación (logo transparente)
   📊 Total de imágenes analizadas: 1
   🎬 Total de animaciones detectadas por fallback: 1
   Resultado: 1 shapes animados detectados: {123}

🎬 Elemento animado extraído: slide 1, shape_id=123

📊 RESUMEN DE ASSETS:
   Total: 1
   Logos: 0
   Transparentes: 0
   Animados: 1  ← ¡ESTO ES LO IMPORTANTE!
   Imágenes: 0
```

### Qué Buscar en la Consola del Navegador:

```javascript
📦 Assets extraídos: {
  animatedElements: [
    {
      id: "asset_0_123",
      slideNumber: 1,
      shapeId: 123,
      hasAnimation: true,
      hasTransparency: true,
      isLogo: true,
      ...
    }
  ],
  totalCount: 1
}
```

### Si Sigue Sin Funcionar:

1. **Verificar que el backend se reinició**:
   - Matar TODOS los procesos Python
   - Iniciar de nuevo
   - Verificar que no hay errores al iniciar

2. **Limpiar caché del navegador**:
   - Ctrl + Shift + Delete
   - O Ctrl + F5 para hard refresh

3. **Verificar que el template tiene el logo**:
   - Abrir el PPTX en PowerPoint
   - Verificar que hay un logo pequeño con fondo transparente
   - Verificar que tiene animación

4. **Ejecutar script de diagnóstico**:
   ```bash
   python backend/test_animation_detection.py path/to/template.pptx
   ```

## ¿Por Qué Es Necesario Reiniciar?

Python carga los módulos en memoria al iniciar. Los cambios en `pptx_analyzer.py` NO se aplican hasta que el proceso se reinicia.

## Checklist

- [ ] Backend detenido (Ctrl+C o kill process)
- [ ] Backend reiniciado (start-backend.bat o python main.py)
- [ ] Backend responde en http://localhost:8000
- [ ] Template subido de nuevo en la app
- [ ] Logs del backend revisados
- [ ] Consola del navegador revisada
- [ ] Logo se ve con animación CSS

---

**IMPORTANTE**: Si después de reiniciar sigue sin funcionar, copia y pega los logs del backend aquí para diagnosticar.
