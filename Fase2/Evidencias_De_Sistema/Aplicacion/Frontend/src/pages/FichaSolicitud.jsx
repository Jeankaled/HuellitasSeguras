import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, FileText, Home, 
  ClipboardList, Clock, Download, Phone, Mail, 
  User, MessageCircle, ShieldCheck, ArrowRight, AlertCircle,
  ShieldAlert, Calendar, X, Plus, Trash2
} from 'lucide-react';
import MarcoLegal from './MarcoLegal';

export default function FichaSolicitud() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados principales
  const [tabActiva, setTabActiva] = useState('formulario');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [enviandoAccion, setEnviandoAccion] = useState(false);

  // Estados de Etapa 2: Checklist de Evaluación y Notas Internas
  const [checklist, setChecklist] = useState({
    entrevista: false,
    visita: false,
    comite: false
  });
  const [notasInternas, setNotasInternas] = useState('');

  // 📸 Visor ampliado para las fotos del hogar
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  // 📅 Estados para el calendario de horarios disponibles de la fundación
  const [fechaNueva, setFechaNueva] = useState('');
  const [horaNueva, setHoraNueva] = useState('10:00');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  // Estados para reportes comunitarios del postulante
  const [reportesPostulante, setReportesPostulante] = useState([]);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);

  // Estados para UI dinámica (Toasts y Modales)
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: 'success' });
  const [modalRechazo, setModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("La postulación no cumple con los requisitos mínimos de adopción.");
  const [modalConfirmacionEtapa, setModalConfirmacionEtapa] = useState({
    abierto: false,
    nuevaEtapa: '',
    nombreEtapaTexto: ''
  });

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

  // Orden numérico para las etapas para saber si estamos avanzando o solo navegando
  const ordenEstados = ['En Revisión', 'En Evaluación', 'Revisión de Documentos', 'Cierre y Contrato', 'Aprobada', 'Rechazada'];

  // Validación del checklist de Evaluación
  const checksMarcados = Object.values(checklist).filter(Boolean).length;
  const checklistCompleto = checksMarcados === 3;

  const toggleCheck = (campo) => {
    setChecklist(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

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
        const estadoCargado = post.estado_postulacion || 'En Revisión';

        // Si la postulación ya superó Evaluación, marcamos los 3 checks por defecto
        if (['Revisión de Documentos', 'Cierre y Contrato', 'Aprobada'].includes(estadoCargado)) {
          setChecklist({ entrevista: true, visita: true, comite: true });
        }

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
          estado: estadoCargado,
          fotos_hogar: post.fotos_hogar || null,
          foto_domicilio_url: post.foto_domicilio_url || null,
          postulante: {
            nombre: post.nombre_adoptante || 'Sin Nombre',
            rut: rutAdoptante,
            telefono: post.telefono_adoptante || '',
            correo: post.correo_adoptante || '',
            ciudad: post.direccion_adoptante || 'No especificada',
            foto: post.foto_adoptante || '',
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

  // Extrae hasta 5 fotos del hogar desde solicitud (funciona si viene como array o JSON string)
  const fotosHogar = (() => {
    const raw = solicitud?.fotos_hogar || solicitud?.foto_domicilio_url;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.slice(0, 5);
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [raw];
    } catch {
      return [raw];
    }
  })();

  // Agregar horario disponible (intenta guardar en backend; si aún no existe el endpoint, lo guarda en pantalla para probar)
  const handleAgregarHorario = async () => {
    if (!fechaNueva || !horaNueva) {
      mostrarToast('Selecciona una fecha y una hora', 'error');
      return;
    }

    const existe = horariosDisponibles.some(
      (h) => h.fecha === fechaNueva && h.hora === horaNueva
    );
    if (existe) {
      mostrarToast('Ese horario ya está agregado', 'error');
      return;
    }

    setGuardandoHorario(true);
    const nuevoBloque = {
      id: Date.now(),
      fecha: fechaNueva,
      hora: horaNueva,
      disponible: true,
    };

    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiBase}/horarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fecha: fechaNueva, hora: horaNueva }),
      });

      if (res.ok) {
        const data = await res.json();
        setHorariosDisponibles((prev) => [...prev, data.datos || nuevoBloque]);
      } else {
        // Fallback temporal mientras el backend crea /horarios
        setHorariosDisponibles((prev) => [...prev, nuevoBloque]);
      }
      mostrarToast('Horario disponible agregado', 'success');
    } catch {
      setHorariosDisponibles((prev) => [...prev, nuevoBloque]);
      mostrarToast('Horario agregado (pendiente conexión backend)', 'success');
    } finally {
      setGuardandoHorario(false);
    }
  };

  const handleEliminarHorario = async (horarioId) => {
    setHorariosDisponibles((prev) => prev.filter((h) => h.id !== horarioId));
    try {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${apiBase}/horarios/${horarioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Silencioso mientras el backend no tenga el endpoint
    }
  };

  // Abre confirmación solo si es una etapa nueva (si ya pasaste por ella, solo cambia de pestaña)
  const avanzarEtapaInteligente = (nuevaEtapa, nombreEtapaTexto) => {
    const indexEstadoActual = ordenEstados.indexOf(solicitud.estado);
    const indexEstadoDestino = ordenEstados.indexOf(nombreEtapaTexto);

    if (indexEstadoActual >= indexEstadoDestino) {
      setTabActiva(nuevaEtapa);
      return;
    }

    // Bloquea el avance a Documentos o etapas posteriores si faltan checks de Evaluación
    if (
      indexEstadoDestino >= ordenEstados.indexOf('Revisión de Documentos') &&
      !checklistCompleto
    ) {
      mostrarToast('Debes marcar los 3 requisitos del checklist de evaluación antes de avanzar.', 'error');
      return;
    }

    setModalConfirmacionEtapa({
      abierto: true,
      nuevaEtapa,
      nombreEtapaTexto
    });
  };

  // Ejecuta el PUT solo si el usuario confirma en el modal
  const confirmarAvanceEtapa = async () => {
    const { nuevaEtapa, nombreEtapaTexto } = modalConfirmacionEtapa;
    setModalConfirmacionEtapa({ abierto: false, nuevaEtapa: '', nombreEtapaTexto: '' });
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
        const errorData = await res.json().catch(() => ({}));
        mostrarToast(errorData.error || 'Error al actualizar la etapa en el servidor.', 'error');
      }
    } catch (err) {
      console.error("Error al avanzar etapa:", err);
      mostrarToast('Error de conexión. No se pudo actualizar la etapa.', 'error');
    } finally {
      setEnviandoAccion(false);
    }
  };

  // Función para procesar el rechazo (usando PUT para guardar estado y disparar correo)
  const procesarRechazo = async () => {
    setModalRechazo(false);
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
        body: JSON.stringify({
          estado_postulacion: 'Rechazada',
          motivo: motivoRechazo,
          motivo_rechazo: motivoRechazo
        })
      });

      if (res.ok) {
        setSolicitud(prev => ({ ...prev, estado: 'Rechazada' }));
        mostrarToast(`Solicitud rechazada. Correo enviado a ${solicitud.postulante.nombre}.`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        mostrarToast(errorData.error || 'Error al procesar el rechazo.', 'error');
      }
    } catch (err) {
      console.error("Error al rechazar:", err);
      mostrarToast('Error de conexión al procesar el rechazo.', 'error');
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

  const yaSuperoEvaluacion = ordenEstados.indexOf(solicitud.estado) >= ordenEstados.indexOf('Revisión de Documentos');
  const bloqueoEvaluacion = !checklistCompleto && !yaSuperoEvaluacion;
  const esAprobacionFinal = modalConfirmacionEtapa.nombreEtapaTexto === 'Aprobada';

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

      {/* ✅ MODAL DE CONFIRMACIÓN PARA AVANZAR DE ETAPA O APROBAR */}
      {modalConfirmacionEtapa.abierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                  esAprobacionFinal ? 'bg-emerald-500' : ''
                }`}
                style={!esAprobacionFinal ? { backgroundColor: tema.principal } : undefined}
              >
                {esAprobacionFinal ? <CheckCircle className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-800">
                {esAprobacionFinal ? 'Confirmar aprobación' : 'Confirmar avance'}
              </h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {esAprobacionFinal ? (
                <>
                  ¿Confirmas aprobar definitivamente la adopción de{' '}
                  <span className="font-bold text-slate-800">{solicitud.mascota.nombre}</span> para{' '}
                  <span className="font-bold text-slate-800">{solicitud.postulante.nombre}</span>?
                  {' '}Se enviará el correo de aprobación al adoptante.
                </>
              ) : (
                <>
                  ¿Confirmas avanzar esta solicitud a la etapa{' '}
                  <span className="font-bold text-slate-800">{modalConfirmacionEtapa.nombreEtapaTexto}</span>?
                  {' '}Se enviará un correo de notificación al adoptante.
                </>
              )}
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setModalConfirmacionEtapa({ abierto: false, nuevaEtapa: '', nombreEtapaTexto: '' })}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAvanceEtapa}
                disabled={enviandoAccion}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white transition shadow-sm disabled:opacity-50 ${
                  esAprobacionFinal ? 'bg-emerald-500 hover:bg-emerald-600' : 'hover:opacity-90'
                }`}
                style={!esAprobacionFinal ? { backgroundColor: tema.principal } : undefined}
              >
                {esAprobacionFinal ? 'Aprobar y Notificar' : 'Confirmar y Notificar'}
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
              {solicitud.postulante.foto ? (
                <img
                  src={solicitud.postulante.foto}
                  alt={solicitud.postulante.nombre}
                  className="w-14 h-14 md:w-20 md:h-20 rounded-full object-cover shadow-md shrink-0 mt-1 sm:mt-0 border-2 border-white"
                />
              ) : (
                <div 
                  className="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl font-extrabold text-white shadow-md shrink-0 mt-1 sm:mt-0"
                  style={{ backgroundColor: tema.secundario }}
                >
                  {solicitud.postulante.avatar}
                </div>
              )}
              
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

            {/* Info de Mascota */}
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
            </div>

          </div>

          {/* BANNER DE ALERTA SI EL POSTULANTE TIENE REPORTES EN LA RED */}
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

              <div className="pt-4">
                <MarcoLegal />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setModalRechazo(true)}
                  disabled={enviandoAccion || solicitud.estado === 'Rechazada'}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-red-600 bg-red-50 border border-red-200 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5 shrink-0"/> Rechazar
                </button>
                <button
                  onClick={() => avanzarEtapaInteligente('evaluacion', 'En Evaluación')}
                  disabled={enviandoAccion}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition hover:opacity-90 disabled:opacity-50 text-sm"
                  style={{ backgroundColor: tema.principal }}
                >
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

              {/* Checklist y Notas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-700 text-sm md:text-base">Checklist de Verificación</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      checklistCompleto ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {checksMarcados}/3 completados
                    </span>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={checklist.entrevista}
                        onChange={() => toggleCheck('entrevista')}
                        className="w-4 h-4 md:w-5 md:h-5 rounded cursor-pointer"
                        style={{ accentColor: tema.principal }}
                      />
                      <span className="font-medium text-sm md:text-base">Entrevista realizada</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={checklist.visita}
                        onChange={() => toggleCheck('visita')}
                        className="w-4 h-4 md:w-5 md:h-5 rounded cursor-pointer"
                        style={{ accentColor: tema.principal }}
                      />
                      <span className="font-medium text-sm md:text-base">Visita domiciliaria/fotos</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={checklist.comite}
                        onChange={() => toggleCheck('comite')}
                        className="w-4 h-4 md:w-5 md:h-5 rounded cursor-pointer"
                        style={{ accentColor: tema.principal }}
                      />
                      <span className="font-medium text-sm md:text-base">Aprobación comité</span>
                    </label>
                  </div>

                  {bloqueoEvaluacion && (
                    <p className="mt-3 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Marca los 3 requisitos obligatorios para habilitar el avance a Documentos.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm md:text-base">Notas Internas</h3>
                  <textarea
                    rows={5}
                    value={notasInternas}
                    onChange={(e) => setNotasInternas(e.target.value)}
                    className="w-full bg-amber-50 border border-amber-200 p-3 md:p-4 rounded-2xl text-amber-900 outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm md:text-base custom-scrollbar"
                    placeholder="Escribe notas aquí..."
                  ></textarea>
                  <div className="flex justify-end mt-3 md:mt-4">
                    <button
                      onClick={() => mostrarToast('Notas guardadas', 'success')}
                      className="w-full sm:w-auto px-6 py-2.5 bg-amber-200 text-amber-800 font-bold rounded-xl hover:bg-amber-300 text-sm transition"
                    >
                      Guardar Notas
                    </button>
                  </div>
                </div>
              </div>

              {/* 📸 GALERÍA DE FOTOS DEL HOGAR (hasta 5) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-slate-600" />
                    <h3 className="font-bold text-slate-700 text-sm md:text-base">Fotos del Hogar del Postulante</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                    {fotosHogar.length}/5 fotos
                  </span>
                </div>

                {fotosHogar.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-6 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    El postulante aún no ha subido fotos de su hogar.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const url = fotosHogar[idx];
                      return url ? (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFotoAmpliada(url)}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:ring-2 transition"
                          style={{ '--tw-ring-color': tema.principal }}
                        >
                          <img
                            src={url}
                            alt={`Foto del hogar ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                          <span className="absolute bottom-1.5 right-1.5 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                            Ver
                          </span>
                        </button>
                      ) : (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl border border-dashed border-slate-200 bg-white/60 flex items-center justify-center text-xs text-slate-300 font-medium"
                        >
                          Sin foto {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 📅 CALENDARIO Y HORARIOS DISPONIBLES DE LA FUNDACIÓN */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <h3 className="font-bold text-slate-700 text-sm md:text-base">Disponibilidad para Entrevistas</h3>
                    <p className="text-xs text-slate-400">Agrega los días y horas disponibles para que el adoptante agende su videollamada</p>
                  </div>
                </div>

                {/* Selector de fecha y hora */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Día disponible</label>
                    <input
                      type="date"
                      value={fechaNueva}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFechaNueva(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Hora</label>
                    <input
                      type="time"
                      value={horaNueva}
                      onChange={(e) => setHoraNueva(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAgregarHorario}
                    disabled={guardandoHorario}
                    className="px-5 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition disabled:opacity-50"
                    style={{ backgroundColor: tema.principal }}
                  >
                    <Plus className="w-4 h-4" /> Agregar horario
                  </button>
                </div>

                {/* Lista de horarios cargados */}
                {horariosDisponibles.length === 0 ? (
                  <p className="text-slate-400 text-xs italic text-center py-3">
                    Aún no has cargado horarios disponibles.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {horariosDisponibles.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 text-sm">
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-700 leading-tight">{h.fecha}</p>
                            <p className="text-xs text-slate-500">
                              {h.hora} hrs ·{' '}
                              <span className={h.disponible ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                                {h.disponible ? 'Disponible' : 'Reservado'}
                              </span>
                            </p>
                          </div>
                        </div>
                        {h.disponible && (
                          <button
                            type="button"
                            onClick={() => handleEliminarHorario(h.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar horario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones inferiores */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setTabActiva('formulario')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4"/> Volver
                </button>
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setModalRechazo(true)}
                    disabled={enviandoAccion || solicitud.estado === 'Rechazada'}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-red-600 bg-red-50 border border-red-200 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5 shrink-0"/> Rechazar
                  </button>
                  <button
                    onClick={() => avanzarEtapaInteligente('documentos', 'Revisión de Documentos')}
                    disabled={enviandoAccion || bloqueoEvaluacion}
                    title={bloqueoEvaluacion ? 'Completa los 3 puntos del checklist para avanzar' : ''}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    style={{ backgroundColor: tema.principal }}
                  >
                    Siguiente: Documentos <ArrowRight className="w-5 h-5 shrink-0"/>
                  </button>
                </div>
              </div>

              {/* Modal para ver foto del hogar en grande */}
              {fotoAmpliada && (
                <div
                  className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
                  onClick={() => setFotoAmpliada(null)}
                >
                  <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setFotoAmpliada(null)}
                      className="absolute -top-10 right-0 text-white hover:text-slate-300 flex items-center gap-1 text-sm font-bold"
                    >
                      <X className="w-5 h-5" /> Cerrar
                    </button>
                    <img
                      src={fotoAmpliada}
                      alt="Foto del hogar ampliada"
                      className="w-full max-h-[80vh] object-contain rounded-2xl bg-black"
                    />
                  </div>
                </div>
              )}
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
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 shrink-0"/>
                      </div>
                      <p className="font-bold text-slate-700 text-sm md:text-base">{doc.nombre}</p>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 md:mt-2 w-full py-2 md:py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-xs md:text-sm rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 transition"
                      >
                        <Download className="w-4 h-4 shrink-0"/> Descargar
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setTabActiva('evaluacion')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4"/> Volver
                </button>
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setModalRechazo(true)}
                    disabled={enviandoAccion || solicitud.estado === 'Rechazada'}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-red-600 bg-red-50 border border-red-200 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5 shrink-0"/> Rechazar
                  </button>
                  <button
                    onClick={() => avanzarEtapaInteligente('historial', 'Cierre y Contrato')}
                    disabled={enviandoAccion}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-sm transition hover:opacity-90 disabled:opacity-50 text-sm"
                    style={{ backgroundColor: tema.principal }}
                  >
                    Cierre y Contrato <ArrowRight className="w-5 h-5 shrink-0"/>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4 */}
          {tabActiva === 'historial' && (
            <div className="animate-fadeIn space-y-6 md:space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-800">Cierre y Contrato</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">Etapa 4: Finalización del proceso de adopción</p>
              </div>

              {solicitud.estado === 'Aprobada' ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                  <h3 className="font-bold text-emerald-800 text-lg mb-2">Adopción aprobada</h3>
                  <p className="text-emerald-700 text-sm text-center max-w-md">
                    Esta postulación ya fue aprobada y el postulante fue notificado correctamente.
                  </p>
                </div>
              ) : solicitud.estado === 'Rechazada' ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 bg-red-50 border border-red-100 rounded-2xl">
                  <XCircle className="w-12 h-12 text-red-400 mb-4" />
                  <h3 className="font-bold text-red-800 text-lg mb-2">Solicitud rechazada</h3>
                  <p className="text-red-700 text-sm text-center max-w-md">
                    Esta postulación fue cerrada como rechazada y no puede aprobarse.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="font-bold text-slate-700 text-lg mb-2">Preparando cierre legal</h3>
                  <p className="text-slate-500 text-sm text-center max-w-md">
                    Asegúrate de haber revisado los documentos y las notas de evaluación antes de aprobar definitivamente esta solicitud.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setTabActiva('documentos')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-600 bg-slate-100 font-bold hover:bg-slate-200 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4"/> Volver
                </button>
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setModalRechazo(true)}
                    disabled={enviandoAccion || solicitud.estado === 'Rechazada'}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-red-600 bg-red-50 border border-red-200 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5 shrink-0"/> Rechazar
                  </button>
                  <button
                    onClick={() => avanzarEtapaInteligente('historial', 'Aprobada')}
                    disabled={enviandoAccion || solicitud.estado === 'Aprobada' || solicitud.estado === 'Rechazada'}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 text-sm bg-emerald-500 hover:bg-emerald-600 transition shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5 shrink-0"/> {solicitud.estado === 'Aprobada' ? 'Aprobada' : 'Aprobar Adopción'}
                  </button>
                </div>
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