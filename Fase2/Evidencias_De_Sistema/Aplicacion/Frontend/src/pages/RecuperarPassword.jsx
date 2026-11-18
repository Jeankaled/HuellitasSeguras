import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      // Ajusta la ruta de la API según cómo lo tengas en tu backend
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/recuperar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Hubo un error al intentar enviar el correo.');
      }

      // Por seguridad, siempre mostramos un mensaje de éxito genérico
      setMensaje('Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.');
      setEmail('');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4 relative overflow-hidden">
      
      {/* Botón Volver a la página principal */}
      <button 
        onClick={() => navigate('/')} 
        className="group absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-1.5 md:gap-2 bg-white/90 backdrop-blur-md px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg border-2 border-white hover:border-pink-200 transition-all duration-300 text-sky-700 font-extrabold text-xs md:text-base hover:text-pink-500 hover:-translate-y-1"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:-translate-x-1"
        >
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        <span className="hidden sm:inline">Volver al Inicio</span>
        <span className="sm:hidden">Volver</span>
      </button>

      {/* Elementos decorativos de fondo */}
      <div className="absolute top-12 right-12 text-6xl opacity-20 hidden md:block animate-pulse">🔑</div>
      <div className="absolute bottom-12 left-12 text-6xl opacity-20 hidden md:block">💌</div>

      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border-4 border-white">
        
        {/* Detalle superior */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 shadow-[0_2px_10px_rgba(203,213,225,0.8)] rounded-t-[2.5rem]"></div>

        {/* Encabezado */}
        <div className="text-center mb-6 mt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300 mb-2 drop-shadow-sm">
            Recuperar Contraseña
          </h1>
          <p className="text-sky-700 font-medium text-sm px-2">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para crear una nueva.
          </p>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-center text-sm font-bold animate-pulse">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-center text-sm font-bold">
            {mensaje}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium placeholder:text-sky-300 text-sm sm:text-base"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className={`group relative w-full text-white font-extrabold text-base sm:text-lg py-3.5 sm:py-4 px-4 rounded-2xl transition-all duration-300 mt-4 overflow-hidden ${
              loading || !email
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-pink-300 hover:bg-pink-400 shadow-[0_8px_20px_-6px_rgba(244,114,182,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(244,114,182,0.8)] hover:-translate-y-1'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? 'Enviando... ⏳' : 'Enviar Enlace 💌'}
            </span>
          </button>
        </form>

        {/* Botón para volver al Login */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-sky-700 font-medium mb-2">
            ¿Recordaste tu contraseña?
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={loading}
            className="text-sky-500 hover:text-pink-500 font-extrabold text-sm sm:text-base transition-colors cursor-pointer"
          >
            Volver a Iniciar Sesión 🐾
          </button>
        </div>

      </div>
    </div>
  );
}