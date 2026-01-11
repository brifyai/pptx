import { useState, useEffect } from 'react'

// Lazy loaded: Solo se carga si el usuario activa comandos de voz
function VoiceCommands({ onCommand, isActive }) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if (!isActive) return

    // Cargar Web Speech API solo cuando se activa
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Voice commands not supported')
      return
    }

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = true
    recognitionInstance.lang = 'es-ES'
    recognitionInstance.interimResults = false

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      processCommand(transcript)
    }

    setRecognition(recognitionInstance)

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop()
      }
    }
  }, [isActive])

  const processCommand = (transcript) => {
    const command = transcript.toLowerCase()
    
    // Comandos de navegación
    if (command.includes('siguiente') || command.includes('próxima')) {
      onCommand({ type: 'navigate', direction: 'next' })
    } else if (command.includes('anterior') || command.includes('atrás')) {
      onCommand({ type: 'navigate', direction: 'prev' })
    }
    
    // Comandos de edición
    else if (command.includes('cambiar título')) {
      const match = command.match(/cambiar título a (.+)/)
      if (match) {
        onCommand({ type: 'edit', field: 'title', value: match[1] })
      }
    }
    
    // Comandos de diapositiva específica
    else if (command.includes('ir a diapositiva')) {
      const match = command.match(/ir a diapositiva (\d+)/)
      if (match) {
        onCommand({ type: 'goto', slide: parseInt(match[1]) - 1 })
      }
    }
  }

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  if (!isActive) return null

  return (
    <button 
      className={`voice-btn ${isListening ? 'listening' : ''}`}
      onClick={toggleListening}
      title="Comandos de voz"
    >
      <span className="material-icons">
        {isListening ? 'mic' : 'mic_none'}
      </span>
      {isListening ? 'Escuchando...' : 'Activar voz'}
    </button>
  )
}

export default VoiceCommands
