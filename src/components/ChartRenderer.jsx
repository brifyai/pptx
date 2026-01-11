import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
)

const defaultColors = [
  'rgba(102, 126, 234, 0.8)',
  'rgba(118, 75, 162, 0.8)',
  'rgba(237, 137, 54, 0.8)',
  'rgba(72, 187, 120, 0.8)',
  'rgba(229, 62, 62, 0.8)',
  'rgba(56, 178, 172, 0.8)'
]

const defaultBorderColors = [
  'rgba(102, 126, 234, 1)',
  'rgba(118, 75, 162, 1)',
  'rgba(237, 137, 54, 1)',
  'rgba(72, 187, 120, 1)',
  'rgba(229, 62, 62, 1)',
  'rgba(56, 178, 172, 1)'
]

// Datos de ejemplo para cada tipo de gráfico
const sampleData = {
  bar: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Ventas 2024',
      data: [65, 59, 80, 81, 56, 95],
      backgroundColor: defaultColors,
      borderColor: defaultBorderColors,
      borderWidth: 2
    }]
  },
  line: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Crecimiento',
      data: [30, 45, 42, 60, 75, 90],
      borderColor: 'rgba(102, 126, 234, 1)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4
    }]
  },
  pie: {
    labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
    datasets: [{
      data: [35, 25, 22, 18],
      backgroundColor: defaultColors,
      borderColor: '#fff',
      borderWidth: 2
    }]
  },
  area: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Ingresos',
      data: [40, 55, 45, 70, 65, 85],
      borderColor: 'rgba(72, 187, 120, 1)',
      backgroundColor: 'rgba(72, 187, 120, 0.3)',
      fill: true,
      tension: 0.4
    }]
  },
  scatter: {
    datasets: [{
      label: 'Correlación',
      data: [
        { x: 10, y: 20 }, { x: 15, y: 25 }, { x: 20, y: 30 },
        { x: 25, y: 28 }, { x: 30, y: 35 }, { x: 35, y: 40 }
      ],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      pointRadius: 8
    }]
  },
  radar: {
    labels: ['Ventas', 'Marketing', 'Desarrollo', 'Soporte', 'Diseño', 'Admin'],
    datasets: [{
      label: 'Equipo A',
      data: [85, 70, 90, 75, 80, 65],
      backgroundColor: 'rgba(102, 126, 234, 0.3)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2
    }]
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true
      }
    }
  }
}

function ChartRenderer({ chartType, data, width = 400, height = 300 }) {
  const chartData = data || sampleData[chartType] || sampleData.bar
  
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />
      case 'line':
        return <Line data={chartData} options={chartOptions} />
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />
      case 'area':
        return <Line data={chartData} options={chartOptions} />
      case 'scatter':
        return <Line data={chartData} options={{ ...chartOptions, showLine: false }} />
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />
      case 'polar':
        return <PolarArea data={chartData} options={chartOptions} />
      default:
        return <Bar data={chartData} options={chartOptions} />
    }
  }

  return (
    <div className="chart-container" style={{ width, height }}>
      {renderChart()}
    </div>
  )
}

export default ChartRenderer
