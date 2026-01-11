import { useState, useEffect, createContext, useContext } from 'react'

// Contexto del router
const RouterContext = createContext()

// Hook para usar el router
export function useRouter() {
  return useContext(RouterContext)
}

// Componente Router
export function Router({ children }) {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (newPath) => {
    window.history.pushState({}, '', newPath)
    setPath(newPath)
  }

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

// Componente Route
export function Route({ path, children }) {
  const { path: currentPath } = useRouter()
  
  if (currentPath === path) {
    return children
  }
  
  return null
}
