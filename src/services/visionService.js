// Servicio para analizar plantillas usando el backend Python
import { getCachedAnalysis, cacheAnalysis } from './templateCacheService'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export async function analyzeTemplate(file, skipCache = false) {
  console.log('🔗 Conectando al backend:', BACKEND_URL)
  
  // Verificar cache primero (si no se solicita saltar)
  if (!skipCache) {
    const cachedAnalysis = await getCachedAnalysis(file)
    if (cachedAnalysis) {
      console.log('⚡ Usando análisis cacheado')
      return cachedAnalysis
    }
  }
  
  try {
    // Verificar que el backend esté disponible
    const healthCheck = await fetch(`${BACKEND_URL}/health`).catch(() => null)
    
    if (!healthCheck || !healthCheck.ok) {
      console.warn('⚠️ Backend no disponible, usando análisis simulado')
      return simulatedAnalysis(file)
    }
    
    console.log('✅ Backend disponible')
    
    // Crear FormData para enviar el archivo
    const formData = new FormData()
    formData.append('file', file)
    
    console.log('📤 Enviando archivo al backend...')
    
    // Llamar al backend Python
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      body: formData
    })
    
    console.log('📥 Respuesta del backend:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error del servidor:', errorText)
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📊 Datos recibidos:', data)
    
    if (!data.success) {
      throw new Error('Error al analizar la presentación')
    }
    
    // Transformar la respuesta del backend al formato esperado por el frontend
    const transformed = transformAnalysisToFrontend(data.analysis)
    console.log('✅ Análisis transformado:', transformed)
    
    // Guardar en cache para próximas veces
    await cacheAnalysis(file, transformed)
    
    return transformed
    
  } catch (error) {
    console.error('❌ Error analyzing template:', error)
    
    // Fallback: análisis simulado si el backend no está disponible
    console.warn('⚠️ Usando análisis simulado como fallback')
    return simulatedAnalysis(file)
  }
}

function transformAnalysisToFrontend(backendAnalysis) {
  console.log('🔄 Transformando análisis del backend:', backendAnalysis)
  
  // Obtener las imágenes de slides (pueden venir como array separado o en cada slide)
  const slideImages = backendAnalysis.slideImages || []
  
  return {
    fileName: backendAnalysis.fileName,
    slideSize: backendAnalysis.slideSize,
    extractedAssets: backendAnalysis.extractedAssets,
    slideImages: slideImages,
    slides: backendAnalysis.slides.map((slide, index) => {
      console.log(`📄 Procesando slide ${slide.number}:`, slide)
      
      // El preview puede venir directamente en el slide o del array slideImages
      const preview = slide.preview || slideImages[index] || null
      
      return {
        number: slide.number,
        type: slide.type,
        layout: slide.layout,
        preview: preview, // Imagen base64 del slide original
        textAreas: (slide.textAreas || []).map(area => ({
          id: area.id,
          type: area.type,
          x: area.position ? Math.round(area.position.x / 9525) : 0,
          y: area.position ? Math.round(area.position.y / 9525) : 0,
          width: area.position ? Math.round(area.position.width / 9525) : 0,
          height: area.position ? Math.round(area.position.height / 9525) : 0,
          text: area.text,
          formatting: area.formatting
        })),
        imageAreas: (slide.imageAreas || []).map(area => ({
          id: area.id,
          x: area.position ? Math.round(area.position.x / 9525) : 0,
          y: area.position ? Math.round(area.position.y / 9525) : 0,
          width: area.position ? Math.round(area.position.width / 9525) : 0,
          height: area.position ? Math.round(area.position.height / 9525) : 0
        }))
      }
    })
  }
}

function simulatedAnalysis(file) {
  // Análisis simulado como fallback
  const slideCount = Math.floor(Math.random() * 3) + 3
  const slides = []
  
  slides.push({
    number: 1,
    type: 'title',
    textAreas: [
      { id: 'title', type: 'title', x: 100, y: 150, width: 800, height: 100 },
      { id: 'subtitle', type: 'subtitle', x: 100, y: 280, width: 800, height: 60 }
    ],
    imageAreas: []
  })
  
  for (let i = 2; i <= slideCount; i++) {
    slides.push({
      number: i,
      type: 'content',
      textAreas: [
        { id: 'heading', type: 'heading', x: 100, y: 80, width: 800, height: 60 },
        { id: 'bullets', type: 'bullets', x: 100, y: 180, width: 800, height: 300 }
      ],
      imageAreas: i % 2 === 0 ? [
        { id: 'image1', x: 600, y: 180, width: 350, height: 300 }
      ] : []
    })
  }
  
  return {
    fileName: file.name,
    slides: slides
  }
}

// Función real para usar con OpenAI GPT-4 Vision
export async function analyzeTemplateWithGPT4Vision(file, apiKey) {
  const base64 = await fileToBase64(file)
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analiza esta diapositiva de PowerPoint. Identifica y devuelve en JSON: 1) Áreas de texto (título, subtítulo, bullets) con sus coordenadas aproximadas, 2) Áreas de imágenes, 3) Tipo de diapositiva (title, content, closing). Formato: {type: string, textAreas: [{id, type, x, y, width, height}], imageAreas: [{id, x, y, width, height}]}'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
