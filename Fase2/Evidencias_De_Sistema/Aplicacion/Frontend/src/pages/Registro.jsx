import { useState } from 'react'

export default function Registro({ onNavigateToLogin }) {
  const [nombre, setNombre] = useState('')
  const [tipoCuenta, setTipoCuenta] = useState('adoptante') // 'adoptante' o 'fundacion'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulamos el envío al backend que haremos después
    console.log("Registrando usuario:", { nombre, tipoCuenta, email, password })
    
    setTimeout(() => {
      setLoading(false)
      alert("¡Cuenta creada con éxito! (Simulación)")
      onNavigateToLogin() // Regresamos al login
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4 relative overflow-hidden">
      
      {/* Iconos de fondo flotantes */}
      <div className="absolute top-12 left-12 text-6xl opacity-20 hidden md:block">🦴</div>
      <div className="absolute bottom-12 right-12 text-6xl opacity-20 hidden md:block">🧶</div>
      <div className="absolute top-24 right-24 text-5xl opacity-20 hidden md:block">🐾</div>
      
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border-4 border-white mt-8 mb-8">
        
        {/* Detalle superior Plateado Brillante */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 shadow-[0_2px_10px_rgba(203,213,225,0.8)] rounded-t-[2.5rem]"></div>

        {/* Encabezado */}
        <div className="text-center mb-6 mt-2">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300 mb-2 drop-shadow-sm">
            Únete a la Familia
          </h1>
          <p className="text-sky-700 font-medium text-sm px-2">
            Crea tu cuenta y ayúdanos a cambiar vidas 🐶🐱
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-center text-sm font-bold animate-pulse">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Selector de Tipo de Cuenta */}
          <div className="flex gap-4 mb-2">
            <button
              type="button"
              onClick={() => setTipoCuenta('adoptante')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold text-sm transition-all ${tipoCuenta === 'adoptante' ? 'bg-pink-300 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              🙋‍♀️ Adoptante
            </button>
            <button
              type="button"
              onClick={() => setTipoCuenta('fundacion')}
              className={`flex-1 py-2 px-2 rounded-xl font-bold text-sm transition-all ${tipoCuenta === 'fundacion' ? 'bg-pink-300 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              🏡 Fundación
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
              {tipoCuenta === 'adoptante' ? 'Tu Nombre' : 'Nombre de la Fundación'}
            </label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={tipoCuenta === 'adoptante' ? 'Ej. Ana Pérez' : 'Ej. Refugio Esperanza'}
              className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`group relative w-full text-white font-extrabold text-lg py-4 px-4 rounded-2xl transition-all duration-300 mt-4 overflow-hidden ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-pink-300 hover:bg-pink-400 shadow-[0_8px_20px_-6px_rgba(244,114,182,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(244,114,182,0.8)] hover:-translate-y-1'}`}
          >
            {!loading && (
              <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-slate-100/60 to-transparent skew-x-12 group-hover:left-[200%] transition-all duration-1000 ease-out z-0"></div>
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Creando cuenta... ⏳' : 'Registrarme ✨'}
            </span>
          </button>
          
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-sky-700 font-medium mb-3">
            ¿Ya tienes una cuenta en Huellitas?
          </p>
          <button 
            onClick={onNavigateToLogin}
            type="button"
            disabled={loading}
            className="text-pink-400 hover:text-pink-500 font-extrabold transition-colors underline decoration-2 underline-offset-4"
          >
            Volver a Iniciar Sesión
          </button>
        </div>

      </div>
    </div>
  )
}