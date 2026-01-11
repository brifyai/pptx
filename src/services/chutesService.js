// Servicio dedicado para interactuar con Chutes AI API

const CHUTES_API_KEY = import.meta.env.VITE_CHUTES_API_KEY
const CHUTES_MODEL = import.meta.env.VITE_CHUTES_MODEL || 'MiniMaxAI/MiniMax-M2.1-TEE'
const CHUTES_API_URL = import.meta.env.VITE_CHUTES_API_URL || 'https://llm.chutes.ai/v1'

/**
 * Función genérica para hacer llamadas a Chutes AI
 */
export async function callChutesAI(messages, options = {}) {
  const {
    temperature = 0.7,
    maxTokens = 2000,
    systemPrompt = null
  } = options

  const requestMessages = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages

  console.log('🔄 Llamando a Chutes AI...')
  console.log('📝 Modelo:', CHUTES_MODEL)
  console.log('🌐 URL:', `${CHUTES_API_URL}/chat/completions`)
  console.log('📨 Mensajes:', requestMessages)

  try {
    const response = await fetch(`${CHUTES_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHUTES_API_KEY}`
      },
      body: JSON.stringify({
        model: CHUTES_MODEL,
        messages: requestMessages,
        temperature,
        max_tokens: maxTokens
      })
    })

    console.log('📥 Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Error data:', errorData)
      throw new Error(`Chutes AI API Error: ${response.status} - ${errorData.error?.message || errorData.detail || response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Response data:', data)
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error calling Chutes AI:', error)
    throw error
  }
}

/**
 * Verificar que la API key está configurada
 */
export function isChutesConfigured() {
  return !!CHUTES_API_KEY && CHUTES_API_KEY !== 'your_api_key_here'
}

/**
 * Obtener información de configuración
 */
export function getChutesConfig() {
  return {
    apiKey: CHUTES_API_KEY ? '***' + CHUTES_API_KEY.slice(-8) : 'Not configured',
    model: CHUTES_MODEL,
    apiUrl: CHUTES_API_URL,
    isConfigured: isChutesConfigured()
  }
}


/**
 * Función simplificada para generar contenido con Chutes AI
 */
export async function generateWithChutes(prompt, systemPrompt = 'Eres un asistente útil que genera datos precisos.') {
  const messages = [{ role: 'user', content: prompt }]
  return await callChutesAI(messages, { systemPrompt })
}
