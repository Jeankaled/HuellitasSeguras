import { useState } from 'react'

export default function Login({ onNavigateToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Estados para manejar la conexión
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Limpiamos mensajes anteriores y activamos la carga
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Enviamos los datos a tu backend Node.js
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const datos = await respuesta.json()

      // Verificamos si el backend nos devolvió un error
      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error al iniciar sesión')
      }

      // Si todo sale bien, guardamos el JWT en el navegador
      localStorage.setItem('token', datos.token)
      setSuccess('¡Inicio de sesión exitoso! Redirigiendo...')
      
      console.log("Token guardado:", datos.token)

    } catch (err) {
      // Si el backend está apagado o hay un error
      setError(err.message === 'Failed to fetch' 
        ? 'No se pudo conectar con el servidor 😔' 
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  // Redirige a la vista de registro usando la propiedad que pasamos en App.jsx
  const handleRegisterRedirect = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister()
    } else {
      console.log("Redirigiendo a la pantalla de crear cuenta...")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4 relative overflow-hidden">
      
      {/* Iconos de fondo flotantes */}
      <div className="absolute top-12 left-12 text-6xl opacity-20 hidden md:block">🐶</div>
      <div className="absolute bottom-12 right-12 text-6xl opacity-20 hidden md:block">🐱</div>
      <div className="absolute top-24 right-24 text-5xl opacity-20 hidden md:block">🐾</div>
      
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border-4 border-white">
        
        {/* Detalle superior Plateado Brillante */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 shadow-[0_2px_10px_rgba(203,213,225,0.8)] rounded-t-[2.5rem]"></div>

        {/* Encabezado */}
        <div className="text-center mb-6 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 mb-4 border-2 border-pink-100 shadow-sm">
            <span className="text-3xl">🐾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300 mb-3 drop-shadow-sm">
            Huellitas Seguras
          </h1>
          <p className="text-sky-700 font-medium text-sm px-2">
            Encuentra hogares llenos de amor para perritos y gatitos rescatados 🏡💖
          </p>
        </div>

        {/* Mensajes de Error o Éxito Visuales */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-center text-sm font-bold animate-pulse">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-600 rounded-xl text-center text-sm font-bold">
            {success}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="relative">
            <label className="block text-sm font-extrabold text-sky-800 mb-2 ml-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full px-5 py-3.5 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-extrabold text-sky-800 mb-2 ml-1">
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-3.5 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`group relative w-full text-white font-extrabold text-lg py-4 px-4 rounded-2xl transition-all duration-300 mt-2 overflow-hidden ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-pink-300 hover:bg-pink-400 shadow-[0_8px_20px_-6px_rgba(244,114,182,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(244,114,182,0.8)] hover:-translate-y-1'}`}
          >
            {!loading && (
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-slate-100/60 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-out z-0"></div>
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Conectando con el Refugio... ⏳' : 'Iniciar Sesión 🐕🐈'}
            </span>
          </button>
          
        </form>

        <div className="mt-8 flex items-center justify-center gap-3 opacity-70">
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent to-slate-300 rounded-full"></div>
          <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Únete</span>
          <div className="h-0.5 w-full bg-gradient-to-l from-transparent to-slate-300 rounded-full"></div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-sky-700 font-medium mb-3">
            ¿Eres una fundación o quieres adoptar un peludito?
          </p>
          <button 
            onClick={handleRegisterRedirect}
            type="button"
            disabled={loading}
            className="w-full bg-white hover:bg-sky-50 text-sky-600 font-extrabold py-3.5 px-4 border-2 border-sky-200 hover:border-sky-300 rounded-2xl transition-all duration-300 shadow-sm disabled:opacity-50"
          >
            Crear nueva cuenta 🌟
          </button>
        </div>

      </div>
    </div>
  )
}