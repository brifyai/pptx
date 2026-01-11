import { useState } from 'react'
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail,
  getFirebaseErrorMessage,
  isFirebaseConfigured 
} from '../services/firebaseConfig'
import '../styles/Auth.css'

function Auth({ mode, onAuth, onBack }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  const isLogin = mode === 'login'

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      let userData
      
      if (isLogin) {
        userData = await loginWithEmail(formData.email, formData.password)
      } else {
        userData = await registerWithEmail(formData.email, formData.password, formData.name)
      }

      // Guardar usuario en localStorage
      const user = {
        uid: userData.uid,
        email: userData.email,
        name: userData.displayName || formData.name || formData.email.split('@')[0],
        photoURL: userData.photoURL,
        plan: 'free',
        createdAt: Date.now(),
        isDemo: userData.isDemo
      }
      localStorage.setItem('user', JSON.stringify(user))
      onAuth(user)
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code)
      setErrors({ general: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleGoogleAuth = async () => {
    setSocialLoading('google')
    setErrors({})

    try {
      const userData = await signInWithGoogle()
      
      const user = {
        uid: userData.uid,
        email: userData.email,
        name: userData.displayName || userData.email.split('@')[0],
        photoURL: userData.photoURL,
        plan: 'free',
        createdAt: Date.now(),
        isDemo: userData.isDemo
      }
      localStorage.setItem('user', JSON.stringify(user))
      onAuth(user)
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error.code)
      setErrors({ general: errorMessage })
    } finally {
      setSocialLoading(null)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
      </div>

      <div className="auth-content">
        <div className="auth-box">
          <button className="back-button" onClick={onBack}>
            <span className="material-icons">arrow_back</span>
          </button>

          <div className="auth-header">
            <h1>{isLogin ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}</h1>
            <p>
              {isLogin 
                ? 'Ingresa tus credenciales para continuar' 
                : 'Comienza gratis, sin tarjeta de crédito'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="error-banner">
                <span className="material-icons">error</span>
                {errors.general}
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Nombre Completo</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Juan Pérez"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="tu@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            {isLogin && (
              <div className="form-extras">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Recordarme</span>
                </label>
                <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Procesando...
                </>
              ) : (
                <>
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  <span className="material-icons">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>o continúa con</span>
          </div>

          <div className="social-auth">
            <button 
              type="button"
              className="social-btn google" 
              onClick={handleGoogleAuth}
              disabled={socialLoading === 'google'}
            >
              {socialLoading === 'google' ? (
                <span className="spinner-small"></span>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {socialLoading === 'google' ? 'Conectando...' : 'Continuar con Google'}
            </button>
          </div>

          {!isFirebaseConfigured() && (
            <div className="demo-notice">
              <span className="material-icons">info</span>
              <span>Modo demo activo. Configura Firebase para autenticación real.</span>
            </div>
          )}

          <div className="auth-footer">
            {isLogin ? (
              <p>
                ¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Regístrate gratis</a>
              </p>
            ) : (
              <p>
                ¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Inicia sesión</a>
              </p>
            )}
          </div>
        </div>

        <div className="auth-features">
          <h3>Tu marca, tu identidad, nuestra IA</h3>
          <p>La única herramienta que respeta tu diseño corporativo al 100%</p>
          
          <div className="feature-item">
            <div className="icon-wrapper">
              <span className="material-icons">bolt</span>
            </div>
            <div>
              <h4>10x Más Rápido</h4>
              <p>Crea presentaciones profesionales en minutos, no horas</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="icon-wrapper">
              <span className="material-icons">palette</span>
            </div>
            <div>
              <h4>100% Tu Diseño</h4>
              <p>Preservamos logos, colores, fuentes y animaciones intactos</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="icon-wrapper">
              <span className="material-icons">security</span>
            </div>
            <div>
              <h4>Datos Seguros</h4>
              <p>Procesamiento seguro, tu contenido bajo tu control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
