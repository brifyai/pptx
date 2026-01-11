# 🚀 Inicio Rápido - AI Presentation Studio

## ⚡ Configuración en 5 Minutos

### Paso 1: Clonar o Descargar el Proyecto

Si aún no lo has hecho:
```bash
git clone <tu-repositorio>
cd ai-presentation-studio
```

### Paso 2: Configurar Variables de Entorno

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edita el archivo `.env` y agrega tu API key de Chutes AI:

```env
VITE_CHUTES_API_KEY=tu_api_key_aqui
VITE_BACKEND_URL=http://localhost:8000
```

**¿Dónde obtener la API key?**
1. Ve a https://chutes.ai
2. Regístrate o inicia sesión
3. Ve a "API Keys" en tu dashboard
4. Copia tu key y pégala en `.env`

### Paso 3: Instalar Dependencias

**Backend (Python):**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

**Frontend (Node.js):**
```bash
npm install
```

### Paso 4: Verificar Integración

```bash
npm run check
```

Deberías ver:
```
✅ ¡Todo está correctamente configurado!
```

### Paso 5: Iniciar la Aplicación

**Opción A: Automático (Windows)**
```bash
START-APP.bat
```

**Opción B: Manual**

Abre 2 terminales:

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### Paso 6: ¡Usar la Aplicación!

1. Abre tu navegador en **http://localhost:5173**
2. Verás la pantalla de bienvenida
3. Haz clic en "Subir Plantilla" o arrastra un archivo .pptx
4. Espera a que se analice (unos segundos)
5. ¡Empieza a chatear con la IA!

---

## 🎯 Primer Uso - Tutorial Rápido

### 1. Subir una Plantilla

- Arrastra un archivo `.pptx` a la zona de carga
- O haz clic en "Seleccionar archivo"
- La aplicación analizará automáticamente el diseño

**Tip:** Usa una plantilla con tu branding corporativo para mejores resultados

### 2. Generar Contenido con IA

En el chat, escribe algo como:

```
Genera una presentación sobre inteligencia artificial con 5 slides
```

La IA generará contenido para todos los slides manteniendo tu diseño.

### 3. Editar Contenido

Puedes editar de dos formas:

**A) Con el chat:**
```
Mejora el título del slide 2
Agrega más puntos al slide 3
Hazlo más profesional
```

**B) Directamente en el slide:**
- Haz clic en cualquier texto
- Edita directamente
- Los cambios se guardan automáticamente

### 4. Exportar

Haz clic en el botón "Exportar" y elige:
- **PowerPoint (.pptx)** - Mantiene todo el diseño
- **PDF** - Para compartir (requiere LibreOffice)
- **Imágenes PNG** - Para redes sociales
- **Google Slides** - Para editar en la nube

---

## 💡 Comandos Útiles del Chat

### Generación
- `"Genera una presentación sobre [tema]"`
- `"Crea 5 slides sobre [tema]"`
- `"Dame ideas para una presentación de [tema]"`

### Edición
- `"Mejora el título"`
- `"Hazlo más profesional"`
- `"Agrega más puntos"`
- `"Simplifica el contenido"`
- `"Hazlo más técnico/casual"`

### Navegación
- `"Ve al slide 3"`
- `"Muéstrame el primer slide"`
- `"Siguiente slide"`

### Búsqueda Web
- `"Busca información sobre [tema]"`
- `"Investiga [tema] y agrégalo al slide"`
- `"Dame datos actuales sobre [tema]"`

---

## 🎨 Ejemplos de Uso

### Ejemplo 1: Presentación Corporativa

```
Usuario: Genera una presentación sobre nuestros resultados Q4 2025

IA: [Genera 5 slides con:]
- Slide 1: Título "Resultados Q4 2025"
- Slide 2: Resumen ejecutivo
- Slide 3: Métricas clave
- Slide 4: Logros destacados
- Slide 5: Próximos pasos

Usuario: Agrega números específicos al slide 3

IA: [Agrega métricas con números]
```

### Ejemplo 2: Pitch Deck

```
Usuario: Crea un pitch deck para una startup de IA

IA: [Genera estructura típica de pitch:]
- Problema
- Solución
- Mercado
- Producto
- Equipo
- Financiamiento

Usuario: Hazlo más convincente

IA: [Mejora el tono y agrega datos impactantes]
```

### Ejemplo 3: Presentación Educativa

```
Usuario: Genera una clase sobre fotosíntesis para secundaria

IA: [Crea contenido educativo:]
- Introducción simple
- Proceso paso a paso
- Ejemplos visuales
- Resumen y conclusiones

Usuario: Simplifica el lenguaje

IA: [Adapta el contenido para el nivel]
```

---

## 🔧 Solución de Problemas Rápida

### ❌ "Backend no disponible"

**Solución:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:8000/health

# Si no responde, inicia el backend:
cd backend
python main.py
```

### ❌ "Chutes AI no configurado"

**Solución:**
1. Verifica que `.env` existe (no `.env.example`)
2. Verifica que `VITE_CHUTES_API_KEY` tiene un valor
3. Reinicia el frontend: `Ctrl+C` y luego `npm run dev`

### ❌ "Error al analizar PPTX"

**Solución:**
1. Verifica que el archivo sea `.pptx` (no `.ppt`)
2. Intenta con otra plantilla
3. Verifica los logs del backend en la terminal

### ❌ "No se descarga el archivo"

**Solución:**
1. Verifica que el navegador no esté bloqueando descargas
2. Intenta con otro navegador
3. Verifica que hay contenido en los slides

---

## 📱 Atajos de Teclado

- `Ctrl + →` - Siguiente slide
- `Ctrl + ←` - Slide anterior
- `Ctrl + S` - Guardar plantilla
- `Ctrl + E` - Exportar
- `Ctrl + /` - Enfocar chat
- `Esc` - Cerrar modales

---

## 🎯 Próximos Pasos

Una vez que domines lo básico:

1. **Explora las Features Avanzadas:**
   - Historial de versiones (botón reloj)
   - Biblioteca de assets (botón galería)
   - Temas personalizados (botón paleta)
   - Comandos de voz (botón micrófono)

2. **Colabora en Tiempo Real:**
   - Haz clic en "Compartir"
   - Copia el link
   - Comparte con tu equipo
   - Editen juntos en tiempo real

3. **Guarda tus Plantillas:**
   - Haz clic en "Guardar"
   - Accede desde tu perfil (botón persona)
   - Reutiliza en futuros proyectos

4. **Importa Contenido Existente:**
   - Haz clic en el botón de importar
   - Sube un PPTX con contenido
   - El contenido se mapea automáticamente

---

## 📚 Más Recursos

- **Guía Completa:** [INTEGRATION-GUIDE.md](INTEGRATION-GUIDE.md)
- **Solución de Problemas:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Backend:** [backend/README.md](backend/README.md)

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Ejecuta `npm run check` para verificar la configuración
2. Revisa [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Verifica los logs en las terminales del backend y frontend
4. Consulta la documentación de cada servicio

---

**¡Listo! Ya puedes crear presentaciones profesionales con IA en minutos.** 🎉
