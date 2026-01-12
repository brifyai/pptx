/**
 * Hook for logging user activities in the chat
 */
import { useCallback } from 'react'

const ACTION_ICONS = {
  'navigate': 'arrow_forward',
  'edit': 'edit',
  'duplicate': 'content_copy',
  'delete': 'delete',
  'rename': 'drive_file_rename_outline',
  'reorder': 'swap_vert',
  'add': 'add_circle',
  'asset': 'image',
  'theme': 'palette',
  'upload': 'upload_file',
  'export': 'download',
  'save': 'save',
  'user_joined': 'person_add',
  'user_left': 'person_remove'
}

export function useActivityLog(setChatHistory) {
  const logActivity = useCallback((action, details = '') => {
    const icon = ACTION_ICONS[action] || 'info'
    const timestamp = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    setChatHistory(prev => [...prev, {
      role: 'system',
      type: 'activity',
      action,
      icon,
      message: details,
      timestamp
    }])
  }, [setChatHistory])

  return { logActivity }
}
