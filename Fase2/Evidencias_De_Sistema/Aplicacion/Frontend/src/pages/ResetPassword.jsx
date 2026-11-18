import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!token) {
      return setError('El enlace no contiene un token válido. Solicita uno nuevo.');
    }

    if (nuevaPassword.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    if (nuevaPassword !== confirmarPassword) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const respuesta = await fetch(`${apiBase}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, nuevaPassword }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || 'No se pudo restablecer la contraseña.');
      }

      setMensaje(datos.mensaje || '¡Contraseña actualizada con éxito! Redirigiendo al login...');
      setNuevaPassword('');
      setConfirmarPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4 relative overflow-hidden">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border-4 border-white">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-t-[2.5rem]"></div>

        <div className="text-center mb-6 mt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300 mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-sky-700 font-medium text-sm px-2">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-center text-sm font-bold">
            {mensaje}
          </div>
        )}

        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500 font-bold">Enlace inválido o incompleto.</p>
            <button
              type="button"
              onClick={() => navigate('/recuperar-password')}
              className="text-sky-500 hover:text-pink-500 font-extrabold text-sm"
            >
              Solicitar un nuevo enlace 🐾
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-sky-800 mb-1 ml-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
                className="w-full px-4 py-3 border-2 border-sky-100 rounded-2xl focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100 transition-all bg-sky-50 text-slate-700 font-medium"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !nuevaPassword || !confirmarPassword}
              className={`w-full text-white font-extrabold text-base sm:text-lg py-3.5 px-4 rounded-2xl transition-all duration-300 mt-4 ${
                loading || !nuevaPassword || !confirmarPassword
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-pink-300 hover:bg-pink-400 shadow-[0_8px_20px_-6px_rgba(244,114,182,0.6)] hover:-translate-y-1'
              }`}
            >
              {loading ? 'Guardando... ⏳' : 'Guardar Nueva Contraseña 🔐'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}