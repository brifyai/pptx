import { useEffect, useCallback } from 'react'

/**
 * Hook para manejar atajos de teclado globales
 * 
 * Atajos disponibles:
 * - Ctrl+S: Guardar
 * - Ctrl+E: Exportar
 * - Ctrl+Shift+S: Guardar en historial
 * - Ctrl+O: Abrir historial
 * - Ctrl+T: Abrir biblioteca de templates
 * - Ctrl+I: Importar contenido
 * - Flechas izq/der: Navegar slides
 * - Escape: Cerrar modales
 * - ?: Mostrar ayuda de atajos
 */
export function useKeyboardShortcuts({
  onSave,
  onExport,
  onSaveToHistory,
  onOpenHistory,
  onOpenTemplateLibrary,
  onOpenImporter,
  onPrevSlide,
  onNextSlide,
  onCloseModal,
  onShowHelp,
  enabled = true
}) {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return

    // Ignorar si está escribiendo en un input/textarea
    const target = event.target
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable

    const { key, ctrlKey, metaKey, shiftKey } = event
    const cmdOrCtrl = ctrlKey || metaKey

    // Atajos que funcionan siempre
    if (key === 'Escape') {
      onCloseModal?.()
      return
    }

    // Atajos con Ctrl/Cmd
    if (cmdOrCtrl) {
      switch (key.toLowerCase()) {
        case 's':
          event.preventDefault()
          if (shiftKey) {
            onSaveToHistory?.()
          } else {
            onSave?.()
          }
          break
        case 'e':
          event.preventDefault()
          onExport?.()
          break
        case 'o':
          event.preventDefault()
          onOpenHistory?.()
          break
        case 't':
          event.preventDefault()
          onOpenTemplateLibrary?.()
          break
        case 'i':
          event.preventDefault()
          onOpenImporter?.()
          break
      }
      return
    }

    // Atajos sin modificadores (solo si no está escribiendo)
    if (!isTyping) {
      switch (key) {
        case 'ArrowLeft':
          event.preventDefault()
          onPrevSlide?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          onNextSlide?.()
          break
        case '?':
          event.preventDefault()
          onShowHelp?.()
          break
      }
    }
  }, [
    enabled,
    onSave,
    onExport,
    onSaveToHistory,
    onOpenHistory,
    onOpenTemplateLibrary,
    onOpenImporter,
    onPrevSlide,
    onNextSlide,
    onCloseModal,
    onShowHelp
  ])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Lista de atajos para mostrar en la ayuda
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Ctrl', 'S'], description: 'Guardar presentación', category: 'general' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Guardar en historial', category: 'general' },
  { keys: ['Ctrl', 'E'], description: 'Exportar presentación', category: 'general' },
  { keys: ['Ctrl', 'O'], description: 'Abrir historial', category: 'general' },
  { keys: ['Ctrl', 'T'], description: 'Biblioteca de templates', category: 'general' },
  { keys: ['Ctrl', 'I'], description: 'Importar contenido', category: 'general' },
  { keys: ['←', '→'], description: 'Navegar entre slides', category: 'navigation' },
  { keys: ['Esc'], description: 'Cerrar modal/panel', category: 'navigation' },
  { keys: ['?'], description: 'Mostrar atajos', category: 'help' }
]

export default useKeyboardShortcuts
