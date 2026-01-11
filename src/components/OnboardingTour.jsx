import { useState, useEffect } from 'react'
import '../styles/OnboardingTour.css'

const ONBOARDING_KEY = 'ai_presentation_onboarding_completed'

const tourSteps = [
  {
    id: 'welcome',
    title: '¡Bienvenido a AI Presentation Studio!',
    description: 'Te guiaremos paso a paso para crear presentaciones profesionales con tu template corporativo.',
    icon: 'auto_awesome',
    position: 'center'
  },
  {
    id: 'upload',
    title: '1. Sube tu Template',
    description: 'Arrastra o selecciona el archivo PPTX de tu empresa. Preservaremos todo el diseño: colores, fuentes, logos e imágenes.',
    icon: 'upload_file',
    highlight: '.upload-zone',
    position: 'bottom'
  },
  {
    id: 'library',
    title: '2. O usa la Biblioteca',
    description: 'Si ya guardaste templates antes, puedes seleccionarlos de tu biblioteca sin volver a subirlos.',
    icon: 'folder_special',
    highlight: '.open-library-btn',
    position: 'top'
  },
  {
    id: 'import',
    title: '3. Importa Contenido',
    description: 'Puedes importar contenido de ChatGPT, Claude o Gemini. Sube un PPTX o pega el texto directamente.',
    icon: 'content_paste',
    position: 'center'
  },
  {
    id: 'edit',
    title: '4. Edita con IA',
    description: 'Usa el chat para generar o modificar contenido. La IA adaptará el texto a tu template.',
    icon: 'chat',
    position: 'center'
  },
  {
    id: 'export',
    title: '5. Exporta tu Presentación',
    description: 'Descarga tu presentación en PPTX o PDF. El diseño de tu template se preservará completamente.',
    icon: 'file_download',
    position: 'center'
  },
  {
    id: 'done',
    title: '¡Listo para empezar!',
    description: 'Ahora conoces el flujo básico. Sube tu primer template para comenzar.',
    icon: 'rocket_launch',
    position: 'center'
  }
]

function OnboardingTour({ onComplete, forceShow = false }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Verificar si ya completó el onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY)
    if (!completed || forceShow) {
      setIsVisible(true)
    }
  }, [forceShow])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsVisible(false)
    onComplete?.()
  }

  if (!isVisible) return null

  const step = tourSteps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === tourSteps.length - 1

  return (
    <div className="onboarding-overlay">
      <div className={`onboarding-modal position-${step.position}`}>
        <div className="onboarding-progress">
          {tourSteps.map((_, idx) => (
            <div 
              key={idx} 
              className={`progress-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-content">
          <div className="step-icon">
            <span className="material-icons">{step.icon}</span>
          </div>
          
          <h2>{step.title}</h2>
          <p>{step.description}</p>

          {step.id === 'welcome' && (
            <div className="feature-highlights">
              <div className="feature">
                <span className="material-icons">palette</span>
                <span>Preserva diseño corporativo</span>
              </div>
              <div className="feature">
                <span className="material-icons">smart_toy</span>
                <span>Genera contenido con IA</span>
              </div>
              <div className="feature">
                <span className="material-icons">sync_alt</span>
                <span>Importa de otras IAs</span>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-actions">
          {!isFirst && (
            <button type="button" className="btn-prev" onClick={handlePrev}>
              <span className="material-icons">arrow_back</span>
              Anterior
            </button>
          )}
          
          {!isLast && (
            <button type="button" className="btn-skip" onClick={handleSkip}>
              Saltar tour
            </button>
          )}

          <button type="button" className="btn-next" onClick={handleNext}>
            {isLast ? (
              <>
                Comenzar
                <span className="material-icons">rocket_launch</span>
              </>
            ) : (
              <>
                Siguiente
                <span className="material-icons">arrow_forward</span>
              </>
            )}
          </button>
        </div>

        <div className="step-counter">
          {currentStep + 1} / {tourSteps.length}
        </div>
      </div>
    </div>
  )
}

// Hook para resetear el onboarding (útil para testing)
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(ONBOARDING_KEY)
  }
}

// Función para verificar si el onboarding está completado
export function isOnboardingCompleted() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export default OnboardingTour
