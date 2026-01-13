# 🎯 Instrucciones para Usar la Aplicación

## ✅ Problema Resuelto

El backend ahora funciona correctamente. Las dependencias faltantes fueron instaladas y el servidor está operativo.

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Inicio Rápido (RECOMENDADO)

1. **Abrir 2 terminales CMD**

2. **Terminal 1 - Backend:**
   ```cmd
   start-backend.bat
   ```
   Espera a ver: `Uvicorn running on http://0.0.0.0:8000`

3. **Terminal 2 - Frontend:**
   ```cmd
   npm run dev
   ```
   Espera a ver: `Local: http://localhost:5173`

4. **Abrir navegador:**
   ```
   http://localhost:5173
   ```

### Opción 2: Inicio Manual

```cmd
# Terminal 1
cd backend
python main.py

# Terminal 2
npm run dev
```

## 🧪 Verificar que Todo Funciona

### 1. Backend Funcionando
Abre en el navegador:
```
http://localhost:8000/health
```
Debe mostrar: `{"status":"healthy","service":"AI Presentation API"}`

### 2. Frontend Funcionando
Abre en el navegador:
```
http://localhost:5173
```
Debe cargar la aplicación sin errores.

### 3. Probar Análisis de Plantilla
1. Sube una plantilla PPTX
2. Verifica que NO diga "Backend no disponible, usando análisis simulado"
3. Debe analizar la plantilla con el backend real

### 4. Probar Chat IA
1. Abre el panel de chat
2. Escribe: `/buscar tendencias marketing 2026`
3. Debe buscar en internet y responder con información real

## 🎯 Funcionalidades Disponibles

### Chat IA - Comandos
- `/buscar [query]` - Búsqueda web real
- `/variantes` - Genera variantes de contenido
- `/sugerencias` - Sugerencias de mejora
- `/estructurar` - Estructura el contenido
- `/limpiar` - Limpia el historial
- `/historial` - Muestra estadísticas

### Análisis de Plantillas
- ✅ Análisis real con backend (no simulado)
- ✅ Detección de estructura
- ✅ Identificación de áreas de texto
- ✅ Análisis de diseño y colores

### Exportación
- ✅ Exportar a PowerPoint (.pptx)
- ✅ Exportar a PDF
- ✅ Preservación de animaciones
- ✅ Preservación de formato

## ⚠️ Solución de Problemas

### Backend no inicia
```cmd
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend no conecta con backend
1. Verifica que el backend esté corriendo en puerto 8000
2. Abre: `http://localhost:8000/health`
3. Si no responde, reinicia el backend

### Error "Module not found"
```cmd
cd backend
pip install requests beautifulsoup4 duckduckgo-search
```

### App se queda en "Analizando plantilla..."
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador (F12)
3. Si dice "Backend no disponible", reinicia el backend

## 📝 Logs Importantes

### Backend OK
```
✅ LibreOffice UNO API cargado correctamente
✅ Base de datos inicializada
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Frontend OK (Consola del navegador)
```
🤖 Chutes AI Configuration: {isConfigured: true}
🔗 Conectando al backend: http://localhost:8000
✅ Backend disponible
```

## 🎉 Todo Listo

Si ves estos mensajes, la aplicación está funcionando al 100%:
- ✅ Backend corriendo en puerto 8000
- ✅ Frontend corriendo en puerto 5173
- ✅ Sin errores en consola
- ✅ Análisis de plantillas real (no simulado)
- ✅ Búsqueda web funcionando

## 📞 Ayuda Adicional

Si algo no funciona:
1. Lee `TROUBLESHOOTING.md`
2. Revisa `BACKEND-FUNCIONANDO.md`
3. Ejecuta `test-backend.bat` para verificar el backend
