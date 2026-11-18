import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, Search, AlertTriangle, X, ShieldAlert, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DirectorioAdoptantes({ onLogout }) {
  const navigate = useNavigate();
  const [adoptantes, setAdoptantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para la barra de búsqueda
  const [busqueda, setBusqueda] = useState('');
  
  // 1. Leemos localStorage directo en el useState (evita setState síncrono en el efecto)
  const [tema] = useState(() => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      return {
        principal: usuarioGuardado.tema?.principal || '#F9A8D4',
        secundario: usuarioGuardado.tema?.secundario || '#93C5FD'
      };
    } catch {
      return { principal: '#94a3b8', secundario: '#cbd5e1' };
    }
  });

  const [nombreOrganizacion] = useState(() => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      return usuarioGuardado.organizacion || 'Gestión de Refugio';
    } catch {
      return 'Gestión de Refugio';
    }
  });

  // Estados para el Modal de Crear Reporte
  const [modalAbierto, setModalAbierto] = useState(false);
  const [adoptanteSeleccionado, setAdoptanteSeleccionado] = useState(null);
  const [tipoFalta, setTipoFalta] = useState('Incumplimiento de contrato / seguimiento');
  const [descripcionFalta, setDescripcionFalta] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Estados para el Modal de VER Historial de Reportes
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [adoptanteHistorial, setAdoptanteHistorial] = useState(null);

  // 2. Función limpia: TODOS los setState ocurren después del await
  const obtenerDatos = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const [resAdoptantes, resReportes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/adoptantes`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/reportes-adoptantes`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }))
      ]);

      if (resAdoptantes.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const dataAdoptantes = await resAdoptantes.json();
      const listaAdoptantes = Array.isArray(dataAdoptantes) ? dataAdoptantes : (dataAdoptantes.datos || dataAdoptantes.data || []);
      
      let listaReportes = [];
      if (resReportes && resReportes.ok) {
        listaReportes = await resReportes.json();
      }

      const adoptantesConReportes = listaAdoptantes.map(adoptante => {
        const susReportes = listaReportes.filter(r => r.adoptante_rut === adoptante.rut);
        return { ...adoptante, reportes: susReportes };
      });

      setAdoptantes(adoptantesConReportes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // 3. Ejecución mediante función asíncrona interna para cumplir con ESLint
  useEffect(() => {
    let montado = true;
    const iniciarCarga = async () => {
      if (montado) {
        await obtenerDatos();
      }
    };
    iniciarCarga();
    return () => { montado = false; };
  }, [obtenerDatos]);

  // Filtrado dinámico
  const adoptantesFiltrados = adoptantes.filter(item => {
    const termino = busqueda.toLowerCase();
    const nombre = (item.nombre_completo || item.nombre || '').toLowerCase();
    const rut = (item.rut || '').toLowerCase();
    const email = (item.email || item.correo || '').toLowerCase();
    return nombre.includes(termino) || rut.includes(termino) || email.includes(termino);
  });

  // Manejadores de Modales
  const abrirModalReporte = (persona) => {
    setAdoptanteSeleccionado(persona);
    setTipoFalta('Incumplimiento de contrato / seguimiento');
    setDescripcionFalta('');
    setModalAbierto(true);
  };

  const abrirModalHistorial = (persona) => {
    setAdoptanteHistorial(persona);
    setModalHistorialAbierto(true);
  };

  // Enviar el reporte de irresponsabilidad
  const handleEnviarReporte = async (e) => {
    e.preventDefault();
    if (!descripcionFalta.trim()) {
      toast.error('Por favor, describe los detalles de la irresponsabilidad o falta.');
      return;
    }

    setEnviando(true);
    const toastId = toast.loading('Enviando alerta a la red de fundaciones...');

    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/reportes-adoptantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adoptante_rut: adoptanteSeleccionado.rut,
          tipo_falta: tipoFalta,
          descripcion: descripcionFalta
        })
      });

      if (!respuesta.ok) {
        throw new Error('Error al registrar el reporte en el servidor.');
      }

      toast.success('⚠️ Alerta enviada con éxito. Las demás fundaciones han sido notificadas.', { id: toastId });
      setModalAbierto(false);
      obtenerDatos(); // Recargar para mostrar el nuevo badge inmediatamente
    } catch (err) {
      console.error(err);
      toast.error('Error al intentar registrar el reporte.', { id: toastId });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Cargando directorio... 🐾</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR / BOTTOM NAV EN MÓVIL */}
      <aside className="fixed md:static bottom-0 w-full md:w-20 h-16 md:h-screen bg-white flex md:flex-col items-center justify-around md:justify-start py-2 md:py-8 md:gap-8 border-t md:border-t-0 md:border-r border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-sm z-40 shrink-0">
        <div 
          onClick={() => navigate('/panel', { state: { vista: 'inicio' } })}
          className="hidden md:flex w-12 h-12 rounded-2xl items-center justify-center text-white shadow-md transition cursor-pointer hover:opacity-90 hover:scale-105" 
          style={{ backgroundColor: tema.principal }}
          title="Ir a Inicio"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>

        <nav className="flex md:flex-col flex-row items-center justify-around md:justify-start w-full h-full gap-2 md:gap-6 text-slate-400">
          <button 
            onClick={() => navigate('/panel', { state: { vista: 'bandeja' } })}
            className="p-3 bg-white rounded-2xl transition shadow-sm hover:bg-slate-100 hover:text-slate-600 md:hover:scale-105"
            title="Ir a Bandeja"
          >
            <svg className="w-6 h-6 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          
          <button 
            onClick={() => navigate('/panel', { state: { vista: 'catalogo' } })}
            className="p-3 bg-white rounded-2xl transition shadow-sm hover:bg-slate-100 hover:text-slate-600 md:hover:scale-105"
            title="Ir a Catálogo"
          >
            <Cat className="w-6 h-6 md:w-6 md:h-6" />
          </button>

          <button 
            className="p-3 rounded-2xl transition shadow-sm text-white md:hover:scale-105"
            style={{ backgroundColor: tema.secundario }}
            title="Directorio de Adoptantes (Activo)"
          >
            <svg className="w-6 h-6 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </button>
          
          <button 
            onClick={() => navigate('/ajustes-perfil')}
            className="p-3 bg-white rounded-2xl transition shadow-sm hover:bg-slate-100 hover:text-slate-600 md:hover:scale-105"
            title="Ajustes de la Fundación"
          >
            <svg className="w-6 h-6 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>

          <div className="md:mt-auto md:pt-8 flex">
            <button 
              onClick={() => {
                if (typeof onLogout === 'function') onLogout();
                else {
                  localStorage.removeItem('token');
                  navigate('/login');
                }
              }}
              title="Cerrar sesión" 
              className="p-3 bg-white text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition border border-red-100 shadow-sm md:hover:scale-105"
            >
              <svg className="w-6 h-6 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL DEL DIRECTORIO */}
      <main className="flex-1 flex flex-col p-8 lg:px-12 relative overflow-y-auto pb-24 md:pb-8">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              {nombreOrganizacion} <span className="text-2xl">✨</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Directorio completo de familias postulantes.
              <span className="ml-1 font-bold" style={{ color: tema.principal }}>
                ({adoptantes.length} registros)
              </span>
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, RUT o email..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ '--tw-ring-color': tema.principal }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex-1">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: tema.principal }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">Directorio General</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: `${tema.secundario}15` }}>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">RUT</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Nombre Completo</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Email</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Teléfono</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm">Dirección</th>
                  <th className="p-4 font-extrabold text-slate-600 text-sm text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {adoptantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                      {busqueda ? 'No se encontraron adoptantes que coincidan con la búsqueda.' : 'No hay adoptantes registrados aún.'}
                    </td>
                  </tr>
                ) : (
                  adoptantesFiltrados.map((persona) => (
                    <tr key={persona.id || persona.rut} className="border-b border-slate-50 hover:bg-slate-50 transition cursor-default">
                      <td className="p-4 font-medium text-slate-500">{persona.rut || 'N/A'}</td>
                      
                      {/* Celda de Nombre Completo y BADGE de Reportes */}
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{persona.nombre_completo}</div>
                        {persona.reportes && persona.reportes.length > 0 && (
                          <button
                            onClick={() => abrirModalHistorial(persona)}
                            className="mt-1 flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md transition shadow-sm"
                            title="Ver detalles de los reportes"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            {persona.reportes.length} Alerta{persona.reportes.length > 1 ? 's' : ''} en la red
                          </button>
                        )}
                      </td>
                      
                      <td className="p-4 text-slate-500 text-sm">{persona.email}</td>
                      <td className="p-4 text-slate-500 text-sm">{persona.telefono || 'No registrado'}</td>
                      <td className="p-4 text-slate-500 text-sm truncate max-w-[150px]">{persona.direccion || 'No registrada'}</td>
                      
                      <td className="p-4 text-center">
                        <button
                          onClick={() => abrirModalReporte(persona)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold text-xs rounded-xl transition shadow-sm border border-red-200"
                          title="Reportar irresponsabilidad o incumplimiento"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Reportar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🚨 MODAL DE CREAR REPORTE DE IRRESPONSABILIDAD */}
      {modalAbierto && adoptanteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setModalAbierto(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reportar Adoptante</h3>
                <p className="text-xs text-slate-500">Esta alerta será notificada a todas las fundaciones de la red.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p><strong>Adoptante:</strong> {adoptanteSeleccionado.nombre_completo}</p>
              <p><strong>RUT:</strong> {adoptanteSeleccionado.rut || 'No especificado'}</p>
              <p><strong>Correo:</strong> {adoptanteSeleccionado.email}</p>
            </div>

            <form onSubmit={handleEnviarReporte} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Motivo / Tipo de Falta</label>
                <select 
                  value={tipoFalta} 
                  onChange={(e) => setTipoFalta(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 bg-white"
                >
                  <option value="Incumplimiento de contrato / seguimiento">Incumplimiento de contrato o seguimiento</option>
                  <option value="Devolución injustificada de mascota">Devolución injustificada de mascota</option>
                  <option value="Negativa a visitas domiciliarias">Negativa a visitas domiciliarias</option>
                  <option value="Señales de maltrato o abandono">Señales de maltrato o abandono</option>
                  <option value="Otro motivo grave">Otro motivo grave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Descripción detallada de la incidencia</label>
                <textarea 
                  rows="4"
                  value={descripcionFalta}
                  onChange={(e) => setDescripcionFalta(e.target.value)}
                  placeholder="Explica detalladamente qué sucedió para advertir a las demás fundaciones..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-red-200"
                >
                  {enviando ? 'Enviando alerta...' : 'Enviar Alerta General'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ MODAL PARA VER HISTORIAL DE REPORTES DE UN ADOPTANTE */}
      {modalHistorialAbierto && adoptanteHistorial && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setModalHistorialAbierto(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Historial de Alertas</h3>
                <p className="text-xs text-slate-500">
                  {adoptanteHistorial.nombre_completo} ({adoptanteHistorial.rut})
                </p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar">
              {adoptanteHistorial.reportes && adoptanteHistorial.reportes.map((reporte) => (
                <div key={reporte.id} className="p-4 rounded-2xl border-l-4 border-red-400 bg-red-50/50 shadow-sm relative">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(reporte.fecha_reporte).toLocaleDateString('es-CL', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{reporte.tipo_falta}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-red-100 mt-2">
                    {reporte.descripcion}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setModalHistorialAbierto(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
              >
                Cerrar Historial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}