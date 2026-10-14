import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Home, 
  ClipboardList, 
  Clock,
  Download,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';

export default function FichaSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [tabActiva, setTabActiva] = useState('formulario');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [solicitud, setSolicitud] = useState(null);

  // Tema de la fundación
  const [tema, setTema] = useState({ principal: '#F9A8D4', secundario: '#93C5FD' });

  useEffect(() => {
    const cargarFicha = async () => {
      try {
        const token = localStorage.getItem('token');
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');

        if (!token) {
          navigate('/login');
          return;
        }

        if (usuarioGuardado.tema) {
          setTema({
            principal: usuarioGuardado.tema.principal || '#F9A8D4',
            secundario: usuarioGuardado.tema.secundario || '#93C5FD'
          });
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/adoptantes/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('No se pudo cargar la información de esta solicitud.');
        }

        const data = await res.json();
        const adoptanteReal = data.data || data.adoptante || data;

        setSolicitud({
          id: adoptanteReal.id,
          estado: adoptanteReal.estado || 'Pendiente',
          postulante: {
            nombre: adoptanteReal.nombre_completo || adoptanteReal.nombre || 'Sin Nombre',
            rut: adoptanteReal.rut || '',
            telefono: adoptanteReal.telefono || '',
            correo: adoptanteReal.correo || '',
            ciudad: adoptanteReal.ciudad || '',
            avatar: (adoptanteReal.nombre_completo || adoptanteReal.nombre || 'A').charAt(0).toUpperCase()
          },
          mascota: {
            nombre: adoptanteReal.nombre_mascota || '',
            especie: adoptanteReal.especie_mascota || '',
            foto: adoptanteReal.foto_mascota || ''
          },
          respuestas: adoptanteReal.respuestas || adoptanteReal,
          documentos: adoptanteReal.documentos || [],
          historial: adoptanteReal.historial || []
        });

      } catch (err) {
        console.error("Error al cargar ficha:", err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarFicha();
  }, [id, navigate]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 bg-slate-50">
        Cargando ficha de la solicitud... 🐾
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-slate-600 bg-slate-50 gap-4">
        <p className="text-red-500 text-xl">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-slate-200 rounded-xl hover:bg-slate-300 transition">
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 flex flex-col">
      {/* HEADER PRINCIPAL */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm z-10">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5"/> Volver al panel principal
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            {/* Info del Postulante */}
            <div className="flex items-center gap-5">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-md"
                style={{ backgroundColor: tema.secundario }}
              >
                {solicitud.postulante.avatar}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-slate-800">{solicitud.postulante.nombre}</h1>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full uppercase tracking-wider">
                    {solicitud.estado}
                  </span>
                </div>
                <div className="text-slate-500 font-medium mt-1 flex gap-4 flex-wrap text-sm">
                  {solicitud.postulante.rut && (
                    <span className="flex items-center gap-1"><User className="w-4 h-4"/> RUT: {solicitud.postulante.rut}</span>
                  )}
                  {solicitud.postulante.telefono && (
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {solicitud.postulante.telefono}</span>
                  )}
                  {solicitud.postulante.correo && (
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4"/> {solicitud.postulante.correo}</span>
                  )}
                  {solicitud.postulante.ciudad && (
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {solicitud.postulante.ciudad}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Info Mascota y Botones */}
            <div className="flex items-center gap-6 border-l border-slate-200 pl-6 w-full lg:w-auto">
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                {solicitud.mascota.foto ? (
                  <img src={solicitud.mascota.foto} alt="Mascota" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">Sin foto</div>
                )}
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Postula por</p>
                  <p className="font-extrabold text-slate-700">{solicitud.mascota.nombre || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  className="px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-90 transition flex items-center gap-2 justify-center"
                  style={{ backgroundColor: tema.principal }}
                  onClick={() => alert('Función de aprobar en desarrollo')}
                >
                  <CheckCircle className="w-5 h-5"/> Aprobar
                </button>
                <button className="px-6 py-2.5 rounded-xl text-slate-500 bg-white border border-slate-200 font-bold hover:bg-slate-50 transition flex items-center gap-2 justify-center text-sm">
                  <XCircle className="w-4 h-4"/> Rechazar / Más info
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO Y PESTAÑAS */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-8">
        
        {/* Navegación de Pestañas */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          {[
            { id: 'formulario', icon: Home, label: 'Formulario' },
            { id: 'evaluacion', icon: ClipboardList, label: 'Evaluación y Notas' },
            { id: 'documentos', icon: FileText, label: 'Documentos' },
            { id: 'historial', icon: Clock, label: 'Historial' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
                tabActiva === tab.id 
                  ? 'bg-slate-100 text-slate-800 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-5 h-5"/> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO DINÁMICO DE LAS PESTAÑAS */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          
          {tabActiva === 'formulario' && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-4">Detalles del Hogar y Estilo de Vida</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Vivienda</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.tipo_vivienda || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Composición del Hogar</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.composicion_hogar || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Otras Mascotas</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.otras_mascotas || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Tiempo a solas estimado</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.tiempo_solas || 'No especificado'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Motivación para adoptar</p>
                  <p className="font-medium text-slate-700 bg-slate-50 p-4 rounded-xl">
                    {solicitud.respuestas.motivacion || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'evaluacion' && (
            <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 mb-6">Checklist de Verificación</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                    <span className="font-medium text-slate-700">Entrevista telefónica realizada</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                    <span className="font-medium text-slate-700">Visita domiciliaria aprobada</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                    <span className="font-medium text-slate-700">Aprobación del comité</span>
                  </label>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 mb-6">Notas Internas (Privado)</h2>
                <textarea 
                  rows="6"
                  className="w-full bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Escribe notas sobre la evaluación aquí. Esto solo es visible para la fundación..."
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button className="px-6 py-2 bg-amber-200 text-amber-800 font-bold rounded-xl hover:bg-amber-300 transition">
                    Guardar Notas
                  </button>
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'documentos' && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">Archivos Adjuntos</h2>
              {solicitud.documentos.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No hay documentos adjuntos registrados para esta solicitud.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {solicitud.documentos.map((doc, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:border-slate-300 transition bg-slate-50">
                      <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400">
                        <FileText className="w-6 h-6"/>
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{doc.nombre || 'Documento'}</p>
                        <p className="text-xs font-medium text-slate-400">{doc.fecha ? `Subido: ${doc.fecha}` : ''}</p>
                      </div>
                      {doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 w-full py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4"/> Descargar
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tabActiva === 'historial' && (
            <div className="animate-fadeIn">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6">Registro de Actividad</h2>
              {solicitud.historial.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No hay registros de actividad adicionales.</p>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                  {solicitud.historial.map((item, idx) => (
                    <div key={idx} className="pl-6 relative">
                      <div className="absolute w-4 h-4 bg-blue-400 rounded-full -left-[9px] top-1 border-2 border-white shadow-sm"></div>
                      <p className="font-bold text-slate-700">{item.accion || item.titulo}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.descripcion}</p>
                      {item.fecha && <p className="text-xs font-bold text-slate-400 mt-2">{item.fecha}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}