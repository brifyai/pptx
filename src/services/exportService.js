// Servicio para exportar presentaciones usando el backend Python

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Exportar a PowerPoint (.pptx)
export async function exportToPowerPoint(slides, templateFile = null) {
  try {
    console.log('📤 Exportando PPTX...')
    console.log('📤 Slides:', slides.length)
    console.log('📤 Template file:', templateFile)
    console.log('📤 Template file type:', templateFile ? templateFile.constructor.name : 'null')
    console.log('📤 Template file name:', templateFile?.name)
    
    // Si hay template, usar clonación completa en el backend
    if (templateFile) {
      console.log('📤 Usando clonación con template')
      console.log('📤 Contenido de slides:', JSON.stringify(slides.map(s => ({
        type: s.type,
        content: s.content
      })), null, 2))
      
      const formData = new FormData()
      formData.append('template', templateFile)
      formData.append('data', JSON.stringify({ slides }))
      
      console.log('📤 FormData preparado, enviando a backend...')
      
      const response = await fetch(`${BACKEND_URL}/api/export/pptx`, {
        method: 'POST',
        body: formData
      })
      
      console.log('📤 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('📤 Error response:', errorText)
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const blob = await response.blob()
      console.log('📤 Blob recibido, tamaño:', blob.size)
      downloadBlob(blob, 'presentacion.pptx')
      return
    }
    
    console.log('📤 Sin template, usando exportación básica')
    
    // Sin template, usar endpoint JSON simple
    const response = await fetch(`${BACKEND_URL}/api/export/pptx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides })
    })
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const blob = await response.blob()
    downloadBlob(blob, 'presentacion.pptx')
    
  } catch (error) {
    console.error('📤 Error en exportación:', error)
    console.warn('⚠️ Backend no disponible, usando exportación local')
    await exportPptxLocal(slides)
  }
}

// Exportar localmente con PptxGenJS
async function exportPptxLocal(slides) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  
  pptx.layout = 'LAYOUT_16x9'
  pptx.title = 'Presentación AI Studio'
  
  slides.forEach((slide, index) => {
    const pptSlide = pptx.addSlide()
    
    if (slide.type === 'title') {
      // Slide de título
      pptSlide.addText(slide.content?.title || `Slide ${index + 1}`, {
        x: 0.5,
        y: 2,
        w: '90%',
        h: 1.5,
        fontSize: 44,
        bold: true,
        align: 'center',
        color: '363636'
      })
      
      if (slide.content?.subtitle) {
        pptSlide.addText(slide.content.subtitle, {
          x: 0.5,
          y: 3.5,
          w: '90%',
          h: 1,
          fontSize: 24,
          align: 'center',
          color: '666666'
        })
      }
    } else {
      // Slide de contenido
      if (slide.content?.heading) {
        pptSlide.addText(slide.content.heading, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 0.8,
          fontSize: 32,
          bold: true,
          color: '363636'
        })
      }
      
      if (slide.content?.bullets && slide.content.bullets.length > 0) {
        const bulletText = slide.content.bullets
          .filter(b => b && b.trim())
          .map(b => ({ text: b, options: { bullet: true } }))
        
        if (bulletText.length > 0) {
          pptSlide.addText(bulletText, {
            x: 0.5,
            y: 1.5,
            w: '90%',
            h: 4,
            fontSize: 18,
            color: '444444',
            valign: 'top'
          })
        }
      }
    }
  })
  
  const blob = await pptx.write('blob')
  downloadBlob(blob, 'presentacion.pptx')
}

// Exportar a PDF
export async function exportToPDF(slides, templateFile = null) {
  try {
    console.log('📄 Exportando PDF...')
    console.log('📄 Slides con preview:', slides.filter(s => s.preview).length)
    
    // Siempre enviar como FormData para soportar archivos grandes
    const formData = new FormData()
    
    if (templateFile) {
      formData.append('template', templateFile)
    }
    
    // Incluir los slides con sus previews
    formData.append('data', JSON.stringify({ slides }))
    
    const response = await fetch(`${BACKEND_URL}/api/export/pdf`, {
      method: 'POST',
      body: formData
    })
    
    console.log('📄 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('📄 Error:', errorText)
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const blob = await response.blob()
    console.log('📄 PDF recibido, tamaño:', blob.size)
    downloadBlob(blob, 'presentacion.pdf')
    
  } catch (error) {
    console.error('📄 Error exportando PDF:', error)
    alert('Error al exportar PDF: ' + error.message)
  }
}

// Exportar a Google Slides (abre en nueva pestaña)
export async function exportToGoogleSlides(slides, templateFile = null) {
  console.log('🔵 Exportando a Google Slides...')
  
  // Primero exportamos a PPTX
  await exportToPowerPoint(slides, templateFile)
  
  // Mostrar instrucciones y abrir Google Slides
  const instructions = `
📤 Archivo PPTX descargado correctamente.

Para importar a Google Slides:
1. Se abrirá Google Slides en una nueva pestaña
2. Ve a Archivo > Importar diapositivas
3. Selecciona el archivo .pptx descargado
4. Elige las diapositivas a importar

¿Deseas abrir Google Slides ahora?
  `.trim()
  
  if (confirm(instructions)) {
    window.open('https://docs.google.com/presentation/u/0/create', '_blank')
  }
}

// Exportar a Figma (genera JSON compatible con plugins)
export async function exportToFigma(slides) {
  console.log('🎨 Exportando a Figma...')
  
  // Crear estructura compatible con plugins de Figma
  const figmaData = {
    name: 'Presentación AI Studio',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    canvas: {
      width: 1920,
      height: 1080
    },
    slides: slides.map((slide, index) => ({
      id: `slide_${index + 1}`,
      name: slide.name || `Slide ${index + 1}`,
      type: slide.type,
      order: index,
      content: {
        title: slide.content?.title || slide.content?.heading || '',
        subtitle: slide.content?.subtitle || '',
        bullets: slide.content?.bullets || [],
        body: slide.content?.body || ''
      },
      layout: {
        width: 1920,
        height: 1080,
        background: '#ffffff'
      },
      elements: generateFigmaElements(slide)
    }))
  }
  
  const blob = new Blob([JSON.stringify(figmaData, null, 2)], { type: 'application/json' })
  downloadBlob(blob, 'presentacion-figma.json')
  
  // Mostrar instrucciones
  const instructions = `
🎨 Archivo JSON exportado correctamente.

Para importar en Figma:
1. Instala un plugin como "JSON to Figma" o "Content Reel"
2. Abre Figma y crea un nuevo archivo
3. Ejecuta el plugin y carga el archivo JSON
4. El plugin creará los frames con el contenido

Plugins recomendados:
• JSON to Figma (gratuito)
• Figma to JSON (bidireccional)
• Content Reel (para contenido dinámico)
  `.trim()
  
  alert(instructions)
}

// Generar elementos de Figma a partir del slide
function generateFigmaElements(slide) {
  const elements = []
  
  // Título
  if (slide.content?.title || slide.content?.heading) {
    elements.push({
      type: 'TEXT',
      name: 'Title',
      x: 100,
      y: slide.type === 'title' ? 400 : 80,
      width: 1720,
      height: 100,
      text: slide.content?.title || slide.content?.heading,
      style: {
        fontSize: slide.type === 'title' ? 72 : 48,
        fontWeight: 'bold',
        textAlign: slide.type === 'title' ? 'center' : 'left',
        color: '#1a1a2e'
      }
    })
  }
  
  // Subtítulo
  if (slide.content?.subtitle) {
    elements.push({
      type: 'TEXT',
      name: 'Subtitle',
      x: 100,
      y: 520,
      width: 1720,
      height: 60,
      text: slide.content.subtitle,
      style: {
        fontSize: 32,
        fontWeight: 'normal',
        textAlign: 'center',
        color: '#4b5563'
      }
    })
  }
  
  // Bullets
  if (slide.content?.bullets && slide.content.bullets.length > 0) {
    elements.push({
      type: 'TEXT',
      name: 'Bullets',
      x: 100,
      y: 200,
      width: 1720,
      height: 600,
      text: slide.content.bullets.map(b => `• ${b}`).join('\n'),
      style: {
        fontSize: 24,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#374151',
        lineHeight: 1.8
      }
    })
  }
  
  return elements
}

// Exportar como imágenes PNG
export async function exportToImages(slides) {
  // Si hay previews, descargarlas
  const hasPreview = slides.some(s => s.preview)
  
  if (hasPreview) {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      if (slide.preview) {
        // Convertir base64 a blob
        const response = await fetch(slide.preview)
        const blob = await response.blob()
        downloadBlob(blob, `slide-${i + 1}.png`)
        
        // Pequeña pausa entre descargas
        await new Promise(r => setTimeout(r, 300))
      }
    }
  } else {
    alert('No hay imágenes de preview disponibles. Sube una plantilla primero.')
  }
}

// Utilidad para descargar blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Función legacy para compatibilidad
export async function exportPresentation(templateFile, analysis, generatedContent) {
  try {
    const formData = new FormData()
    formData.append('file', templateFile)
    formData.append('content', JSON.stringify(generatedContent))
    
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    return url
    
  } catch (error) {
    console.error('Error exporting presentation:', error)
    console.warn('⚠️ Backend no disponible, usando exportación básica')
    return exportWithPptxGenJS(templateFile, analysis, generatedContent)
  }
}

async function exportWithPptxGenJS(templateFile, analysis, generatedContent) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  
  generatedContent.slides.forEach((slideContent, index) => {
    const slideAnalysis = analysis.slides[index]
    const slide = pptx.addSlide()
    
    slideAnalysis.textAreas.forEach(area => {
      const content = getContentForArea(area, slideContent.content)
      
      if (content) {
        slide.addText(content, {
          x: area.x / 100,
          y: area.y / 100,
          w: area.width / 100,
          h: area.height / 100,
          fontSize: getFontSizeForType(area.type),
          bold: area.type === 'title' || area.type === 'heading',
          align: area.type === 'title' ? 'center' : 'left',
          color: '363636'
        })
      }
    })
  })
  
  const blob = await pptx.write('blob')
  const url = URL.createObjectURL(blob)
  
  return url
}

function getContentForArea(area, slideContent) {
  switch(area.type) {
    case 'title':
      return slideContent.title || ''
    case 'subtitle':
      return slideContent.subtitle || ''
    case 'heading':
      return slideContent.heading || ''
    case 'bullets':
      return slideContent.bullets ? slideContent.bullets.join('\n• ') : ''
    default:
      return ''
  }
}

function getFontSizeForType(type) {
  const sizes = {
    title: 44,
    subtitle: 28,
    heading: 32,
    bullets: 18,
    body: 16
  }
  return sizes[type] || 16
}

export async function exportWithOriginalStyles(templateFile, analysis, generatedContent) {
  return exportPresentation(templateFile, analysis, generatedContent)
}
