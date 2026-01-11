#!/usr/bin/env node

/**
 * Script de verificación de integración
 * Verifica que todos los componentes estén correctamente configurados
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 Verificando integración de AI Presentation Studio...\n')

let errors = 0
let warnings = 0

// 1. Verificar archivo .env
console.log('📋 Verificando configuración...')
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ Archivo .env no encontrado')
  console.log('   → Copia .env.example a .env y configura tus API keys')
  errors++
} else {
  console.log('✅ Archivo .env encontrado')
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  
  // Verificar Chutes AI
  if (!envContent.includes('VITE_CHUTES_API_KEY=') || envContent.includes('tu_chutes_api_key_aqui')) {
    console.log('⚠️  VITE_CHUTES_API_KEY no configurado')
    warnings++
  } else {
    console.log('✅ Chutes AI configurado')
  }
  
  // Verificar Backend URL
  if (!envContent.includes('VITE_BACKEND_URL=')) {
    console.log('⚠️  VITE_BACKEND_URL no configurado')
    warnings++
  } else {
    console.log('✅ Backend URL configurado')
  }
  
  // Verificar Gemini (opcional)
  if (!envContent.includes('VITE_GEMINI_API_KEY=') || envContent.includes('tu_gemini_api_key_aqui')) {
    console.log('ℹ️  Gemini Vision no configurado (opcional)')
  } else {
    console.log('✅ Gemini Vision configurado')
  }
}

// 2. Verificar dependencias del frontend
console.log('\n📦 Verificando dependencias del frontend...')
const packageJsonPath = path.join(__dirname, 'package.json')
const nodeModulesPath = path.join(__dirname, 'node_modules')

if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ package.json no encontrado')
  errors++
} else {
  console.log('✅ package.json encontrado')
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules no encontrado')
    console.log('   → Ejecuta: npm install')
    errors++
  } else {
    console.log('✅ node_modules encontrado')
  }
}

// 3. Verificar backend
console.log('\n🐍 Verificando backend Python...')
const backendPath = path.join(__dirname, 'backend')
const requirementsPath = path.join(backendPath, 'requirements.txt')
const mainPyPath = path.join(backendPath, 'main.py')

if (!fs.existsSync(backendPath)) {
  console.log('❌ Carpeta backend no encontrada')
  errors++
} else {
  console.log('✅ Carpeta backend encontrada')
  
  if (!fs.existsSync(requirementsPath)) {
    console.log('❌ requirements.txt no encontrado')
    errors++
  } else {
    console.log('✅ requirements.txt encontrado')
  }
  
  if (!fs.existsSync(mainPyPath)) {
    console.log('❌ main.py no encontrado')
    errors++
  } else {
    console.log('✅ main.py encontrado')
  }
}

// 4. Verificar estructura de archivos críticos
console.log('\n📁 Verificando estructura de archivos...')
const criticalFiles = [
  'src/App.jsx',
  'src/services/aiService.js',
  'src/services/visionService.js',
  'src/services/exportService.js',
  'src/services/chutesService.js',
  'src/components/SlideViewer.jsx',
  'src/components/ChatPanel.jsx',
  'backend/pptx_analyzer.py',
  'backend/pptx_generator.py',
  'backend/database.py'
]

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} no encontrado`)
    errors++
  }
})

if (errors === 0) {
  console.log('✅ Todos los archivos críticos encontrados')
}

// 5. Verificar conectividad del backend (si está corriendo)
console.log('\n🌐 Verificando conectividad del backend...')
console.log('ℹ️  Para verificar el backend, asegúrate de que esté corriendo:')
console.log('   cd backend && python main.py')
console.log('   Luego prueba: curl http://localhost:8000/health')

// Resumen
console.log('\n' + '='.repeat(50))
console.log('📊 RESUMEN DE VERIFICACIÓN')
console.log('='.repeat(50))

if (errors === 0 && warnings === 0) {
  console.log('✅ ¡Todo está correctamente configurado!')
  console.log('\n🚀 Próximos pasos:')
  console.log('   1. Inicia el backend: cd backend && python main.py')
  console.log('   2. Inicia el frontend: npm run dev')
  console.log('   3. Abre http://localhost:5173')
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} error(es) encontrado(s)`)
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} advertencia(s) encontrada(s)`)
  }
  console.log('\n📖 Consulta INTEGRATION-GUIDE.md para más detalles')
}

console.log('='.repeat(50))

process.exit(errors > 0 ? 1 : 0)
