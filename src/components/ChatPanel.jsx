import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { generateAIResponse, generateFullPresentation, initializePresentationContext } from '../services/aiService'
import '../styles/ChatPanel.css'

const ContentMapper = lazy(() => import('./ContentMapper'))

// Modos de interacción
const INTERACTION_MODES = {
  CHAT: { id: 'chat', icon: 'chat', label: 'Chat', description: 'Pregunta lo que quieras', color: '#6b7280' },
  SLIDE: { id: 'slide', icon: 'crop_square', label: 'Esta Lámina', description: 'Editar slide actual', color: '#667eea' },
  ALL: { id: 'all', icon: 'auto_awesome', label: 'Toda la Presentación', description: 'Generar contenido completo', color: '#8b5cf6' }
}

function ChatPanel({ chatHistory, currentSlide, slides, onMessage, onSlideUpdate, onNavigateSlide, logActivity }) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState('chat') // chat, slide, all
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [previewTarget, setPreviewTarget] = useState(null)
  const [showContentMapper, setShowContentMapper] = useState(false)
  const [pendingContent, setPendingContent] = useState(null)
  const [aiStatus, setAiStatus] = useState(null) // null, 'thinking', 'searching', 'analyzing', 'generating'
  const [previewChanges, setPreviewChanges] = useState(null)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  useEffect(() => {
    if (slides.length > 0) {
      initializePresentationContext(slides, null)
    }
  }, [slides.length])

  // Detectar intención automáticamente mientras escribe (con debounce)
  useEffect(() => {
    const text = input.toLowerCase()
    
    // Solo detectar si el texto empieza con @ o ?
    if (!text.startsWith('@') && !text.startsWith('?')) {
      return
    }
    
    // Auto-detectar modo basado en el contenido
    if (text.startsWith('@slide ') || text.startsWith('@lámina ')) {
      setMode('slide')
      setPreviewTarget({ type: 'slide', index: currentSlide })
    } else if (text.startsWith('@all ') || text.startsWith('@todo ') || text.startsWith('@presentación ')) {
      setMode('all')
      setPreviewTarget({ type: 'all' })
    } else if (text.startsWith('@chat ') || text.startsWith('?')) {
      setMode('chat')
      setPreviewTarget(null)
    } else {
      // Detectar menciones de slides específicos: @1, @2, etc.
      const slideMatch = text.match(/^@(\d+)\s/)
      if (slideMatch) {
        const slideNum = parseInt(slideMatch[1]) - 1
        if (slideNum >= 0 && slideNum < slides.length) {
          setMode('slide')
          setPreviewTarget({ type: 'slide', index: slideNum })
        }
      }
    }
  }, [input, currentSlide, slides.length])

  const handleSend = async () => {
    if (!input.trim()) return

    // Detectar comandos rápidos
    const command = detectCommand(input)
    if (command) {
      handleCommand(command)
      return
    }

    // Limpiar prefijos del mensaje
    let cleanMessage = input
      .replace(/^@(slide|lámina|all|todo|presentación|chat|\d+)\s+/i, '')
      .trim()

    if (!cleanMessage) return

    const userMessage = input
    setInput('')
    setIsTyping(true)
    setPreviewTarget(null)

    try {
      let aiResponse

      if (mode === 'all') {
        // Generar toda la presentación
        setAiStatus('generating')
        aiResponse = await generateFullPresentation(cleanMessage, slides)
        
        if (aiResponse.slideUpdates) {
          // Mostrar preview antes de aplicar
          setPreviewChanges({
            type: 'all',
            updates: aiResponse.slideUpdates,
            message: aiResponse.message
          })
          setAiStatus(null)
          setIsTyping(false)
          return // No enviar mensaje aún, esperar confirmación
        }
      } else if (mode === 'slide') {
        // Editar slide específico
        setAiStatus('analyzing')
        const targetIndex = previewTarget?.index ?? currentSlide
        aiResponse = await generateAIResponse(cleanMessage, slides[targetIndex], slides)
        
        if (aiResponse.updates) {
          // Mostrar preview del cambio
          setPreviewChanges({
            type: 'slide',
            slideIndex: targetIndex,
            updates: aiResponse.updates,
            message: aiResponse.message
          })
          setAiStatus(null)
          setIsTyping(false)
          return // Esperar confirmación
        } else if (aiResponse.slideUpdates) {
          setPreviewChanges({
            type: 'multiple',
            updates: aiResponse.slideUpdates,
            message: aiResponse.message
          })
          setAiStatus(null)
          setIsTyping(false)
          return
        }
      } else {
        // Chat normal - pero detectar si debe generar contenido
        const shouldGenerateContent = detectContentGenerationIntent(cleanMessage)
        
        if (shouldGenerateContent) {
          // Cambiar automáticamente a modo "all" y generar
          console.log('🎯 Detectada intención de generar presentación completa')
          setAiStatus('generating')
          aiResponse = await generateFullPresentation(cleanMessage, slides)
          
          if (aiResponse.slideUpdates) {
            setPreviewChanges({
              type: 'all',
              updates: aiResponse.slideUpdates,
              message: aiResponse.message
            })
            setAiStatus(null)
            setIsTyping(false)
            return
          }
        } else {
          // Detectar si necesita buscar en web
          const needsWebSearch = detectWebSearchIntent(cleanMessage)
          if (needsWebSearch) {
            setAiStatus('searching')
          } else {
            setAiStatus('thinking')
          }
          
          aiResponse = await generateAIResponse(cleanMessage, slides[currentSlide], slides)
          
          // Si la IA detecta que debería actualizar slides, mostrar preview
          if (aiResponse.updates) {
            setPreviewChanges({
              type: 'slide',
              slideIndex: currentSlide,
              updates: aiResponse.updates,
              message: aiResponse.message
            })
            setAiStatus(null)
            setIsTyping(false)
            return
          }
        }
      }

      // Construir mensaje con indicador
      let responseMessage = aiResponse.message
      
      if (mode !== 'chat' && (aiResponse.slideUpdates || aiResponse.updates)) {
        const count = aiResponse.slideUpdates?.length || 1
        responseMessage += `\n\n✅ ${count} slide${count > 1 ? 's' : ''} actualizado${count > 1 ? 's' : ''}`
      }

      onMessage(userMessage, responseMessage)

    } catch (error) {
      console.error('Error:', error)
      onMessage(userMessage, 'Lo siento, hubo un error. Por favor intenta de nuevo.')
    } finally {
      setIsTyping(false)
      setAiStatus(null)
      setMode('chat') // Reset a chat después de enviar
    }
  }

  // Detectar comandos rápidos
  const detectCommand = (text) => {
    const match = text.match(/^\/(\w+)(?:\s+(.*))?/)
    if (!match) return null
    
    const [, command, args] = match
    return { command: command.toLowerCase(), args: args?.trim() || '' }
  }

  // Manejar comandos
  const handleCommand = (cmd) => {
    const { command, args } = cmd
    
    switch (command) {
      case 'generar':
      case 'generate':
        setMode('all')
        setInput(args || 'Genera una presentación profesional')
        break
      
      case 'mejorar':
      case 'improve':
        setMode('slide')
        setInput(args || 'Mejora el contenido de esta lámina')
        break
      
      case 'buscar':
      case 'search':
        if (args) {
          setInput(`Investiga sobre: ${args}`)
        }
        break
      
      case 'ayuda':
      case 'help':
        onMessage(`/${command}`, `**Comandos disponibles:**\n\n` +
          `• **/generar [tema]** - Genera presentación completa\n` +
          `• **/mejorar [instrucción]** - Mejora slide actual\n` +
          `• **/buscar [tema]** - Busca información en web\n` +
          `• **/ayuda** - Muestra esta ayuda\n\n` +
          `También puedes usar: @slide, @all, @1, @2, etc.`)
        setInput('')
        break
      
      default:
        onMessage(`/${command}`, `Comando no reconocido. Usa **/ayuda** para ver comandos disponibles.`)
        setInput('')
    }
  }

  // Detectar intención de búsqueda web
  const detectWebSearchIntent = (message) => {
    const msg = message.toLowerCase()
    const keywords = ['investiga', 'busca', 'información sobre', 'qué es', 'quién es', 'dónde está']
    return keywords.some(k => msg.includes(k)) || msg.includes('http')
  }

  // Aplicar cambios del preview
  const applyPreviewChanges = () => {
    if (!previewChanges) return

    if (previewChanges.type === 'all' || previewChanges.type === 'multiple') {
      // Abrir Content Mapper para ajuste fino
      setPendingContent(previewChanges.updates.map(u => u.content))
      setShowContentMapper(true)
    } else if (previewChanges.type === 'slide') {
      // Aplicar cambio a un slide - fusionar con contenido existente
      const slide = slides[previewChanges.slideIndex]
      if (slide) {
        const newContent = {
          ...slide.content,
          ...previewChanges.updates
        }
        console.log('📝 Aplicando contenido al slide:', previewChanges.slideIndex, newContent)
        onSlideUpdate(slide.id, newContent)
      }
    }

    // Enviar mensaje de confirmación
    onMessage('Aplicar cambios', previewChanges.message + '\n\n✅ Cambios aplicados')
    setPreviewChanges(null)
  }

  // Cancelar preview
  const cancelPreviewChanges = () => {
    const userMessage = chatHistory[chatHistory.length - 1]?.message || 'Cancelar'
    onMessage(userMessage, 'Cambios cancelados. ¿Quieres intentar algo diferente?')
    setPreviewChanges(null)
  }

  const handleModeSelect = (newMode) => {
    setMode(newMode)
    setShowModeSelector(false)
    inputRef.current?.focus()
    
    if (newMode === 'slide') {
      setPreviewTarget({ type: 'slide', index: currentSlide })
    } else if (newMode === 'all') {
      setPreviewTarget({ type: 'all' })
    } else {
      setPreviewTarget(null)
    }
  }

  const quickPrompts = {
    chat: [
      { icon: 'help', text: '¿Qué puedes hacer?' },
      { icon: 'lightbulb', text: 'Dame ideas para mi presentación' },
      { icon: 'psychology', text: '¿Cómo hago una buena presentación?' }
    ],
    slide: [
      { icon: 'edit', text: 'Mejora el contenido' },
      { icon: 'add', text: 'Agrega más puntos' },
      { icon: 'auto_fix_high', text: 'Hazlo más profesional' }
    ],
    all: [
      { icon: 'business', text: 'Presentación corporativa' },
      { icon: 'rocket_launch', text: 'Pitch de startup' },
      { icon: 'school', text: 'Presentación educativa' }
    ]
  }

  const currentMode = INTERACTION_MODES[mode.toUpperCase()]

  // Detectar si el usuario quiere generar contenido para toda la presentación
  const detectContentGenerationIntent = (message) => {
    const msg = message.toLowerCase()
    const keywords = [
      'generar', 'genera', 'crear', 'crea', 'hacer', 'haz',
      'estrategia', 'presentación', 'presentacion', 'contenido',
      'completa', 'toda', 'todas las', 'plan', 'propuesta'
    ]
    
    // Si menciona múltiples keywords, probablemente quiere generar contenido
    const matchCount = keywords.filter(k => msg.includes(k)).length
    return matchCount >= 2
  }

  const handleApplyMapping = (mappings) => {
    // Aplicar el contenido mapeado a cada slide
    mappings.forEach(mapping => {
      const slideId = slides[mapping.slideIndex]?.id
      if (!slideId) return

      // Construir contenido desde las áreas mapeadas
      const content = {}
      mapping.areas.forEach(area => {
        if (area.areaType === 'title') {
          content.title = area.content
        } else if (area.areaType === 'subtitle') {
          content.subtitle = area.content
        } else if (area.areaType === 'bullets' || area.areaType === 'body') {
          // Convertir texto con bullets a array
          const bullets = area.content.split('\n').map(b => b.replace(/^•\s*/, '').trim()).filter(b => b)
          content.bullets = bullets.length > 0 ? bullets : [area.content]
        } else {
          content.heading = area.content
        }
      })

      onSlideUpdate(slideId, { ...slides[mapping.slideIndex].content, ...content })
    })

    setShowContentMapper(false)
    setPendingContent(null)
  }

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="header-info">
          <h3>
            <span className="material-icons">psychology</span>
            Asistente IA
          </h3>
        </div>
        <div className="header-status">
          <span className="status-dot"></span>
          <span>Activo</span>
        </div>
      </div>

      {/* Mode Indicator Bar */}
      <div className="mode-bar">
        <div 
          className={`mode-indicator ${mode}`}
          style={{ '--mode-color': currentMode.color }}
        >
          <span className="material-icons">{currentMode.icon}</span>
          <span className="mode-label">{currentMode.label}</span>
          {mode === 'slide' && previewTarget && (
            <span className="target-badge">Slide {(previewTarget.index ?? currentSlide) + 1}</span>
          )}
        </div>
        
        {/* Preview de destino */}
        {previewTarget && mode !== 'chat' && (
          <div className="target-preview">
            <span className="material-icons">arrow_forward</span>
            {previewTarget.type === 'all' ? (
              <span>Todas las {slides.length} láminas</span>
            ) : (
              <span>Lámina {(previewTarget.index ?? currentSlide) + 1}: {slides[previewTarget.index ?? currentSlide]?.type === 'title' ? 'Título' : 'Contenido'}</span>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {chatHistory.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">
              <span className="material-icons">waving_hand</span>
            </div>
            <h4>¡Hola! Soy tu asistente</h4>
            <p>Selecciona un modo para comenzar:</p>
            
            <div className="mode-cards">
              {Object.values(INTERACTION_MODES).map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`mode-card ${mode === m.id ? 'active' : ''}`}
                  onClick={() => handleModeSelect(m.id)}
                  style={{ '--card-color': m.color }}
                >
                  <span className="material-icons">{m.icon}</span>
                  <strong>{m.label}</strong>
                  <small>{m.description}</small>
                </button>
              ))}
            </div>

            <div className="shortcut-hint">
              <span className="material-icons">keyboard</span>
              <span>Tip: Usa <code>@slide</code>, <code>@all</code> o <code>@1</code> para cambiar modo rápido</span>
            </div>
          </div>
        )}

        {chatHistory.map((msg, index) => (
          msg.type === 'activity' ? (
            <div key={index} className="message activity" data-action={msg.action}>
              <div className="activity-icon">
                <span className="material-icons">{msg.icon}</span>
              </div>
              <div className="activity-content">
                <span className="activity-message">{msg.message}</span>
                <span className="activity-time">{msg.timestamp}</span>
              </div>
            </div>
          ) : (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                <span className="material-icons">
                  {msg.role === 'user' ? 'person' : 'psychology'}
                </span>
              </div>
              <div className="message-content">
                <div className="message-text">{msg.message}</div>
                {msg.role === 'assistant' && msg.message.includes('✅') && (
                  <div className="update-indicator">
                    <span className="material-icons">check_circle</span>
                    Cambios aplicados
                  </div>
                )}
              </div>
            </div>
          )
        ))}
        
        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar">
              <span className="material-icons">psychology</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              {aiStatus && (
                <div className="ai-status">
                  <span className="material-icons status-icon">
                    {aiStatus === 'thinking' && 'psychology'}
                    {aiStatus === 'searching' && 'search'}
                    {aiStatus === 'analyzing' && 'analytics'}
                    {aiStatus === 'generating' && 'auto_awesome'}
                  </span>
                  <span className="status-text">
                    {aiStatus === 'thinking' && 'Pensando...'}
                    {aiStatus === 'searching' && 'Buscando información...'}
                    {aiStatus === 'analyzing' && 'Analizando diseño...'}
                    {aiStatus === 'generating' && 'Generando contenido...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      {chatHistory.length < 2 && (
        <div className="quick-prompts">
          <div className="prompts-label">Sugerencias:</div>
          <div className="prompts-list">
            {quickPrompts[mode]?.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="prompt-chip"
                onClick={() => setInput(prompt.text)}
              >
                <span className="material-icons">{prompt.icon}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Command Suggestions */}
      {input.startsWith('/') && input.length > 1 && (
        <div className="command-suggestions">
          <div className="suggestions-header">
            <span className="material-icons">terminal</span>
            Comandos disponibles:
          </div>
          {[
            { cmd: '/generar', desc: 'Genera presentación completa', icon: 'auto_awesome' },
            { cmd: '/mejorar', desc: 'Mejora slide actual', icon: 'auto_fix_high' },
            { cmd: '/buscar', desc: 'Busca información en web', icon: 'search' },
            { cmd: '/ayuda', desc: 'Muestra ayuda', icon: 'help' }
          ]
            .filter(c => c.cmd.startsWith(input.toLowerCase().split(' ')[0]))
            .map((cmd, idx) => (
              <button
                key={idx}
                type="button"
                className="command-option"
                onClick={() => setInput(cmd.cmd + ' ')}
              >
                <span className="material-icons">{cmd.icon}</span>
                <div className="cmd-info">
                  <strong>{cmd.cmd}</strong>
                  <small>{cmd.desc}</small>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Input Area */}
      <div className="chat-input-area">
        {/* Mode Selector */}
        <div className="mode-selector-container">
          <button
            type="button"
            className={`mode-toggle ${showModeSelector ? 'active' : ''}`}
            onClick={() => setShowModeSelector(!showModeSelector)}
            style={{ '--mode-color': currentMode.color }}
          >
            <span className="material-icons">{currentMode.icon}</span>
            <span className="material-icons arrow">expand_more</span>
          </button>

          {showModeSelector && (
            <div className="mode-dropdown">
              {Object.values(INTERACTION_MODES).map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`mode-option ${mode === m.id ? 'active' : ''}`}
                  onClick={() => handleModeSelect(m.id)}
                >
                  <span className="material-icons" style={{ color: m.color }}>{m.icon}</span>
                  <div className="option-text">
                    <strong>{m.label}</strong>
                    <small>{m.description}</small>
                  </div>
                  {mode === m.id && <span className="material-icons check">check</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={
              mode === 'chat' ? 'Pregunta lo que quieras...' :
              mode === 'slide' ? 'Describe el contenido para esta lámina...' :
              'Describe el tema de tu presentación...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={2}
          />
        </div>

        {/* Send Button */}
        <button 
          type="button"
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          style={{ '--mode-color': currentMode.color }}
        >
          <span className="material-icons">
            {mode === 'all' ? 'auto_awesome' : mode === 'slide' ? 'edit' : 'send'}
          </span>
        </button>
      </div>

      {/* Preview Changes Modal */}
      {previewChanges && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-header">
              <h3>
                <span className="material-icons">preview</span>
                Vista Previa de Cambios
              </h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={cancelPreviewChanges}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="preview-content">
              <div className="preview-info">
                <span className="material-icons">info</span>
                {previewChanges.type === 'all' && `Se actualizarán ${previewChanges.updates.length} láminas`}
                {previewChanges.type === 'slide' && `Se actualizará la lámina ${previewChanges.slideIndex + 1}`}
                {previewChanges.type === 'multiple' && `Se actualizarán ${previewChanges.updates.length} láminas`}
              </div>

              <div className="preview-changes-list">
                {previewChanges.type === 'slide' ? (
                  <div className="change-item">
                    <div className="change-header">
                      <span className="material-icons">edit</span>
                      <strong>Lámina {previewChanges.slideIndex + 1}</strong>
                    </div>
                    <div className="change-details">
                      {previewChanges.updates.title && (
                        <div className="change-field">
                          <label>Título:</label>
                          <p>{previewChanges.updates.title}</p>
                        </div>
                      )}
                      {previewChanges.updates.subtitle && (
                        <div className="change-field">
                          <label>Subtítulo:</label>
                          <p>{previewChanges.updates.subtitle}</p>
                        </div>
                      )}
                      {previewChanges.updates.bullets && (
                        <div className="change-field">
                          <label>Contenido:</label>
                          <ul>
                            {previewChanges.updates.bullets.map((bullet, i) => (
                              <li key={i}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  previewChanges.updates.map((update, idx) => (
                    <div key={idx} className="change-item">
                      <div className="change-header">
                        <span className="material-icons">edit</span>
                        <strong>Lámina {update.slideIndex + 1}</strong>
                      </div>
                      <div className="change-details">
                        {update.content?.title && (
                          <div className="change-field">
                            <label>Título:</label>
                            <p>{update.content.title}</p>
                          </div>
                        )}
                        {update.content?.bullets && (
                          <div className="change-field">
                            <label>Contenido:</label>
                            <ul>
                              {update.content.bullets.slice(0, 3).map((bullet, i) => (
                                <li key={i}>{bullet}</li>
                              ))}
                              {update.content.bullets.length > 3 && (
                                <li className="more">...y {update.content.bullets.length - 3} más</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="preview-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelPreviewChanges}
              >
                <span className="material-icons">close</span>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={applyPreviewChanges}
              >
                <span className="material-icons">check</span>
                Aplicar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Mapper Modal */}
      {showContentMapper && pendingContent && (
        <Suspense fallback={null}>
          <ContentMapper
            slides={slides}
            aiGeneratedContent={pendingContent}
            onApplyMapping={handleApplyMapping}
            onClose={() => {
              setShowContentMapper(false)
              setPendingContent(null)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}

export default ChatPanel
