import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, Plus, Edit, X, Upload } from 'lucide-react';

export default function PanelGestion({ onLogout }) {
  const navigate = useNavigate();
  
  const [adoptantes, setAdoptantes] = useState([]);
  const [animales, setAnimales] = useState([]); 
  const [, setRefugios] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de Interfaz
  const [vistaActiva, setVistaActiva] = useState('bandeja'); // 'bandeja' o 'catalogo'
  const [seleccionado, setSeleccionado] = useState(null); // Para adoptantes
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null); // Para el modal de detalles del catálogo
  const [fichaClinica, setFichaClinica] = useState(null);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  // Estados para Formulario y Modal de Crear / Editar Mascota
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear'); // 'crear' o 'editar'
  const [animalEditandoId, setAnimalEditandoId] = useState(null);
  const [guardandoAnimal, setGuardandoAnimal] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState('');

  const [formAnimal, setFormAnimal] = useState({
    nombre: '',
    especie: 'Perro',
    sexo: 'Macho',
    edad: '',
    historia: '',
    estado: 'En adopción',
    foto_url: ''
  });

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

        const [resAdoptantes, resAnimales, resRefugios] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/adoptantes`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/animales`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/refugios`, { headers }) 
        ]);

        if (resAdoptantes.status === 401 || resAnimales.status === 401) {
          if (typeof onLogout === 'function') onLogout();
          return;
        } 

        const datosAdoptantes = await resAdoptantes.json();
        const datosAnimales = await resAnimales.json();
        const datosRefugios = await resRefugios.json(); 

        const listaAdoptantes = Array.isArray(datosAdoptantes) ? datosAdoptantes : (datosAdoptantes.data || datosAdoptantes.datos || datosAdoptantes.adoptantes || []);
        const listaAnimales = Array.isArray(datosAnimales) ? datosAnimales : (datosAnimales.data || datosAnimales.datos || datosAnimales.animales || []);
        const listaRefugios = Array.isArray(datosRefugios) ? datosRefugios : (datosRefugios.data || datosRefugios.datos || datosRefugios.refugios || []); 

        setAdoptantes(listaAdoptantes);
        setAnimales(listaAnimales);
        setRefugios(listaRefugios); 
        
        if (usuarioGuardado && listaRefugios.length > 0) {
          const miRefugio = listaRefugios.find(r => r.id === usuarioGuardado.id || r.usuario_id === usuarioGuardado.id);
          const nombreAmostrar = miRefugio?.nombre_organizacion || miRefugio?.nombre || usuarioGuardado.nombre || 'Refugio';
          setNombreOrganizacion(nombreAmostrar);
        } else if (listaRefugios.length > 0) {
          setNombreOrganizacion(listaRefugios[0].nombre_organizacion || listaRefugios[0].nombre || 'Refugio');
        }

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

  const abrirModalAnimal = async (animal) => {
    setAnimalSeleccionado(animal);
    setCargandoFicha(true);
    setFichaClinica(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/fichas-clinicas/animal/${animal.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFichaClinica(data);
      }
    } catch (error) {
      console.error("Error al obtener la ficha clínica:", error);
    } finally {
      setCargandoFicha(false);
    }
  };

  // MANEJO DE MODAL DE FORMULARIO (REGISTRO Y EDICIÓN)
  const abrirModalCrear = () => {
    setModoModal('crear');
    setAnimalEditandoId(null);
    setFormAnimal({
      nombre: '',
      especie: 'Perro',
      sexo: 'Macho',
      edad: '',
      historia: '',
      estado: 'En adopción',
      foto_url: ''
    });
    setArchivoFoto(null);
    setVistaPreviaFoto('');
    setErrorForm('');
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (animal, e) => {
    if (e) e.stopPropagation();
    setModoModal('editar');
    setAnimalEditandoId(animal.id);
    setFormAnimal({
      nombre: animal.nombre || '',
      especie: animal.especie || 'Perro',
      sexo: animal.sexo || 'Macho',
      edad: animal.edad || '',
      historia: animal.historia || '',
      estado: animal.estado || 'En adopción',
      foto_url: animal.foto_url || ''
    });
    setArchivoFoto(null);
    setVistaPreviaFoto(animal.foto_url || '');
    setErrorForm('');
    setModalFormAbierto(true);
  };

  const cerrarModalForm = () => {
    setModalFormAbierto(false);
    setErrorForm('');
    setArchivoFoto(null);
    setVistaPreviaFoto('');
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFoto(file);
      setVistaPreviaFoto(URL.createObjectURL(file));
    }
  };

  const handleSubmitAnimal = async (e) => {
    e.preventDefault();
    setGuardandoAnimal(true);
    setErrorForm('');

    try {
      const token = localStorage.getItem('token');
      const esCrear = modoModal === 'crear';
      const endpoint = esCrear 
        ? `${import.meta.env.VITE_API_URL}/animales`
        : `${import.meta.env.VITE_API_URL}/animales/${animalEditandoId}`;
      const metodo = esCrear ? 'POST' : 'PUT';

      let bodyPayload;
      let headersPayload = { 'Authorization': `Bearer ${token}` };

      // Si el usuario subió una nueva foto, enviamos FormData; si no, JSON
      if (archivoFoto) {
        const formData = new FormData();
        formData.append('nombre', formAnimal.nombre);
        formData.append('especie', formAnimal.especie);
        formData.append('sexo', formAnimal.sexo);
        formData.append('edad', formAnimal.edad);
        formData.append('historia', formAnimal.historia);
        formData.append('estado', formAnimal.estado);
        formData.append('foto', archivoFoto);
        bodyPayload = formData;
      } else {
        headersPayload['Content-Type'] = 'application/json';
        bodyPayload = JSON.stringify(formAnimal);
      }

      const res = await fetch(endpoint, {
        method: metodo,
        headers: headersPayload,
        body: bodyPayload
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.mensaje || errorData.message || 'Error al procesar la solicitud');
      }

      const dataRespuesta = await res.json();
      const animalGuardado = dataRespuesta.data || dataRespuesta.animal || dataRespuesta;

      // Asegurar que el objeto conserve propiedades locales si la API retorna respuesta parcial
      const animalActualizado = {
        ...(modoModal === 'editar' ? animales.find(a => a.id === animalEditandoId) : {}),
        ...formAnimal,
        ...(typeof animalGuardado === 'object' ? animalGuardado : {})
      };

      if (esCrear) {
        setAnimales(prev => [animalActualizado, ...prev]);
      } else {
        setAnimales(prev => prev.map(a => a.id === animalEditandoId ? animalActualizado : a));
        if (animalSeleccionado && animalSeleccionado.id === animalEditandoId) {
          setAnimalSeleccionado(animalActualizado);
        }
      }

      cerrarModalForm();
    } catch (err) {
      setErrorForm(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setGuardandoAnimal(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Cargando panel de gestión... 🐾</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-700">
      
      {/* SIDEBAR */}
      <aside className="w-20 bg-white flex flex-col items-center py-8 gap-8 border-r border-slate-200 shadow-sm z-10">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition" 
          style={{ backgroundColor: tema.principal }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
        </div>
        <nav className="flex flex-col gap-6 text-slate-400 h-full">
          {/* Botón Bandeja */}
          <button 
            onClick={() => setVistaActiva('bandeja')}
            className={`p-3 rounded-2xl transition shadow-sm ${vistaActiva === 'bandeja' ? 'text-white' : 'hover:bg-slate-100'}`}
            style={{ backgroundColor: vistaActiva === 'bandeja' ? tema.secundario : 'transparent' }}
            title="Bandeja de Adoptantes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          
          {/* Botón Catálogo de Mascotas */}
          <button 
            onClick={() => setVistaActiva('catalogo')}
            className={`p-3 rounded-2xl transition shadow-sm ${vistaActiva === 'catalogo' ? 'text-white' : 'hover:bg-slate-100'}`}
            style={{ backgroundColor: vistaActiva === 'catalogo' ? tema.secundario : 'transparent' }}
            title="Catálogo de Mascotas"
          >
            <Cat className="w-6 h-6" />
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
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              {nombreOrganizacion} <span className="text-2xl">✨</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {vistaActiva === 'bandeja' ? 'Revisa las solicitudes y une familias.' : 'Administra y visualiza los animales registrados.'}
              <span className="ml-1 font-bold" style={{ color: tema.principal }}>
                ({animales.length} mascotas registradas)
              </span>
            </p>
          </div>
          
          {/* BOTÓN REGISTRAR MASCOTA (VISIBLE EN EL ENCABEZADO) */}
          {vistaActiva === 'catalogo' && (
            <button 
              onClick={abrirModalCrear}
              className="px-6 py-3.5 rounded-2xl text-white font-extrabold shadow-lg transition flex items-center gap-2 hover:opacity-90 transform hover:-translate-y-0.5"
              style={{ backgroundColor: tema.principal, boxShadow: `0 8px 20px -4px ${tema.principal}60` }}
            >
              <Plus className="w-5 h-5" /> + Registrar Mascota
            </button>
          )}
        </header>

        {/* RENDERIZADO CONDICIONAL DE VISTAS */}
        {vistaActiva === 'bandeja' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
            <section className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex justify-between items-center px-1 mb-2">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">Bandeja de Entrada 💌</h2>
                <span className="text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: tema.secundario }}>
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
                    className={`p-5 rounded-4xl border-2 cursor-pointer transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
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

            {seleccionado && (
              <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col h-full min-h-[70vh]">
                <div className="rounded-4xl p-6 flex justify-between items-center mb-8 bg-opacity-10 border" style={{ backgroundColor: `${tema.secundario}20`, borderColor: `${tema.secundario}40` }}>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm" style={{ color: tema.principal }}>
                      {seleccionado?.nombre_completo ? seleccionado.nombre_completo.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800">{seleccionado?.nombre_completo || 'Sin Nombre'}</h2>
                      <p className="font-medium mt-1" style={{ color: tema.secundario }}>RUT: {seleccionado?.rut || 'Sin RUT'}</p>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2" style={{ color: tema.principal }}>
                    <span>🐾</span> Postula por Mascota
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition cursor-pointer hover:opacity-80" style={{ borderColor: `${tema.principal}50`, backgroundColor: `${tema.principal}10`, color: tema.principal }}>
                      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      <span className="text-xs font-bold">Ver Foto {num}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-auto">
                  <h3 className="font-extrabold text-slate-700 text-lg mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: tema.secundario }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Documentación Legal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
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
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                  <button className="px-6 py-3.5 rounded-2xl text-slate-500 font-bold border-2 border-slate-200 hover:bg-slate-50 transition flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Solicitar más info / Rechazar
                  </button>
                  <button className="px-8 py-3.5 rounded-2xl text-white font-extrabold shadow-lg transition flex items-center gap-2 hover:opacity-90 transform hover:-translate-y-0.5" style={{ backgroundColor: tema.principal, boxShadow: `0 10px 15px -3px ${tema.principal}60` }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Aprobar Adopción 🐾
                  </button>
                </div>
              </section>
            )}
          </div>
        ) : (
          /* VISTA CATÁLOGO DE MASCOTAS */
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 custom-scrollbar pb-8">
            {animales.map((animal) => (
              <div key={animal.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex flex-col hover:shadow-lg transition-all duration-300 relative group">
                
                {/* BOTÓN EDITAR RÁPIDO EN LA TARJETA */}
                <button
                  onClick={(e) => abrirModalEditar(animal, e)}
                  className="absolute top-7 right-7 p-2.5 bg-white/90 hover:bg-white text-slate-600 rounded-full shadow-md transition transform hover:scale-110 z-10"
                  title="Editar mascota"
                >
                  <Edit className="w-4 h-4 text-slate-700" />
                </button>

                {/* Imagen (Placeholder dinámico o URL real) */}
                <div 
                  className="h-48 w-full rounded-3xl mb-4 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.01]" 
                  style={{ 
                    backgroundImage: `url(${animal.foto_url || 'https://via.placeholder.com/300x200?text=Sin+Foto'})`,
                    backgroundColor: `${tema.secundario}20` 
                  }}
                />
                <div className="flex justify-between items-start mb-2 pr-8">
                  <h3 className="text-xl font-extrabold text-slate-800">{animal.nombre}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${
                    animal.estado === 'En adopción' || animal.estado === 'Disponible' 
                      ? 'bg-green-100 text-green-600' 
                      : animal.estado === 'En tratamiento' 
                      ? 'bg-amber-100 text-amber-600' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {animal.estado}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{animal.especie} {animal.raza ? `• ${animal.raza}` : ''}</p>
                <p className="text-sm text-slate-400 mb-5">{animal.edad || 'Edad no especificada'} • {animal.sexo}</p>
                
                <div className="mt-auto flex gap-2">
                  <button 
                    onClick={() => abrirModalAnimal(animal)}
                    className="flex-1 py-3 rounded-2xl text-white font-bold transition hover:opacity-90 shadow-md"
                    style={{ backgroundColor: tema.principal }}
                  >
                    Ver detalles
                  </button>
                  <button 
                    onClick={(e) => abrirModalEditar(animal, e)}
                    className="px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                    title="Editar datos"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

      </main>

      {/* MODAL DETALLES DE MASCOTA */}
      {animalSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
              <button 
                onClick={(e) => {
                  const anim = animalSeleccionado;
                  setAnimalSeleccionado(null);
                  abrirModalEditar(anim, e);
                }}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition flex items-center gap-1.5 px-4 font-bold text-xs"
              >
                <Edit className="w-4 h-4" /> Editar Mascota
              </button>
              <button 
                onClick={() => setAnimalSeleccionado(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              
              {/* Columna Izquierda: Foto e Info General */}
              <div className="md:w-2/5 p-8 border-r border-slate-100" style={{ backgroundColor: `${tema.secundario}10` }}>
                <div 
                  className="w-full h-64 rounded-3xl bg-cover bg-center mb-6 shadow-sm border-4 border-white"
                  style={{ backgroundImage: `url(${animalSeleccionado.foto_url || 'https://via.placeholder.com/300x300?text=Sin+Foto'})` }}
                />
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{animalSeleccionado.nombre}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.especie}</span>
                  {animalSeleccionado.raza && <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.raza}</span>}
                  <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.sexo}</span>
                  <span className="px-3 py-1 bg-white rounded-xl text-xs font-bold text-slate-500 border border-slate-200">{animalSeleccionado.estado}</span>
                </div>
                
                <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <span style={{ color: tema.principal }}>📖</span> Historia / Contexto
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {animalSeleccionado.historia || 'No hay información registrada sobre cómo llegó al refugio o su comportamiento actual.'}
                </p>
              </div>

              {/* Columna Derecha: Ficha Médica */}
              <div className="md:w-3/5 p-8 bg-white">
               <h3 className="text-xl font-extrabold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2 pr-28 md:pr-36 whitespace-normal flex-wrap">
                  <span style={{ color: tema.principal }}>⚕️</span> Ficha Médica e Historial Veterinario
              </h3>

                {cargandoFicha ? (
                  <div className="flex items-center justify-center h-40 text-slate-400 font-medium">Cargando ficha...</div>
                ) : fichaClinica ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Estado Reproductivo</p>
                        <p className="font-bold text-slate-700 flex items-center gap-2">
                          {fichaClinica.esterilizado ? '✅ Esterilizado/a' : '❌ Sin esterilizar'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Vacunas</p>
                        <p className="font-bold text-slate-700 flex items-center gap-2">
                          {fichaClinica.vacunas_al_dia ? '✅ Al día' : '⚠️ Pendientes'}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Peso Registrado</p>
                        <p className="font-bold text-slate-700">{fichaClinica.peso_kg ? `${fichaClinica.peso_kg} kg` : 'No registrado'}</p>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Microchip</p>
                        <p className="font-bold text-slate-700">{animalSeleccionado.microchip || 'No posee'}</p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-blue-50 bg-blue-50/50">
                      <p className="text-xs text-blue-400 font-bold uppercase mb-2">Diagnóstico de Ingreso</p>
                      <p className="text-sm font-medium text-slate-600">{fichaClinica.diagnostico_ingreso || 'Sin diagnóstico registrado.'}</p>
                    </div>

                    <div className="p-5 rounded-2xl border border-amber-50 bg-amber-50/50">
                      <p className="text-xs text-amber-400 font-bold uppercase mb-2">Tratamientos / Observaciones Médicas</p>
                      <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap">{fichaClinica.observaciones_medicas || 'Sin observaciones recientes.'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center p-6">
                    <p className="text-slate-500 font-medium mb-2">No se encontró una ficha médica para esta mascota.</p>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition">
                      + Crear Ficha Clínica
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMULARIO DE CREAR / EDITAR MASCOTA */}
      {modalFormAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative my-8">
            
            <button 
              onClick={cerrarModalForm}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <span style={{ color: tema.principal }}>🐾</span>
                {modoModal === 'crear' ? 'Registrar Nueva Mascota' : 'Editar Datos de Mascota'}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {modoModal === 'crear' ? 'Ingresa los datos del animal para agregarlo al catálogo.' : 'Modifica los campos necesarios.'}
              </p>
            </div>

            {errorForm && (
              <div className="mb-4 p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm border border-red-100">
                ⚠️ {errorForm}
              </div>
            )}

            <form onSubmit={handleSubmitAnimal} className="space-y-4">
              
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre</label>
                <input 
                  type="text"
                  required
                  value={formAnimal.nombre}
                  onChange={(e) => setFormAnimal({ ...formAnimal, nombre: e.target.value })}
                  placeholder="Ej: Pelusa"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition text-sm font-medium"
                  style={{ focusRingColor: tema.principal }}
                />
              </div>

              {/* Especie y Sexo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Especie</label>
                  <select 
                    value={formAnimal.especie}
                    onChange={(e) => setFormAnimal({ ...formAnimal, especie: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition text-sm font-medium bg-white"
                  >
                    <option value="Perro">🐶 Perro</option>
                    <option value="Gato">🐱 Gato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Sexo</label>
                  <select 
                    value={formAnimal.sexo}
                    onChange={(e) => setFormAnimal({ ...formAnimal, sexo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition text-sm font-medium bg-white"
                  >
                    <option value="Macho">♂️ Macho</option>
                    <option value="Hembra">♀️ Hembra</option>
                  </select>
                </div>
              </div>

              {/* Edad y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Edad / F. Nacimiento Estimada</label>
                  <input 
                    type="text"
                    required
                    value={formAnimal.edad}
                    onChange={(e) => setFormAnimal({ ...formAnimal, edad: e.target.value })}
                    placeholder="Ej: 2 años / 6 meses"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Estado Inicial</label>
                  <select 
                    value={formAnimal.estado}
                    onChange={(e) => setFormAnimal({ ...formAnimal, estado: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition text-sm font-medium bg-white"
                  >
                    <option value="En adopción">En adopción</option>
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Adoptado">Adoptado</option>
                  </select>
                </div>
              </div>

              {/* Foto de la Mascota (Subir archivo o URL previa) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Foto de la Mascota</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition bg-slate-50 text-slate-500 font-bold text-xs">
                    <Upload className="w-4 h-4" />
                    <span>{archivoFoto ? archivoFoto.name : 'Seleccionar archivo de imagen'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFotoChange}
                      className="hidden" 
                    />
                  </label>
                  {vistaPreviaFoto && (
                    <div 
                      className="w-12 h-12 rounded-xl bg-cover bg-center border border-slate-200 flex-shrink-0"
                      style={{ backgroundImage: `url(${vistaPreviaFoto})` }}
                    />
                  )}
                </div>
              </div>

              {/* Historia / Contexto */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Historia / Contexto de Rescate</label>
                <textarea 
                  rows="3"
                  value={formAnimal.historia}
                  onChange={(e) => setFormAnimal({ ...formAnimal, historia: e.target.value })}
                  placeholder="Escribe dónde y cómo fue encontrado, o detalles importantes..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 transition text-sm font-medium custom-scrollbar"
                />
              </div>

              {/* Botones del Formulario */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={cerrarModalForm}
                  className="px-5 py-3 rounded-2xl text-slate-500 font-bold text-sm hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={guardandoAnimal}
                  className="px-6 py-3 rounded-2xl text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: tema.principal }}
                >
                  {guardandoAnimal ? 'Guardando...' : modoModal === 'crear' ? 'Registrar Mascota' : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}