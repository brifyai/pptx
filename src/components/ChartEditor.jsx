import { useState, useEffect } from 'react'
import { generateWithChutes } from '../services/chutesService'
import ChartRenderer from './ChartRenderer'
import '../styles/ChartEditor.css'

const colorPresets = {
  'Corporativo': ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
  'Natural': ['#11998e', '#38ef7d', '#56ab2f', '#a8e063', '#134e5e', '#71b280'],
  'Cálido': ['#ee0979', '#ff6a00', '#f7971e', '#ffd200', '#fc4a1a', '#f7b733'],
  'Frío': ['#2193b0', '#6dd5ed', '#00c6ff', '#0072ff', '#4776e6', '#8e54e9'],
  'Profesional': ['#2c3e50', '#3498db', '#1abc9c', '#9b59b6', '#e74c3c', '#f39c12']
}

const chartTypeOptions = [
  { id: 'bar', name: 'Barras', icon: 'bar_chart' },
  { id: 'line', name: 'Líneas', icon: 'show_chart' },
  { id: 'pie', name: 'Circular', icon: 'pie_chart' },
  { id: 'doughnut', name: 'Dona', icon: 'donut_large' },
  { id: 'area', name: 'Área', icon: 'area_chart' },
  { id: 'radar', name: 'Radar', icon: 'radar' }
]

function ChartEditor({ asset, onSave, onClose }) {
  const [chartType, setChartType] = useState(asset.chartType || 'bar')
  const [title, setTitle] = useState(asset.customData?.datasets?.[0]?.label || 'Datos')
  const [dataRows, setDataRows] = useState(() => {
    if (asset.customData?.labels) {
      return asset.customData.labels.map((label, i) => ({
        label,
        value: asset.customData.datasets[0].data[i] || 0
      }))
    }
    return [
      { label: 'Ene', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Abr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 95 }
    ]
  })
  const [colorScheme, setColorScheme] = useState('Corporativo')
  const [showLegend, setShowLegend] = useState(true)
  const [showValues, setShowValues] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const addRow = () => {
    setDataRows([...dataRows, { label: `Item ${dataRows.length + 1}`, value: 50 }])
  }

  const removeRow = (index) => {
    if (dataRows.length > 2) {
      setDataRows(dataRows.filter((_, i) => i !== index))
    }
  }

  const updateRow = (index, field, value) => {
    const newRows = [...dataRows]
    newRows[index][field] = field === 'value' ? parseFloat(value) || 0 : value
    setDataRows(newRows)
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    
    setGenerating(true)
    try {
      const prompt = `Genera datos para un gráfico sobre: "${aiPrompt}". 
      Responde SOLO con un JSON válido en este formato exacto, sin explicaciones:
      {"title": "Título del gráfico", "data": [{"label": "Etiqueta1", "value": 100}, {"label": "Etiqueta2", "value": 80}]}
      Genera entre 4 y 8 items con valores numéricos realistas.`
      
      const response = await generateWithChutes(prompt)
      
      // Extraer JSON de la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.title) setTitle(parsed.title)
        if (parsed.data && Array.isArray(parsed.data)) {
          setDataRows(parsed.data)
        }
      }
    } catch (error) {
      console.error('Error generando con IA:', error)
      alert('Error al generar datos. Intenta de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  const generateRandomData = () => {
    const categories = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const count = Math.floor(Math.random() * 5) + 4 // 4-8 items
    const newRows = categories.slice(0, count).map(label => ({
      label,
      value: Math.floor(Math.random() * 100) + 20
    }))
    setDataRows(newRows)
  }

  const handleSave = () => {
    const colors = colorPresets[colorScheme]
    const newData = {
      labels: dataRows.map(r => r.label),
      datasets: [{
        label: title,
        data: dataRows.map(r => r.value),
        backgroundColor: colors.map(c => c + 'cc'),
        borderColor: colors,
        borderWidth: 2,
        fill: chartType === 'area' || chartType === 'line',
        tension: 0.4
      }]
    }
    onSave({ ...newData, chartType, showLegend, showValues })
  }

  // Preview data
  const previewData = {
    labels: dataRows.map(r => r.label),
    datasets: [{
      label: title,
      data: dataRows.map(r => r.value),
      backgroundColor: colorPresets[colorScheme].map(c => c + 'cc'),
      borderColor: colorPresets[colorScheme],
      borderWidth: 2,
      fill: chartType === 'area' || chartType === 'line',
      tension: 0.4
    }]
  }

  return (
    <div className="chart-editor-overlay" onClick={onClose}>
      <div className="chart-editor-pro" onClick={e => e.stopPropagation()}>
        <div className="editor-header">
          <h3>
            <span className="material-icons">insert_chart</span>
            Editor de Gráfico
          </h3>
          <button type="button" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="editor-layout">
          {/* Panel izquierdo - Configuración */}
          <div className="editor-config">
            {/* Generación con IA */}
            <div className="config-section ai-section">
              <h4>
                <span className="material-icons">auto_awesome</span>
                Generar con IA
              </h4>
              <div className="ai-input-group">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Ej: Ventas trimestrales de una startup tech"
                  onKeyPress={e => e.key === 'Enter' && generateWithAI()}
                />
                <button 
                  type="button"
                  onClick={generateWithAI} 
                  disabled={generating || !aiPrompt.trim()}
                  className="ai-btn"
                >
                  {generating ? (
                    <span className="spinner-small"></span>
                  ) : (
                    <span className="material-icons">bolt</span>
                  )}
                </button>
              </div>
              <button type="button" className="random-btn" onClick={generateRandomData}>
                <span className="material-icons">casino</span>
                Datos aleatorios
              </button>
            </div>

            {/* Tipo de gráfico */}
            <div className="config-section">
              <h4>Tipo de gráfico</h4>
              <div className="chart-type-grid">
                {chartTypeOptions.map(type => (
                  <button
                    type="button"
                    key={type.id}
                    className={chartType === type.id ? 'active' : ''}
                    onClick={() => setChartType(type.id)}
                  >
                    <span className="material-icons">{type.icon}</span>
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div className="config-section">
              <h4>Título</h4>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título del gráfico"
              />
            </div>

            {/* Colores */}
            <div className="config-section">
              <h4>Esquema de colores</h4>
              <div className="color-schemes">
                {Object.entries(colorPresets).map(([name, colors]) => (
                  <button
                    type="button"
                    key={name}
                    className={`color-scheme ${colorScheme === name ? 'active' : ''}`}
                    onClick={() => setColorScheme(name)}
                  >
                    <div className="color-preview">
                      {colors.slice(0, 4).map((c, i) => (
                        <span key={i} style={{ background: c }}></span>
                      ))}
                    </div>
                    <span className="scheme-name">{name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones */}
            <div className="config-section">
              <h4>Opciones</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={e => setShowLegend(e.target.checked)}
                />
                <span>Mostrar leyenda</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showValues}
                  onChange={e => setShowValues(e.target.checked)}
                />
                <span>Mostrar valores</span>
              </label>
            </div>
          </div>

          {/* Panel derecho - Datos y Preview */}
          <div className="editor-data">
            {/* Tabla de datos */}
            <div className="data-section">
              <div className="data-header">
                <h4>Datos</h4>
                <button type="button" onClick={addRow} className="add-row-btn">
                  <span className="material-icons">add</span>
                  Agregar
                </button>
              </div>
              <div className="data-table">
                <div className="table-header">
                  <span>Etiqueta</span>
                  <span>Valor</span>
                  <span></span>
                </div>
                {dataRows.map((row, index) => (
                  <div key={index} className="table-row">
                    <input
                      type="text"
                      value={row.label}
                      onChange={e => updateRow(index, 'label', e.target.value)}
                    />
                    <input
                      type="number"
                      value={row.value}
                      onChange={e => updateRow(index, 'value', e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={dataRows.length <= 2}
                      className="remove-row-btn"
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="preview-section">
              <h4>Vista previa</h4>
              <div className="chart-preview">
                <ChartRenderer 
                  chartType={chartType} 
                  data={previewData}
                  width={350} 
                  height={220} 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="editor-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            <span className="material-icons">check</span>
            Aplicar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChartEditor
