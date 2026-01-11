// Firebase Configuration
// Para activar Google Auth:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un proyecto o usa uno existente
// 3. Ve a Authentication > Sign-in method > Google > Habilitar
// 4. Copia las credenciales y pégalas en tu archivo .env

import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
}

// Verificar si Firebase está configurado
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId
}

// Inicializar Firebase solo si está configurado
let app = null
let auth = null
let googleProvider = null

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
    googleProvider.addScope('email')
    googleProvider.addScope('profile')
    console.log('✅ Firebase inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error)
  }
} else {
  console.warn('⚠️ Firebase no está configurado. Usando modo demo.')
}

// Función para login con Google
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    // Modo demo si Firebase no está configurado
    console.log('🔄 Modo demo: Simulando login con Google')
    const demoUser = {
      uid: 'demo_' + Date.now(),
      email: 'demo@gmail.com',
      displayName: 'Usuario Demo',
      photoURL: null,
      isDemo: true
    }
    return demoUser
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isDemo: false
    }
  } catch (error) {
    console.error('Error en login con Google:', error)
    throw error
  }
}

// Función para registro con email/password
export const registerWithEmail = async (email, password, name) => {
  if (!auth) {
    // Modo demo
    const demoUser = {
      uid: 'demo_' + Date.now(),
      email: email,
      displayName: name,
      photoURL: null,
      isDemo: true
    }
    return demoUser
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Actualizar el perfil con el nombre
    await updateProfile(result.user, { displayName: name })
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: name,
      photoURL: null,
      isDemo: false
    }
  } catch (error) {
    console.error('Error en registro:', error)
    throw error
  }
}

// Función para login con email/password
export const loginWithEmail = async (email, password) => {
  if (!auth) {
    // Modo demo
    const demoUser = {
      uid: 'demo_' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      photoURL: null,
      isDemo: true
    }
    return demoUser
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      isDemo: false
    }
  } catch (error) {
    console.error('Error en login:', error)
    throw error
  }
}

// Función para cerrar sesión
export const logoutUser = async () => {
  if (!auth) {
    return true
  }

  try {
    await signOut(auth)
    return true
  } catch (error) {
    console.error('Error en logout:', error)
    throw error
  }
}

// Observador de estado de autenticación
export const onAuthChange = (callback) => {
  if (!auth) {
    // En modo demo, no hay observador real
    return () => {}
  }

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isDemo: false
      })
    } else {
      callback(null)
    }
  })
}

// Traducir errores de Firebase al español
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/popup-closed-by-user': 'Ventana cerrada. Intenta de nuevo',
    'auth/cancelled-popup-request': 'Operación cancelada',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
  }

  return errorMessages[errorCode] || 'Error de autenticación. Intenta de nuevo'
}

export { auth, isFirebaseConfigured }
