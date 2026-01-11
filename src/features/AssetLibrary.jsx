import { useState, lazy, Suspense } from 'react'
import '../styles/AssetLibrary.css'

const IconPicker = lazy(() => import('./assets/IconPicker'))
const ImageSearch = lazy(() => import('./assets/ImageSearch'))
const ShapeLibrary = lazy(() => import('./assets/ShapeLibrary'))
const ChartEditor = lazy(() => import('../components/ChartEditor'))

function AssetLibrary({ onInsert, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('icons')
  const [searchQuery, setSearchQuery] = useState('')
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [selectedChartType, setSelectedChartType] = useState(null)

  if (!isOpen) return null

  const tabs = [
    { id: 'icons', label: 'Iconos', icon: 'emoji_symbols' },
    { id: 'images', label: 'Imágenes', icon: 'image' },
    { id: 'shapes', label: 'Formas', icon: 'category' },
    { id: 'charts', label: 'Gráficos', icon: 'insert_chart' },
    { id: 'templates', label: 'Plantillas', icon: 'dashboard' }
  ]

  const chartTypes = [
    { type: 'bar', icon: 'bar_chart', name: 'Barras', desc: 'Comparar valores entre categorías', color: '#3b82f6' },
    { type: 'line', icon: 'show_chart', name: 'Líneas', desc: 'Mostrar tendencias en el tiempo', color: '#10b981' },
    { type: 'pie', icon: 'pie_chart', name: 'Circular', desc: 'Mostrar proporciones del total', color: '#f97316' },
    { type: 'doughnut', icon: 'donut_large', name: 'Dona', desc: 'Proporciones con espacio central', color: '#8b5cf6' },
    { type: 'area', icon: 'area_chart', name: 'Área', desc: 'Volumen acumulado en el tiempo', color: '#06b6d4' },
    { type: 'radar', icon: 'radar', name: 'Radar', desc: 'Comparar múltiples variables', color: '#ec4899' }
  ]

  const templates = [
    { id: 'timeline', icon: 'timeline', name: 'Línea de tiempo', color: '#3b82f6', desc: 'Eventos cronológicos' },
    { id: 'process', icon: 'account_tree', name: 'Diagrama de proceso', color: '#10b981', desc: 'Flujo de trabajo' },
    { id: 'comparison', icon: 'compare', name: 'Comparación', color: '#f97316', desc: 'Lado a lado' },
    { id: 'swot', icon: 'grid_view', name: 'Análisis SWOT', color: '#ef4444', desc: '4 cuadrantes' },
    { id: 'funnel', icon: 'filter_alt', name: 'Embudo', color: '#8b5cf6', desc: 'Conversión' },
    { id: 'pyramid', icon: 'signal_cellular_alt', name: 'Pirámide', color: '#14b8a6', desc: 'Jerarquía' }
  ]

  const handleChartSelect = (chartType) => {
    setSelectedChartType(chartType)
    setShowChartEditor(true)
  }

  const handleChartSave = (chartData) => {
    onInsert({
      type: 'chart',
      chartType: selectedChartType,
      customData: chartData,
      position: { x: 100, y: 100 }
    })
    setShowChartEditor(false)
    setSelectedChartType(null)
  }

  const handleIconSelect = (iconData) => {
    onInsert({
      type: 'icon',
      icon: iconData.icon,
      color: iconData.color,
      size: iconData.size,
      name: iconData.name,
      position: { x: 100, y: 100 }
    })
  }

  const handleShapeSelect = (shapeData) => {
    onInsert({
      type: 'shape',
      shapeType: shapeData.shapeType,
      color: shapeData.color,
      name: shapeData.name,
      svgPath: shapeData.svgPath,
      position: { x: 100, y: 100 }
    })
  }

  const handleTemplateSelect = (template) => {
    onInsert({
      type: 'template',
      templateId: template.id,
      name: template.name,
      color: template.color,
      position: { x: 50, y: 50 }
    })
  }

  return (
    <div className="asset-library-overlay" onClick={onClose}>
      <div className="asset-library" onClick={e => e.stopPropagation()}>
        <div className="library-header">
          <div className="header-title">
            <span className="material-icons">collections</span>
            <h3>Biblioteca de Assets</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="library-tabs">
          {tabs.map(tab => (
            <button 
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-icons">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="library-search-container">
          <span className="material-icons search-icon">search</span>
          <input
            type="text"
            className="library-search"
            placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>
              <span className="material-icons">close</span>
            </button>
          )}
        </div>

        <div className="library-content">
          <Suspense fallback={
            <div className="loading-state">
              <div className="spinner"></div>
              <span>Cargando...</span>
            </div>
          }>
            {activeTab === 'icons' && (
              <IconPicker 
                query={searchQuery} 
                onSelect={handleIconSelect} 
              />
            )}
            
            {activeTab === 'images' && (
              <ImageSearch 
                query={searchQuery} 
                onSelect={(img) => onInsert({ type: 'image', ...img, position: { x: 100, y: 100 } })} 
              />
            )}
            
            {activeTab === 'shapes' && (
              <ShapeLibrary onSelect={handleShapeSelect} />
            )}
            
            {activeTab === 'charts' && (
              <div className="charts-section">
                <p className="charts-intro">
                  Selecciona un tipo de gráfico para personalizarlo con tus datos
                </p>
                <div className="charts-grid">
                  {chartTypes.map(chart => (
                    <div 
                      key={chart.type}
                      className="chart-card"
                      onClick={() => handleChartSelect(chart.type)}
                      style={{ '--chart-color': chart.color }}
                    >
                      <div className="chart-icon">
                        <span className="material-icons">{chart.icon}</span>
                      </div>
                      <div className="chart-info">
                        <span className="chart-name">{chart.name}</span>
                        <span className="chart-desc">{chart.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'templates' && (
              <div className="templates-section">
                <p className="templates-intro">
                  Plantillas prediseñadas para estructurar tu contenido
                </p>
                <div className="templates-grid">
                  {templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      className="template-card"
                      onClick={() => handleTemplateSelect(tpl)}
                      style={{ '--accent-color': tpl.color }}
                    >
                      <div className="template-icon">
                        <span className="material-icons">{tpl.icon}</span>
                      </div>
                      <div className="template-info">
                        <span className="template-name">{tpl.name}</span>
                        <span className="template-desc">{tpl.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Suspense>
        </div>

        <div className="library-footer">
          <span className="footer-hint">
            <span className="material-icons">info</span>
            Haz clic en un elemento para insertarlo en la diapositiva
          </span>
        </div>
      </div>

      {/* Chart Editor Modal */}
      {showChartEditor && (
        <Suspense fallback={<div className="loading-overlay">Cargando editor...</div>}>
          <ChartEditor
            asset={{ chartType: selectedChartType }}
            onSave={handleChartSave}
            onClose={() => {
              setShowChartEditor(false)
              setSelectedChartType(null)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}

export default AssetLibrary
