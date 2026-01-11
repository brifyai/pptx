# 🔧 Guía de Solución de Problemas

## Problema: "No pasa nada al subir un PPT"

### Diagnóstico Rápido

1. **Abre la consola del navegador** (F12)
2. **Busca mensajes** que empiecen con:
   - 📄 Procesando archivo
   - 🔍 Analizando plantilla
   - ✅ Análisis completado
   - ❌ Error

### Soluciones Comunes

#### 1. Backend no está corriendo

**Síntoma:** Ves `⚠️ Backend no disponible, usando análisis simulado`

**Solución:**
```bash
# Terminal 1 - Iniciar backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Verificar:** Abre http://localhost:8000/health
- Debe mostrar: `{"status":"healthy"}`

#### 2. Puerto ocupado

**Síntoma:** Error `Address already in use`

**Solución:**
```bash
# Windows - Matar proceso en puerto 8000
netstat -ano | findstr :8000
taskkill /PID [número] /F

# O cambiar puerto en backend/main.py:
uvicorn.run(app, host="0.0.0.0", port=8001)

# Y actualizar .env:
VITE_BACKEND_URL=http://localhost:8001
```

#### 3. Python no instalado

**Síntoma:** `'python' no se reconoce como comando`

**Solución:**
1. Descargar Python 3.8+ de https://www.python.org/downloads/
2. Durante instalación, marcar "Add Python to PATH"
3. Reiniciar terminal

#### 4. Dependencias faltantes

**Síntoma:** `ModuleNotFoundError: No module named 'fastapi'`

**Solución:**
```bash
cd backend
pip install -r requirements.txt
```

#### 5. CORS bloqueado

**Síntoma:** Error `CORS policy` en consola

**Solución:** Verificar que backend/main.py tenga:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3006"],
    ...
)
```

#### 6. Archivo no válido

**Síntoma:** `Solo se aceptan archivos .pptx`

**Solución:**
- Asegúrate de subir archivo `.pptx` (no `.ppt` legacy)
- Convierte archivos antiguos en PowerPoint: Archivo → Guardar como → .pptx

## Verificación Paso a Paso

### 1. Verificar Backend
```bash
# Debe responder con JSON
curl http://localhost:8000/health
```

### 2. Verificar Frontend
```bash
# Debe abrir en navegador
http://localhost:3006
```

### 3. Verificar Logs

**Backend (Terminal 1):**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Frontend (Terminal 2):**
```
VITE v5.0.0  ready in 500 ms
➜  Local:   http://localhost:3006/
```

**Navegador (F12 → Console):**
```
🤖 Chutes AI Configuration: {...}
📄 Procesando archivo: plantilla.pptx
✅ Análisis completado
```

## Modo Debug

Activa logs detallados:

**Frontend (.env):**
```bash
VITE_DEBUG=true
```

**Backend (main.py):**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contacto

Si el problema persiste:
1. Copia los logs de consola
2. Copia el error exacto
3. Indica qué archivo intentaste subir
