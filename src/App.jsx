import { useState, lazy, Suspense, useEffect, useCallback } from 'react'
import SlideViewer from './components/SlideViewer'
import ChatPanel from './components/ChatPanel'
import MainSlideViewer from './components/MainSlideViewer'
import TemplateUploader from './components/TemplateUploader'
import ContentImporter from './components/ContentImporter'
import TemplateLibrary from './components/TemplateLibrary'
import TextImporter from './components/TextImporter'
import OnboardingTour from './components/OnboardingTour'
import PresentationHistory from './components/PresentationHistory'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import ProfilePanel from './components/ProfilePanel'
import ShareModal from './components/ShareModal'
import VariantGenerator from './components/VariantGenerator'
import ContentSuggestions from './components/ContentSuggestions'
import TextOnlyMode from './components/TextOnlyMode'
import HeaderDropdown from './components/HeaderDropdown'
import FontWarning from './components/FontWarning'
import ResizablePanel from './components/ResizablePanel'
import Landing from './components/Landing'
import Auth from './components/Auth'
import { AlertProvider, useAlert } from './components/CustomAlert'
import { getChutesConfig } from './services/chutesService'
import { Router, Route, useRouter } from './SimpleRouter'
import collaborationService from './services/collaborationService'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTheme } from './hooks/useTheme'

// Lazy load de features avanzadas (solo se cargan cuando se usan)
const VoiceCommands = lazy(() => import('./features/VoiceCommands'))
const VersionHistory = lazy(() => import('./features/VersionHistory'))
const AssetLibrary = lazy(() => import('./features/AssetLibrary'))
const Collaboration = lazy(() => import('./features/Collaboration'))
const Analytics = lazy(() => import('./features/Analytics'))
const ThemeCustomizer = lazy(() => import('./features/ThemeCustomizer'))
const ExportOptions = lazy(() => import('./features/ExportOptions'))

// Componente principal envuelto en AlertProvider y Router
function App() {
  return (
    <Router>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </Router>
  )
}

function AppContent() {
  const { showToast, showWarning, showDeleteConfirm } = useAlert()
  const { path, navigate } = useRouter()
  const { theme, isDark, toggleTheme } = useTheme()
  
  // Estado de autenticación
  const [user, setUser] = useState(null)
  
  const [hasTemplate, setHasTemplate] = useState(false)
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [chatHistory, setChatHistory] = useState([])
  const [extractedAssets, setExtractedAssets] = useState(null)
  const [currentTemplateData, setCurrentTemplateData] = useState(null)
  const [templateFile, setTemplateFile] = useState(null) // Guardar archivo original del template
  
  // Estados para features avanzadas
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showContentImporter, setShowContentImporter] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showTextImporter, setShowTextImporter] = useState(false)
  const [showPresentationHistory, setShowPresentationHistory] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showVariantGenerator, setShowVariantGenerator] = useState(false)
  const [showContentSuggestions, setShowContentSuggestions] = useState(false)
  const [showTextOnlyMode, setShowTextOnlyMode] = useState(false)
  const [currentUser, setCurrentUser] = useState('user_' + Math.random().toString(36).substr(2, 9))
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [fontAnalysis, setFontAnalysis] = useState(null)
  const [showFontWarning, setShowFontWarning] = useState(true)

  // Función para registrar actividad en el chat
  const logActivity = (action, details = '') => {
    const icons = {
      'navigate': 'arrow_forward',
      'edit': 'edit',
      'duplicate': 'content_copy',
      'delete': 'delete',
      'rename': 'drive_file_rename_outline',
      'reorder': 'swap_vert',
      'add': 'add_circle',
      'asset': 'image',
      'theme': 'palette',
      'upload': 'upload_file',
      'export': 'download',
      'save': 'save'
    }
    
    const icon = icons[action] || 'info'
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    
    setChatHistory(prev => [...prev, {
      role: 'system',
      type: 'activity',
      action,
      icon,
      message: details,
      timestamp
    }])
  }

  useEffect(() => {
    // Verificar configuración de Chutes AI al iniciar
    const config = getChutesConfig()
    console.log('🤖 Chutes AI Configuration:', config)
    
    if (!config.isConfigured) {
      console.warn('⚠️ Chutes AI no está configurado. Verifica tu archivo .env')
    }

    // Verificar si hay usuario guardado
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error al cargar usuario:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Agregar/quitar clase editor-mode al body según la ruta
  useEffect(() => {
    if (path === '/editor' && hasTemplate) {
      document.body.classList.add('editor-mode')
    } else {
      document.body.classList.remove('editor-mode')
    }

    return () => {
      document.body.classList.remove('editor-mode')
    }
  }, [path, hasTemplate])

  const handleTemplateUpload = async (file, analysis) => {
    console.log('📋 Plantilla subida:', file.name)
    console.log('📊 Análisis recibido:', analysis)
    console.log('📊 Slides del análisis:', analysis.slides)
    console.log('📊 Primer slide:', analysis.slides[0])
    console.log('📊 Preview del primer slide:', analysis.slides[0]?.preview?.substring(0, 100))
    
    // Guardar assets extraídos (logos, imágenes con transparencia)
    if (analysis.extractedAssets) {
      console.log('📦 Assets extraídos:', analysis.extractedAssets)
      setExtractedAssets(analysis.extractedAssets)
    }
    
    // Analizar fuentes del template
    try {
      console.log('🔤 Analizando fuentes del template...')
      const formData = new FormData()
      formData.append('file', file)
      
      const fontResponse = await fetch('http://localhost:8000/api/analyze-fonts', {
        method: 'POST',
        body: formData
      })
      
      if (fontResponse.ok) {
        const fontData = await fontResponse.json()
        console.log('🔤 Análisis de fuentes:', fontData)
        
        if (fontData.summary?.missing > 0 || fontData.availableOnline?.length > 0) {
          setFontAnalysis(fontData)
          setShowFontWarning(true)
        } else {
          setFontAnalysis(null)
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo analizar fuentes:', error)
      // No bloquear el flujo si falla el análisis de fuentes
    }
    
    // Inicializar slides con el análisis
    const initialSlides = analysis.slides.map((slide, index) => {
      const slideObj = {
        id: index + 1,
        type: slide.type,
        content: getEmptyContent(slide.type),
        preview: slide.preview, // ✅ Pasar el preview directamente
        layout: slide,
        slideWidth: analysis.slideSize?.width,
        slideHeight: analysis.slideSize?.height
      }
      console.log(`📄 Slide ${index + 1} inicializado:`, {
        id: slideObj.id,
        type: slideObj.type,
        hasPreview: !!slideObj.preview,
        previewLength: slideObj.preview?.length || 0
      })
      return slideObj
    })
    
    console.log('🎨 Slides inicializados:', initialSlides)
    
    // Guardar datos del template actual
    setCurrentTemplateData({
      fileName: file.name,
      analysis: analysis,
      uploadedAt: Date.now()
    })
    
    // Guardar archivo original para exportación con clonación
    setTemplateFile(file)
    
    setSlides(initialSlides)
    setHasTemplate(true)
    setChatHistory([{
      role: 'assistant',
      message: `¡Perfecto! He analizado tu plantilla "${file.name}". Tiene ${analysis.slides.length} diapositivas. ¿Qué contenido quieres generar?`
    }])
    
    // Log de actividad
    logActivity('upload', `Plantilla "${file.name}" cargada (${analysis.slides.length} láminas)`)
    
    // Navegar al editor
    navigate('/editor')
    
    console.log('✅ Estado actualizado, mostrando editor')
  }

  // Función para cargar template desde la biblioteca
  const handleTemplateFromLibrary = async (file) => {
    try {
      // Usar el servicio de análisis existente
      const { analyzeTemplate } = await import('./services/visionService')
      const analysis = await analyzeTemplate(file)
      handleTemplateUpload(file, analysis)
    } catch (error) {
      console.error('Error al cargar template de biblioteca:', error)
      alert('Error al cargar el template: ' + error.message)
    }
  }

  // Función para cargar presentación desde historial
  const handleLoadFromHistory = (presentation) => {
    setSlides(presentation.slides)
    setCurrentSlide(0)
    setHasTemplate(true)
    setChatHistory([{
      role: 'assistant',
      message: `Presentación "${presentation.name}" cargada. Tiene ${presentation.slideCount} diapositivas.`
    }])
    logActivity('upload', `Presentación "${presentation.name}" cargada desde historial`)
    navigate('/editor')
  }

  // Función para crear slides desde texto plano (TextOnlyMode)
  const handleTextOnlySlides = (structuredSlides) => {
    const newSlides = structuredSlides.map((slide, index) => ({
      id: index + 1,
      type: slide.type,
      content: slide.content,
      preview: null,
      layout: null
    }))
    
    setSlides(newSlides)
    setCurrentSlide(0)
    setHasTemplate(true)
    setCurrentTemplateData({
      fileName: 'Presentación desde texto',
      analysis: { slides: structuredSlides },
      uploadedAt: Date.now()
    })
    setChatHistory([{
      role: 'assistant',
      message: `¡Listo! He estructurado tu texto en ${newSlides.length} diapositivas. Puedes editarlas o aplicar un template.`
    }])
    logActivity('upload', `Presentación creada desde texto (${newSlides.length} slides)`)
    navigate('/editor')
  }

  // Función para aplicar variante al slide actual
  const handleApplyVariant = (variantContent) => {
    const slide = slides[currentSlide]
    handleSlideUpdate(slide.id, {
      ...slide.content,
      ...variantContent
    })
    logActivity('edit', `Variante aplicada a lámina ${currentSlide + 1}`)
  }

  // Función para aplicar sugerencia al slide actual
  const handleApplySuggestion = (newContent) => {
    const slide = slides[currentSlide]
    handleSlideUpdate(slide.id, newContent)
    logActivity('edit', `Sugerencia aplicada a lámina ${currentSlide + 1}`)
  }

  // Cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setShowExport(false)
    setShowHistory(false)
    setShowAssets(false)
    setShowThemes(false)
    setShowAnalytics(false)
    setShowContentImporter(false)
    setShowTemplateLibrary(false)
    setShowTextImporter(false)
    setShowPresentationHistory(false)
    setShowKeyboardHelp(false)
    setShowProfile(false)
    setShowShareModal(false)
    setShowVariantGenerator(false)
    setShowContentSuggestions(false)
    setShowTextOnlyMode(false)
  }, [])

  // Atajos de teclado
  useKeyboardShortcuts({
    onSave: () => {
      if (hasTemplate) {
        handleSaveTemplate()
        showToast('Presentación guardada')
      }
    },
    onExport: () => {
      if (hasTemplate) setShowExport(true)
    },
    onSaveToHistory: () => {
      if (hasTemplate) setShowPresentationHistory(true)
    },
    onOpenHistory: () => setShowPresentationHistory(true),
    onOpenTemplateLibrary: () => setShowTemplateLibrary(true),
    onOpenImporter: () => {
      if (hasTemplate) setShowTextImporter(true)
    },
    onPrevSlide: () => {
      if (hasTemplate && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1)
      }
    },
    onNextSlide: () => {
      if (hasTemplate && currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1)
      }
    },
    onCloseModal: closeAllModals,
    onShowHelp: () => setShowKeyboardHelp(true),
    enabled: hasTemplate || !hasTemplate // Siempre habilitado
  })

  const handleChatMessage = (message, aiResponse) => {
    setChatHistory(prev => [...prev, 
      { role: 'user', message },
      { role: 'assistant', message: aiResponse }
    ])
  }

  const handleSlideUpdate = (slideId, newContent, skipLog = false) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, content: newContent } : slide
    ))
    
    if (!skipLog) {
      const slideIndex = slides.findIndex(s => s.id === slideId)
      logActivity('edit', `Contenido editado en lámina ${slideIndex + 1}`)
    }
  }

  // Navegación de slides (sin log para no saturar el chat)
  const handleNavigateSlide = (newIndex) => {
    if (newIndex !== currentSlide && newIndex >= 0 && newIndex < slides.length) {
      setCurrentSlide(newIndex)
    }
  }
  const handleSlideReorder = (fromIndex, toIndex) => {
    setSlides(prev => {
      const newSlides = [...prev]
      const [movedSlide] = newSlides.splice(fromIndex, 1)
      newSlides.splice(toIndex, 0, movedSlide)
      
      // Actualizar IDs para mantener orden
      return newSlides.map((slide, index) => ({
        ...slide,
        id: index + 1
      }))
    })
    
    // Ajustar currentSlide si es necesario
    if (currentSlide === fromIndex) {
      setCurrentSlide(toIndex)
    } else if (fromIndex < currentSlide && toIndex >= currentSlide) {
      setCurrentSlide(currentSlide - 1)
    } else if (fromIndex > currentSlide && toIndex <= currentSlide) {
      setCurrentSlide(currentSlide + 1)
    }
    
    logActivity('reorder', `Lámina ${fromIndex + 1} movida a posición ${toIndex + 1}`)
  }

  const handleSlideAdd = () => {
    const newSlideNum = slides.length + 1
    
    setSlides(prev => {
      const newSlide = {
        id: Date.now(),
        type: 'content',
        name: `Lámina ${prev.length + 1}`,
        content: getEmptyContent('content'),
        preview: null
      }
      
      const newSlides = [...prev, newSlide]
      
      // Actualizar IDs
      return newSlides.map((slide, index) => ({
        ...slide,
        id: index + 1
      }))
    })
    
    // Navegar al nuevo slide
    setCurrentSlide(slides.length)
    
    showToast('Nueva lámina agregada')
    logActivity('add', `Nueva lámina ${newSlideNum} creada`)
  }

  const handleSlideDuplicate = (slideIndex) => {
    setSlides(prev => {
      const slideToDuplicate = prev[slideIndex]
      const newSlide = {
        ...slideToDuplicate,
        id: Date.now(), // ID temporal único
        name: `${slideToDuplicate.name || `Lámina ${slideIndex + 1}`} (copia)`,
        content: JSON.parse(JSON.stringify(slideToDuplicate.content)), // Deep copy
        preview: slideToDuplicate.preview // Mantener el preview
      }
      
      const newSlides = [
        ...prev.slice(0, slideIndex + 1),
        newSlide,
        ...prev.slice(slideIndex + 1)
      ]
      
      // Actualizar IDs
      return newSlides.map((slide, index) => ({
        ...slide,
        id: index + 1
      }))
    })
    
    // Navegar al slide duplicado
    setCurrentSlide(slideIndex + 1)
    
    showToast(`Lámina ${slideIndex + 1} duplicada`)
    logActivity('duplicate', `Lámina ${slideIndex + 1} duplicada`)
  }

  const handleSlideDelete = (slideIndex) => {
    if (slides.length <= 1) {
      showWarning(
        'No se puede eliminar',
        'No puedes eliminar la única lámina de la presentación.'
      )
      return
    }
    
    showDeleteConfirm(`Lámina ${slideIndex + 1}`, () => {
      setSlides(prev => {
        const newSlides = prev.filter((_, index) => index !== slideIndex)
        // Actualizar IDs
        return newSlides.map((slide, index) => ({
          ...slide,
          id: index + 1
        }))
      })
      
      // Ajustar currentSlide
      if (currentSlide >= slides.length - 1) {
        setCurrentSlide(Math.max(0, currentSlide - 1))
      } else if (currentSlide > slideIndex) {
        setCurrentSlide(currentSlide - 1)
      }
      
      showToast(`Lámina ${slideIndex + 1} eliminada`)
      logActivity('delete', `Lámina ${slideIndex + 1} eliminada`)
    })
  }

  const handleSlideRename = (slideId, newName) => {
    const slideIndex = slides.findIndex(s => s.id === slideId)
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, name: newName } : slide
    ))
    logActivity('rename', `Lámina ${slideIndex + 1} renombrada a "${newName}"`)
  }

  const handleVoiceCommand = (command) => {
    switch(command.type) {
      case 'navigate':
        if (command.direction === 'next') {
          setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
        } else {
          setCurrentSlide(Math.max(0, currentSlide - 1))
        }
        break
      case 'goto':
        setCurrentSlide(command.slide)
        break
      case 'edit':
        const slide = slides[currentSlide]
        handleSlideUpdate(slide.id, {
          ...slide.content,
          [command.field]: command.value
        })
        break
    }
  }

  const handleAssetInsert = (asset) => {
    console.log('📊 Asset insertado:', asset)
    
    // Preparar el asset con posición inicial si no la tiene
    const assetWithPosition = {
      ...asset,
      position: asset.position || { x: 100, y: 100 },
      id: Date.now() // ID único para el asset
    }
    
    // Insertar asset en la diapositiva actual
    const slide = slides[currentSlide]
    handleSlideUpdate(slide.id, {
      ...slide.content,
      assets: [...(slide.content.assets || []), assetWithPosition]
    }, true) // skipLog porque logueamos aquí
    
    setShowAssets(false)
    
    // Log descriptivo según tipo
    const assetLabels = {
      'chart': 'Gráfico',
      'icon': 'Icono',
      'shape': 'Forma',
      'image': 'Imagen',
      'template': 'Plantilla'
    }
    const label = assetLabels[asset.type] || 'Asset'
    logActivity('asset', `${label} "${asset.name || asset.icon || asset.chartType || ''}" insertado en lámina ${currentSlide + 1}`)
  }

  const handleThemeChange = (newTheme) => {
    // Aplicar tema a todas las diapositivas
    localStorage.setItem('presentationTheme', JSON.stringify(newTheme))
    logActivity('theme', `Tema cambiado a "${newTheme.name || 'personalizado'}"`)
  }

  const handleVersionRestore = (restoredSlides) => {
    setSlides(restoredSlides)
    setShowHistory(false)
  }

  const handleContentImport = (updates) => {
    // Aplicar las actualizaciones de contenido
    updates.forEach(update => {
      handleSlideUpdate(update.slideId, {
        ...slides[update.slideIndex].content,
        ...update.content
      })
    })
    
    showToast(`Contenido importado a ${updates.length} láminas`)
    logActivity('upload', `Contenido importado desde PPTX a ${updates.length} láminas`)
  }

  const handleSaveTemplate = () => {
    console.log('🔵 handleSaveTemplate called')
    
    if (!currentTemplateData) {
      showWarning('No hay plantilla', 'Primero debes cargar una plantilla')
      return
    }

    try {
      // Limpiar localStorage si está muy lleno
      const currentSize = new Blob([JSON.stringify(localStorage)]).size
      if (currentSize > 4 * 1024 * 1024) { // > 4MB
        console.log('🗑️ Limpiando localStorage...')
        localStorage.removeItem('ai_presentation_template_cache')
        localStorage.removeItem('savedTemplates')
      }

      const savedTemplates = JSON.parse(localStorage.getItem('savedTemplates') || '[]')
      
      // Guardar versión ligera sin imágenes base64 pesadas
      const lightAnalysis = {
        ...currentTemplateData.analysis,
        slides: currentTemplateData.analysis.slides.map(slide => ({
          ...slide,
          preview: null, // No guardar previews pesados
          images: [] // No guardar imágenes extraídas
        }))
      }
      
      const templateToSave = {
        id: Date.now(),
        name: currentTemplateData.fileName,
        slideCount: slides.length,
        preview: null, // No guardar preview
        analysis: lightAnalysis,
        savedAt: Date.now()
      }

      // Limitar a 5 templates guardados
      if (savedTemplates.length >= 5) {
        savedTemplates.shift() // Eliminar el más antiguo
      }

      savedTemplates.push(templateToSave)
      localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates))
      
      console.log('✅ Template saved successfully')
      showToast('Plantilla guardada correctamente')
      logActivity('save', `Plantilla "${currentTemplateData.fileName}" guardada`)
    } catch (error) {
      console.error('❌ Error saving template:', error)
      // Intentar limpiar y reintentar
      if (error.name === 'QuotaExceededError') {
        localStorage.clear()
        showWarning('Almacenamiento lleno', 'Se limpió el caché. Intenta guardar de nuevo.')
      } else {
        showWarning('Error al guardar', error.message)
      }
    }
  }

  const handleSelectSavedTemplate = (template) => {
    // Cargar la plantilla guardada
    const initialSlides = template.analysis.slides.map((slide, index) => ({
      id: index + 1,
      type: slide.type,
      content: getEmptyContent(slide.type),
      preview: slide.preview,
      layout: slide,
      slideWidth: template.analysis.slideSize?.width,
      slideHeight: template.analysis.slideSize?.height
    }))

    setCurrentTemplateData({
      fileName: template.name,
      analysis: template.analysis,
      uploadedAt: template.savedAt
    })

    if (template.analysis.extractedAssets) {
      setExtractedAssets(template.analysis.extractedAssets)
    }

    setSlides(initialSlides)
    setHasTemplate(true)
    setChatHistory([{
      role: 'assistant',
      message: `Plantilla "${template.name}" cargada. Tiene ${template.slideCount} diapositivas. ¿Qué contenido quieres generar?`
    }])

    logActivity('upload', `Plantilla guardada "${template.name}" cargada`)
    navigate('/editor')
  }

  const getEmptyContent = (type) => {
    if (type === 'title') {
      return { title: 'Título Principal', subtitle: 'Subtítulo' }
    }
    return { heading: 'Título', bullets: ['Punto 1', 'Punto 2', 'Punto 3'] }
  }

  // Manejo de autenticación
  const handleGetStarted = (mode) => {
    if (mode === 'contact') {
      // Abrir modal de contacto o redirigir
      window.location.href = 'mailto:contacto@aipresentationstudio.com'
      return
    }
    
    // Navegar a la ruta correspondiente
    if (mode === 'login') {
      navigate('/acceso')
    } else if (mode === 'register') {
      navigate('/registro')
    }
  }

  const handleAuth = (userData) => {
    setUser(userData)
    navigate('/editor')
    showToast(`¡Bienvenido${userData.name ? ', ' + userData.name : ''}!`)
  }

  const handleBackToLanding = () => {
    navigate('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setHasTemplate(false)
    setSlides([])
    navigate('/')
    showToast('Sesión cerrada')
  }

  // Routing basado en path
  // Landing (home) - solo si no hay usuario
  if (path === '/' && !user) {
    return <Landing onGetStarted={handleGetStarted} />
  }

  // Login
  if (path === '/acceso') {
    if (user) {
      navigate('/editor')
      return null
    }
    return <Auth mode="login" onAuth={handleAuth} onBack={handleBackToLanding} />
  }

  // Registro
  if (path === '/registro') {
    if (user) {
      navigate('/editor')
      return null
    }
    return <Auth mode="register" onAuth={handleAuth} onBack={handleBackToLanding} />
  }

  // Si hay usuario pero está en "/" redirigir a /editor
  if (path === '/' && user) {
    navigate('/editor')
    return null
  }

  // Editor - requiere autenticación
  if (path === '/editor') {
    if (!user) {
      navigate('/')
      return null
    }

    // Si hay usuario pero no hay template, mostrar pantalla de bienvenida dentro del layout
    if (!hasTemplate) {
      return (
        <div className="app">
          <header className="app-header">
            <div className="header-left">
              <div className="logo">
                <h1>AI Presentation Studio</h1>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="btn-icon theme-toggle-btn"
                onClick={toggleTheme}
                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <span className="material-icons">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
              <button 
                className="btn-icon profile-btn"
                onClick={() => setShowProfile(true)}
                title="Mi perfil"
              >
                <span className="material-icons">person</span>
              </button>
            </div>
          </header>
          
          <main className="welcome-main">
            <div className="welcome-content">
              <h1>¡Hola{user.name ? `, ${user.name}` : ''}!</h1>
              <p>Sube tu plantilla y edita con IA en tiempo real</p>
              <TemplateUploader onUpload={handleTemplateUpload} />
              
              <div className="library-divider">
                <span>o selecciona de tu biblioteca</span>
              </div>
              
              <button 
                type="button" 
                className="open-library-btn"
                onClick={() => setShowTemplateLibrary(true)}
              >
                <span className="material-icons">folder_special</span>
                Abrir Biblioteca de Templates
              </button>
              
              <button 
                type="button" 
                className="open-library-btn text-only-btn"
                onClick={() => setShowTextOnlyMode(true)}
              >
                <span className="material-icons">text_fields</span>
                Modo Solo Texto
              </button>
              
              <button 
                type="button" 
                className="tour-btn"
                onClick={() => setShowOnboarding(true)}
              >
                <span className="material-icons">help_outline</span>
                Ver tutorial
              </button>
            </div>
          </main>
          
          {showTemplateLibrary && (
            <TemplateLibrary
              currentTemplateFile={templateFile}
              onSelectTemplate={handleTemplateFromLibrary}
              onClose={() => setShowTemplateLibrary(false)}
            />
          )}
          
          {showTextOnlyMode && (
            <TextOnlyMode
              onCreateSlides={handleTextOnlySlides}
              onClose={() => setShowTextOnlyMode(false)}
            />
          )}
          
          <OnboardingTour 
            onComplete={() => setShowOnboarding(false)}
            forceShow={showOnboarding}
          />
          
          <KeyboardShortcutsHelp
            isOpen={showKeyboardHelp}
            onClose={() => setShowKeyboardHelp(false)}
          />
          
          {showProfile && (
            <ProfilePanel
              isOpen={showProfile}
              onClose={() => setShowProfile(false)}
              onSelectTemplate={handleSelectSavedTemplate}
              onLogout={handleLogout}
            />
          )}
        </div>
      )
    }

    // Si hay template, mostrar editor completo
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Volver al inicio">
            <h1>AI Presentation Studio</h1>
          </div>
          <span className="slide-counter">
            <span className="material-icons">slideshow</span>
            Diapositiva {currentSlide + 1} de {slides.length}
          </span>
        </div>
        <div className="header-actions">
          {/* Dropdown: Importar */}
          <HeaderDropdown
            icon="download"
            label="Importar"
            items={[
              { icon: 'file_upload', label: 'Importar desde PPTX', onClick: () => setShowContentImporter(true) },
              { icon: 'content_paste', label: 'Pegar texto (ChatGPT)', onClick: () => setShowTextImporter(true) }
            ]}
          />

          {/* Dropdown: Archivos */}
          <HeaderDropdown
            icon="folder"
            label="Archivos"
            items={[
              { icon: 'folder_special', label: 'Biblioteca de Templates', onClick: () => setShowTemplateLibrary(true) },
              { icon: 'folder_open', label: 'Historial Presentaciones', onClick: () => setShowPresentationHistory(true), shortcut: 'Ctrl+O' }
            ]}
          />

          {/* Dropdown: IA */}
          <HeaderDropdown
            icon="psychology"
            label="Herramientas IA"
            items={[
              { icon: 'shuffle', label: 'Generar variantes', onClick: () => setShowVariantGenerator(true) },
              { icon: 'lightbulb', label: 'Sugerencias de mejora', onClick: () => setShowContentSuggestions(true) }
            ]}
          />

          {/* Dropdown: Diseño */}
          <HeaderDropdown
            icon="brush"
            label="Diseño"
            isActive={showAssets || showThemes}
            items={[
              { icon: 'collections', label: 'Insertar imágenes/iconos', onClick: () => setShowAssets(true) },
              { icon: 'palette', label: 'Personalizar tema', onClick: () => setShowThemes(true) }
            ]}
          />

          <button 
            className="btn-icon theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="material-icons">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button 
            className={`btn-icon ${voiceEnabled ? 'active' : ''}`}
            onClick={() => setVoiceEnabled(!voiceEnabled)} 
            title="Comandos de voz"
          >
            <span className="material-icons">{voiceEnabled ? 'mic' : 'mic_none'}</span>
          </button>
          <button 
            className={`btn-icon ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)} 
            title="Historial de versiones"
          >
            <span className="material-icons">history</span>
          </button>
          <button 
            className={`btn-icon ${showAnalytics ? 'active' : ''}`}
            onClick={() => setShowAnalytics(!showAnalytics)} 
            title="Analytics"
          >
            <span className="material-icons">analytics</span>
          </button>
          <button 
            className={`btn-icon ${isCollaborating ? 'active' : ''}`}
            onClick={() => setIsCollaborating(!isCollaborating)} 
            title="Colaboración en tiempo real"
          >
            <span className="material-icons">groups</span>
          </button>
          <button 
            type="button"
            className="btn-icon"
            onClick={() => setShowKeyboardHelp(true)} 
            title="Atajos de teclado (?)"
          >
            <span className="material-icons">keyboard</span>
          </button>
          <button 
            type="button"
            className="btn-secondary"
            onClick={handleSaveTemplate}
            title="Guardar plantilla (Ctrl+S)"
          >
            <span className="material-icons">save</span>
            Guardar
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowShareModal(true)}
            title="Compartir presentación"
          >
            <span className="material-icons">share</span>
            Compartir
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowExport(true)}>
            <span className="material-icons">file_download</span>
            Exportar
          </button>
          
          {/* User Menu */}
          {user && (
            <HeaderDropdown
              icon="person"
              label={user.name || 'Usuario'}
              items={[
                { icon: 'person', label: 'Mi Perfil', onClick: () => setShowProfile(true) },
                { icon: 'settings', label: 'Configuración', onClick: () => {} },
                { icon: 'logout', label: 'Cerrar Sesión', onClick: handleLogout }
              ]}
            />
          )}
        </div>
      </header>

      <div className="main-layout">
        {/* Font Warning Banner */}
        {showFontWarning && fontAnalysis && (
          <FontWarning
            fontAnalysis={fontAnalysis}
            onLoadGoogleFonts={(fonts) => {
              console.log('✅ Fuentes de Google cargadas:', fonts)
              showToast(`${fonts.length} fuentes cargadas desde Google Fonts`)
            }}
            onDismiss={() => setShowFontWarning(false)}
          />
        )}
        
        <div className="main-layout-content">
          <ResizablePanel
            defaultWidth={280}
            minWidth={200}
            maxWidth={500}
            position="left"
            storageKey="slide-thumbnails-width"
          >
            <SlideViewer 
              slides={slides}
              currentSlide={currentSlide}
              onSlideChange={handleNavigateSlide}
              onSlideUpdate={handleSlideUpdate}
              extractedAssets={extractedAssets}
              onSlideReorder={handleSlideReorder}
              onSlideDuplicate={handleSlideDuplicate}
              onSlideDelete={handleSlideDelete}
              onSlideRename={handleSlideRename}
              onSlideAdd={handleSlideAdd}
              logActivity={logActivity}
            />
          </ResizablePanel>
          
          <div className="center-panel">
            <MainSlideViewer
              slide={slides[currentSlide]}
              slideIndex={currentSlide}
              onSlideUpdate={handleSlideUpdate}
              extractedAssets={extractedAssets}
            />
          </div>
          
          <ResizablePanel
            defaultWidth={400}
            minWidth={300}
            maxWidth={700}
            position="right"
            storageKey="chat-panel-width"
          >
            <ChatPanel 
              chatHistory={chatHistory}
              currentSlide={currentSlide}
              slides={slides}
              onMessage={handleChatMessage}
              onSlideUpdate={handleSlideUpdate}
              onNavigateSlide={handleNavigateSlide}
              logActivity={logActivity}
            />
          </ResizablePanel>
        </div>
      </div>

      {/* Features cargadas bajo demanda */}
      <Suspense fallback={null}>
        {voiceEnabled && (
          <VoiceCommands 
            onCommand={handleVoiceCommand}
            isActive={voiceEnabled}
          />
        )}
        
        {showHistory && (
          <VersionHistory 
            slides={slides}
            onRestore={handleVersionRestore}
          />
        )}
        
        {showAssets && (
          <AssetLibrary 
            onInsert={handleAssetInsert}
            isOpen={showAssets}
            onClose={() => setShowAssets(false)}
          />
        )}
        
        {showThemes && (
          <ThemeCustomizer 
            onThemeChange={handleThemeChange}
            isOpen={showThemes}
            onClose={() => setShowThemes(false)}
          />
        )}
        
        {showExport && (
          <ExportOptions 
            slides={slides}
            templateFile={templateFile}
            isOpen={showExport}
            onClose={() => setShowExport(false)}
          />
        )}
        
        {showAnalytics && (
          <Analytics 
            slides={slides}
            currentSlide={currentSlide}
            isOpen={showAnalytics}
            onClose={() => setShowAnalytics(false)}
            templateData={currentTemplateData}
          />
        )}
        
        {showContentImporter && (
          <ContentImporter
            slides={slides}
            onImport={handleContentImport}
            onClose={() => setShowContentImporter(false)}
          />
        )}
        
        {showTemplateLibrary && (
          <TemplateLibrary
            currentTemplateFile={templateFile}
            onSelectTemplate={handleTemplateFromLibrary}
            onClose={() => setShowTemplateLibrary(false)}
          />
        )}
        
        {showTextImporter && (
          <TextImporter
            slides={slides}
            onImport={handleContentImport}
            onClose={() => setShowTextImporter(false)}
          />
        )}
        
        {showPresentationHistory && (
          <PresentationHistory
            currentSlides={slides}
            currentTemplate={currentTemplateData}
            onLoad={handleLoadFromHistory}
            onClose={() => setShowPresentationHistory(false)}
          />
        )}
        
        <KeyboardShortcutsHelp
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      </Suspense>

      {/* Profile Panel */}
      <ProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onSelectTemplate={handleSelectSavedTemplate}
        onLogout={handleLogout}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        templateData={currentTemplateData}
        slides={slides}
        extractedAssets={extractedAssets}
        currentUser={currentUser}
      />

      {/* Variant Generator */}
      {showVariantGenerator && slides[currentSlide] && (
        <VariantGenerator
          slide={slides[currentSlide]}
          onApplyVariant={handleApplyVariant}
          onClose={() => setShowVariantGenerator(false)}
        />
      )}

      {/* Content Suggestions */}
      {showContentSuggestions && slides[currentSlide] && (
        <ContentSuggestions
          slide={slides[currentSlide]}
          onApplySuggestion={handleApplySuggestion}
          onClose={() => setShowContentSuggestions(false)}
        />
      )}

      {/* Text Only Mode */}
      {showTextOnlyMode && (
        <TextOnlyMode
          onCreateSlides={handleTextOnlySlides}
          onClose={() => setShowTextOnlyMode(false)}
        />
      )}

      {/* Collaboration Panel */}
      {isCollaborating && (
        <Suspense fallback={<div>Cargando...</div>}>
          <Collaboration
            presentationId={currentTemplateData?.fileName || 'default-session'}
            currentUser={user}
            slides={slides}
            onSlideUpdate={(slideIndex, slideData) => {
              handleSlideUpdate(slides[slideIndex]?.id, slideData, true)
            }}
            onUserJoined={(userName) => {
              logActivity('user_joined', `${userName} se unió a la sesión`)
            }}
            onUserLeft={(userName) => {
              logActivity('user_left', `${userName} salió de la sesión`)
            }}
            isOpen={isCollaborating}
            onClose={() => setIsCollaborating(false)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default App
