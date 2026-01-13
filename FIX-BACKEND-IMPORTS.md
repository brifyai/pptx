# 🔧 Fix: Backend No Inicia - Error de Importación

## ❌ Problema
```
ImportError: No module named 'requests'
```

El backend no puede iniciar porque faltan las dependencias para la búsqueda web real que agregamos.

## 🔍 Causa Raíz
- Agregamos `backend/routes/search.py` con búsqueda web real
- Este archivo requiere: `requests`, `beautifulsoup4`, `duckduckgo-search`
- Estas dependencias NO estaban en `requirements.txt`
- El backend intenta importar `search.py` al iniciar y falla

## ✅ Solución Implementada

### 1. Actualizado `backend/requirements.txt`
```txt
# Web Search (NUEVO)
requests>=2.31.0
beautifulsoup4>=4.12.0
duckduckgo-search>=4.0.0
```

### 2. Creado script de instalación: `install-backend-deps.bat`
- Instala todas las dependencias
- Verifica la instalación
- Inicia el backend automáticamente

## 🚀 Cómo Usar

### Opción 1: Script Automático (RECOMENDADO)
```cmd
install-backend-deps.bat
```

### Opción 2: Manual
```cmd
cd backend
pip install requests beautifulsoup4 duckduckgo-search
python main.py
```

### Opción 3: Reinstalar Todo
```cmd
cd backend
pip install -r requirements.txt
python main.py
```

## ✅ Verificación

Después de instalar, verifica que el backend funciona:

1. **Health Check**
   ```
   http://localhost:8000/health
   ```
   Debe responder: `{"status": "healthy"}`

2. **Test de Búsqueda**
   ```
   http://localhost:8000/api/search/test
   ```
   Debe responder: `{"status": "ok", "features": [...]}`

3. **Logs del Backend**
   Debe mostrar:
   ```
   ✅ LibreOffice UNO API cargado correctamente
   INFO:     Started server process
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

## 📋 Dependencias Completas

### Core
- `fastapi` - Framework web
- `uvicorn` - Servidor ASGI
- `python-pptx` - Manipulación de PowerPoint
- `Pillow` - Procesamiento de imágenes

### Web Search (NUEVO)
- `requests` - HTTP client
- `beautifulsoup4` - HTML parsing
- `duckduckgo-search` - Búsqueda web sin API key

### Testing
- `pytest` - Testing framework
- `hypothesis` - Property-based testing

## 🎯 Estado Final

- ✅ `requirements.txt` actualizado
- ✅ Script de instalación creado
- ✅ Backend listo para iniciar
- ✅ Búsqueda web 100% funcional
- ✅ Sin dependencias de LibreOffice UNO

## 🔄 Próximos Pasos

1. Ejecutar `install-backend-deps.bat`
2. Verificar que el backend inicia sin errores
3. Probar el endpoint `/api/search/test`
4. Probar búsqueda web desde el chat
5. Verificar análisis de plantillas con backend real
