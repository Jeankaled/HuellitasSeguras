import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Heart, ArrowLeft, ShieldCheck, Info, MapPin, CheckCircle, Phone, Mail, Building2, Sparkles } from 'lucide-react';

export default function CatalogoMascotasRefugio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refugioId = searchParams.get('fundacion');

  const [refugio, setRefugio] = useState(null);
  const [animales, setAnimales] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('Todos');
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [fichaMedica, setFichaMedica] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  // Cargar información de la fundación y sus mascotas conectando al backend de forma segura
  useEffect(() => {
    if (!refugioId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Usamos TU ruta especializada del backend
        const res = await fetch(`${apiBase}/animales/catalogo/${refugioId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Tu backend ya te entrega todo empaquetado y listo para usar
          setRefugio(data.fundacion);
          setAnimales(data.animales || []);
        } else {
          console.error("Error al cargar los datos de la fundación");
        }
      } catch (error) {
        console.error("Error de conexión al cargar catálogo:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [refugioId]);

  // Cargar ficha médica al abrir el modal de una mascota
  const abrirDetalles = async (animal) => {
    setAnimalSeleccionado(animal);
    setCargandoFicha(true);
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/fichas-clinicas/animal/${animal.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFichaMedica(data);
      } else {
        setFichaMedica(null);
      }
    } catch {
      setFichaMedica(null);
    } finally {
      setCargandoFicha(false);
    }
  };

  // Función para redirigir al formulario de adopción de forma segura
  const handleQuieroAdoptar = () => {
    if (!animalSeleccionado) return;
    
    // Soportar tanto 'id' como '_id' (por si tu BD es MongoDB)
    const idMascota = animalSeleccionado.id || animalSeleccionado._id;
    
    // Cerrar el modal antes de navegar
    setAnimalSeleccionado(null);
    
    // Redirigir a la vista del formulario
    navigate(`/formulario-adopcion?mascotaId=${idMascota}&mascotaNombre=${animalSeleccionado.nombre}`);
  };

  // 1. Filtrado dinámico mejorado y normalizado
  const animalesFiltrados = animales.filter(animal => {
    const coincideTexto = animal.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                          animal.raza?.toLowerCase().includes(busqueda.toLowerCase());
    
    // Normalizamos las especies a minúsculas para evitar errores de coincidencia
    const especieAnimal = animal.especie?.trim().toLowerCase() || '';
    const especieFiltro = filtroEspecie === 'Todos' ? 'todos' : filtroEspecie.trim().toLowerCase();
    
    const coincideEspecie = filtroEspecie === 'Todos' || especieAnimal === especieFiltro;
    return coincideTexto && coincideEspecie;
  });

  const colorPrimario = refugio?.color_principal || '#F472B6';
  const colorSecundario = refugio?.color_secundario || '#FBCFE8';

  return (
    <div className="min-h-screen bg-pink-50/30 font-sans text-slate-700 pb-16">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
          <button 
            onClick={() => navigate('/fundaciones')}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-pink-100 text-pink-600 font-bold text-[11px] md:text-xs hover:bg-pink-200 transition shadow-sm active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> 
            <span className="hidden sm:inline">Volver a Fundaciones</span>
            <span className="sm:hidden">Volver</span>
          </button>
          
          <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer truncate" onClick={() => navigate('/fundaciones')}>
            <span className="text-xl md:text-2xl shrink-0">🐾</span>
            <h1 className="text-sm md:text-xl font-extrabold text-slate-800 truncate">Huellita Segura</h1>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO / INFORMACIÓN DE LA FUNDACIÓN */}
      <div 
        className="relative py-8 md:py-12 px-4 md:px-6 overflow-hidden shadow-md mb-8 md:mb-10 transition-colors duration-500"
        style={{ background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})` }}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white/90 backdrop-blur-md p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-white/40">
          
          {/* Logo de la Fundación */}
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl bg-white p-2 md:p-3 shadow-lg border-2 md:border-4 border-white flex items-center justify-center overflow-hidden shrink-0">
            {refugio?.logo_url || refugio?.logo ? (
              <img 
                src={
                  (refugio.logo_url || refugio.logo).startsWith('http')
                    ? (refugio.logo_url || refugio.logo)
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${(refugio.logo_url || refugio.logo)}`
                }
                alt={refugio.nombre_organizacion}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 md:w-12 md:h-12 text-pink-400" />
            )}
          </div>

          {/* Información y Datos de Contacto */}
          <div className="flex-1 text-center md:text-left w-full">
            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 rounded-full bg-pink-100 text-pink-600 font-extrabold text-[10px] md:text-xs mb-2">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> Refugio Aliado
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              {refugio?.nombre_organizacion || "Cargando..."}
            </h2>
            <p className="text-slate-500 text-[11px] md:text-sm font-medium mt-1 md:mt-2 px-2 md:px-0">
              {refugio?.descripcion || "Somos una organización comprometida con el rescate, rehabilitación y búsqueda de hogares llenos de amor."}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-4 text-[11px] md:text-xs font-semibold text-slate-600">
              {refugio?.direccion && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 bg-pink-50/80 md:bg-pink-50 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-pink-500 shrink-0" /> 
                  <span className="truncate">{refugio.direccion}</span>
                </div>
              )}
              {refugio?.telefono && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 bg-purple-50/80 md:bg-purple-50 px-3 py-1.5 rounded-xl">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500 shrink-0" /> 
                  <span>{refugio.telefono}</span>
                </div>
              )}
              {refugio?.email_contacto && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 bg-sky-50/80 md:bg-sky-50 px-3 py-1.5 rounded-xl">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-500 shrink-0" /> 
                  <span className="truncate">{refugio.email_contacto}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: BÚSQUEDA Y MASCOTAS */}
      <main className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-pink-100">
          <div className="w-full md:w-auto">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-800">Peluditos en Adopción 🐾</h3>
            <p className="text-[11px] md:text-xs text-slate-400 font-medium">Encuentra a tu nuevo mejor amigo.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Buscar por nombre o raza..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
            <select 
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 md:py-3 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            >
              <option value="Todos">Todas las especies</option>
              <option value="Perro">Perros 🐶</option>
              <option value="Gato">Gatos 🐱</option>
            </select>
          </div>
        </div>

        {/* GRID DE MASCOTAS */}
        {cargando ? (
          <div className="text-center py-16 md:py-20 text-pink-400 font-bold text-base md:text-lg animate-pulse">
            Cargando el catálogo de mascotas... 🐾
          </div>
        ) : animalesFiltrados.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-[2rem] md:rounded-3xl border border-pink-100 shadow-sm max-w-md mx-auto p-6 md:p-8">
            <div className="text-4xl md:text-5xl mb-3">😿</div>
            <h4 className="font-bold text-slate-700 text-base md:text-lg">No hay mascotas disponibles</h4>
            <p className="text-[11px] md:text-xs text-slate-400 mt-1">Intenta con otra búsqueda o filtro.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {animalesFiltrados.map((animal) => (
              <div 
                key={animal.id}
                onClick={() => abrirDetalles(animal)}
                className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform md:hover:-translate-y-2 border border-pink-100 flex flex-col cursor-pointer group"
              >
                {/* FOTO */}
                <div className="relative h-56 md:h-64 overflow-hidden bg-pink-50">
                  {animal.foto_url || animal.foto ? (
                    <img 
                      src={
                        (animal.foto_url || animal.foto).startsWith('http') 
                          ? (animal.foto_url || animal.foto) 
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${animal.foto_url || animal.foto}`
                      } 
                      alt={animal.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 group-hover:scale-105 transition duration-500">
                      <span className="text-3xl md:text-4xl mb-2">🐾</span>
                      <span className="font-bold text-xs md:text-sm">Foto no disponible</span>
                    </div>
                  )}
                  
                  <span className="absolute top-3 right-3 md:top-4 md:right-4 bg-white/90 backdrop-blur-md text-pink-600 text-[10px] md:text-xs font-extrabold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full shadow-sm">
                    {animal.estado || 'Disponible'}
                  </span>
                  <span className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-slate-900/60 backdrop-blur-md text-white text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 rounded-xl">
                    {animal.especie}
                  </span>
                </div>

                {/* INFORMACIÓN DE LA MASCOTA */}
                <div className="p-4 md:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-800">{animal.nombre}</h3>
                    <p className="text-slate-500 text-xs md:text-sm font-medium mt-0.5 flex justify-between">
                      <span className="truncate pr-2">{animal.raza || 'Raza mestiza'}</span>
                      <span className="text-pink-500 font-bold shrink-0">{animal.edad ? animal.edad : 'N/D'}</span>
                    </p>
                  </div>

                  <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Ver ficha</span>
                    <div 
                      className="w-8 h-8 md:w-9 md:h-9 rounded-xl md:rounded-2xl text-white flex items-center justify-center transition shadow-md"
                      style={{ backgroundColor: colorPrimario }}
                    >
                      <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 fill-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DE DETALLE DE LA MASCOTA */}
      {animalSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
          <div className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-pink-100 transform transition-all flex flex-col max-h-[90vh] sm:max-h-[90vh] mt-12 sm:mt-0 animate-slide-up sm:animate-none">
            
            {/* CABECERA DEL MODAL */}
            <div className="relative h-56 md:h-72 bg-pink-100 shrink-0">
              {animalSeleccionado.foto_url || animalSeleccionado.foto ? (
                <img 
                  src={
                    (animalSeleccionado.foto_url || animalSeleccionado.foto).startsWith('http') 
                      ? (animalSeleccionado.foto_url || animalSeleccionado.foto) 
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${animalSeleccionado.foto_url || animalSeleccionado.foto}`
                  } 
                  alt={animalSeleccionado.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <span className="text-5xl md:text-6xl mb-2">🐾</span>
                  <span className="font-bold text-base md:text-lg">Foto no disponible</span>
                </div>
              )}

              <button 
                onClick={() => setAnimalSeleccionado(null)}
                className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur-md rounded-full text-slate-700 font-extrabold flex items-center justify-center hover:bg-white shadow-lg transition text-xs md:text-base z-10"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-white/90 backdrop-blur-md px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl shadow-sm max-w-[85%]">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 truncate">{animalSeleccionado.nombre}</h2>
                <p className="text-[10px] md:text-xs font-bold text-pink-600 truncate">{animalSeleccionado.especie} • {animalSeleccionado.raza || 'Mestizo'}</p>
              </div>
            </div>

            {/* CUERPO DEL MODAL (CON SCROLL) */}
            <div className="p-4 md:p-6 lg:p-8 space-y-5 md:space-y-6 overflow-y-auto flex-1 pb-24 sm:pb-6">
              
              {/* Datos generales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-pink-50/60 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-center">
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold block">SEXO</span>
                  <span className="text-slate-700 font-extrabold text-xs md:text-sm">{animalSeleccionado.sexo || 'N/D'}</span>
                </div>
                <div className="bg-pink-50/60 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-center">
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold block">EDAD</span>
                  <span className="text-slate-700 font-extrabold text-xs md:text-sm">{animalSeleccionado.edad ? animalSeleccionado.edad : 'N/D'}</span>
                </div>
                <div className="bg-pink-50/60 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-center overflow-hidden">
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold block">MICROCHIP</span>
                  <span className="text-slate-700 font-extrabold text-[10px] md:text-xs truncate block">{animalSeleccionado.microchip || 'Ninguno'}</span>
                </div>
                <div className="bg-pink-50/60 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-center">
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold block">ESTADO</span>
                  <span className="text-pink-600 font-extrabold text-[10px] md:text-xs truncate block">{animalSeleccionado.estado}</span>
                </div>
              </div>

              {/* Historia */}
              <div>
                <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 md:gap-2 mb-2 text-sm md:text-base">
                  <Info className="w-4 h-4 text-pink-500" /> Historia y Comportamiento
                </h4>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                  {animalSeleccionado.historia || "Este peludito aún no tiene una historia registrada, pero está lleno de amor y listo para encontrar un hogar cálido."}
                </p>
              </div>

              {/* Ficha Médica */}
              <div>
                <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5 md:gap-2 mb-2 text-sm md:text-base">
                  <ShieldCheck className="w-4 h-4 text-pink-500" /> Historial Veterinario
                </h4>
                {cargandoFicha ? (
                  <p className="text-xs md:text-sm text-slate-400 animate-pulse">Cargando historial médico...</p>
                ) : fichaMedica ? (
                  <div className="bg-emerald-50/60 border border-emerald-100 p-3 md:p-4 rounded-xl md:rounded-2xl space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-1.5 md:gap-2 text-emerald-700 font-bold text-xs md:text-sm mb-2">
                      <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> Ficha Médica Activa
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-600"><strong>Vacunas:</strong> {fichaMedica.vacunas || 'Al día'}</p>
                    <p className="text-[11px] md:text-xs text-slate-600"><strong>Esterilizado:</strong> {fichaMedica.esterilizado ? 'Sí' : 'No'}</p>
                    <p className="text-[11px] md:text-xs text-slate-600"><strong>Observaciones:</strong> {fichaMedica.tratamientos || 'Ninguna'}</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                    <p className="text-[11px] md:text-xs text-slate-400 font-medium">No hay registros médicos detallados en este momento.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PIE DEL MODAL (Fijo en móvil para que siempre esté visible) */}
            <div className="p-4 md:p-6 bg-white sm:bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 md:gap-3 shrink-0 absolute sm:relative bottom-0 left-0 w-full">
              <button 
                onClick={() => setAnimalSeleccionado(null)}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-slate-100 sm:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm hover:bg-slate-200 sm:hover:bg-slate-300 transition text-center"
              >
                Cancelar
              </button>
              <button 
                onClick={handleQuieroAdoptar}
                className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-emerald-400 hover:bg-emerald-500 text-white font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-2 shadow-md transition text-xs md:text-sm"
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5 fill-white" />
                ¡Quiero Adoptar!
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}