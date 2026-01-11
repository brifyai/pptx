# 📱 Propuesta de Diseño Mobile - Slide AI

**Fecha:** Enero 2026  
**Objetivo:** Optimizar la experiencia mobile con navegación intuitiva y funcionalidad completa

---

## 🎯 FILOSOFÍA DE DISEÑO MOBILE

### Principios Clave
1. **Mobile-First Thinking** - Diseñado primero para móvil, escalado a desktop
2. **Thumb-Friendly** - Todos los controles accesibles con una mano
3. **Progressive Disclosure** - Mostrar solo lo necesario en cada momento
4. **Gestos Naturales** - Swipe, pinch, long-press para acciones comunes
5. **Performance** - Carga rápida, animaciones fluidas 60fps

---

## 📐 ARQUITECTURA DE NAVEGACIÓN

### ✅ RECOMENDACIÓN: **Navegación Híbrida (Tab Bar + Hamburger)**

**Por qué NO solo hamburguesa:**
- El menú hamburguesa esconde funcionalidades críticas
- Requiere 2 taps para acceder a cualquier función
- Estudios muestran 20% menos engagement vs tab bar

**Solución Híbrida:**
```
┌─────────────────────────────────────┐
│  [☰]  Slide AI        [👤] [🔔]   │ ← Header fijo
├─────────────────────────────────────┤
│                                     │
│     CONTENIDO PRINCIPAL             │
│     (Slides / Chat / Editor)        │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [🏠]  [💬]  [➕]  [📊]  [⚙️]     │ ← Tab Bar fijo
└─────────────────────────────────────┘
```

---

## 🎨 ESTRUCTURA DE PANTALLAS

### 1. **Tab Bar Principal** (5 tabs)

```
┌─────────────────────────────────────┐
│ 🏠 Inicio                           │
│ 💬 Chat IA                          │
│ ➕ Crear (FAB destacado)            │
│ 📊 Slides                           │
│ ⚙️ Más                              │
└─────────────────────────────────────┘
```

#### Tab 1: 🏠 **Inicio**
- Templates recientes
- Presentaciones guardadas
- Acceso rápido a crear nueva
- Sugerencias de IA

#### Tab 2: 💬 **Chat IA**
- Chat conversacional full-screen
- Modos: Chat / Esta Lámina / Toda la Presentación
- Prompts rápidos
- Historial de conversación

#### Tab 3: ➕ **Crear** (FAB - Floating Action Button)
- Botón central destacado
- Abre modal con opciones:
  - 📤 Subir template
  - 📝 Crear desde cero
  - 📚 Usar biblioteca
  - 📋 Importar texto

#### Tab 4: 📊 **Slides**
- Vista de thumbnails (grid 2x)
- Navegación rápida
- Edición inline
- Reordenar con drag & drop

#### Tab 5: ⚙️ **Más**
- Exportar
- Historial de versiones
- Assets
- Temas
- Colaboración
- Analytics
- Configuración

---

### 2. **Menú Hamburguesa** (Funciones secundarias)

```
┌─────────────────────────────────────┐
│  ☰ MENÚ                        [✕]  │
├─────────────────────────────────────┤
│                                     │
│  👤 Mi Perfil                       │
│  📚 Biblioteca de Templates         │
│  🎨 Personalizar Tema               │
│  📊 Analytics                       │
│  👥 Colaboración                    │
│  📜 Historial de Versiones          │
│  🎯 Assets                          │
│  ⌨️ Atajos de Teclado              │
│  ❓ Ayuda y Tutorial                │
│  ⚙️ Configuración                   │
│  🚪 Cerrar Sesión                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 PANTALLAS PRINCIPALES

### **A. Pantalla de Inicio (Home)**

```
┌─────────────────────────────────────┐
│  [☰]  Slide AI        [👤] [🔔]   │
├─────────────────────────────────────┤
│                                     │
│  Hola, Usuario 👋                   │
│  ¿Qué quieres crear hoy?            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📤 Subir Template          │   │
│  │  Usa tu diseño corporativo  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📝 Crear desde Cero        │   │
│  │  Empieza con plantilla base │   │
│  └─────────────────────────────┘   │
│                                     │
│  📂 Recientes                       │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ [📊] │ │ [📊] │ │ [📊] │       │
│  │ Pres │ │ Pres │ │ Pres │       │
│  │ 1    │ │ 2    │ │ 3    │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  💡 Sugerencias de IA               │
│  • "Presentación de ventas Q1"     │
│  • "Pitch para inversores"         │
│                                     │
├─────────────────────────────────────┤
│  [🏠]  [💬]  [➕]  [📊]  [⚙️]     │
└─────────────────────────────────────┘
```

---

### **B. Pantalla de Chat IA**

```
┌─────────────────────────────────────┐
│  [←]  Chat IA            [⋮]       │
├─────────────────────────────────────┤
│  Modo: [💬 Chat] [▼]               │
│  ┌─────────────────────────────┐   │
│  │ 💬 Chat                     │   │
│  │ 📄 Esta Lámina              │   │
│  │ 📊 Toda la Presentación     │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│                                     │
│  [AI] Hola! ¿En qué puedo ayudarte?│
│                                     │
│       [Usuario] Genera una         │
│       presentación sobre IA        │
│                                     │
│  [AI] ¡Perfecto! Voy a crear una   │
│       presentación sobre IA con    │
│       5 slides...                  │
│                                     │
│  ✅ Actualizado: Slide 1-5          │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Prompts Rápidos:            │   │
│  │ [Mejorar título]            │   │
│  │ [Agregar bullets]           │   │
│  │ [Generar variantes]         │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [📎] [Escribe un mensaje...] [↑]  │
├─────────────────────────────────────┤
│  [🏠]  [💬]  [➕]  [📊]  [⚙️]     │
└─────────────────────────────────────┘
```

**Características:**
- **Swipe down** para cambiar modo (Chat/Slide/All)
- **Long press** en mensaje para copiar/compartir
- **Tap en "Actualizado"** para ver preview de cambios
- **Voice input** con botón de micrófono

---

### **C. Pantalla de Slides (Grid View)**

```
┌─────────────────────────────────────┐
│  [←]  Presentación       [⋮] [↗]   │
├─────────────────────────────────────┤
│  📊 Mi Presentación                 │
│  5 slides • Editado hace 2h         │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │    1     │  │    2     │        │
│  │ [Título] │  │ [Intro]  │        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │    3     │  │    4     │        │
│  │ [Datos]  │  │ [Gráfico]│        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │    5     │  │    ➕    │        │
│  │ [Cierre] │  │  Agregar │        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
├─────────────────────────────────────┤
│  [🏠]  [💬]  [➕]  [📊]  [⚙️]     │
└─────────────────────────────────────┘
```

**Gestos:**
- **Tap** en slide → Abrir editor
- **Long press** → Menú contextual (Duplicar/Eliminar/Renombrar)
- **Drag & drop** → Reordenar slides
- **Pinch** → Zoom in/out en grid

---

### **D. Pantalla de Editor de Slide**

```
┌─────────────────────────────────────┐
│  [←]  Slide 1/5          [💬] [⋮]  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [PREVIEW DEL SLIDE]       │   │
│  │                             │   │
│  │   Título editable           │   │
│  │   • Bullet 1                │   │
│  │   • Bullet 2                │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📝 Editar Contenido         │   │
│  │                             │   │
│  │ Título: [____________]      │   │
│  │                             │   │
│  │ Bullets:                    │   │
│  │ • [____________]            │   │
│  │ • [____________]            │   │
│  │ [+ Agregar bullet]          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Herramientas:                      │
│  [🎨] [📊] [🖼️] [🔤]              │
│                                     │
├─────────────────────────────────────┤
│  [🏠]  [💬]  [➕]  [📊]  [⚙️]     │
└─────────────────────────────────────┘
```

**Gestos:**
- **Swipe left/right** → Navegar entre slides
- **Pinch to zoom** → Acercar/alejar preview
- **Double tap** en texto → Editar inline
- **Tap en 💬** → Abrir chat contextual

---

### **E. Pantalla de Exportación**

```
┌─────────────────────────────────────┐
│  [←]  Exportar                      │
├─────────────────────────────────────┤
│                                     │
│  📊 Preview                         │
│  ┌─────────────────────────────┐   │
│  │  [Slide 1 preview]          │   │
│  └─────────────────────────────┘   │
│  ◀ 1/5 ▶                           │
│                                     │
│  📤 Formato de Exportación          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📄 PowerPoint (.pptx)       │   │
│  │ Mantiene diseño 100%    [✓] │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📕 PDF                      │   │
│  │ Para compartir          [ ] │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🖼️ Imágenes PNG            │   │
│  │ Slides individuales     [ ] │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [📥 Exportar]               │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [🏠]  [💬]  [➕]  [📊]  [⚙️]     │
└─────────────────────────────────────┘
```

---

## 🎯 GESTOS Y INTERACCIONES

### Gestos Principales

| Gesto | Acción | Contexto |
|-------|--------|----------|
| **Swipe Left/Right** | Navegar slides | Editor |
| **Swipe Down** | Cerrar modal/panel | Cualquier modal |
| **Swipe Up** | Abrir opciones | Slide thumbnail |
| **Long Press** | Menú contextual | Slide, texto |
| **Double Tap** | Editar inline | Texto |
| **Pinch** | Zoom | Preview, grid |
| **Drag & Drop** | Reordenar | Grid de slides |
| **Pull to Refresh** | Actualizar | Lista de presentaciones |

---

## 🎨 COMPONENTES MOBILE-OPTIMIZADOS

### 1. **Bottom Sheet** (Panel deslizable)
```
┌─────────────────────────────────────┐
│                                     │
│  [Contenido principal]              │
│                                     │
│  ═══ (Swipe up) ═══                │
├─────────────────────────────────────┤
│  📋 Opciones                        │
│  • Duplicar slide                   │
│  • Eliminar slide                   │
│  • Renombrar                        │
│  • Compartir                        │
└─────────────────────────────────────┘
```

### 2. **Floating Action Button (FAB)**
- Botón circular grande en tab central
- Animación de expansión al tap
- Muestra 4 opciones en cruz

### 3. **Snackbar** (Notificaciones)
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✅ Slide guardado           │   │
│  │                    [Deshacer]│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 4. **Chips** (Filtros y tags)
```
[Todos] [Recientes] [Favoritos] [Compartidos]
```

### 5. **Cards** (Presentaciones)
```
┌─────────────────────────────────────┐
│  📊 Presentación Q1                 │
│  5 slides • Editado hace 2h         │
│  [Ver] [Editar] [Compartir]         │
└─────────────────────────────────────┘
```

---

## 📏 ESPECIFICACIONES TÉCNICAS

### Breakpoints
```css
/* Mobile Portrait */
@media (max-width: 480px) {
  - Tab bar visible
  - Grid 1 columna
  - Font size: 16px base
}

/* Mobile Landscape */
@media (min-width: 481px) and (max-width: 767px) {
  - Tab bar visible
  - Grid 2 columnas
  - Font size: 16px base
}

/* Tablet Portrait */
@media (min-width: 768px) and (max-width: 1024px) {
  - Tab bar opcional
  - Grid 3 columnas
  - Sidebar visible
}

/* Desktop */
@media (min-width: 1025px) {
  - Layout desktop completo
  - Sidebar + chat panel
  - Grid 4+ columnas
}
```

### Tamaños de Touch Targets
```
Mínimo: 44x44px (iOS) / 48x48px (Android)
Recomendado: 56x56px
Espaciado: 8px mínimo entre elementos
```

### Tipografía Mobile
```
H1: 28px (clamp 24-32px)
H2: 24px (clamp 20-28px)
H3: 20px (clamp 18-24px)
Body: 16px (nunca menos de 16px)
Small: 14px
```

---

## 🚀 OPTIMIZACIONES DE PERFORMANCE

### 1. **Lazy Loading**
- Cargar slides bajo demanda
- Thumbnails en baja resolución
- Imágenes progresivas

### 2. **Virtual Scrolling**
- Grid de slides virtualizado
- Solo renderizar visibles + buffer

### 3. **Offline First**
- Service Worker para caché
- Sincronización en background
- Indicador de estado offline

### 4. **Animaciones Optimizadas**
- Transform y opacity (GPU)
- 60fps garantizado
- Reducir animaciones en low-end devices

---

## 🎨 TEMA MOBILE

### Colores Adaptados
```css
:root {
  /* Fondos más oscuros para reducir brillo */
  --bg-mobile: #fafafa;
  --bg-card-mobile: #ffffff;
  
  /* Contraste aumentado */
  --text-mobile: #1a1a1a;
  --text-secondary-mobile: #666666;
  
  /* Touch targets más grandes */
  --touch-target: 56px;
  --spacing-mobile: 16px;
}
```

### Dark Mode Mobile
- Automático según sistema
- Toggle manual en configuración
- OLED-friendly (negro puro #000000)

---

## 📊 PRIORIZACIÓN DE FEATURES

### Must Have (MVP Mobile)
✅ Subir template  
✅ Chat con IA  
✅ Ver slides (grid)  
✅ Editar contenido básico  
✅ Exportar PPTX  
✅ Navegación con gestos  

### Should Have (V1.1)
⚠️ Drag & drop reordenar  
⚠️ Assets (gráficos, iconos)  
⚠️ Historial de versiones  
⚠️ Colaboración básica  
⚠️ Offline mode  

### Nice to Have (V1.2+)
💡 Comandos de voz  
💡 AR preview  
💡 Templates marketplace  
💡 Analytics avanzado  
💡 Integración con Drive/Dropbox  

---

## 🧪 TESTING MOBILE

### Dispositivos de Prueba
- **iOS:** iPhone SE (small), iPhone 14 Pro (standard), iPhone 14 Pro Max (large)
- **Android:** Samsung Galaxy S21 (standard), Pixel 7 (standard), Xiaomi (budget)
- **Tablets:** iPad Air, Samsung Tab S8

### Métricas Clave
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** > 90
- **Touch Response:** < 100ms

---

## 🎯 RECOMENDACIONES FINALES

### ✅ **SÍ usar:**
1. **Tab Bar + Hamburger** (híbrido)
2. **Bottom Sheets** para opciones
3. **FAB** para acción principal
4. **Gestos naturales** (swipe, pinch)
5. **Feedback háptico** en acciones importantes

### ❌ **NO usar:**
1. Solo menú hamburguesa (esconde funciones)
2. Hover states (no existen en mobile)
3. Tooltips (difíciles de activar)
4. Menús desplegables complejos
5. Textos < 16px

---

## 📱 IMPLEMENTACIÓN PROGRESIVA

### Fase 1: Foundation (2 semanas)
- Responsive layout base
- Tab bar navigation
- Grid de slides mobile
- Chat mobile optimizado

### Fase 2: Interactions (2 semanas)
- Gestos (swipe, pinch, drag)
- Bottom sheets
- FAB con opciones
- Animaciones fluidas

### Fase 3: Polish (1 semana)
- Dark mode
- Offline support
- Performance optimization
- Testing en dispositivos reales

---

## 🎨 MOCKUPS DE REFERENCIA

Ver carpeta `/design/mobile-mockups/` para:
- Flujos de usuario completos
- Especificaciones de componentes
- Guía de animaciones
- Assets exportables

---

## 📚 RECURSOS

### Librerías Recomendadas
- **React Native Gesture Handler** - Gestos nativos
- **React Native Reanimated** - Animaciones 60fps
- **React Navigation** - Navegación mobile
- **React Native Bottom Sheet** - Bottom sheets nativos

### Inspiración
- **Figma Mobile** - Edición colaborativa
- **Canva Mobile** - Diseño simplificado
- **Google Slides Mobile** - Navegación de slides
- **Notion Mobile** - Edición de contenido

---

**Conclusión:** La navegación híbrida (Tab Bar + Hamburger) ofrece el mejor balance entre accesibilidad y funcionalidad para Slide AI mobile. Las funciones principales están siempre a un tap de distancia, mientras que las opciones avanzadas se mantienen organizadas en el menú hamburguesa.
