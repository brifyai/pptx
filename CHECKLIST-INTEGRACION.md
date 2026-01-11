# ✅ Checklist de Integración End-to-End

## 📋 Verificación Completa del Sistema

### 1. Configuración Inicial

- [ ] Repositorio clonado/descargado
- [ ] Python 3.8+ instalado (`python --version`)
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Git instalado (opcional)

### 2. Variables de Entorno

- [ ] Archivo `.env` creado (copiado de `.env.example`)
- [ ] `VITE_CHUTES_API_KEY` configurado con key válida
- [ ] `VITE_BACKEND_URL` configurado (http://localhost:8000)
- [ ] `VITE_GEMINI_API_KEY` configurado (opcional)

**Verificar:**
```bash
# Windows
type .env

# Mac/Linux
cat .env
```

### 3. Dependencias del Backend

- [ ] Navegado a carpeta `backend`
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] Paquetes críticos verificados:
  - [ ] `fastapi` instalado
  - [ ] `uvicorn` instalado
  - [ ] `python-pptx` instalado
  - [ ] `Pillow` instalado

**Verificar:**
```bash
cd backend
pip list | grep fastapi
pip list | grep python-pptx
```

### 4. Dependencias del Frontend

- [ ] Navegado a carpeta raíz
- [ ] Dependencias instaladas (`npm install`)
- [ ] Carpeta `node_modules` creada
- [ ] Paquetes críticos verificados:
  - [ ] `react` instalado
  - [ ] `vite` instalado
  - [ ] `pptxgenjs` instalado

**Verificar:**
```bash
npm list react
npm list vite
```

### 5. Backend Python

- [ ] Backend iniciado (`python main.py`)
- [ ] Servidor corriendo en puerto 8000
- [ ] Health check responde: `curl http://localhost:8000/health`
- [ ] Respuesta esperada: `{"status":"healthy","service":"AI Presentation API"}`
- [ ] Base de datos SQLite creada (`presentations.db`)
- [ ] Logs muestran: "✅ Base de datos inicializada"

**Verificar:**
```bash
cd backend
python main.py

# En otra terminal:
curl http://localhost:8000/health
```

### 6. Frontend React

- [ ] Frontend iniciado (`npm run dev`)
- [ ] Servidor corriendo en puerto 5173
- [ ] Navegador abre automáticamente
- [ ] Página carga sin errores
- [ ] Consola muestra: "🤖 Chutes AI Configuration: { isConfigured: true }"
- [ ] No hay errores en la consola del navegador

**Verificar:**
```bash
npm run dev
# Abre http://localhost:5173
# Abre DevTools (F12) y revisa la consola
```

### 7. Integración Backend ↔ Frontend

- [ ] Frontend puede conectarse al backend
- [ ] Consola muestra: "🔗 Conectando al backend: http://localhost:8000"
- [ ] Consola muestra: "✅ Backend disponible"
- [ ] No hay errores CORS
- [ ] Health check desde frontend funciona

**Verificar:**
```javascript
// En la consola del navegador:
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
// Debe mostrar: {status: "healthy", ...}
```

### 8. Servicio de IA (Chutes AI)

- [ ] API key configurada en `.env`
- [ ] Consola muestra configuración correcta
- [ ] No muestra: "⚠️ Chutes AI no está configurado"
- [ ] Puede hacer llamadas a la API

**Verificar:**
```javascript
// En la consola del navegador:
import { getChutesConfig } from './src/services/chutesService.js'
console.log(getChutesConfig())
// Debe mostrar: { isConfigured: true, apiKey: "***...", ... }
```

### 9. Análisis de Plantillas

- [ ] Puede subir archivo .pptx
- [ ] Backend recibe el archivo
- [ ] Backend analiza la estructura
- [ ] Backend genera previews de slides
- [ ] Frontend recibe el análisis
- [ ] Slides se muestran correctamente
- [ ] Previews se cargan (imágenes base64)

**Verificar:**
1. Sube una plantilla .pptx
2. Revisa la consola:
   - "📄 Archivo guardado en: ..."
   - "✅ Análisis completado: X slides"
   - "📊 Análisis recibido: ..."
   - "🎨 Slides inicializados: ..."

### 10. Generación de Contenido con IA

- [ ] Chat está visible
- [ ] Puede escribir mensajes
- [ ] IA responde correctamente
- [ ] Contenido se genera en formato JSON
- [ ] Slides se actualizan con el contenido
- [ ] No hay errores de parsing

**Verificar:**
1. Escribe: "Genera una presentación sobre IA"
2. Revisa la consola:
   - "🔄 Llamando a Chutes AI..."
   - "✅ Response data: ..."
   - "📄 Respuesta de IA: ..."

### 11. Edición de Slides

- [ ] Puede navegar entre slides
- [ ] Puede editar contenido directamente
- [ ] Cambios se guardan automáticamente
- [ ] Preview se mantiene visible
- [ ] No hay errores al editar

**Verificar:**
1. Navega a un slide
2. Edita el título
3. Verifica que el cambio se guarda

### 12. Exportación

- [ ] Botón "Exportar" funciona
- [ ] Modal de exportación se abre
- [ ] Puede exportar a PPTX
- [ ] Archivo se descarga correctamente
- [ ] Archivo se puede abrir en PowerPoint
- [ ] Diseño se mantiene

**Verificar:**
1. Haz clic en "Exportar"
2. Selecciona "PowerPoint"
3. Verifica que se descarga
4. Abre el archivo en PowerPoint

### 13. Colaboración (Opcional)

- [ ] Puede crear presentación compartida
- [ ] Modal de compartir funciona
- [ ] Se genera link de compartir
- [ ] WebSocket se conecta
- [ ] Cambios se sincronizan en tiempo real

**Verificar:**
1. Haz clic en "Compartir"
2. Crea presentación compartida
3. Copia el link
4. Abre en otra pestaña

### 14. Features Avanzadas

- [ ] Historial de versiones funciona
- [ ] Biblioteca de assets se abre
- [ ] Temas personalizados funcionan
- [ ] Comandos de voz funcionan (opcional)
- [ ] Analytics se muestra
- [ ] Importador de contenido funciona

**Verificar:**
1. Haz clic en cada botón del header
2. Verifica que cada feature se abre sin errores

### 15. Rendimiento

- [ ] Aplicación carga en < 3 segundos
- [ ] Análisis de plantilla toma < 10 segundos
- [ ] Generación de IA toma < 5 segundos
- [ ] Navegación entre slides es fluida
- [ ] No hay memory leaks (DevTools > Memory)

### 16. Compatibilidad

- [ ] Funciona en Chrome
- [ ] Funciona en Firefox
- [ ] Funciona en Edge
- [ ] Funciona en Safari (Mac)
- [ ] Responsive en diferentes tamaños de pantalla

---

## 🎯 Flujo de Verificación Completo

### Test End-to-End Completo

1. **Inicio:**
   - [ ] Inicia backend: `cd backend && python main.py`
   - [ ] Inicia frontend: `npm run dev`
   - [ ] Abre http://localhost:5173

2. **Carga de Plantilla:**
   - [ ] Sube archivo `test.pptx`
   - [ ] Espera análisis (< 10 seg)
   - [ ] Verifica que se muestran los slides
   - [ ] Verifica que hay previews

3. **Generación con IA:**
   - [ ] Escribe: "Genera una presentación sobre inteligencia artificial"
   - [ ] Espera respuesta (< 5 seg)
   - [ ] Verifica que todos los slides se actualizan
   - [ ] Verifica que el contenido es coherente

4. **Edición:**
   - [ ] Navega al slide 2
   - [ ] Edita el título
   - [ ] Verifica que se guarda
   - [ ] Usa el chat: "Mejora el título"
   - [ ] Verifica que se actualiza

5. **Exportación:**
   - [ ] Haz clic en "Exportar"
   - [ ] Selecciona "PowerPoint"
   - [ ] Espera descarga
   - [ ] Abre el archivo
   - [ ] Verifica que el diseño se mantiene

6. **Colaboración (Opcional):**
   - [ ] Haz clic en "Compartir"
   - [ ] Crea presentación compartida
   - [ ] Copia el link
   - [ ] Abre en incógnito
   - [ ] Edita en una pestaña
   - [ ] Verifica que se actualiza en la otra

---

## 📊 Resumen de Estado

### ✅ Completado (Marcar cuando todo funcione)

- [ ] **Configuración inicial** (Pasos 1-2)
- [ ] **Instalación de dependencias** (Pasos 3-4)
- [ ] **Servicios corriendo** (Pasos 5-6)
- [ ] **Integración básica** (Pasos 7-8)
- [ ] **Funcionalidad core** (Pasos 9-12)
- [ ] **Features avanzadas** (Pasos 13-14)
- [ ] **Calidad y rendimiento** (Pasos 15-16)

### 🎉 ¡Integración Completa!

Si todos los checkboxes están marcados, tu aplicación está **100% integrada y funcionando end-to-end**.

---

## 🐛 Si Algo Falla

1. **Revisa el paso específico** que falló
2. **Consulta TROUBLESHOOTING.md** para soluciones
3. **Verifica los logs** en las terminales
4. **Ejecuta** `npm run check` para diagnóstico automático
5. **Revisa la consola** del navegador (F12)

---

## 📞 Comandos de Diagnóstico Rápido

```bash
# Verificar todo
npm run check

# Verificar backend
curl http://localhost:8000/health

# Verificar variables de entorno
node -e "console.log(process.env.VITE_CHUTES_API_KEY ? '✅ Configurado' : '❌ No configurado')"

# Verificar puertos
netstat -an | grep 8000  # Backend
netstat -an | grep 5173  # Frontend

# Verificar procesos
ps aux | grep python     # Backend
ps aux | grep node       # Frontend
```

---

**Última actualización:** Enero 2026
