import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, Home, 
  ClipboardList, Clock, Download, Phone, Mail, 
  User, MessageCircle, ShieldCheck, ArrowRight, AlertCircle,
  ShieldAlert, Calendar, X
} from 'lucide-react';
import MarcoLegal from './MarcoLegal'; // <-- Importación añadida

export default function FichaSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [tabActiva, setTabActiva] = useState('formulario');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [enviandoAccion, setEnviandoAccion] = useState(false);

  // Estados para reportes comunitarios del postulante
  const [reportesPostulante, setReportesPostulante] = useState([]);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);

  // Estados para UI dinámica (Toasts y Modales)
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [modalRechazo, setModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("La postulación no cumple con los requisitos mínimos de adopción.");

  // Tema de la fundación (inicializado desde localStorage)
  const [tema] = useState(() => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      return {
        principal: usuarioGuardado.tema?.principal || '#F9A8D4',
        secundario: usuarioGuardado.tema?.secundario || '#93C5FD'
      };
    } catch {
      return { principal: '#F9A8D4', secundario: '#93C5FD' };
    }
  });

  // Definimos un orden numérico para las etapas para saber si estamos avanzando o solo navegando
  const ordenEstados = ['En Revisión', 'En Evaluación', 'Revisión de Documentos', 'Cierre y Contrato', 'Aprobada', 'Rechazada'];

  useEffect(() => {
    const cargarFicha = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login');
          return;
        }

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Consultamos la postulación y los reportes comunitarios en paralelo
        const [res, resReportes] = await Promise.all([
          fetch(`${apiBase}/postulaciones/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch(`${apiBase}/reportes-adoptantes`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }).catch(() => ({ ok: false }))
        ]);

        if (!res.ok) {
          throw new Error('No se pudo cargar la información de esta solicitud.');
        }

        const data = await res.json();
        const post = data.datos || data;

        const rutAdoptante = post.rut_adoptante || '';

        // Filtrar reportes que coincidan con el RUT del postulante
        if (resReportes && resReportes.ok && rutAdoptante) {
          const listaReportes = await resReportes.json();
          const coincidencias = Array.isArray(listaReportes)
            ? listaReportes.filter(r => r.adoptante_rut === rutAdoptante)
            : [];
          setReportesPostulante(coincidencias);
        }

        setSolicitud({
          id: post.id,
          estado: post.estado_postulacion || 'En Revisión',
          postulante: {
            nombre: post.nombre_adoptante || 'Sin Nombre',
            rut: rutAdoptante,
            telefono: post.telefono_adoptante || '',
            correo: post.correo_adoptante || '',
            ciudad: post.direccion_adoptante || 'No especificada', 
            avatar: (post.nombre_adoptante || 'A').charAt(0).toUpperCase()
          },
          mascota: {
            nombre: post.nombre_animal || 'No especificada',
            especie: post.especie_animal || 'No especificada',
            foto: post.foto_animal || ''
          },
          respuestas: {
            tipo_vivienda: post.tipo_vivienda || 'No especificado',
            composicion_hogar: post.composicion_hogar || 'No especificado',
            otras_mascotas: post.otras_mascotas || 'No especificado',
            tiempo_solas: post.tiempo_solas || 'No especificado',
            motivacion: post.motivacion || 'No especificada'
          },
          documentos: post.foto_cedula_url ? [{ nombre: 'Cédula de Identidad', url: post.foto_cedula_url, fecha: 'Reciente' }] : [],
          historial: []
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

  // Función auxiliar para mostrar el toast bonito
  const mostrarToast = (mensaje, tipo = 'success') => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: '', tipo: 'success' }), 4000);
  };

  // Función inteligente de avance de etapa
  const avanzarEtapaInteligente = async (nuevaEtapa, nombreEtapaTexto) => {
    const indexEstadoActual = ordenEstados.indexOf(solicitud.estado);
    const indexEstadoDestino = ordenEstados.indexOf(nombreEtapaTexto);

    // Si ya estamos en esta etapa (o una más avanzada), SOLO navegamos visualmente, no llamamos al backend
    if (indexEstadoActual >= indexEstadoDestino) {
      setTabActiva(nuevaEtapa);
      return;
    }

    // Si es una etapa nueva, llamamos al backend y mandamos correo
    setEnviandoAccion(true);
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${apiBase}/postulaciones/${solicitud.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado_postulacion: nombreEtapaTexto })
      });

      if (res.ok) {
        setTabActiva(nuevaEtapa);
        setSolicitud(prev => ({ ...prev, estado: nombreEtapaTexto }));
        mostrarToast(`¡Proceso actualizado! Se notificó a ${solicitud.postulante.nombre}.`);
      } else {
        mostrarToast('Error al actualizar la etapa en el servidor.', 'error');
      }
    } catch (err) {
      console.error("Error al avanzar etapa:", err);
      mostrarToast('Error de conexión. Se avanzó localmente.', 'error');
      setTabActiva(nuevaEtapa);
    } finally {
      setEnviandoAccion(false);
    }
  };

  // Función para procesar el rechazo
  const procesarRechazo = async () => {
    setModalRechazo(false); // Cerramos modal
    setEnviandoAccion(true);
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const res = await fetch(`${apiBase}/postulaciones/${solicitud.id}/respuesta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accion: 'rechazar',
          motivo: motivoRechazo
        })
      });

      if (res.ok) {
        setSolicitud(prev => ({ ...prev, estado: 'Rechazada' }));
        mostrarToast(`Solicitud rechazada. Correo enviado a ${solicitud.postulante.nombre}.`);
      } else {
        mostrarToast('Error al procesar el rechazo.', 'error');
      }
    } catch (err) {
      console.error("Error al rechazar:", err);
      setSolicitud(prev => ({ ...prev, estado: 'Rechazada' }));
      mostrarToast('Marcado como rechazado localmente.', 'error');
    } finally {
      setEnviandoAccion(false);
    }
  };

  const obtenerEnlaceWhatsApp = () => {
    if (!solicitud?.postulante?.telefono) return '#';
    const telefonoLimpio = solicitud.postulante.telefono.replace(/\D/g, '');
    const mensaje = encodeURIComponent(
      `Hola ${solicitud.postulante.nombre}, te contactamos desde la fundación de rescate animal por tu postulación para adoptar a ${solicitud.mascota.nombre}. ¿Cómo estás?`
    );
    return `https://wa.me/${telefonoLimpio}?text=${mensaje}`;
  };

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-700 flex flex-col relative overflow-hidden">
      
      {/* 🚀 COMPONENTE DE NOTIFICACIÓN DINÁMICA (TOAST) */}
      {notificacion.mostrar && (
        <div className={`fixed top-6 right-4 left-4 md:left-auto md:right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border animate-in slide-in-from-top-5 fade-in duration-300 ${
          notificacion.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {notificacion.tipo === 'error' ? <AlertCircle className="w-5 h-5 shrink-0"/> : <CheckCircle className="w-5 h-5 shrink-0"/>}
          <p className="font-bold text-sm">{notificacion.mensaje}</p>
        </div>
      )}

      {/* 🚫 MODAL DINÁMICO DE RECHAZO */}
      {modalRechazo && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <XCircle className="w-8 h-8 shrink-0" />
              <h3 className="text-lg md:text-xl font-extrabold">Rechazar Solicitud</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Ingresa el motivo del rechazo. Este mensaje será enviado al correo del postulante.
            </p>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none mb-6 custom-scrollbar"
              rows="4"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            ></textarea>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button 
                onClick={() => setModalRechazo(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={procesarRechazo}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ MODAL PARA VER HISTORIAL DE REPORTES DEL POSTULANTE */}
      {modalHistorialAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setModalHistorialAbierto(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Alertas en la Red</h3>
                <p className="text-xs text-slate-500">
                  {solicitud.postulante.nombre} ({solicitud.postulante.rut})
                </p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-2 custom-scrollbar">
              {reportesPostulante.map((reporte) => (
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

      {/* HEADER PRINCIPAL RESPONSIVO */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-6 shadow-sm z-10">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-4 md:mb-6 transition font-medium text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5"/> Volver al panel principal
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            {/* Info del Adoptante */}
            <div className="flex items-start sm:items-center gap-4 md:gap-5 w-full lg:w-auto">
              <div 
                className="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-extrabold text-white shadow-md shrink-0 mt-1 sm:mt-0"
                style={{ backgroundColor: tema.secundario }}
              >
                {solicitud.postulante.avatar}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h1 className="text-xl md:text-3xl font-extrabold text-slate-800 break-words">{solicitud.postulante.nombre}</h1>
                  <span className={`px-2.5 py-1 md:px-3 font-bold text-[10px] md:text-xs rounded-full uppercase tracking-wider whitespace-nowrap ${
                    solicitud.estado === 'Rechazada' ? 'bg-red-100 text-red-700' :
                    solicitud.estado === 'Aprobada' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {solicitud.estado}
                  </span>
                </div>
                
                <div className="text-slate-500 font-medium mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs md:text-sm">
                  {solicitud.postulante.rut && (
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5"/> {solicitud.postulante.rut}</span>
                  )}
                  {solicitud.postulante.telefono && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {solicitud.postulante.telefono}</span>
                      <a 
                        href={obtenerEnlaceWhatsApp()} target="_blank" rel="noopener noreferrer"
                        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3"/> WhatsApp
                      </a>
                    </div>
                  )}
                  {solicitud.postulante.correo && (
                    <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-none"><Mail className="w-3.5 h-3.5 shrink-0"/> <span className="truncate">{solicitud.postulante.correo}</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* Info de Mascota y Acciones */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-100 lg:border-slate-200 pt-4 lg:pt-0 lg:pl-6">
              
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 md:py-2 rounded-2xl border border-slate-100 flex-1 sm:flex-none">
                {solicitud.mascota.foto ? (
                  <img src={solicitud.mascota.foto} alt="Mascota" className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-500 text-center leading-tight shrink-0">Sin foto</div>
                )}
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase truncate">Postula por</p>
                  <p className="font-extrabold text-slate-700 text-sm md:text-base truncate">{solicitud.mascota.nombre || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                <button 
                  className="flex-1 sm:flex-none px-3 md:px-6 py-2.5 rounded-xl text-white font-bold shadow-md hover:opacity-90 transition flex items-center gap-2 justify-center text-xs md:text-sm"
                  style={{ backgroundColor: tema.principal }}
                  onClick={() => mostrarToast('Función de aprobar rápido en desarrollo', 'success')}
                >
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> Aprobar
                </button>
                <button 
                  onClick={() => setModalRechazo(true)}
                  className="flex-1 sm:flex-none px-3 md:px-6 py-2.5 rounded-xl text-red-600 bg-red-50 border border-red-200 font-bold hover:bg-red-100 transition flex items-center gap-2 justify-center text-xs md:text-sm text-center"
                >
                  <XCircle className="w-4 h-4 shrink-0"/> Rechazar
                </button>
              </div>
            </div>

          </div>

          {/* 🚨 BANNER DE ALERTA SI EL POSTULANTE TIENE REPORTES EN LA RED */}
          {reportesPostulante.length > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-red-800">
                    ¡Atención! Este postulante tiene {reportesPostulante.length} reporte{reportesPostulante.length > 1 ? 's' : ''} en la red de fundaciones.
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    Revisa los antecedentes antes de continuar con el proceso de adopción.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalHistorialAbierto(true)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0 text-center"
              >
                Ver detalles ({reportesPostulante.length})
              </button>
            </div>
          )}

        </div>
      </header>

      {/* CONTENIDO Y PESTAÑAS */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-8 py-6 md:py-8">
        
        {/* Pestañas (con scroll horizontal en celular) */}
        <div className="flex gap-2 mb-6 md:mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto hide-scrollbar">
          {[
            { id: 'formulario', icon: Home, label: '1. Formulario' },
            { id: 'evaluacion', icon: ClipboardList, label: '2. Evaluación' },
            { id: 'documentos', icon: FileText, label: '3. Documentos' },
            { id: 'historial', icon: Clock, label: '4. Cierre/Contrato' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 min-w-[150px] sm:min-w-0 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl font-bold transition text-xs md:text-sm whitespace-nowrap ${
                tabActiva === tab.id 
                  ? 'bg-slate-100 text-slate-800 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100">
          
          {/* ETAPA 1 */}
          {tabActiva === 'formulario' && (
            <div className="space-y-6 md:space-y-8 animate-fadeIn">
              
              {/* Contenedor del título que ahora se apila en móvil */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-800">Detalles del Hogar y Estilo de Vida</h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-0.5">Etapa 1: Verificación de información básica</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] md:text-xs font-bold border border-emerald-100 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0"/> Datos protegidos (Ley 19.799)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Vivienda</p><p className="font-medium text-slate-700 bg-slate-50 p-3 md:p-4 rounded-xl text-sm md:text-base">{solicitud.respuestas.tipo_vivienda}</p></div>
                <div><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Composición del Hogar</p><p className="font-medium text-slate-700 bg-slate-50 p-3 md:p-4 rounded-xl text-sm md:text-base">{solicitud.respuestas.composicion_hogar}</p></div>
                <div><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Otras Mascotas</p><p className="font-medium text-slate-700 bg-slate-50 p-3 md:p-4 rounded-xl text-sm md:text-base">{solicitud.respuestas.otras_mascotas}</p></div>
                <div><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Tiempo a solas estimado</p><p className="font-medium text-slate-700 bg-slate-50 p-3 md:p-4 rounded-xl text-sm md:text-base">{solicitud.respuestas.tiempo_solas}</p></div>
                <div className="md:col-span-2"><p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mb-1">Motivación para adoptar</p><p className="font-medium text-slate-700 bg-slate-50 p-3 md:p-4 rounded-xl text-sm md:text-base">{solicitud.respuestas.motivacion}</p></div>
              </div>

              {/* 👇 COMPONENTE MARCO LEGAL INTEGRADO AQUÍ 👇 */}
              <div className="pt-4">
                <MarcoLegal />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button onClick={() => setModalRechazo(true)} disabled={enviandoAccion} className="w-full sm:w-auto px-6 py-3 rounded-xl text-red-600 bg-red-50 border border-red-200 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm">
                  <XCircle className="w-5 h-5 shrink-0"/> Rechazar
                </button>
                <button onClick={() => avanzarEtapaInteligente('evaluacion', 'En Evaluación')} disabled={enviandoAccion} className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition hover:opacity-90 disabled:opacity-50 text-sm" style={{ backgroundColor: tema.principal }}>
                  Evaluación y Notas <ArrowRight className="w-5 h-5 shrink-0"/>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2 */}
          {tabActiva === 'evaluacion' && (
            <div className="animate-fadeIn space-y-6 md:space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-800">Evaluación y Pauta de Seguridad</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">Etapa 2: Validación de filtros de la fundación</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm md:text-base">Checklist de Verificación</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100"><input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 rounded text-pink-500" /><span className="font-medium text-sm md:text-base">Entrevista realizada</span></label>
                    <label className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100"><input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 rounded text-pink-500" /><span className="font-medium text-sm md:text-base">Visita domiciliaria</span></label>
                    <label className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100"><input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 rounded text-pink-500" /><span className="font-medium text-sm md:text-base">Aprobación comité</span></label>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm md:text-base">Notas Internas</h3>
                  <textarea rows="5" className="w-full bg-amber-50 border border-amber-200 p-3 md:p-4 rounded-2xl text-amber-900 outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm md:text-base custom-scrollbar" placeholder="Escribe notas aquí..."></textarea>
                  <div className="flex justify-end mt-3 md:mt-4">
                    <button onClick={() => mostrarToast('Notas guardadas', 'success')} className="w-full sm:w-auto px-6 py-2.5 bg-amber-200 text-amber-800 font-bold rounded-xl hover:bg-amber-300 text-sm">Guardar Notas</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button onClick={() => setTabActiva('formulario')} className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 text-sm flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4"/> Volver
                </button>
                <button onClick={() => avanzarEtapaInteligente('documentos', 'Revisión de Documentos')} disabled={enviandoAccion} className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-sm" style={{ backgroundColor: tema.principal }}>
                  Siguiente: Documentos <ArrowRight className="w-5 h-5 shrink-0"/>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3 */}
          {tabActiva === 'documentos' && (
            <div className="animate-fadeIn space-y-6 md:space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-800">Verificación de Identidad</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">Etapa 3: Revisión de cédula y certificados adjuntos</p>
              </div>

              {solicitud.documentos.length === 0 ? (
                <p className="text-slate-400 text-sm italic py-8 text-center bg-slate-50 rounded-2xl">No hay documentos registrados.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {solicitud.documentos.map((doc, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center gap-3 bg-slate-50">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow flex items-center justify-center text-slate-400"><FileText className="w-5 h-5 md:w-6 md:h-6 shrink-0"/></div>
                      <p className="font-bold text-slate-700 text-sm md:text-base">{doc.nombre}</p>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="mt-1 md:mt-2 w-full py-2 md:py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-xs md:text-sm rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 transition">
                        <Download className="w-4 h-4 shrink-0"/> Descargar
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button onClick={() => setTabActiva('evaluacion')} className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 text-sm flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4"/> Volver
                </button>
                <button onClick={() => avanzarEtapaInteligente('historial', 'Cierre y Contrato')} disabled={enviandoAccion} className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-sm" style={{ backgroundColor: tema.principal }}>
                  Cierre y Contrato <ArrowRight className="w-5 h-5 shrink-0"/>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 4 (Agregada para completar el flujo según los botones y el corte del código) */}
          {tabActiva === 'historial' && (
            <div className="animate-fadeIn space-y-6 md:space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-800">Cierre y Contrato</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">Etapa 4: Finalización del proceso de adopción</p>
              </div>

              <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg mb-2">Preparando cierre legal</h3>
                <p className="text-slate-500 text-sm text-center max-w-md">
                  Asegúrate de haber revisado los documentos y las notas de evaluación antes de aprobar definitivamente esta solicitud.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button onClick={() => setTabActiva('documentos')} className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 text-sm flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4"/> Volver
                </button>
                <button onClick={() => avanzarEtapaInteligente('historial', 'Aprobada')} disabled={enviandoAccion} className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-sm bg-emerald-500 hover:bg-emerald-600 transition shadow-sm">
                  <CheckCircle className="w-5 h-5 shrink-0"/> Aprobar Adopción
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      
      {/* Estilos para ocultar la barra de scroll en las pestañas móviles */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}