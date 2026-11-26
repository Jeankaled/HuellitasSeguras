import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Dog, Cat, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PerfilAdoptante() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [preferencia, setPreferencia] = useState('Ambos');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState('');

  // Construye la URL completa si el backend devuelve una ruta relativa (/uploads/...)
  const resolverUrlFoto = (ruta) => {
    if (!ruta) return '';
    if (ruta.startsWith('http') || ruta.startsWith('blob:')) return ruta;
    return `${apiBase}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
  };

  // Extrae el ID del adoptante desde localStorage o directamente desde el payload del JWT
  const obtenerIdAdoptante = (token, usuarioGuardado) => {
    if (usuarioGuardado?.id) return usuarioGuardado.id;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      const adoptanteId = obtenerIdAdoptante(token, usuarioGuardado);

      // Precarga inmediata desde localStorage mientras responde el servidor
      if (usuarioGuardado.nombre_completo || usuarioGuardado.nombre) {
        setNombreCompleto(usuarioGuardado.nombre_completo || usuarioGuardado.nombre);
      }
      if (usuarioGuardado.telefono) {
        setTelefono(usuarioGuardado.telefono);
      }
      if (usuarioGuardado.preferencia_mascota) {
        setPreferencia(usuarioGuardado.preferencia_mascota);
      }
      if (usuarioGuardado.foto_perfil) {
        setVistaPreviaFoto(resolverUrlFoto(usuarioGuardado.foto_perfil));
      }

      if (!adoptanteId) {
        setCargando(false);
        return;
      }

      try {
        const res = await fetch(`${apiBase}/adoptantes/${adoptanteId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          const perfil = data.datos || data;

          setNombreCompleto(perfil.nombre_completo || perfil.nombre || '');
          setTelefono(perfil.telefono || '');
          setPreferencia(perfil.preferencia_mascota || 'Ambos');
          setVistaPreviaFoto(resolverUrlFoto(perfil.foto_perfil));

          // Mantiene localStorage sincronizado con los datos reales de la BD
          localStorage.setItem('usuario', JSON.stringify({
            ...usuarioGuardado,
            id: perfil.id,
            nombre: perfil.nombre_completo,
            nombre_completo: perfil.nombre_completo,
            email: perfil.email,
            telefono: perfil.telefono,
            direccion: perfil.direccion,
            foto_perfil: perfil.foto_perfil,
            preferencia_mascota: perfil.preferencia_mascota
          }));
        }
      } catch (err) {
        console.error('Error al cargar perfil del adoptante:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [apiBase, navigate]);

  const handleSeleccionarFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoFoto(file);
    setVistaPreviaFoto(URL.createObjectURL(file));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
    const adoptanteId = obtenerIdAdoptante(token, usuarioGuardado);

    if (!adoptanteId) {
      toast.error('No se pudo identificar tu sesión. Inicia sesión nuevamente.');
      return;
    }

    setGuardando(true);
    const toastId = toast.loading('Guardando cambios...');

    try {
      const formData = new FormData();
      // Solo enviamos los campos con contenido; los vacíos quedan en null en el backend y no borran datos previos
      if (nombreCompleto.trim()) {
        formData.append('nombre_completo', nombreCompleto.trim());
      }
      if (telefono.trim()) {
        formData.append('telefono', telefono.trim());
      }
      if (preferencia) {
        formData.append('preferencia_mascota', preferencia);
      }
      if (archivoFoto) {
        formData.append('foto_perfil', archivoFoto);
      }

      const res = await fetch(`${apiBase}/adoptantes/${adoptanteId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron guardar los cambios.');
      }

      const actualizado = data.datos || data;

      setNombreCompleto(actualizado.nombre_completo || '');
      setTelefono(actualizado.telefono || '');
      setPreferencia(actualizado.preferencia_mascota || 'Ambos');
      setVistaPreviaFoto(resolverUrlFoto(actualizado.foto_perfil));
      setArchivoFoto(null);

      // Actualiza localStorage para que al volver a entrar o navegar se vean los cambios
      localStorage.setItem('usuario', JSON.stringify({
        ...usuarioGuardado,
        id: actualizado.id,
        nombre: actualizado.nombre_completo,
        nombre_completo: actualizado.nombre_completo,
        telefono: actualizado.telefono,
        direccion: actualizado.direccion,
        foto_perfil: actualizado.foto_perfil,
        preferencia_mascota: actualizado.preferencia_mascota
      }));

      toast.success('¡Perfil e intereses actualizados! Redirigiendo...', { id: toastId });
      setTimeout(() => navigate('/fundaciones'), 1500);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      toast.error(err.message || 'Error al guardar los cambios.', { id: toastId });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">
        Cargando tu perfil... 🐾
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans text-slate-700">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-10">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-5 mb-8 border-b border-slate-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
            Mi Cuenta y Preferencias
          </h1>
        </div>

        <form onSubmit={handleGuardar} className="space-y-8">
          {/* Avatar / Foto de perfil */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full border-4 border-pink-100 bg-slate-50 overflow-hidden flex items-center justify-center shadow-sm hover:border-pink-300 transition group relative"
            >
              {vistaPreviaFoto ? (
                <img
                  src={vistaPreviaFoto}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-11 h-11 text-slate-400 group-hover:text-pink-400 transition" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleSeleccionarFoto}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs font-medium text-slate-400 hover:text-pink-500 transition"
            >
              Haz clic para subir o cambiar tu foto de perfil
            </button>
          </div>

          {/* Datos personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Preferencias de adopción */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 font-extrabold text-slate-800 text-sm">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              ¿Qué tipo de mascota te interesa adoptar?
            </div>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Puedes cambiar esta preferencia cuando quieras.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'Perros', label: 'Perros', icono: <Dog className="w-5 h-5 text-blue-500" /> },
                { id: 'Gatos', label: 'Gatos', icono: <Cat className="w-5 h-5 text-pink-500" /> },
                {
                  id: 'Ambos',
                  label: 'Ambos',
                  icono: (
                    <div className="flex items-center gap-0.5">
                      <Dog className="w-4 h-4 text-blue-500" />
                      <Cat className="w-4 h-4 text-pink-500" />
                    </div>
                  )
                }
              ].map((opcion) => {
                const activo = preferencia === opcion.id;
                return (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => setPreferencia(opcion.id)}
                    className={`py-4 px-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition bg-white ${
                      activo
                        ? 'border-purple-500 text-purple-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opcion.icono}
                    <span className="text-xs font-extrabold">{opcion.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={guardando}
            className="w-full py-3.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-sm shadow-lg shadow-pink-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}