import { useState, useEffect } from 'react'

/**
 * Hook para detectar si estamos en mobile
 * @param {number} breakpoint - Ancho máximo para considerar mobile (default: 768px)
 * @returns {boolean} - true si es mobile
 */
export function useMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= breakpoint)
    }

    // Check inicial
    checkMobile()

    // Listener para cambios de tamaño
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}

/**
 * Hook para detectar orientación del dispositivo
 * @returns {string} - 'portrait' o 'landscape'
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState('portrait')

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  return orientation
}

/**
 * Hook para detectar tipo de dispositivo
 * @returns {object} - { isMobile, isTablet, isDesktop }
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  })

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      setDeviceType({
        isMobile: width <= 480,
        isTablet: width > 480 && width <= 1024,
        isDesktop: width > 1024
      })
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  return deviceType
}
