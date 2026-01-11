import { useState, lazy, Suspense } from 'react'
import '../styles/AssetLibrary.css'

const IconPicker = lazy(() => import('./assets/IconPicker'))
const ImageSearch = lazy(() => import('./assets/ImageSearch'))
const ShapeLibrary = lazy(() => import('./assets/ShapeLibrary'))

function AssetLibrary({ onInsert, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('icons')
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const tabs = [
    { id: 'icons', label: 'Iconos', icon: 'emoji_symbols' },
    { id: 'images', label: 'Imágenes', icon: 'image' },
    { id: 'shapes', label: 'Formas', icon: 'category' },
    { id: 'charts', label: 'Gráficos', icon: 'insert_chart' },
    { id: 'templates', label: 'Plantillas', icon: 'dashboard' }
  ]

  const chartTypes = [
    { type: 'bar', icon: 'bar_chart', name: 'Barras', desc: 'Comparar valores' },
    { type: 'line', icon: 'show_chart', name: 'Líneas', desc: 'Tendencias' },
    { type: 'pie', icon: 'pie_chart', name: 'Circular', desc: 'Proporciones' },
    { type: 'area', icon: 'area_chart', name: 'Área', desc: 'Volumen' },
    { type: 'scatter', icon: 'scatter_plot', name: 'Dispersión', desc: 'Correlación' },
    { type: 'radar', icon: 'radar', name: 'Radar', desc: 'Múltiples variables' }
  ]

  const templates = [
    { id: 'timeline', icon: 'timeline', name: 'Línea de tiempo', color: '#667eea' },
    { id: 'process', icon: 'account_tree', name: 'Diagrama de proceso', color: '#48bb78' },
    { id: 'comparison', icon: 'compare', name: 'Comparación', color: '#ed8936' },
    { id: 'swot', icon: 'grid_view', name: 'Análisis SWOT', color: '#e53e3e' },
    { id: 'funnel', icon: 'filter_alt', name: 'Embudo', color: '#9f7aea' },
    { id: 'pyramid', icon: 'signal_cellular_alt', name: 'Pirámide', color: '#38b2ac' }
  ]

  return (
    <div className="asset-library-overlay" onClick={onClose}>
      <div className="asset-library" onClick={e => e.stopPropagation()}>
        <div className="library-header">
          <div className="header-title">
            <span className="material-icons">collections</span>
            <h3>Biblioteca de Assets</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="library-tabs">
          {tabs.map(tab => (
            <button 
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
            <button className="clear-search" onClick={() => setSearchQuery('')}>
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
              <IconPicker query={searchQuery} onSelect={(icon) => onInsert({ type: 'icon', value: icon })} />
            )}
            
            {activeTab === 'images' && (
              <ImageSearch query={searchQuery} onSelect={(img) => onInsert({ type: 'image', ...img })} />
            )}
            
            {activeTab === 'shapes' && (
              <ShapeLibrary onSelect={(shape) => onInsert({ type: 'shape', ...shape })} />
            )}
            
            {activeTab === 'charts' && (
              <div className="charts-grid">
                {chartTypes.map(chart => (
                  <div 
                    key={chart.type}
                    className="chart-card"
                    onClick={() => onInsert({ type: 'chart', chartType: chart.type })}
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
            )}
            
            {activeTab === 'templates' && (
              <div className="templates-grid">
                {templates.map(tpl => (
                  <div 
                    key={tpl.id}
                    className="template-card"
                    onClick={() => onInsert({ type: 'template', templateId: tpl.id })}
                    style={{ '--accent-color': tpl.color }}
                  >
                    <div className="template-icon">
                      <span className="material-icons">{tpl.icon}</span>
                    </div>
                    <span className="template-name">{tpl.name}</span>
                  </div>
                ))}
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
    </div>
  )
}

export default AssetLibrary
