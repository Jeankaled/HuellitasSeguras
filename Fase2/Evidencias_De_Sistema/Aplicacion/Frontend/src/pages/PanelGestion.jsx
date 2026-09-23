import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Recibimos la prop onLogout desde App.jsx
export default function PanelGestion({ onLogout }) {
  const navigate = useNavigate();
  
  const [adoptantes, setAdoptantes] = useState([]);
  const [animales, setAnimales] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para manejar al postulante seleccionado en la "Bandeja de Entrada"
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        };

        const [resAdoptantes, resAnimales] = await Promise.all([
          fetch('http://localhost:3000/adoptantes', { headers }),
          fetch('http://localhost:3000/animales', { headers })
        ]);

        if (!resAdoptantes.ok || !resAnimales.ok) {
          if (resAdoptantes.status === 401 || resAnimales.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Error al conectar con el servidor. Verifica tu sesión.');
        }

        const datosAdoptantes = await resAdoptantes.json();
        const datosAnimales = await resAnimales.json();

        console.log("Respuesta del Backend (Adoptantes):", datosAdoptantes);
        console.log("Respuesta del Backend (Animales):", datosAnimales);

        // CORRECCIÓN FRONTEND: Tolera arreglos directos o propiedades encapsuladas (data, datos, adoptantes, animales)
        const listaAdoptantes = Array.isArray(datosAdoptantes)
          ? datosAdoptantes
          : (datosAdoptantes.data || datosAdoptantes.datos || datosAdoptantes.adoptantes || []);

        const listaAnimales = Array.isArray(datosAnimales)
          ? datosAnimales
          : (datosAnimales.data || datosAnimales.datos || datosAnimales.animales || []);

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
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-400 font-bold">Cargando panel de gestión... 🐾</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#FFF5F8] flex overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR (Barra lateral) */}
      <aside className="w-20 bg-[#FFF5F8] flex flex-col items-center py-8 gap-8 border-r border-pink-100">
        <div className="w-12 h-12 bg-pink-200 rounded-2xl flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-pink-300 transition">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>
        <nav className="flex flex-col gap-6 text-sky-300 h-full">
          <button className="p-3 bg-sky-100 text-sky-500 rounded-2xl hover:bg-sky-200 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></button>
          <button className="p-3 hover:bg-pink-100 hover:text-pink-400 rounded-2xl transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></button>
          <button className="p-3 hover:bg-pink-100 hover:text-pink-400 rounded-2xl transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></button>
          
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
      <main className="flex-1 flex flex-col p-8 lg:px-12 relative">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              Gestión de Refugio <span className="text-2xl">✨</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Revisa las solicitudes y une familias. <span className="text-pink-400 ml-1 font-bold">({animales.length} mascotas registradas)</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" placeholder="Buscar postulante..." className="pl-10 pr-4 py-3 bg-white border border-pink-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 w-64 shadow-sm placeholder:text-pink-300 text-slate-600 font-medium" />
              <svg className="w-4 h-4 absolute left-4 top-3.5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-pink-100 shadow-sm text-sky-400 hover:bg-sky-50 transition relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-pink-400 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        {/* GRID PRINCIPAL: Bandeja Izquierda + Detalle Derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          
          {/* COLUMNA IZQUIERDA: BANDEJA DE ENTRADA */}
          <section className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex justify-between items-center px-1 mb-2">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                Bandeja de Entrada <span className="text-pink-400">💌</span>
              </h2>
              <span className="bg-pink-100 text-pink-600 text-xs font-extrabold px-3 py-1 rounded-full">{adoptantes.length} Nuevas</span>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[70vh] custom-scrollbar">
              {adoptantes.map((adoptante) => (
                <div 
                  key={adoptante.id || adoptante.rut} 
                  onClick={() => setSeleccionado(adoptante)}
                  className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 bg-white ${seleccionado?.id === adoptante.id ? 'border-pink-300 shadow-[0_4px_15px_-3px_rgba(244,114,182,0.3)] transform scale-[1.02]' : 'border-transparent shadow-sm hover:border-pink-100'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-extrabold text-slate-800 text-lg">{adoptante.nombre_completo || 'Sin Nombre'}</h3>
                    <span className="bg-yellow-100 text-yellow-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Pendiente</span>
                  </div>
                  <p className="text-pink-400 text-sm font-medium flex items-center gap-1 mb-4">
                    ♡ Para adoptar a: <span className="text-slate-600">Mascota Vinculada</span>
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 07 Sept 2026</span>
                    <span className="text-slate-500 hover:text-pink-500 transition">Ver ficha →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMNA DERECHA: DETALLE DEL ADOPTANTE */}
          {seleccionado && (
            <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-sky-100/50 border-4 border-white relative overflow-hidden flex flex-col h-full min-h-[70vh]">
              
              {/* Tarjeta Superior Azul Celeste */}
              <div className="bg-gradient-to-r from-sky-100 to-sky-50 rounded-[2rem] p-6 flex justify-between items-center border border-sky-100 mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-sky-500 shadow-sm border border-sky-100">
                    {seleccionado?.nombre_completo ? seleccionado.nombre_completo.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{seleccionado?.nombre_completo || 'Sin Nombre'}</h2>
                    <p className="text-sky-600 font-medium mt-1">RUT: {seleccionado?.rut || 'Sin RUT'}</p>
                  </div>
                </div>
                <div className="bg-white/60 px-4 py-2 rounded-xl text-pink-500 font-bold text-sm border border-pink-100/50 flex items-center gap-2">
                  <span>🐾</span> Postula por Mascota
                </div>
              </div>

              {/* Fotos Placeholder */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="h-32 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 flex flex-col items-center justify-center text-pink-300 hover:bg-pink-50 transition cursor-pointer">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    <span className="text-xs font-bold">Ver Foto {num}</span>
                  </div>
                ))}
              </div>

              {/* Documentación Legal */}
              <div className="mb-auto">
                <h3 className="font-extrabold text-slate-700 text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Documentación Legal
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-sky-50 rounded-2xl p-4 flex items-center justify-between border border-sky-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-400 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Comprobante Ingresos.pdf</p>
                        <p className="text-xs text-sky-500 mt-0.5">Verificado automáticamente</p>
                      </div>
                    </div>
                    <button className="text-sky-600 bg-white px-4 py-1.5 rounded-lg text-xs font-bold border border-sky-100 hover:bg-sky-100 transition">Revisar</button>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3 border border-green-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Firma Electrónica</p>
                      <p className="text-xs text-green-600 mt-0.5">Términos aceptados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Footer */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                <button className="px-6 py-3.5 rounded-2xl text-pink-500 font-bold border-2 border-pink-100 hover:bg-pink-50 transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Solicitar más info / Rechazar
                </button>
                <button className="px-8 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-white font-extrabold shadow-lg shadow-emerald-200 transition flex items-center gap-2">
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