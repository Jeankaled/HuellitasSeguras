import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PanelGestion({ onLogout }) {
  const navigate = useNavigate();
  
  const [adoptantes, setAdoptantes] = useState([]);
  const [animales, setAnimales] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  // Estados dinámicos del Refugio
  const [tema, setTema] = useState({ principal: '#94a3b8', secundario: '#cbd5e1' });
  const [nombreOrganizacion, setNombreOrganizacion] = useState('Gestión de Refugio');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        if (!token) {
          localStorage.removeItem('usuario');
          if (typeof onLogout === 'function') onLogout();
          navigate('/login');
          return;
        }

        // Aplicar el tema y el nombre del refugio
        if (usuarioGuardado.tema) {
          setTema({
            principal: usuarioGuardado.tema.principal || '#F9A8D4',
            secundario: usuarioGuardado.tema.secundario || '#93C5FD'
          });
        }
        if (usuarioGuardado.organizacion) {
          setNombreOrganizacion(usuarioGuardado.organizacion);
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        };

        const [resAdoptantes, resAnimales] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/adoptantes`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/animales`, { headers })
        ]);

        if (resAdoptantes.status === 401 || resAnimales.status === 401) {
          if (typeof onLogout === 'function') onLogout();
          return;
        } 

        const datosAdoptantes = await resAdoptantes.json();
        const datosAnimales = await resAnimales.json();

        const listaAdoptantes = Array.isArray(datosAdoptantes) ? datosAdoptantes : (datosAdoptantes.data || datosAdoptantes.datos || datosAdoptantes.adoptantes || []);
        const listaAnimales = Array.isArray(datosAnimales) ? datosAnimales : (datosAnimales.data || datosAnimales.datos || datosAnimales.animales || []);

        setAdoptantes(listaAdoptantes);
        setAnimales(listaAnimales);
        
        if (listaAdoptantes.length > 0) {
          setSeleccionado(listaAdoptantes[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [navigate, onLogout]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Cargando panel de gestión... 🐾</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR (Barra lateral) */}
      <aside className="w-20 bg-white flex flex-col items-center py-8 gap-8 border-r border-slate-200 shadow-sm z-10">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition" 
          style={{ backgroundColor: tema.principal }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>
        <nav className="flex flex-col gap-6 text-slate-400 h-full">
          <button 
            className="p-3 text-white rounded-2xl transition shadow-sm"
            style={{ backgroundColor: tema.secundario }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          <button className="p-3 hover:bg-slate-100 rounded-2xl transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></button>
          
          {/* BOTÓN CERRAR SESIÓN */}
          <div className="mt-auto pt-8">
            <button 
              onClick={onLogout}
              title="Cerrar sesión" 
              className="p-3 bg-white text-red-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition border border-red-100 shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col p-8 lg:px-12 relative overflow-y-auto">
        
        {/* HEADER - Títulos Dinámicos */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              {nombreOrganizacion} <span className="text-2xl">✨</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Revisa las solicitudes y une familias. 
              <span className="ml-1 font-bold" style={{ color: tema.principal }}>
                ({animales.length} mascotas registradas)
              </span>
            </p>
          </div>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          
          {/* COLUMNA IZQUIERDA: BANDEJA DE ENTRADA */}
          <section className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex justify-between items-center px-1 mb-2">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                Bandeja de Entrada 💌
              </h2>
              <span 
                className="text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: tema.secundario }}
              >
                {adoptantes.length} Nuevas
              </span>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[70vh] custom-scrollbar">
              {adoptantes.map((adoptante) => (
                <div 
                  key={adoptante.id || adoptante.rut} 
                  onClick={() => setSeleccionado(adoptante)}
                  style={{
                    borderColor: seleccionado?.id === adoptante.id ? tema.principal : 'transparent',
                    boxShadow: seleccionado?.id === adoptante.id ? `0 4px 15px -3px ${tema.principal}40` : ''
                  }}
                  className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
                    seleccionado?.id === adoptante.id ? 'transform scale-[1.02]' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-slate-800 text-lg">{adoptante.nombre_completo || 'Sin Nombre'}</h3>
                    <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Pendiente</span>
                  </div>
                  <p className="text-sm font-medium flex items-center gap-1 mb-4" style={{ color: tema.principal }}>
                    ♡ Para adoptar a: <span className="text-slate-600">Mascota Vinculada</span>
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Hoy</span>
                    <span className="transition" style={{ color: tema.secundario }}>Ver ficha →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMNA DERECHA: DETALLE DEL ADOPTANTE */}
          {seleccionado && (
            <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col h-full min-h-[70vh]">
              
              {/* Tarjeta Superior Dinámica */}
              <div 
                className="rounded-[2rem] p-6 flex justify-between items-center mb-8 bg-opacity-10 border"
                style={{ backgroundColor: `${tema.secundario}20`, borderColor: `${tema.secundario}40` }}
              >
                <div className="flex items-center gap-5">
                  <div 
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm"
                    style={{ color: tema.principal }}
                  >
                    {seleccionado?.nombre_completo ? seleccionado.nombre_completo.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{seleccionado?.nombre_completo || 'Sin Nombre'}</h2>
                    <p className="font-medium mt-1" style={{ color: tema.secundario }}>RUT: {seleccionado?.rut || 'Sin RUT'}</p>
                  </div>
                </div>
                <div 
                  className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2"
                  style={{ color: tema.principal }}
                >
                  <span>🐾</span> Postula por Mascota
                </div>
              </div>

              {/* RESTAURADO: Fotos Placeholder Dinámicas */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((num) => (
                  <div 
                    key={num} 
                    className="h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition cursor-pointer hover:opacity-80"
                    style={{ borderColor: `${tema.principal}50`, backgroundColor: `${tema.principal}10`, color: tema.principal }}
                  >
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    <span className="text-xs font-bold">Ver Foto {num}</span>
                  </div>
                ))}
              </div>

              {/* RESTAURADO: Documentación Legal Completa */}
              <div className="mb-auto">
                <h3 className="font-extrabold text-slate-700 text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: tema.secundario }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Documentación Legal
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Caja 1: Comprobante */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm" style={{ color: tema.secundario }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Comprobante Ingresos.pdf</p>
                        <p className="text-xs text-slate-400 mt-0.5">Verificado automáticamente</p>
                      </div>
                    </div>
                    <button className="text-slate-600 bg-white px-4 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 transition">Revisar</button>
                  </div>

                  {/* Caja 2: Firma Electrónica */}
                  <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3 border border-green-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Firma Electrónica</p>
                      <p className="text-xs text-green-600 mt-0.5">Términos aceptados</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Botones de Acción Footer - Botón Principal Dinámico */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                <button className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold border-2 border-slate-200 hover:bg-slate-50 transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Solicitar más info / Rechazar
                </button>
                <button 
                  className="px-8 py-3.5 rounded-2xl text-white font-extrabold shadow-lg transition flex items-center gap-2 hover:opacity-90 transform hover:-translate-y-0.5"
                  style={{ backgroundColor: tema.principal, boxShadow: `0 10px 15px -3px ${tema.principal}60` }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Aprobar Adopción 🐾
                </button>
              </div>

            </section>
          )}
        </div>
      </main>
    </div>
  );
}