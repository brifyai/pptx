import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'app_theme_mode'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Cargar tema guardado o detectar preferencia del sistema
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved
    
    // Detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark-theme')
      root.classList.remove('light-theme')
    } else {
      root.classList.add('light-theme')
      root.classList.remove('dark-theme')
    }
    
    // Guardar preferencia
    localStorage.setItem(THEME_KEY, theme)
    
    // Actualizar meta theme-color para móviles
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#ffffff')
    }
  }, [theme])

  // Escuchar cambios en preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem(THEME_KEY)
      // Solo cambiar si el usuario no ha elegido manualmente
      if (!savedTheme || savedTheme === 'auto') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const setLightTheme = useCallback(() => setTheme('light'), [])
  const setDarkTheme = useCallback(() => setTheme('dark'), [])

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setTheme,
    setLightTheme,
    setDarkTheme
  }
}

export default useTheme
