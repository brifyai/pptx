import { useState } from 'react'
import '../styles/RibbonMenu.css'

function RibbonMenu({ 
  onNewPresentation,
  onOpenTemplate,
  onSave,
  onExport,
  onUndo,
  onRedo,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onChangeLayout,
  onInsertImage,
  onInsertChart,
  onInsertTable,
  onInsertShape,
  onTextFormat,
  onAlignContent,
  onThemeChange,
  onShare,
  onPublish,
  onAIGenerate,
  onAIRewrite,
  onAITranslate,
  onAISummarize,
  onAIAnalyzeAudience,
  onAIImageGenerate,
  onAIVoiceDictate,
  onInsertVideo,
  onInsertAudio,
  onInsertIcon,
  onDataConnect,
  onDataImportExcel,
  onDataImportSheets,
  onCollabShare,
  onCollabInvite,
  onCollabComments,
  onCollabHistory,
  onToolsFormatPainter,
  onToolsFindReplace,
  onToolsMacros,
  onToolsAccessibility,
  onToolsOptimize,
  onSpellCheck,
  onShowComments,
  onViewPresentation,
  onZoom,
  onHelp,
  canUndo = false,
  canRedo = false,
  currentSlide = null
}) {
  const [activeTab, setActiveTab] = useState('inicio')
  const [showLayoutMenu, setShowLayoutMenu] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const tabs = [
    { id: 'archivo', label: 'Archivo', icon: 'folder' },
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'insertar', label: 'Insertar', icon: 'add_circle' },
    { id: 'diseño', label: 'Diseño', icon: 'palette' },
    { id: 'transiciones', label: 'Transiciones', icon: 'animation' },
    { id: 'animaciones', label: 'Animaciones', icon: 'play_circle' },
    { id: 'ia', label: 'IA Avanzada', icon: 'psychology' },
    { id: 'datos', label: 'Datos', icon: 'bar_chart' },
    { id: 'colaborar', label: 'Colaborar', icon: 'groups' },
    { id: 'revisar', label: 'Revisar', icon: 'spellcheck' },
    { id: 'vista', label: 'Vista', icon: 'visibility' },
    { id: 'herramientas', label: 'Herramientas', icon: 'build' },
    { id: 'ayuda', label: 'Ayuda', icon: 'help' }
  ]

  const layouts = [
    { id: 'title', name: 'Título', icon: '📄' },
    { id: 'title-content', name: 'Título y contenido', icon: '📋' },
    { id: 'two-content', name: 'Dos contenidos', icon: '📊' },
    { id: 'comparison', name: 'Comparación', icon: '⚖️' },
    { id: 'blank', name: 'En blanco', icon: '⬜' }
  ]

  const themes = [
    { id: 'default', name: 'Predeterminado', color: '#4285f4' },
    { id: 'dark', name: 'Oscuro', color: '#1a1a1a' },
    { id: 'light', name: 'Claro', color: '#ffffff' },
    { id: 'corporate', name: 'Corporativo', color: '#0066cc' },
    { id: 'creative', name: 'Creativo', color: '#ff6b6b' }
  ]

  return (
    <div className="ribbon-menu">
      {/* Tabs */}
      <div className="ribbon-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ribbon-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="material-icons">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="ribbon-content">
        {/* ARCHIVO TAB */}
        {activeTab === 'archivo' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Nuevo</div>
              <button className="ribbon-btn large" onClick={onNewPresentation}>
                <span className="material-icons">add</span>
                <span>Nueva presentación</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Abrir</div>
              <button className="ribbon-btn large" onClick={onOpenTemplate}>
                <span className="material-icons">folder_open</span>
                <span>Abrir template</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Guardar</div>
              <div className="ribbon-row">
                <button className="ribbon-btn large" onClick={onSave}>
                  <span className="material-icons">save</span>
                  <span>Guardar</span>
                </button>
                <button className="ribbon-btn large" onClick={onExport}>
                  <span className="material-icons">download</span>
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Compartir</div>
              <div className="ribbon-row">
                <button className="ribbon-btn" onClick={onShare}>
                  <span className="material-icons">share</span>
                  <span>Compartir</span>
                </button>
                <button className="ribbon-btn" onClick={onPublish}>
                  <span className="material-icons">cloud_upload</span>
                  <span>Publicar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INICIO TAB */}
        {activeTab === 'inicio' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Portapapeles</div>
              <div className="ribbon-row">
                <button className="ribbon-btn" onClick={onUndo} disabled={!canUndo}>
                  <span className="material-icons">undo</span>
                  <span>Deshacer</span>
                </button>
                <button className="ribbon-btn" onClick={onRedo} disabled={!canRedo}>
                  <span className="material-icons">redo</span>
                  <span>Rehacer</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Diapositivas</div>
              <button className="ribbon-btn large" onClick={onAddSlide}>
                <span className="material-icons">note_add</span>
                <span>Nueva diapositiva</span>
              </button>
              <div className="ribbon-row">
                <button className="ribbon-btn" onClick={onDuplicateSlide} title="Duplicar">
                  <span className="material-icons">content_copy</span>
                  <span>Duplicar</span>
                </button>
                <button className="ribbon-btn" onClick={onDeleteSlide} title="Eliminar">
                  <span className="material-icons">delete</span>
                  <span>Eliminar</span>
                </button>
                <button 
                  className="ribbon-btn" 
                  onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                  title="Layout"
                >
                  <span className="material-icons">dashboard</span>
                  <span>Layout</span>
                </button>
              </div>
              {showLayoutMenu && (
                <div className="dropdown-menu">
                  {layouts.map(layout => (
                    <button
                      key={layout.id}
                      className="dropdown-item"
                      onClick={() => {
                        onChangeLayout(layout.id)
                        setShowLayoutMenu(false)
                      }}
                    >
                      <span className="layout-icon">{layout.icon}</span>
                      {layout.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ribbon-group">
              <div className="group-label">Fuente</div>
              <div className="ribbon-row">
                <select className="ribbon-select">
                  <option>Arial</option>
                  <option>Calibri</option>
                  <option>Times New Roman</option>
                  <option>Verdana</option>
                  <option>Georgia</option>
                  <option>Helvetica</option>
                  <option>Tahoma</option>
                  <option>Trebuchet MS</option>
                  <option>Courier New</option>
                  <option>Garamond</option>
                  <option>Palatino</option>
                  <option>Book Antiqua</option>
                  <option>Comic Sans MS</option>
                  <option>Impact</option>
                  <option>Lucida Sans</option>
                  <option>Century Gothic</option>
                </select>
                <select className="ribbon-select small">
                  <option>8</option>
                  <option>9</option>
                  <option>10</option>
                  <option>11</option>
                  <option>12</option>
                  <option>14</option>
                  <option>16</option>
                  <option>18</option>
                  <option>20</option>
                  <option>22</option>
                  <option>24</option>
                  <option>26</option>
                  <option>28</option>
                  <option>32</option>
                  <option>36</option>
                  <option>40</option>
                  <option>44</option>
                  <option>48</option>
                  <option>54</option>
                  <option>60</option>
                  <option>66</option>
                  <option>72</option>
                  <option>80</option>
                  <option>96</option>
                </select>
              </div>
              <div className="ribbon-row">
                <button className="ribbon-btn icon-only" title="Negrita">
                  <span className="material-icons">format_bold</span>
                </button>
                <button className="ribbon-btn icon-only" title="Cursiva">
                  <span className="material-icons">format_italic</span>
                </button>
                <button className="ribbon-btn icon-only" title="Subrayado">
                  <span className="material-icons">format_underlined</span>
                </button>
                <button className="ribbon-btn icon-only" title="Color de texto">
                  <span className="material-icons">format_color_text</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Párrafo</div>
              <div className="ribbon-row">
                <button className="ribbon-btn icon-only" title="Alinear izquierda">
                  <span className="material-icons">format_align_left</span>
                </button>
                <button className="ribbon-btn icon-only" title="Centrar">
                  <span className="material-icons">format_align_center</span>
                </button>
                <button className="ribbon-btn icon-only" title="Alinear derecha">
                  <span className="material-icons">format_align_right</span>
                </button>
                <button className="ribbon-btn icon-only" title="Justificar">
                  <span className="material-icons">format_align_justify</span>
                </button>
              </div>
              <div className="ribbon-row">
                <button className="ribbon-btn icon-only" title="Viñetas">
                  <span className="material-icons">format_list_bulleted</span>
                </button>
                <button className="ribbon-btn icon-only" title="Numeración">
                  <span className="material-icons">format_list_numbered</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INSERTAR TAB */}
        {activeTab === 'insertar' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Imágenes</div>
              <button className="ribbon-btn large" onClick={onInsertImage}>
                <span className="material-icons">image</span>
                <span>Imagen</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Ilustraciones</div>
              <button className="ribbon-btn" onClick={onInsertShape}>
                <span className="material-icons">category</span>
                <span>Formas</span>
              </button>
              <button className="ribbon-btn" onClick={onInsertIcon}>
                <span className="material-icons">auto_awesome</span>
                <span>Iconos</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Gráficos</div>
              <button className="ribbon-btn large" onClick={onInsertChart}>
                <span className="material-icons">bar_chart</span>
                <span>Gráfico</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Tablas</div>
              <button className="ribbon-btn large" onClick={onInsertTable}>
                <span className="material-icons">table_chart</span>
                <span>Tabla</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Texto</div>
              <button className="ribbon-btn" onClick={() => onInsertShape && onInsertShape('textbox')}>
                <span className="material-icons">text_fields</span>
                <span>Cuadro de texto</span>
              </button>
              <button className="ribbon-btn" onClick={() => onInsertShape && onInsertShape('wordart')}>
                <span className="material-icons">title</span>
                <span>WordArt</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Multimedia</div>
              <button className="ribbon-btn" onClick={onInsertVideo}>
                <span className="material-icons">videocam</span>
                <span>Video</span>
              </button>
              <button className="ribbon-btn" onClick={onInsertAudio}>
                <span className="material-icons">volume_up</span>
                <span>Audio</span>
              </button>
            </div>
          </div>
        )}

        {/* DISEÑO TAB */}
        {activeTab === 'diseño' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Temas</div>
              <button 
                className="ribbon-btn large" 
                onClick={() => setShowThemeMenu(!showThemeMenu)}
              >
                <span className="material-icons">palette</span>
                <span>Temas</span>
              </button>
              {showThemeMenu && (
                <div className="dropdown-menu themes">
                  {themes.map(theme => (
                    <button
                      key={theme.id}
                      className="dropdown-item theme-item"
                      onClick={() => {
                        onThemeChange(theme.id)
                        setShowThemeMenu(false)
                      }}
                    >
                      <div 
                        className="theme-preview" 
                        style={{ backgroundColor: theme.color }}
                      />
                      {theme.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ribbon-group">
              <div className="group-label">Variantes</div>
              <div className="color-variants">
                <button className="color-btn" style={{ background: '#4285f4' }} />
                <button className="color-btn" style={{ background: '#ea4335' }} />
                <button className="color-btn" style={{ background: '#34a853' }} />
                <button className="color-btn" style={{ background: '#fbbc04' }} />
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Configurar página</div>
              <button className="ribbon-btn">
                <span className="material-icons">aspect_ratio</span>
                <span>Tamaño de diapositiva</span>
              </button>
              <button className="ribbon-btn">
                <span className="material-icons">format_paint</span>
                <span>Formato de fondo</span>
              </button>
            </div>
          </div>
        )}

        {/* TRANSICIONES TAB */}
        {activeTab === 'transiciones' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Vista previa</div>
              <button className="ribbon-btn large">
                <span className="material-icons">play_arrow</span>
                <span>Vista previa</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Transición a esta diapositiva</div>
              <div className="transition-gallery">
                <button className="transition-btn" title="Ninguna">Ninguna</button>
                <button className="transition-btn" title="Desvanecer">Desvanecer</button>
                <button className="transition-btn" title="Empujar">Empujar</button>
                <button className="transition-btn" title="Limpiar">Limpiar</button>
                <button className="transition-btn" title="Dividir">Dividir</button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Intervalos</div>
              <button className="ribbon-btn">
                <span className="material-icons">timer</span>
                <span>Duración</span>
              </button>
              <label className="ribbon-checkbox">
                <input type="checkbox" />
                <span>Al hacer clic</span>
              </label>
            </div>
          </div>
        )}

        {/* ANIMACIONES TAB */}
        {activeTab === 'animaciones' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Vista previa</div>
              <button className="ribbon-btn large">
                <span className="material-icons">play_circle</span>
                <span>Vista previa</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Animación</div>
              <div className="animation-gallery">
                <button className="animation-btn">Aparecer</button>
                <button className="animation-btn">Desvanecer</button>
                <button className="animation-btn">Volar</button>
                <button className="animation-btn">Flotar</button>
                <button className="animation-btn">Dividir</button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Animación avanzada</div>
              <button className="ribbon-btn">
                <span className="material-icons">add_circle</span>
                <span>Agregar animación</span>
              </button>
              <button className="ribbon-btn">
                <span className="material-icons">animation</span>
                <span>Panel de animación</span>
              </button>
            </div>
          </div>
        )}

        {/* IA AVANZADA TAB */}
        {activeTab === 'ia' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Generación IA</div>
              <button className="ribbon-btn large" onClick={onAIGenerate}>
                <span className="material-icons">auto_awesome</span>
                <span>Generar contenido</span>
              </button>
              <div className="ribbon-row">
                <button className="ribbon-btn small" onClick={() => onAIGenerate && onAIGenerate('variants')}>
                  <span className="material-icons">shuffle</span>
                  <span>Variantes</span>
                </button>
                <button className="ribbon-btn small" onClick={() => onAIGenerate && onAIGenerate('suggestions')}>
                  <span className="material-icons">lightbulb</span>
                  <span>Sugerencias</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Mejora de Contenido</div>
              <button className="ribbon-btn" onClick={onAIRewrite}>
                <span className="material-icons">edit_note</span>
                <span>Reescribir</span>
              </button>
              <button className="ribbon-btn" onClick={onAITranslate}>
                <span className="material-icons">translate</span>
                <span>Traducir</span>
              </button>
              <button className="ribbon-btn" onClick={onAISummarize}>
                <span className="material-icons">format_size</span>
                <span>Resumir</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Análisis IA</div>
              <button className="ribbon-btn" onClick={onAIAnalyzeAudience}>
                <span className="material-icons">analytics</span>
                <span>Analizar audiencia</span>
              </button>
              <button className="ribbon-btn" onClick={() => onAIAnalyzeAudience && onAIAnalyzeAudience('tone')}>
                <span className="material-icons">sentiment_satisfied</span>
                <span>Tono y estilo</span>
              </button>
              <button className="ribbon-btn" onClick={() => onAIAnalyzeAudience && onAIAnalyzeAudience('facts')}>
                <span className="material-icons">fact_check</span>
                <span>Verificar datos</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Imágenes IA</div>
              <button className="ribbon-btn" onClick={onAIImageGenerate}>
                <span className="material-icons">image</span>
                <span>Generar imagen</span>
              </button>
              <button className="ribbon-btn" onClick={() => onAIImageGenerate && onAIImageGenerate('enhance')}>
                <span className="material-icons">auto_fix_high</span>
                <span>Mejorar imagen</span>
              </button>
              <button className="ribbon-btn" onClick={() => onAIImageGenerate && onAIImageGenerate('remove-bg')}>
                <span className="material-icons">background_replace</span>
                <span>Quitar fondo</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Voz y Audio</div>
              <button className="ribbon-btn" onClick={onAIVoiceDictate}>
                <span className="material-icons">mic</span>
                <span>Dictar contenido</span>
              </button>
              <button className="ribbon-btn" onClick={() => onAIVoiceDictate && onAIVoiceDictate('narration')}>
                <span className="material-icons">record_voice_over</span>
                <span>Narración IA</span>
              </button>
            </div>
          </div>
        )}

        {/* DATOS TAB */}
        {activeTab === 'datos' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Gráficos</div>
              <button className="ribbon-btn large" onClick={onInsertChart}>
                <span className="material-icons">insert_chart</span>
                <span>Insertar gráfico</span>
              </button>
              <div className="ribbon-row">
                <button className="ribbon-btn small" title="Gráfico de barras" onClick={() => onInsertChart && onInsertChart('bar')}>
                  <span className="material-icons">bar_chart</span>
                </button>
                <button className="ribbon-btn small" title="Gráfico de líneas" onClick={() => onInsertChart && onInsertChart('line')}>
                  <span className="material-icons">show_chart</span>
                </button>
                <button className="ribbon-btn small" title="Gráfico circular" onClick={() => onInsertChart && onInsertChart('pie')}>
                  <span className="material-icons">pie_chart</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Tablas</div>
              <button className="ribbon-btn large" onClick={onInsertTable}>
                <span className="material-icons">table_chart</span>
                <span>Insertar tabla</span>
              </button>
              <div className="ribbon-row">
                <button className="ribbon-btn small" onClick={() => onInsertTable && onInsertTable('grid')}>
                  <span className="material-icons">grid_on</span>
                </button>
                <button className="ribbon-btn small" onClick={() => onInsertTable && onInsertTable('columns')}>
                  <span className="material-icons">view_column</span>
                </button>
              </div>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Datos en Vivo</div>
              <button className="ribbon-btn" onClick={onDataConnect}>
                <span className="material-icons">cloud_sync</span>
                <span>Conectar datos</span>
              </button>
              <button className="ribbon-btn" onClick={() => onDataConnect && onDataConnect('refresh')}>
                <span className="material-icons">refresh</span>
                <span>Actualizar</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Importar</div>
              <button className="ribbon-btn" onClick={onDataImportExcel}>
                <span className="material-icons">upload_file</span>
                <span>Desde Excel</span>
              </button>
              <button className="ribbon-btn" onClick={onDataImportSheets}>
                <span className="material-icons">cloud_upload</span>
                <span>Desde Google Sheets</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Visualización</div>
              <button className="ribbon-btn" onClick={() => onInsertChart && onInsertChart('dashboard')}>
                <span className="material-icons">dashboard</span>
                <span>Dashboard</span>
              </button>
              <button className="ribbon-btn" onClick={() => onInsertChart && onInsertChart('timeline')}>
                <span className="material-icons">timeline</span>
                <span>Línea de tiempo</span>
              </button>
            </div>
          </div>
        )}

        {/* COLABORAR TAB */}
        {activeTab === 'colaborar' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Compartir</div>
              <button className="ribbon-btn large" onClick={onCollabShare}>
                <span className="material-icons">share</span>
                <span>Compartir</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabShare && onCollabShare('link')}>
                <span className="material-icons">link</span>
                <span>Copiar enlace</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Colaboración</div>
              <button className="ribbon-btn" onClick={onCollabInvite}>
                <span className="material-icons">group_add</span>
                <span>Invitar personas</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabInvite && onCollabInvite('view')}>
                <span className="material-icons">visibility</span>
                <span>Ver colaboradores</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabInvite && onCollabInvite('realtime')}>
                <span className="material-icons">edit</span>
                <span>Edición en tiempo real</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Comentarios</div>
              <button className="ribbon-btn" onClick={onCollabComments}>
                <span className="material-icons">add_comment</span>
                <span>Nuevo comentario</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabComments && onCollabComments('view')}>
                <span className="material-icons">forum</span>
                <span>Ver todos</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabComments && onCollabComments('resolve')}>
                <span className="material-icons">done_all</span>
                <span>Resolver</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Versiones</div>
              <button className="ribbon-btn" onClick={onCollabHistory}>
                <span className="material-icons">history</span>
                <span>Historial</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabHistory && onCollabHistory('restore')}>
                <span className="material-icons">restore</span>
                <span>Restaurar</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Permisos</div>
              <button className="ribbon-btn" onClick={() => onCollabShare && onCollabShare('permissions')}>
                <span className="material-icons">lock</span>
                <span>Configurar acceso</span>
              </button>
              <button className="ribbon-btn" onClick={() => onCollabShare && onCollabShare('admin')}>
                <span className="material-icons">admin_panel_settings</span>
                <span>Administrar</span>
              </button>
            </div>
          </div>
        )}

        {/* HERRAMIENTAS TAB */}
        {activeTab === 'herramientas' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Productividad</div>
              <button className="ribbon-btn" onClick={onToolsFormatPainter}>
                <span className="material-icons">content_copy</span>
                <span>Copiar formato</span>
              </button>
              <button className="ribbon-btn" onClick={onToolsFindReplace}>
                <span className="material-icons">find_replace</span>
                <span>Buscar y reemplazar</span>
              </button>
              <button className="ribbon-btn" onClick={() => onToolsFormatPainter && onToolsFormatPainter('rules')}>
                <span className="material-icons">rule</span>
                <span>Reglas automáticas</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Plantillas</div>
              <button className="ribbon-btn" onClick={() => onSave && onSave('template')}>
                <span className="material-icons">save_as</span>
                <span>Guardar como plantilla</span>
              </button>
              <button className="ribbon-btn" onClick={onOpenTemplate}>
                <span className="material-icons">folder_special</span>
                <span>Mis plantillas</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Macros</div>
              <button className="ribbon-btn" onClick={onToolsMacros}>
                <span className="material-icons">code</span>
                <span>Grabar macro</span>
              </button>
              <button className="ribbon-btn" onClick={() => onToolsMacros && onToolsMacros('run')}>
                <span className="material-icons">play_arrow</span>
                <span>Ejecutar macro</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Accesibilidad</div>
              <button className="ribbon-btn" onClick={onToolsAccessibility}>
                <span className="material-icons">accessibility</span>
                <span>Verificar accesibilidad</span>
              </button>
              <button className="ribbon-btn" onClick={() => onToolsAccessibility && onToolsAccessibility('captions')}>
                <span className="material-icons">closed_caption</span>
                <span>Subtítulos</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Optimización</div>
              <button className="ribbon-btn" onClick={onToolsOptimize}>
                <span className="material-icons">compress</span>
                <span>Comprimir imágenes</span>
              </button>
              <button className="ribbon-btn" onClick={() => onToolsOptimize && onToolsOptimize('performance')}>
                <span className="material-icons">speed</span>
                <span>Optimizar rendimiento</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Integración</div>
              <button className="ribbon-btn" onClick={() => onToolsOptimize && onToolsOptimize('addons')}>
                <span className="material-icons">extension</span>
                <span>Complementos</span>
              </button>
              <button className="ribbon-btn" onClick={() => onToolsOptimize && onToolsOptimize('api')}>
                <span className="material-icons">api</span>
                <span>API</span>
              </button>
            </div>
          </div>
        )}
        {activeTab === 'revisar' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Revisión</div>
              <button className="ribbon-btn large" onClick={onSpellCheck}>
                <span className="material-icons">spellcheck</span>
                <span>Ortografía</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Idioma</div>
              <button className="ribbon-btn" onClick={onAITranslate}>
                <span className="material-icons">translate</span>
                <span>Traducir</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Comentarios</div>
              <button className="ribbon-btn" onClick={onShowComments}>
                <span className="material-icons">comment</span>
                <span>Nuevo comentario</span>
              </button>
              <button className="ribbon-btn" onClick={() => onShowComments && onShowComments('view')}>
                <span className="material-icons">visibility</span>
                <span>Mostrar comentarios</span>
              </button>
            </div>
          </div>
        )}

        {/* VISTA TAB */}
        {activeTab === 'vista' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Vistas de presentación</div>
              <button className="ribbon-btn" onClick={() => onViewPresentation && onViewPresentation('normal')}>
                <span className="material-icons">view_carousel</span>
                <span>Normal</span>
              </button>
              <button className="ribbon-btn" onClick={() => onViewPresentation && onViewPresentation('sorter')}>
                <span className="material-icons">grid_view</span>
                <span>Clasificador</span>
              </button>
              <button className="ribbon-btn" onClick={onViewPresentation}>
                <span className="material-icons">slideshow</span>
                <span>Presentación</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Mostrar</div>
              <label className="ribbon-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Regla</span>
              </label>
              <label className="ribbon-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Líneas de cuadrícula</span>
              </label>
              <label className="ribbon-checkbox">
                <input type="checkbox" />
                <span>Guías</span>
              </label>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Zoom</div>
              <button className="ribbon-btn" onClick={() => onZoom && onZoom('in')}>
                <span className="material-icons">zoom_in</span>
                <span>Acercar</span>
              </button>
              <button className="ribbon-btn" onClick={() => onZoom && onZoom('out')}>
                <span className="material-icons">zoom_out</span>
                <span>Alejar</span>
              </button>
              <button className="ribbon-btn" onClick={() => onZoom && onZoom('fit')}>
                <span className="material-icons">fit_screen</span>
                <span>Ajustar</span>
              </button>
            </div>
          </div>
        )}

        {/* AYUDA TAB */}
        {activeTab === 'ayuda' && (
          <div className="ribbon-groups">
            <div className="ribbon-group">
              <div className="group-label">Ayuda</div>
              <button className="ribbon-btn large" onClick={onHelp}>
                <span className="material-icons">help_outline</span>
                <span>Ayuda de PowerPoint</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Soporte</div>
              <button className="ribbon-btn" onClick={() => onHelp && onHelp('support')}>
                <span className="material-icons">contact_support</span>
                <span>Contactar soporte</span>
              </button>
              <button className="ribbon-btn" onClick={() => onHelp && onHelp('feedback')}>
                <span className="material-icons">feedback</span>
                <span>Enviar comentarios</span>
              </button>
            </div>

            <div className="ribbon-group">
              <div className="group-label">Acerca de</div>
              <button className="ribbon-btn" onClick={() => onHelp && onHelp('about')}>
                <span className="material-icons">info</span>
                <span>Acerca de</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RibbonMenu
