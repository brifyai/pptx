# 🎨 Guía: Menú Ribbon Estilo PowerPoint

## 📋 Descripción

He creado un menú ribbon completo estilo PowerPoint con todas las pestañas y funcionalidades principales.

## 🎯 Características

### Pestañas Incluidas

1. **Archivo** - Nuevo, Abrir, Guardar, Exportar, Compartir
2. **Inicio** - Deshacer/Rehacer, Diapositivas, Fuente, Párrafo
3. **Insertar** - Imágenes, Formas, Gráficos, Tablas, Multimedia
4. **Diseño** - Temas, Variantes, Configuración de página
5. **Transiciones** - Efectos de transición entre diapositivas
6. **Animaciones** - Efectos de animación para objetos
7. **Revisar** - Ortografía, Traducción, Comentarios
8. **Vista** - Vistas de presentación, Zoom, Guías
9. **Ayuda** - Ayuda, Soporte, Acerca de

### Funcionalidades

- ✅ Diseño responsive (se adapta a móviles)
- ✅ Modo oscuro automático
- ✅ Menús desplegables (layouts, temas)
- ✅ Botones grandes, medianos y pequeños
- ✅ Iconos Material Icons
- ✅ Animaciones suaves
- ✅ Scrollbar personalizado

## 🚀 Cómo Integrar

### 1. Importar en App.jsx

```jsx
import RibbonMenu from './components/RibbonMenu'

function App() {
  // ... tu código existente ...

  // Handlers para el ribbon
  const handleNewPresentation = () => {
    console.log('Nueva presentación')
    // Tu lógica aquí
  }

  const handleOpenTemplate = () => {
    console.log('Abrir template')
    // Tu lógica aquí
  }

  const handleSave = () => {
    console.log('Guardar')
    // Tu lógica aquí
  }

  const handleExport = () => {
    console.log('Exportar')
    setShowExportOptions(true) // Si ya tienes esta función
  }

  const handleAddSlide = () => {
    console.log('Agregar slide')
    // Tu lógica aquí
  }

  const handleDeleteSlide = () => {
    console.log('Eliminar slide')
    // Tu lógica aquí
  }

  const handleDuplicateSlide = () => {
    console.log('Duplicar slide')
    // Tu lógica aquí
  }

  const handleChangeLayout = (layoutId) => {
    console.log('Cambiar layout:', layoutId)
    // Tu lógica aquí
  }

  const handleInsertImage = () => {
    console.log('Insertar imagen')
    // Tu lógica aquí
  }

  const handleInsertChart = () => {
    console.log('Insertar gráfico')
    // Tu lógica aquí
  }

  const handleInsertTable = () => {
    console.log('Insertar tabla')
    // Tu lógica aquí
  }

  const handleInsertShape = () => {
    console.log('Insertar forma')
    // Tu lógica aquí
  }

  const handleThemeChange = (themeId) => {
    console.log('Cambiar tema:', themeId)
    // Tu lógica aquí
  }

  return (
    <div className="app">
      {/* Agregar el RibbonMenu */}
      <RibbonMenu
        onNewPresentation={handleNewPresentation}
        onOpenTemplate={handleOpenTemplate}
        onSave={handleSave}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAddSlide={handleAddSlide}
        onDeleteSlide={handleDeleteSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onChangeLayout={handleChangeLayout}
        onInsertImage={handleInsertImage}
        onInsertChart={handleInsertChart}
        onInsertTable={handleInsertTable}
        onInsertShape={handleInsertShape}
        onThemeChange={handleThemeChange}
        canUndo={canUndo}
        canRedo={canRedo}
        currentSlide={currentSlide}
      />

      {/* Tu contenido existente */}
      <div className="app-content">
        {/* ... */}
      </div>
    </div>
  )
}
```

### 2. Ajustar CSS de App

Si el ribbon queda debajo de tu header existente, ajusta el z-index:

```css
/* En App.css */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-content {
  flex: 1;
  overflow: auto;
}

/* Si tienes un header existente */
.app-header {
  z-index: 999; /* Menor que el ribbon (1000) */
}
```

## 🎨 Personalización

### Cambiar Colores

Edita `src/styles/RibbonMenu.css`:

```css
/* Color principal */
.ribbon-tab.active {
  color: #0078d4; /* Cambia este color */
}

.ribbon-tab.active::after {
  background: #0078d4; /* Y este también */
}

/* Hover de botones */
.ribbon-btn:hover:not(:disabled) {
  background: #f3f3f3; /* Color de hover */
}
```

### Agregar Nuevas Pestañas

En `RibbonMenu.jsx`, agrega a la lista de `tabs`:

```jsx
const tabs = [
  // ... tabs existentes ...
  { id: 'mi-tab', label: 'Mi Pestaña', icon: 'star' }
]
```

Luego agrega el contenido:

```jsx
{activeTab === 'mi-tab' && (
  <div className="ribbon-groups">
    <div className="ribbon-group">
      <div className="group-label">Mi Grupo</div>
      <button className="ribbon-btn large">
        <span className="material-icons">star</span>
        <span>Mi Botón</span>
      </button>
    </div>
  </div>
)}
```

### Agregar Nuevos Botones

```jsx
<button 
  className="ribbon-btn large" 
  onClick={handleMiFuncion}
>
  <span className="material-icons">mi_icono</span>
  <span>Mi Botón</span>
</button>
```

Tipos de botones:
- `ribbon-btn large` - Botón grande con icono arriba
- `ribbon-btn` - Botón normal con icono a la izquierda
- `ribbon-btn small` - Botón pequeño
- `ribbon-btn icon-only` - Solo icono

## 📱 Responsive

El menú se adapta automáticamente a diferentes tamaños de pantalla:

- **Desktop (>1200px)**: Menú completo
- **Tablet (768px-1200px)**: Botones más pequeños, scroll horizontal
- **Mobile (<768px)**: Menú compacto, iconos más pequeños

## 🌙 Modo Oscuro

El menú detecta automáticamente el modo oscuro del sistema:

```css
@media (prefers-color-scheme: dark) {
  /* Estilos oscuros automáticos */
}
```

Para forzar modo oscuro:

```css
/* En RibbonMenu.css, reemplaza @media por: */
.dark-mode .ribbon-menu {
  /* estilos oscuros */
}
```

Y en tu App:

```jsx
<div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
  <RibbonMenu ... />
</div>
```

## 🔧 Conectar con Funcionalidades Existentes

### Conectar con ExportOptions

```jsx
const handleExport = () => {
  setShowExportOptions(true) // Tu función existente
}
```

### Conectar con TemplateUploader

```jsx
const handleOpenTemplate = () => {
  // Simular clic en el input de archivo
  document.getElementById('template-upload-input').click()
}
```

### Conectar con ChatPanel

```jsx
const handleInsertImage = () => {
  // Abrir panel de assets o chat
  setChatPanelOpen(true)
  // Enviar comando al chat
  sendChatMessage('Insertar imagen')
}
```

## 🎯 Ejemplo Completo de Integración

```jsx
import { useState } from 'react'
import RibbonMenu from './components/RibbonMenu'
import SlideViewer from './components/SlideViewer'
import ChatPanel from './components/ChatPanel'
import ExportOptions from './features/ExportOptions'

function App() {
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleUndo = () => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1)
      setSlides(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1)
      setSlides(history[historyIndex + 1])
    }
  }

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now(),
      type: 'content',
      content: {},
      preview: null
    }
    setSlides([...slides, newSlide])
  }

  const handleDeleteSlide = () => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== currentSlide)
      setSlides(newSlides)
      if (currentSlide >= newSlides.length) {
        setCurrentSlide(newSlides.length - 1)
      }
    }
  }

  return (
    <div className="app">
      <RibbonMenu
        onNewPresentation={() => setSlides([])}
        onOpenTemplate={() => {/* abrir template */}}
        onSave={() => {/* guardar */}}
        onExport={() => setShowExportOptions(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAddSlide={handleAddSlide}
        onDeleteSlide={handleDeleteSlide}
        onDuplicateSlide={() => {/* duplicar */}}
        onChangeLayout={(layout) => {/* cambiar layout */}}
        onInsertImage={() => {/* insertar imagen */}}
        onInsertChart={() => {/* insertar gráfico */}}
        onInsertTable={() => {/* insertar tabla */}}
        onInsertShape={() => {/* insertar forma */}}
        onThemeChange={(theme) => {/* cambiar tema */}}
        canUndo={canUndo}
        canRedo={canRedo}
        currentSlide={slides[currentSlide]}
      />

      <div className="app-content">
        <SlideViewer 
          slides={slides}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />
        <ChatPanel slides={slides} onSlidesUpdate={setSlides} />
      </div>

      {showExportOptions && (
        <ExportOptions
          slides={slides}
          isOpen={showExportOptions}
          onClose={() => setShowExportOptions(false)}
        />
      )}
    </div>
  )
}

export default App
```

## 🎨 Capturas de Pantalla

El menú se ve así:

```
┌─────────────────────────────────────────────────────────────┐
│ [Archivo] [Inicio] [Insertar] [Diseño] [Transiciones] ...  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌──────────────┐ ┌─────────┐ ┌──────────┐     │
│ │ Nuevo   │ │ Deshacer     │ │ Fuente  │ │ Párrafo  │     │
│ │ [+]     │ │ [←] [→]      │ │ Arial ▼ │ │ [≡][≡][≡]│     │
│ │         │ │              │ │ 12 ▼    │ │          │     │
│ └─────────┘ └──────────────┘ └─────────┘ └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 💡 Tips

1. **Usa los handlers**: Conecta cada botón con tu lógica existente
2. **Personaliza los iconos**: Usa Material Icons o cambia a Font Awesome
3. **Agrega tooltips**: Usa el atributo `title` en los botones
4. **Keyboard shortcuts**: Agrega atajos de teclado para acciones comunes
5. **Estado de botones**: Usa `disabled` para botones que no aplican

## 🐛 Troubleshooting

### El menú no se ve

Verifica que importaste el CSS:
```jsx
import './styles/RibbonMenu.css'
```

### Los iconos no aparecen

Asegúrate de tener Material Icons en tu `index.html`:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

### El menú se superpone con otro contenido

Ajusta el z-index en `RibbonMenu.css`:
```css
.ribbon-menu {
  z-index: 1000; /* Aumenta si es necesario */
}
```

### Los dropdowns no se ven

Verifica que el contenedor padre no tenga `overflow: hidden`:
```css
.ribbon-group {
  position: relative; /* Necesario para dropdowns */
}
```

---

¡El menú ribbon está listo para usar! 🎉
