import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ArrowRight, Search, User, LogOut, Sparkles, HeartHandshake, Eye } from 'lucide-react';

export default function DirectorioFundaciones() {
  const navigate = useNavigate();
  const [fundaciones, setFundaciones] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarMisPostulaciones, setMostrarMisPostulaciones] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // 1. Cargar Fundaciones
        const resFundaciones = await fetch(`${apiBase}/refugios`);
        if (resFundaciones.ok) {
          const data = await resFundaciones.json();
          const lista = Array.isArray(data) ? data : (data.datos || data.refugios || data.data || []);
          setFundaciones(lista);
        }

        // 2. Cargar Mis Postulaciones (si el adoptante inició sesión)
        if (token) {
          const resPostulaciones = await fetch(`${apiBase}/postulaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resPostulaciones.ok) {
            const dataPost = await resPostulaciones.json();
            const listaPost = Array.isArray(dataPost) ? dataPost : (dataPost.datos || []);
            setPostulaciones(listaPost);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('preferencia_mascota');
    window.location.href = '/login';
  };

  const fundacionesFiltradas = Array.isArray(fundaciones) ? fundaciones.filter((f) =>
    f.nombre_organizacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.direccion?.toLowerCase().includes(busqueda.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 font-sans text-slate-700 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo cute */}
      <div className="absolute top-10 left-10 text-5xl opacity-15 pointer-events-none animate-bounce">🐾</div>
      <div className="absolute top-1/3 right-12 text-6xl opacity-15 pointer-events-none">✨</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-15 pointer-events-none">🦴</div>

      {/* Barra de Navegación del Adoptante */}
      <header className="bg-white/85 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group" 
            onClick={() => navigate('/fundaciones')}
          >
            <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              🐾
            </div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              Huellita Segura
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón para ver Estado de Postulaciones */}
            <button
              onClick={() => setMostrarMisPostulaciones(!mostrarMisPostulaciones)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-100 text-purple-700 font-bold text-xs hover:bg-purple-200 transition shadow-sm active:scale-95 relative"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Mis Postulaciones</span>
              {postulaciones.length > 0 && (
                <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {postulaciones.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/perfil-adoptante')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-pink-100 text-pink-600 font-bold text-xs hover:bg-pink-200 transition shadow-sm active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">

        {/* SECCIÓN DESPLEGABLE: ESTADO DE MIS POSTULACIONES */}
        {(mostrarMisPostulaciones || postulaciones.length > 0) && (
          <div className="mb-12 bg-white/90 backdrop-blur-md border-2 border-purple-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b border-purple-100 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  Mis Postulaciones Activas 💌
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Revisa en qué etapa se encuentra cada una de tus solicitudes de adopción.
                </p>
              </div>
              <span className="px-4 py-1.5 bg-purple-100 text-purple-700 font-extrabold text-xs rounded-full">
                {postulaciones.length} Registrada{postulaciones.length !== 1 ? 's' : ''}
              </span>
            </div>

            {postulaciones.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-sm font-medium">
                Aún no has enviado postulaciones para adoptar. ¡Explora las fundaciones abajo! 🐾
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postulaciones.map((post) => (
                  <div 
                    key={post.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center gap-4 hover:bg-purple-50/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      {post.foto_animal ? (
                        <img src={post.foto_animal} alt={post.nombre_animal} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-inner">
                          🐶
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          {post.nombre_animal || 'Mascota'}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {post.nombre_refugio || 'Refugio Registrado'}
                        </p>
                        <span className={`inline-block mt-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          post.estado_postulacion === 'Rechazada' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          Etapa: {post.estado_postulacion || 'En Revisión'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/mis-postulaciones/${post.id}`)}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Seguimiento</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hero / Encabezado del Directorio */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-extrabold text-xs mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Red de Refugios Aliados</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Encuentra tu nuevo compañero 💖
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium">
            Explora las fundaciones registradas y descubre patitas esperando un hogar lleno de amor.
          </p>

          {/* Buscador Súper Cute */}
          <div className="relative mt-8 max-w-lg mx-auto">
            <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-pink-400" />
            <input
              type="text"
              placeholder="Busca por nombre de fundación o ciudad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-3xl border-2 border-pink-100 bg-white shadow-lg shadow-pink-100/50 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Tarjetas de Fundaciones */}
        {cargando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] border-2 border-pink-100 p-6 h-80 animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-24 bg-pink-100 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-slate-200 rounded-xl w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-2/3"></div>
                  </div>
                </div>
                <div className="h-12 bg-pink-100 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : fundacionesFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-[2.5rem] border-2 border-pink-100 shadow-xl max-w-md mx-auto p-8">
            <div className="text-5xl mb-3">😿</div>
            <p className="font-bold text-slate-700 text-lg">No se encontraron fundaciones</p>
            <p className="text-xs text-slate-400 mt-1">Intenta buscando con otro término.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundacionesFiltradas.map((fundacion) => {
              const colorBase = fundacion.color_principal || '#F472B6';

              return (
                <div
                  key={fundacion.id || fundacion._id}
                  className="bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden flex flex-col justify-between group hover:-translate-y-2"
                  style={{ borderColor: `${colorBase}40` }}
                >
                  <div>
                    <div
                      className="h-28 p-5 relative flex items-center justify-between"
                      style={{ backgroundColor: colorBase }}
                    >
                      <div className="absolute inset-0 bg-black/5"></div>
                      <div className="w-20 h-20 rounded-3xl bg-white p-2.5 shadow-lg border-4 border-white flex items-center justify-center absolute -bottom-8 left-6 overflow-hidden group-hover:scale-105 transition-transform">
                        {fundacion.logo_url || fundacion.logo ? (
                          <img
                            src={
                              (fundacion.logo_url || fundacion.logo).startsWith('http')
                                ? (fundacion.logo_url || fundacion.logo)
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${(fundacion.logo_url || fundacion.logo)}`
                            }
                            alt={fundacion.nombre_organizacion}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-9 h-9" style={{ color: colorBase }} />
                        )}
                      </div>
                    </div>

                    <div className="pt-10 px-7 pb-6">
                      <h3 className="text-xl font-extrabold text-slate-800 mb-3">
                        {fundacion.nombre_organizacion}
                      </h3>

                      <div className="space-y-2.5 text-xs font-medium text-slate-600 mb-6">
                        {fundacion.direccion && (
                          <div 
                            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: `${colorBase}15` }}
                          >
                            <MapPin className="w-4 h-4 shrink-0" style={{ color: colorBase }} />
                            <span className="truncate">{fundacion.direccion}</span>
                          </div>
                        )}
                        {fundacion.telefono && (
                          <div 
                            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: `${colorBase}15` }}
                          >
                            <Phone className="w-4 h-4 shrink-0" style={{ color: colorBase }} />
                            <span>{fundacion.telefono}</span>
                          </div>
                        )}
                        {fundacion.email_contacto && (
                          <div 
                            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
                            style={{ backgroundColor: `${colorBase}15` }}
                          >
                            <Mail className="w-4 h-4 shrink-0" style={{ color: colorBase }} />
                            <span className="truncate">{fundacion.email_contacto}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-7 pt-0">
                    <button
                      onClick={() => navigate(`/catalogo-adoptante?fundacion=${fundacion.id || fundacion._id}`)}
                      className="w-full py-3.5 px-5 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-95 group-hover:shadow-lg"
                      style={{ backgroundColor: colorBase }}
                    >
                      <span>Ver Mascotas Disponibles</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}