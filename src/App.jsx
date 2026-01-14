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
import PageTransition from './components/PageTransition'
import MobileHeader from './components/MobileHeader'
import MobileTabBar from './components/MobileTabBar'
import MobileMenu from './components/MobileMenu'
import MobileCreateModal from './components/MobileCreateModal'
import MobileSlideOptions from './components/MobileSlideOptions'
import SlideErrorBoundary from './components/SlideErrorBoundary'
import RibbonMenu from './components/RibbonMenu'
import { AlertProvider, useAlert } from './components/CustomAlert'
import { getChutesConfig } from './services/chutesService'
import { Router, useRouter } from './SimpleRouter'

// Custom hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTheme } from './hooks/useTheme'
import { useMobile } from './hooks/useMobile'
import { useAuth } from './hooks/useAuth'
import { useModals } from './hooks/useModals'
import { useSlideManagement } from './hooks/useSlideManagement'
import { useActivityLog } from './hooks/useActivityLog'
import { useTemplateManager } from './hooks/useTemplateManager'

// Lazy load de features avanzadas
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
  const isMobile = useMobile(768)
  
  // Auth hook
  const { user, login, logout: authLogout } = useAuth()
  
  // Chat history for activity log
  const [chatHistory, setChatHistory] = useState([])
  const { logActivity } = useActivityLog(setChatHistory)
  
  // Modals hook
  const {
    showExport, setShowExport,
    showHistory, setShowHistory,
    showAssets, setShowAssets,
    showThemes, setShowThemes,
    showAnalytics, setShowAnalytics,
    showContentImporter, setShowContentImporter,
    showTemplateLibrary, setShowTemplateLibrary,
    showTextImporter, setShowTextImporter,
    showPresentationHistory, setShowPresentationHistory,
    showKeyboardHelp, setShowKeyboardHelp,
    showOnboarding, setShowOnboarding,
    showProfile, setShowProfile,
    showShareModal, setShowShareModal,
    showVariantGenerator, setShowVariantGenerator,
    showContentSuggestions, setShowContentSuggestions,
    showTextOnlyMode, setShowTextOnlyMode,
    showMobileMenu, setShowMobileMenu,
    showCreateModal, setShowCreateModal,
    showSlideOptions, setShowSlideOptions,
    closeAllModals
  } = useModals()
  
  // Template manager hook
  const {
    hasTemplate, setHasTemplate,
    currentTemplateData, setCurrentTemplateData,
    templateFile, setTemplateFile,
    extractedAssets, setExtractedAssets,
    fontAnalysis,
    showFontWarning, setShowFontWarning,
    analyzeFonts,
    saveTemplate
  } = useTemplateManager({ showToast, showWarning, logActivity })

  // Slide management hook
  const {
    slides, setSlides,
    currentSlide, setCurrentSlide,
    getEmptyContent,
    handleSlideUpdate,
    handleBatchSlideUpdate,
    handleNavigateSlide,
    handleSlideReorder,
    handleSlideAdd,
    handleSlideDuplicate,
    handleSlideDelete,
    handleSlideRename,
    initializeSlides,
    undo,
    redo,
    canUndo,
    canRedo
  } = useSlideManagement([], { showToast, showWarning, showDeleteConfirm, logActivity })
  
  // Estados adicionales
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isCollaborating, setIsCollaborating] = useState(false)
  const [mobileTab, setMobileTab] = useState('home')
  const [selectedSlide, setSelectedSlide] = useState(null)
  const [profileInitialTab, setProfileInitialTab] = useState('profile')
  const currentUser = useState(() => 'user_' + Math.random().toString(36).substr(2, 9))[0]

  useEffect(() => {
    const config = getChutesConfig()
    console.log('🤖 Chutes AI Configuration:', config)
    if (!config.isConfigured) {
      console.warn('⚠️ Chutes AI no está configurado. Verifica tu archivo .env')
    }
  }, [])

  // CRÍTICO: Sincronizar currentSlide cuando slides cambia
  // Esto previene el error "Cannot read properties of undefined (reading 'content')"
  useEffect(() => {
    if (slides.length === 0) {
      // No hay slides, resetear a 0
      if (currentSlide !== 0) {
        console.log('🔄 Reseteando currentSlide a 0 (no hay slides)')
        setCurrentSlide(0)
      }
    } else if (currentSlide >= slides.length) {
      // currentSlide está fuera de rango, ajustar al último slide válido
      const newIndex = Math.max(0, slides.length - 1)
      console.log(`🔄 Ajustando currentSlide de ${currentSlide} a ${newIndex} (fuera de rango)`)
      setCurrentSlide(newIndex)
    }
  }, [slides.length, currentSlide, setCurrentSlide])

  // Agregar/quitar clase editor-mode al body según la ruta
  useEffect(() => {
    if (path === '/editor' && hasTemplate) {
      document.body.classList.add('editor-mode')
    } else {
      document.body.classList.remove('editor-mode')
    }
    return () => document.body.classList.remove('editor-mode')
  }, [path, hasTemplate])

  const handleTemplateUpload = async (file, analysis) => {
    console.log('📋 Plantilla subida:', file.name)
    
    if (analysis.extractedAssets) {
      setExtractedAssets(analysis.extractedAssets)
    }
    
    // Analizar fuentes
    await analyzeFonts(file)
    
    // Inicializar slides
    const initialSlides = analysis.slides.map((slide, index) => ({
      id: index + 1,
      type: slide.type,
      content: getEmptyContent(slide.type),
      preview: slide.preview,
      layout: slide,
      slideWidth: analysis.slideSize?.width,
      slideHeight: analysis.slideSize?.height
    }))
    
    setCurrentTemplateData({
      fileName: file.name,
      analysis: analysis,
      uploadedAt: Date.now()
    })
    setTemplateFile(file)
    setSlides(initialSlides)
    setHasTemplate(true)
    setChatHistory([{
      role: 'assistant',
      message: `¡Perfecto! He analizado tu plantilla "${file.name}". Tiene ${analysis.slides.length} diapositivas. ¿Qué contenido quieres generar?`
    }])
    logActivity('upload', `Plantilla "${file.name}" cargada (${analysis.slides.length} láminas)`)
    navigate('/editor')
  }

  const handleTemplateFromLibrary = async (file) => {
    try {
      const { analyzeTemplate } = await import('./services/visionService')
      const analysis = await analyzeTemplate(file)
      handleTemplateUpload(file, analysis)
    } catch (error) {
      console.error('Error al cargar template de biblioteca:', error)
      showWarning('Error', 'Error al cargar el template: ' + error.message)
    }
  }

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
      message: `¡Listo! He estructurado tu texto en ${newSlides.length} diapositivas.`
    }])
    logActivity('upload', `Presentación creada desde texto (${newSlides.length} slides)`)
    navigate('/editor')
  }

  const handleApplyVariant = (variantContent) => {
    const slide = slides[currentSlide]
    if (!slide || !slide.content) {
      console.warn(`⚠️ No se puede aplicar variante: slide ${currentSlide} no existe o no tiene content`)
      return
    }
    handleSlideUpdate(slide.id, { ...slide.content, ...variantContent })
    logActivity('edit', `Variante aplicada a lámina ${currentSlide + 1}`)
  }

  const handleApplySuggestion = (newContent) => {
    const slide = slides[currentSlide]
    if (!slide) {
      console.warn(`⚠️ No se puede aplicar sugerencia: slide ${currentSlide} no existe`)
      return
    }
    handleSlideUpdate(slide.id, newContent)
    logActivity('edit', `Sugerencia aplicada a lámina ${currentSlide + 1}`)
  }

  // Atajos de teclado
  useKeyboardShortcuts({
    onSave: () => {
      if (hasTemplate) {
        saveTemplate()
        showToast('Presentación guardada')
      }
    },
    onExport: () => hasTemplate && setShowExport(true),
    onSaveToHistory: () => hasTemplate && setShowPresentationHistory(true),
    onOpenHistory: () => setShowPresentationHistory(true),
    onOpenTemplateLibrary: () => setShowTemplateLibrary(true),
    onOpenImporter: () => hasTemplate && setShowTextImporter(true),
    onPrevSlide: () => hasTemplate && currentSlide > 0 && setCurrentSlide(prev => prev - 1),
    onNextSlide: () => hasTemplate && currentSlide < slides.length - 1 && setCurrentSlide(prev => prev + 1),
    onCloseModal: closeAllModals,
    onShowHelp: () => setShowKeyboardHelp(true),
    enabled: true
  })

  const handleChatMessage = (message, aiResponse) => {
    setChatHistory(prev => [...prev, 
      { role: 'user', message },
      { role: 'assistant', message: aiResponse }
    ])
  }

  const handleVoiceCommand = (command) => {
    switch(command.type) {
      case 'navigate':
        command.direction === 'next' 
          ? setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
          : setCurrentSlide(Math.max(0, currentSlide - 1))
        break
      case 'goto':
        setCurrentSlide(command.slide)
        break
      case 'edit':
        const slide = slides[currentSlide]
        if (!slide || !slide.content) {
          console.warn(`⚠️ No se puede editar por voz: slide ${currentSlide} no existe o no tiene content`)
          return
        }
        handleSlideUpdate(slide.id, { ...slide.content, [command.field]: command.value })
        break
    }
  }

  const handleAssetInsert = (asset) => {
    const assetWithPosition = {
      ...asset,
      position: asset.position || { x: 100, y: 100 },
      id: Date.now()
    }
    const slide = slides[currentSlide]
    if (!slide || !slide.content) {
      console.warn(`⚠️ No se puede insertar asset: slide ${currentSlide} no existe o no tiene content`)
      return
    }
    handleSlideUpdate(slide.id, {
      ...slide.content,
      assets: [...(slide.content.assets || []), assetWithPosition]
    }, true)
    setShowAssets(false)
    logActivity('asset', `Asset insertado en lámina ${currentSlide + 1}`)
  }

  const handleThemeChange = (newTheme) => {
    localStorage.setItem('presentationTheme', JSON.stringify(newTheme))
    logActivity('theme', `Tema cambiado a "${newTheme.name || 'personalizado'}"`)
  }

  const handleVersionRestore = (restoredSlides) => {
    setSlides(restoredSlides)
    setShowHistory(false)
  }

  const handleContentImport = (updates) => {
    updates.forEach(update => {
      handleSlideUpdate(update.slideId, {
        ...slides[update.slideIndex].content,
        ...update.content
      })
    })
    showToast(`Contenido importado a ${updates.length} láminas`)
    logActivity('upload', `Contenido importado desde PPTX a ${updates.length} láminas`)
  }

  const handleSelectSavedTemplate = (template) => {
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
      message: `Plantilla "${template.name}" cargada. Tiene ${template.slideCount} diapositivas.`
    }])
    logActivity('upload', `Plantilla guardada "${template.name}" cargada`)
    navigate('/editor')
  }

  // Auth handlers
  const handleGetStarted = (mode) => {
    if (mode === 'contact') {
      window.location.href = 'mailto:contacto@aipresentationstudio.com'
      return
    }
    navigate(mode === 'login' ? '/acceso' : '/registro')
  }

  const handleAuth = (userData) => {
    login(userData)
    navigate('/editor')
    showToast(`¡Bienvenido${userData.name ? ', ' + userData.name : ''}!`)
  }

  const handleLogout = () => {
    authLogout(() => {
      setHasTemplate(false)
      setSlides([])
      navigate('/')
      showToast('Sesión cerrada')
    })
  }

  // Redirecciones automáticas
  useEffect(() => {
    if ((path === '/acceso' || path === '/registro') && user) {
      navigate('/editor')
    } else if (path === '/' && user) {
      navigate('/editor')
    } else if (path === '/editor' && !user) {
      navigate('/')
    }
  }, [path, user, navigate])

  // Landing
  if (path === '/' && !user) {
    return (
      <PageTransition type="fade" duration={300} isActive={true}>
        <Landing onGetStarted={handleGetStarted} />
      </PageTransition>
    )
  }

  // Login
  if (path === '/acceso' && !user) {
    return (
      <PageTransition type="slide" duration={300} isActive={true}>
        <Auth mode="login" onAuth={handleAuth} onBack={() => navigate('/')} />
      </PageTransition>
    )
  }

  // Registro
  if (path === '/registro' && !user) {
    return (
      <PageTransition type="slide" duration={300} isActive={true}>
        <Auth mode="register" onAuth={handleAuth} onBack={() => navigate('/')} />
      </PageTransition>
    )
  }

  // Redirect states
  if ((path === '/' || path === '/acceso' || path === '/registro') && user) return null
  if (path === '/editor' && !user) return null

  // Editor sin template - pantalla de bienvenida
  if (path === '/editor' && !hasTemplate) {
    return (
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <div className="logo"><h1>Slide AI</h1></div>
          </div>
          <div className="header-actions">
            <button className="btn-icon theme-toggle-btn" onClick={toggleTheme} title={isDark ? 'Modo claro' : 'Modo oscuro'}>
              <span className="material-icons">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="btn-icon profile-btn" onClick={() => { setProfileInitialTab('profile'); setShowProfile(true) }} title="Mi perfil">
              <span className="material-icons">person</span>
            </button>
          </div>
        </header>
        
        <main className="welcome-main">
          <div className="welcome-content">
            <h1>¡Hola{user?.name ? `, ${user.name}` : ''}!</h1>
            <p>Sube tu plantilla y edita con IA en tiempo real</p>
            <TemplateUploader onUpload={handleTemplateUpload} />
            
            <div className="library-divider"><span>o selecciona de tu biblioteca</span></div>
            
            <button type="button" className="open-library-btn" onClick={() => setShowTemplateLibrary(true)}>
              <span className="material-icons">folder_special</span>
              Abrir Biblioteca de Templates
            </button>
            
            <button type="button" className="open-library-btn text-only-btn" onClick={() => setShowTextOnlyMode(true)}>
              <span className="material-icons">text_fields</span>
              Modo Solo Texto
            </button>
            
            <button type="button" className="tour-btn" onClick={() => setShowOnboarding(true)}>
              <span className="material-icons">help_outline</span>
              Ver tutorial
            </button>
          </div>
        </main>
        
        {showTemplateLibrary && (
          <TemplateLibrary currentTemplateFile={templateFile} onSelectTemplate={handleTemplateFromLibrary} onClose={() => setShowTemplateLibrary(false)} />
        )}
        {showTextOnlyMode && (
          <TextOnlyMode onCreateSlides={handleTextOnlySlides} onClose={() => setShowTextOnlyMode(false)} />
        )}
        <OnboardingTour onComplete={() => setShowOnboarding(false)} forceShow={showOnboarding} />
        <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
        {showProfile && (
          <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} onSelectTemplate={handleSelectSavedTemplate} onLogout={handleLogout} initialTab={profileInitialTab} />
        )}
      </div>
    )
  }

  // Editor con template - vista principal
  return (
    <div className="app">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader 
          title={hasTemplate ? `Slide ${currentSlide + 1}/${slides.length}` : 'Slide AI'}
          onMenuClick={() => setShowMobileMenu(true)}
          onProfileClick={() => setShowProfile(true)}
          showBack={path === '/editor' && hasTemplate}
          onBackClick={() => navigate('/')}
          actions={hasTemplate ? [{ icon: 'chat', label: 'Chat', onClick: () => setMobileTab('chat') }] : []}
        />
      )}

      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu 
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          user={user}
          onLogout={handleLogout}
          onShowProfile={() => setShowProfile(true)}
          onShowLibrary={() => setShowTemplateLibrary(true)}
          onShowThemes={() => setShowThemes(true)}
          onShowAnalytics={() => setShowAnalytics(true)}
          onShowCollaboration={() => showToast('Colaboración próximamente')}
          onShowHistory={() => setShowHistory(true)}
          onShowAssets={() => setShowAssets(true)}
          onShowShortcuts={() => setShowKeyboardHelp(true)}
          onShowHelp={() => setShowOnboarding(true)}
          onShowSettings={() => showToast('Configuración próximamente')}
          onNavigateHome={() => navigate('/')}
        />
      )}

      {/* Ribbon Menu - Solo en desktop */}
      {!isMobile && (
        <RibbonMenu
          onNewPresentation={() => {
            setHasTemplate(false)
            setSlides([])
            navigate('/')
            showToast('Nueva presentación')
          }}
          onOpenTemplate={() => setShowTemplateLibrary(true)}
          onSave={() => {
            saveTemplate()
            showToast('Presentación guardada')
          }}
          onExport={() => setShowExport(true)}
          onUndo={() => {
            if (canUndo) {
              undo()
            } else {
              showToast('No hay acciones para deshacer')
            }
          }}
          onRedo={() => {
            if (canRedo) {
              redo()
            } else {
              showToast('No hay acciones para rehacer')
            }
          }}
          onAddSlide={() => {
            handleSlideAdd()
            showToast('Nueva diapositiva agregada')
          }}
          onDeleteSlide={() => {
            if (slides.length > 1) {
              handleSlideDelete(currentSlide)
            } else {
              showWarning('No se puede eliminar', 'Debe haber al menos una diapositiva')
            }
          }}
          onDuplicateSlide={() => {
            handleSlideDuplicate(currentSlide)
            showToast('Diapositiva duplicada')
          }}
          onChangeLayout={(layoutId) => {
            showToast(`Layout "${layoutId}" - próximamente`)
          }}
          onInsertImage={() => setShowAssets(true)}
          onInsertChart={(type) => {
            if (type) showToast(`Gráfico ${type} - próximamente`)
            else showToast('Insertar gráfico - próximamente')
          }}
          onInsertTable={(type) => {
            if (type) showToast(`Tabla ${type} - próximamente`)
            else showToast('Insertar tabla - próximamente')
          }}
          onInsertShape={(type) => {
            if (type) showToast(`Forma ${type} - próximamente`)
            else showToast('Insertar forma - próximamente')
          }}
          onInsertIcon={() => setShowAssets(true)}
          onInsertVideo={() => showToast('Insertar video - próximamente')}
          onInsertAudio={() => showToast('Insertar audio - próximamente')}
          onTextFormat={() => showToast('Formato de texto - próximamente')}
          onAlignContent={() => showToast('Alinear contenido - próximamente')}
          onThemeChange={(themeId) => {
            setShowThemes(true)
          }}
          onShare={(action) => {
            if (action === 'link') {
              navigator.clipboard.writeText(window.location.href)
              showToast('Enlace copiado al portapapeles')
            } else {
              setShowShareModal(true)
            }
          }}
          onPublish={() => showToast('Publicar presentación - próximamente')}
          onAIGenerate={(type) => {
            if (type === 'variants') setShowVariantGenerator(true)
            else if (type === 'suggestions') setShowContentSuggestions(true)
            else showToast('Generar contenido con IA - próximamente')
          }}
          onAIRewrite={() => showToast('Reescribir con IA - próximamente')}
          onAITranslate={() => showToast('Traducir con IA - próximamente')}
          onAISummarize={() => showToast('Resumir con IA - próximamente')}
          onAIAnalyzeAudience={(type) => {
            if (type === 'tone') showToast('Análisis de tono - próximamente')
            else if (type === 'facts') showToast('Verificación de datos - próximamente')
            else setShowAnalytics(true)
          }}
          onAIImageGenerate={(type) => {
            if (type === 'enhance') showToast('Mejorar imagen con IA - próximamente')
            else if (type === 'remove-bg') showToast('Quitar fondo con IA - próximamente')
            else showToast('Generar imagen con IA - próximamente')
          }}
          onAIVoiceDictate={(type) => {
            if (type === 'narration') showToast('Narración IA - próximamente')
            else {
              setVoiceEnabled(!voiceEnabled)
              showToast(voiceEnabled ? 'Dictado desactivado' : 'Dictado activado')
            }
          }}
          onDataConnect={(action) => {
            if (action === 'refresh') showToast('Actualizar datos - próximamente')
            else showToast('Conectar datos en vivo - próximamente')
          }}
          onDataImportExcel={() => showToast('Importar desde Excel - próximamente')}
          onDataImportSheets={() => showToast('Importar desde Google Sheets - próximamente')}
          onCollabShare={(action) => {
            if (action === 'link') {
              navigator.clipboard.writeText(window.location.href)
              showToast('Enlace copiado')
            } else if (action === 'permissions') {
              showToast('Configurar permisos - próximamente')
            } else if (action === 'admin') {
              showToast('Administrar acceso - próximamente')
            } else {
              setShowShareModal(true)
            }
          }}
          onCollabInvite={(action) => {
            if (action === 'view') showToast('Ver colaboradores - próximamente')
            else if (action === 'realtime') {
              setIsCollaborating(!isCollaborating)
              showToast(isCollaborating ? 'Colaboración desactivada' : 'Colaboración activada')
            } else {
              showToast('Invitar personas - próximamente')
            }
          }}
          onCollabComments={(action) => {
            if (action === 'view') showToast('Ver comentarios - próximamente')
            else if (action === 'resolve') showToast('Resolver comentarios - próximamente')
            else showToast('Nuevo comentario - próximamente')
          }}
          onCollabHistory={(action) => {
            if (action === 'restore') showToast('Restaurar versión - próximamente')
            else setShowHistory(true)
          }}
          onToolsFormatPainter={(action) => {
            if (action === 'rules') showToast('Reglas automáticas - próximamente')
            else showToast('Copiar formato - próximamente')
          }}
          onToolsFindReplace={() => showToast('Buscar y reemplazar - próximamente')}
          onToolsMacros={(action) => {
            if (action === 'run') showToast('Ejecutar macro - próximamente')
            else showToast('Grabar macro - próximamente')
          }}
          onToolsAccessibility={(action) => {
            if (action === 'captions') showToast('Subtítulos - próximamente')
            else showToast('Verificar accesibilidad - próximamente')
          }}
          onToolsOptimize={(action) => {
            if (action === 'performance') showToast('Optimizar rendimiento - próximamente')
            else if (action === 'addons') showToast('Complementos - próximamente')
            else if (action === 'api') showToast('Integración API - próximamente')
            else showToast('Comprimir imágenes - próximamente')
          }}
          onSpellCheck={() => showToast('Revisar ortografía - próximamente')}
          onShowComments={(action) => {
            if (action === 'view') showToast('Mostrar comentarios - próximamente')
            else showToast('Nuevo comentario - próximamente')
          }}
          onViewPresentation={(mode) => {
            if (mode === 'normal') showToast('Vista normal')
            else if (mode === 'sorter') showToast('Vista clasificador - próximamente')
            else showToast('Modo presentación - próximamente')
          }}
          onZoom={(action) => {
            if (action === 'in') showToast('Acercar zoom')
            else if (action === 'out') showToast('Alejar zoom')
            else if (action === 'fit') showToast('Ajustar zoom')
          }}
          onHelp={(action) => {
            if (action === 'support') window.location.href = 'mailto:soporte@slideai.com'
            else if (action === 'feedback') showToast('Enviar comentarios - próximamente')
            else if (action === 'about') showToast('Slide AI v1.0 - Presentaciones con IA')
            else setShowOnboarding(true)
          }}
          canUndo={canUndo}
          canRedo={canRedo}
          currentSlide={slides[currentSlide]}
        />
      )}

      <div className="main-layout">
        {showFontWarning && fontAnalysis && (
          <FontWarning
            fontAnalysis={fontAnalysis}
            onLoadGoogleFonts={(fonts) => showToast(`${fonts.length} fuentes cargadas desde Google Fonts`)}
            onDismiss={() => setShowFontWarning(false)}
          />
        )}
        
        <div className="main-layout-content">
          <ResizablePanel defaultWidth={280} minWidth={200} maxWidth={500} position="left" storageKey="slide-thumbnails-width">
            <SlideErrorBoundary onRetry={() => {
              // Forzar currentSlide a un valor válido
              if (currentSlide >= slides.length) {
                setCurrentSlide(Math.max(0, slides.length - 1))
              }
            }}>
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
                onSlideOptionsOpen={(slide) => {
                  if (isMobile) {
                    setSelectedSlide(slide)
                    setShowSlideOptions(true)
                  }
                }}
              />
            </SlideErrorBoundary>
          </ResizablePanel>
          
          <div className="center-panel">
            <SlideErrorBoundary onRetry={() => {
              if (currentSlide >= slides.length) {
                setCurrentSlide(Math.max(0, slides.length - 1))
              }
            }}>
              <MainSlideViewer
                slide={slides[currentSlide]}
                slideIndex={currentSlide}
                onSlideUpdate={handleSlideUpdate}
                extractedAssets={extractedAssets}
                onNavigateSlide={handleNavigateSlide}
                totalSlides={slides.length}
              />
            </SlideErrorBoundary>
          </div>
          
          <ResizablePanel defaultWidth={400} minWidth={300} maxWidth={700} position="right" storageKey="chat-panel-width">
            <ChatPanel 
              chatHistory={chatHistory}
              currentSlide={currentSlide}
              slides={slides}
              onMessage={handleChatMessage}
              onSlideUpdate={handleSlideUpdate}
              onBatchSlideUpdate={handleBatchSlideUpdate}
              onNavigateSlide={handleNavigateSlide}
              logActivity={logActivity}
            />
          </ResizablePanel>
        </div>
      </div>

      {/* ExportOptions - Fuera del Suspense para evitar re-renders que colapsan paneles */}
      <Suspense fallback={null}>
        {showExport && <ExportOptions slides={slides} templateFile={templateFile} isOpen={showExport} onClose={() => {
          setShowExport(false)
        }} />}
      </Suspense>

      {/* Features cargadas bajo demanda */}
      <Suspense fallback={null}>
        {voiceEnabled && <VoiceCommands onCommand={handleVoiceCommand} isActive={voiceEnabled} />}
        {showHistory && <VersionHistory slides={slides} onRestore={handleVersionRestore} onClose={() => setShowHistory(false)} />}
        {showAssets && <AssetLibrary onInsert={handleAssetInsert} isOpen={showAssets} onClose={() => setShowAssets(false)} />}
        {showThemes && <ThemeCustomizer onThemeChange={handleThemeChange} isOpen={showThemes} onClose={() => setShowThemes(false)} />}
        {showAnalytics && <Analytics slides={slides} currentSlide={currentSlide} isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} templateData={currentTemplateData} />}
        {showContentImporter && <ContentImporter slides={slides} onImport={handleContentImport} onClose={() => setShowContentImporter(false)} />}
        {showTemplateLibrary && <TemplateLibrary currentTemplateFile={templateFile} onSelectTemplate={handleTemplateFromLibrary} onClose={() => setShowTemplateLibrary(false)} />}
        {showTextImporter && <TextImporter slides={slides} onImport={handleContentImport} onClose={() => setShowTextImporter(false)} />}
        {showPresentationHistory && <PresentationHistory currentSlides={slides} currentTemplate={currentTemplateData} onLoad={handleLoadFromHistory} onClose={() => setShowPresentationHistory(false)} />}
        <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />
      </Suspense>

      <ProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} onSelectTemplate={handleSelectSavedTemplate} onLogout={handleLogout} initialTab={profileInitialTab} />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} templateData={currentTemplateData} slides={slides} extractedAssets={extractedAssets} currentUser={currentUser} />
      
      {showVariantGenerator && slides[currentSlide] && (
        <VariantGenerator slide={slides[currentSlide]} onApplyVariant={handleApplyVariant} onClose={() => setShowVariantGenerator(false)} />
      )}
      {showContentSuggestions && slides[currentSlide] && (
        <ContentSuggestions slide={slides[currentSlide]} onApplySuggestion={handleApplySuggestion} onClose={() => setShowContentSuggestions(false)} />
      )}
      {showTextOnlyMode && <TextOnlyMode onCreateSlides={handleTextOnlySlides} onClose={() => setShowTextOnlyMode(false)} />}
      
      {isCollaborating && (
        <Suspense fallback={<div>Cargando...</div>}>
          <Collaboration
            presentationId={currentTemplateData?.fileName || 'default-session'}
            currentUser={user}
            slides={slides}
            onSlideUpdate={(slideIndex, slideData) => handleSlideUpdate(slides[slideIndex]?.id, slideData, true)}
            onUserJoined={(userName) => logActivity('user_joined', `${userName} se unió a la sesión`)}
            onUserLeft={(userName) => logActivity('user_left', `${userName} salió de la sesión`)}
            isOpen={isCollaborating}
            onClose={() => setIsCollaborating(false)}
          />
        </Suspense>
      )}

      {/* Mobile components */}
      {isMobile && hasTemplate && (
        <MobileTabBar 
          activeTab={mobileTab}
          onTabChange={(tab) => {
            setMobileTab(tab)
            if (tab === 'home') navigate('/')
            else if (tab === 'more') setShowMobileMenu(true)
          }}
          onCreateClick={() => setShowCreateModal(true)}
        />
      )}

      {isMobile && (
        <MobileCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSelectOption={(action) => {
            setShowCreateModal(false)
            switch(action) {
              case 'upload': document.querySelector('input[type="file"]')?.click(); break
              case 'blank': handleSlideAdd(); showToast('Nueva presentación creada'); break
              case 'library': setShowTemplateLibrary(true); break
              case 'text': setShowTextImporter(true); break
            }
          }}
        />
      )}

      {isMobile && selectedSlide && (
        <MobileSlideOptions
          isOpen={showSlideOptions}
          onClose={() => { setShowSlideOptions(false); setSelectedSlide(null) }}
          slide={selectedSlide}
          onDuplicate={() => {
            const idx = slides.findIndex(s => s.id === selectedSlide.id)
            if (idx !== -1) handleSlideDuplicate(idx)
            setShowSlideOptions(false); setSelectedSlide(null)
          }}
          onDelete={() => {
            const idx = slides.findIndex(s => s.id === selectedSlide.id)
            if (idx !== -1) handleSlideDelete(idx)
            setShowSlideOptions(false); setSelectedSlide(null)
          }}
          onRename={() => {
            const idx = slides.findIndex(s => s.id === selectedSlide.id)
            if (idx !== -1) {
              const newName = prompt('Nuevo nombre:', selectedSlide.name || `Lámina ${idx + 1}`)
              if (newName) handleSlideRename(selectedSlide.id, newName)
            }
            setShowSlideOptions(false); setSelectedSlide(null)
          }}
          onMoveUp={() => {
            const idx = slides.findIndex(s => s.id === selectedSlide.id)
            if (idx > 0) handleSlideReorder(idx, idx - 1)
            setShowSlideOptions(false); setSelectedSlide(null)
          }}
          onMoveDown={() => {
            const idx = slides.findIndex(s => s.id === selectedSlide.id)
            if (idx < slides.length - 1) handleSlideReorder(idx, idx + 1)
            setShowSlideOptions(false); setSelectedSlide(null)
          }}
          canMoveUp={slides.findIndex(s => s.id === selectedSlide.id) > 0}
          canMoveDown={slides.findIndex(s => s.id === selectedSlide.id) < slides.length - 1}
        />
      )}
    </div>
  )
}

export default App
