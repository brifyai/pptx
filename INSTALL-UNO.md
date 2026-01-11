# Instalación de LibreOffice UNO API

LibreOffice UNO API permite control programático completo de LibreOffice desde Python.

## Ventajas de UNO API

- ✅ Control total sobre renderizado de slides
- ✅ Acceso a todas las propiedades (animaciones, efectos, etc.)
- ✅ Renderizado más preciso que modo headless
- ✅ Posibilidad de capturar animaciones frame por frame
- ✅ No requiere conversión a PDF intermedia

## Instalación en Windows

### Opción 1: Usar Python de LibreOffice (Recomendado)

LibreOffice incluye su propio Python con `pyuno` ya instalado:

```bash
# Ubicación típica del Python de LibreOffice
"C:\Program Files\LibreOffice\program\python.exe"

# Verificar que funciona
"C:\Program Files\LibreOffice\program\python.exe" -c "import uno; print('UNO OK')"
```

**Para usar en tu app:**
1. Configura tu aplicación para usar el Python de LibreOffice
2. O copia los módulos `uno` y `pyuno` a tu Python

### Opción 2: Instalar pyuno en tu Python

```bash
# Agregar LibreOffice al PYTHONPATH
set PYTHONPATH=%PYTHONPATH%;C:\Program Files\LibreOffice\program

# Copiar archivos necesarios
copy "C:\Program Files\LibreOffice\program\*.pyd" venv\Lib\site-packages\
copy "C:\Program Files\LibreOffice\program\uno.py" venv\Lib\site-packages\
copy "C:\Program Files\LibreOffice\program\unohelper.py" venv\Lib\site-packages\
```

## Instalación en Linux

```bash
# Ubuntu/Debian
sudo apt-get install libreoffice python3-uno

# Verificar
python3 -c "import uno; print('UNO OK')"
```

## Instalación en macOS

```bash
# Instalar LibreOffice
brew install --cask libreoffice

# Agregar al PYTHONPATH
export PYTHONPATH=$PYTHONPATH:/Applications/LibreOffice.app/Contents/Resources

# Verificar
python3 -c "import uno; print('UNO OK')"
```

## Uso en la Aplicación

Una vez instalado, el renderizador UNO se usará automáticamente si está disponible:

```python
from libreoffice_uno_renderer import render_pptx_with_uno, UNO_AVAILABLE

if UNO_AVAILABLE:
    images = render_pptx_with_uno("presentation.pptx")
else:
    # Fallback a método headless
    images = convert_pptx_to_images("presentation.pptx")
```

## Iniciar Servidor LibreOffice

Para mejor rendimiento, inicia LibreOffice en modo servidor una vez:

```bash
# Windows
"C:\Program Files\LibreOffice\program\soffice.exe" --headless --invisible --nocrashreport --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager"

# Linux/macOS
soffice --headless --invisible --nocrashreport --nodefault --nofirststartwizard --nolockcheck --nologo --norestore --accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager"
```

El servidor se mantiene corriendo y acepta conexiones UNO en el puerto 2002.

## Solución de Problemas

### Error: "No module named 'uno'"

- Verifica que LibreOffice esté instalado
- Agrega LibreOffice al PYTHONPATH
- Usa el Python de LibreOffice directamente

### Error: "Cannot connect to LibreOffice"

- Inicia el servidor LibreOffice manualmente
- Verifica que el puerto 2002 esté libre
- Revisa el firewall

### Rendimiento lento

- Inicia el servidor una vez al inicio de la app
- Reutiliza la conexión para múltiples documentos
- Usa modo headless para mejor rendimiento

## Estado Actual

⚠️ **UNO API es opcional** - La app funciona sin ella usando el método headless estándar.

Si UNO está disponible, se usará automáticamente para mejor calidad de renderizado.
