import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Video, 
  FileText, 
  Heart, 
  AlertCircle, 
  Calendar,
  Sparkles,
  PawPrint,
  Camera,
  Home,
  ShieldCheck,
  Upload,
  X,
  Loader2
} from 'lucide-react';

// 🎨 Paletas disponibles (se asignan automáticamente a cualquier fundación)
const LISTA_TEMAS = [
  // Rosado
  {
    bg: 'from-pink-50 via-rose-50/70 to-fuchsia-50',
    blob1: 'bg-pink-200/30',
    blob2: 'bg-rose-200/30',
    border: 'border-pink-100',
    shadow: 'shadow-pink-100/50',
    badge: 'bg-pink-100/80 text-pink-600 border-pink-200',
    hoverText: 'hover:text-pink-500',
    icon: 'text-pink-500',
    itemActivo: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-400 shadow-md scale-[1.01]',
    itemHover: 'hover:border-pink-200 hover:bg-pink-50/40',
    fotoActivo: 'border-pink-300 bg-pink-100',
    header: 'from-pink-400 via-rose-400 to-fuchsia-400',
    stepperBg: 'bg-pink-50',
    stepperLine: 'from-pink-400 to-rose-400',
    stepperActivo: 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-pink-200 scale-110 ring-4 ring-pink-100',
    stepperTexto: 'text-pink-600',
    contenidoBg: 'from-pink-50/30 to-rose-50/30',
    etapa2Icon: 'bg-pink-100 text-pink-600',
    textoFuerte: 'text-pink-600',
    btnPrimario: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-200',
  },
  // Verde / Esmeralda
  {
    bg: 'from-emerald-50 via-teal-50/70 to-cyan-50',
    blob1: 'bg-emerald-200/30',
    blob2: 'bg-teal-200/30',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-100/50',
    badge: 'bg-emerald-100/80 text-emerald-700 border-emerald-200',
    hoverText: 'hover:text-emerald-600',
    icon: 'text-emerald-500',
    itemActivo: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-md scale-[1.01]',
    itemHover: 'hover:border-emerald-200 hover:bg-emerald-50/40',
    fotoActivo: 'border-emerald-300 bg-emerald-100',
    header: 'from-emerald-400 via-teal-400 to-cyan-500',
    stepperBg: 'bg-emerald-50',
    stepperLine: 'from-emerald-400 to-teal-400',
    stepperActivo: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-200 scale-110 ring-4 ring-emerald-100',
    stepperTexto: 'text-emerald-600',
    contenidoBg: 'from-emerald-50/30 to-teal-50/30',
    etapa2Icon: 'bg-emerald-100 text-emerald-600',
    textoFuerte: 'text-emerald-600',
    btnPrimario: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200',
  },
  // Morado
  {
    bg: 'from-purple-50 via-violet-50/70 to-indigo-50',
    blob1: 'bg-purple-200/30',
    blob2: 'bg-violet-200/30',
    border: 'border-purple-100',
    shadow: 'shadow-purple-100/50',
    badge: 'bg-purple-100/80 text-purple-600 border-purple-200',
    hoverText: 'hover:text-purple-600',
    icon: 'text-purple-500',
    itemActivo: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-400 shadow-md scale-[1.01]',
    itemHover: 'hover:border-purple-200 hover:bg-purple-50/40',
    fotoActivo: 'border-purple-300 bg-purple-100',
    header: 'from-purple-500 via-violet-500 to-indigo-400',
    stepperBg: 'bg-purple-50',
    stepperLine: 'from-purple-400 to-violet-500',
    stepperActivo: 'bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-purple-200 scale-110 ring-4 ring-purple-100',
    stepperTexto: 'text-purple-600',
    contenidoBg: 'from-purple-50/30 to-violet-50/30',
    etapa2Icon: 'bg-purple-100 text-purple-600',
    textoFuerte: 'text-purple-600',
    btnPrimario: 'from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-purple-200',
  },
  // Ámbar / Naranja
  {
    bg: 'from-amber-50 via-orange-50/70 to-yellow-50',
    blob1: 'bg-amber-200/30',
    blob2: 'bg-orange-200/30',
    border: 'border-amber-100',
    shadow: 'shadow-amber-100/50',
    badge: 'bg-amber-100/80 text-amber-700 border-amber-200',
    hoverText: 'hover:text-amber-600',
    icon: 'text-amber-500',
    itemActivo: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 shadow-md scale-[1.01]',
    itemHover: 'hover:border-amber-200 hover:bg-amber-50/40',
    fotoActivo: 'border-amber-300 bg-amber-100',
    header: 'from-amber-400 via-orange-400 to-yellow-400',
    stepperBg: 'bg-amber-50',
    stepperLine: 'from-amber-400 to-orange-400',
    stepperActivo: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200 scale-110 ring-4 ring-amber-100',
    stepperTexto: 'text-amber-600',
    contenidoBg: 'from-amber-50/30 to-orange-50/30',
    etapa2Icon: 'bg-amber-100 text-amber-600',
    textoFuerte: 'text-amber-600',
    btnPrimario: 'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-200',
  },
  // Celeste / Azul
  {
    bg: 'from-sky-50 via-blue-50/70 to-cyan-50',
    blob1: 'bg-sky-200/30',
    blob2: 'bg-blue-200/30',
    border: 'border-sky-100',
    shadow: 'shadow-sky-100/50',
    badge: 'bg-sky-100/80 text-sky-700 border-sky-200',
    hoverText: 'hover:text-sky-600',
    icon: 'text-sky-500',
    itemActivo: 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-400 shadow-md scale-[1.01]',
    itemHover: 'hover:border-sky-200 hover:bg-sky-50/40',
    fotoActivo: 'border-sky-300 bg-sky-100',
    header: 'from-sky-400 via-blue-400 to-cyan-500',
    stepperBg: 'bg-sky-50',
    stepperLine: 'from-sky-400 to-blue-400',
    stepperActivo: 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-sky-200 scale-110 ring-4 ring-sky-100',
    stepperTexto: 'text-sky-600',
    contenidoBg: 'from-sky-50/30 to-blue-50/30',
    etapa2Icon: 'bg-sky-100 text-sky-600',
    textoFuerte: 'text-sky-600',
    btnPrimario: 'from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-sky-200',
  },
  // Índigo
  {
    bg: 'from-indigo-50 via-blue-50/70 to-violet-50',
    blob1: 'bg-indigo-200/30',
    blob2: 'bg-blue-200/30',
    border: 'border-indigo-100',
    shadow: 'shadow-indigo-100/50',
    badge: 'bg-indigo-100/80 text-indigo-700 border-indigo-200',
    hoverText: 'hover:text-indigo-600',
    icon: 'text-indigo-500',
    itemActivo: 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-400 shadow-md scale-[1.01]',
    itemHover: 'hover:border-indigo-200 hover:bg-indigo-50/40',
    fotoActivo: 'border-indigo-300 bg-indigo-100',
    header: 'from-indigo-400 via-blue-500 to-violet-500',
    stepperBg: 'bg-indigo-50',
    stepperLine: 'from-indigo-400 to-violet-400',
    stepperActivo: 'bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-indigo-200 scale-110 ring-4 ring-indigo-100',
    stepperTexto: 'text-indigo-600',
    contenidoBg: 'from-indigo-50/30 to-violet-50/30',
    etapa2Icon: 'bg-indigo-100 text-indigo-600',
    textoFuerte: 'text-indigo-600',
    btnPrimario: 'from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-indigo-200',
  },
];

// ⚙️ Asigna un color automático y siempre igual según el nombre de la fundación
const obtenerTemaFundacion = (nombreFundacion = '') => {
  const texto = nombreFundacion.trim().toLowerCase();
  if (!texto) return LISTA_TEMAS[0];

  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }

  const indice = Math.abs(hash) % LISTA_TEMAS.length;
  return LISTA_TEMAS[indice];
};

// Helper seguro para leer fotos_hogar venga como array o string JSON desde la BD
const parsearFotosHogar = (valor) => {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string') {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [valor];
    }
  }
  return [];
};

export default function SeguimientoPostulacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [postulacion, setPostulacion] = useState(null);
  const [misPostulaciones, setMisPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para subida de fotos del hogar (Etapa 2)
  const [archivosHogar, setArchivosHogar] = useState([]);
  const [previewsHogar, setPreviewsHogar] = useState([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);
  const [mensajeFotos, setMensajeFotos] = useState(null);

  // Estados para subida de documentos KYC (Etapa 3)
  const [archivosDoc, setArchivosDoc] = useState({
    carnet: null,
    sueldo: null,
    domicilio: [],
  });
  const [subiendoDocs, setSubiendoDocs] = useState(false);
  const [mensajeDocs, setMensajeDocs] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Tema dinámico basado en el nombre de la fundación actual
  const tema = obtenerTemaFundacion(postulacion?.fundacion?.nombre);

  // Mapeo de etapas para el Stepper visual
  const etapas = [
    { id: 1, titulo: 'Formulario', descripcion: 'Solicitud enviada', emoji: '📝' },
    { id: 2, titulo: 'Evaluación', descripcion: 'Entrevistas y visitas', emoji: '💬' },
    { id: 3, titulo: 'Documentos', descripcion: 'Contrato y firmas', emoji: '📜' },
    { id: 4, titulo: '¡Adopción!', descripcion: 'Bienvenida a casa', emoji: '🏡' },
  ];

  // Función auxiliar para determinar la etapa numérica basada en el texto del backend
  const obtenerEtapaNumerica = (estadoBackend) => {
    switch (estadoBackend) {
      case 'En Revisión': return 1;
      case 'En Evaluación': return 2;
      case 'Revisión de Documentos': return 3;
      case 'Cierre y Contrato': return 3;
      case 'Aprobada': return 4;
      case 'Rechazada': return 1; 
      default: return 1;
    }
  };

  // Colores cute para los badges de estado
  const obtenerEstiloEstado = (estado) => {
    switch (estado) {
      case 'Aprobada':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rechazada':
        return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'En Evaluación':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Revisión de Documentos':
      case 'Cierre y Contrato':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  // Helper para armar la URL de la foto
  const formatearFoto = useCallback((foto) => {
    if (!foto) return null;
    return foto.startsWith('http') ? foto : `${apiBase}/uploads/${foto}`;
  }, [apiBase]);

  // 1️⃣ Cargar TODAS las postulaciones del adoptante para mostrar el selector superior
  useEffect(() => {
    const cargarTodasLasPostulaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const respuesta = await fetch(`${apiBase}/postulaciones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (respuesta.ok) {
          const json = await respuesta.json();
          const lista = Array.isArray(json) ? json : (json.datos || json.postulaciones || []);
          setMisPostulaciones(lista);
        }
      } catch (err) {
        console.error("No se pudo cargar la lista de postulaciones:", err);
      }
    };

    cargarTodasLasPostulaciones();
  }, [apiBase]);

  const idInvalido = !id || isNaN(Number(id));

  // 2️⃣ Cargar el detalle de la postulación seleccionada
  useEffect(() => {
    if (idInvalido) return;
    let cancelado = false;

    const cargarPostulacion = async () => {
      try {
        const token = localStorage.getItem('token');

        const respuesta = await fetch(`${apiBase}/postulaciones/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (cancelado) return;

        if (respuesta.ok) {
          const json = await respuesta.json();
          if (cancelado) return;
          const dataBD = json.datos;

          const datosFormateados = {
            id: dataBD.id,
            fecha_postulacion: dataBD.fecha_postulacion,
            etapa_actual: obtenerEtapaNumerica(dataBD.estado_postulacion),
            estado_general: dataBD.estado_postulacion,
            entrevista_realizada: Boolean(dataBD.entrevista_realizada),
            visita_realizada: Boolean(dataBD.visita_realizada),
            aprobacion_comite: Boolean(dataBD.aprobacion_comite),
            fotos_hogar: parsearFotosHogar(dataBD.foto_domicilio_url),
            documentos: {
              carnet: dataBD.foto_cedula_url || null,
              sueldo: dataBD.comprobante_ingresos_url || null,
              domicilio: parsearFotosHogar(dataBD.foto_domicilio_url),
            },
            mascota: {
              nombre: dataBD.nombre_animal || 'Mascota',
              foto: formatearFoto(dataBD.foto_animal),
            },
            fundacion: {
              nombre: dataBD.nombre_refugio || 'Fundación',
              telefono: dataBD.telefono_refugio || null
            }
          };

          setPostulacion(datosFormateados);
          setError(null);
          setArchivosHogar([]);
          setPreviewsHogar([]);
          setMensajeFotos(null);
          setArchivosDoc({ carnet: null, sueldo: null, domicilio: [] });
          setMensajeDocs(null);
        } else {
          const errData = await respuesta.json().catch(() => ({}));
          if (!cancelado) {
            setError(errData.error || "No se pudo cargar la postulación");
          }
        }
      } catch (err) {
        console.error("Error de red:", err);
        if (!cancelado) {
          setError("Error de conexión al servidor");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarPostulacion();

    return () => {
      cancelado = true;
    };
  }, [id, apiBase, idInvalido, formatearFoto]);

  const handleCambiarPostulacion = (nuevoId) => {
    if (Number(nuevoId) === Number(id)) return;
    setArchivosHogar([]);
    setPreviewsHogar([]);
    setMensajeFotos(null);
    setArchivosDoc({ carnet: null, sueldo: null, domicilio: [] });
    setMensajeDocs(null);
    setError(null);
    setCargando(true);
    navigate(`../${nuevoId}`, { relative: 'path', replace: true });
  };

  const handleAgendar = () => {
    const raw = postulacion?.fundacion?.telefono;
    if (!raw) {
      alert("La fundación aún no ha configurado su número de contacto. Por favor revisa tu correo.");
      return;
    }

    // Deja solo dígitos (quita +, espacios, guiones, etc.)
    let numero = String(raw).replace(/\D/g, '');
    // Si en Chile guardaron solo 9 dígitos (ej. 912345678), agrega el 56
    if (numero.length === 9 && numero.startsWith('9')) {
      numero = `56${numero}`;
    }

    const mensaje = `Hola, mi postulación por ${postulacion.mascota.nombre} está en evaluación y me gustaría coordinar la entrevista.`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  // 📸 Handlers para subir fotos del hogar en Etapa 2
  const handleSeleccionarFotosHogar = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const combinados = [...archivosHogar, ...files].slice(0, 5);
    setArchivosHogar(combinados);
    setPreviewsHogar(combinados.map((file) => URL.createObjectURL(file)));
    setMensajeFotos(null);
    e.target.value = '';
  };

  const handleQuitarPreview = (index) => {
    const nuevosArchivos = archivosHogar.filter((_, i) => i !== index);
    const nuevasPreviews = previewsHogar.filter((_, i) => i !== index);
    setArchivosHogar(nuevosArchivos);
    setPreviewsHogar(nuevasPreviews);
  };

  const handleSubirFotosHogar = async () => {
    if (archivosHogar.length === 0 || !postulacion) return;

    try {
      setSubiendoFotos(true);
      setMensajeFotos(null);

      const formData = new FormData();
      archivosHogar.forEach((archivo) => {
        formData.append('fotos_hogar', archivo);
      });

      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${apiBase}/postulaciones/${postulacion.id}/fotos-hogar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudieron subir las fotos');
      }

      const json = await respuesta.json();
      const nuevasFotos = parsearFotosHogar(json.fotos_hogar || json.datos?.foto_domicilio_url);

      setPostulacion((prev) => {
        const listaFinal = nuevasFotos.length > 0 ? nuevasFotos : prev.fotos_hogar;
        return {
          ...prev,
          fotos_hogar: listaFinal,
          documentos: {
            ...prev.documentos,
            domicilio: listaFinal,
          },
        };
      });

      setArchivosHogar([]);
      setPreviewsHogar([]);
      setMensajeFotos({
        tipo: 'ok',
        texto: '¡Fotos enviadas! La fundación ya puede revisarlas en tu solicitud.'
      });
    } catch (err) {
      console.error("Error subiendo fotos del hogar:", err);
      setMensajeFotos({
        tipo: 'error',
        texto: err.message || 'Hubo un problema al subir las fotos. Intenta nuevamente.'
      });
    } finally {
      setSubiendoFotos(false);
    }
  };

  // 📄 Handler para subir documentos KYC en Etapa 3
  const handleSubirDocumentosKYC = async (e) => {
    e.preventDefault();
    if (!postulacion) return;
    if (!archivosDoc.carnet && !archivosDoc.sueldo && archivosDoc.domicilio.length === 0) {
      setMensajeDocs({ tipo: 'error', texto: 'Selecciona al menos un documento (carnet, sueldo o domicilio).' });
      return;
    }

    try {
      setSubiendoDocs(true);
      setMensajeDocs(null);

      const formData = new FormData();
      if (archivosDoc.carnet) formData.append('carnet', archivosDoc.carnet);
      if (archivosDoc.sueldo) formData.append('sueldo', archivosDoc.sueldo);
      archivosDoc.domicilio.forEach((file) => formData.append('domicilio', file));

      const token = localStorage.getItem('token');
      const respuesta = await fetch(`${apiBase}/postulaciones/${postulacion.id}/documentos`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!respuesta.ok) {
        const errData = await respuesta.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudieron subir los documentos');
      }

      const json = await respuesta.json();
      const actualizado = json.datos || {};
      const domicilioActualizado = parsearFotosHogar(actualizado.foto_domicilio_url);

      setPostulacion((prev) => ({
        ...prev,
        estado_general: actualizado.estado_postulacion || prev.estado_general,
        etapa_actual: obtenerEtapaNumerica(actualizado.estado_postulacion || prev.estado_general),
        fotos_hogar: domicilioActualizado.length > 0 ? domicilioActualizado : prev.fotos_hogar,
        documentos: {
          carnet: actualizado.foto_cedula_url || prev.documentos?.carnet || null,
          sueldo: actualizado.comprobante_ingresos_url || prev.documentos?.sueldo || null,
          domicilio: domicilioActualizado.length > 0 ? domicilioActualizado : (prev.documentos?.domicilio || []),
        },
      }));

      setArchivosDoc({ carnet: null, sueldo: null, domicilio: [] });
      setMensajeDocs({ tipo: 'ok', texto: '¡Documentos guardados! Ya puedes revisarlos aquí abajo.' });
    } catch (err) {
      setMensajeDocs({ tipo: 'error', texto: err.message || 'Error al subir documentos.' });
    } finally {
      setSubiendoDocs(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-md border-2 border-pink-100 flex items-center justify-center text-3xl animate-bounce">
          🐾
        </div>
        <p className="text-sm font-bold text-pink-500">Cargando seguimiento...</p>
      </div>
    );
  }

  if (error || !postulacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 p-4">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border-2 border-pink-100 shadow-lg text-center max-w-md w-full">
          <div className="text-4xl mb-3">😿</div>
          <p className="text-rose-500 font-extrabold mb-4">{error || "Postulación no encontrada"}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold text-sm transition shadow-md shadow-pink-200"
          >
            Volver a mis postulaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tema.bg} font-sans text-slate-700 p-4 sm:p-6 md:p-10 relative overflow-x-hidden transition-colors duration-500`}>
      
      {/* Decoración de fondo suave */}
      <div className={`fixed top-10 left-10 w-64 h-64 ${tema.blob1} rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500`}></div>
      <div className={`fixed bottom-10 right-10 w-72 h-72 ${tema.blob2} rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500`}></div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BOTÓN VOLVER */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-slate-600 ${tema.hoverText} font-bold text-sm border ${tema.border} shadow-sm transition-all`}
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${tema.badge}`}>
            <Sparkles className="w-3.5 h-3.5" /> Seguimiento en vivo
          </span>
        </div>

        {/* 🐾 SELECTOR DE TODAS MIS POSTULACIONES */}
        {misPostulaciones.length > 0 && (
          <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 ${tema.border} shadow-sm`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-700 flex items-center gap-2">
                <PawPrint className={`w-4 h-4 ${tema.icon}`} />
                Tus Postulaciones ({misPostulaciones.length})
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                Toca una para ver su estado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {misPostulaciones.map((item) => {
                const esActual = Number(item.id) === Number(id);
                const fotoItem = formatearFoto(item.foto_animal);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleCambiarPostulacion(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      esActual
                        ? tema.itemActivo
                        : `bg-white/90 border-slate-100 ${tema.itemHover}`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-xl shrink-0 border-2 ${
                      esActual ? tema.fotoActivo : 'border-slate-100 bg-slate-50'
                    }`}>
                      {fotoItem ? (
                        <img src={fotoItem} alt={item.nombre_animal} className="w-full h-full object-cover" />
                      ) : (
                        '🐶'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-sm text-slate-800 truncate">
                        {item.nombre_animal || 'Mascota'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mb-1">
                        {item.nombre_refugio || 'Fundación'}
                      </p>
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${obtenerEstiloEstado(item.estado_postulacion)}`}>
                        {item.estado_postulacion}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 💖 TARJETA PRINCIPAL DE SEGUIMIENTO */}
        <div className={`bg-white/95 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] border-2 ${tema.border} shadow-xl ${tema.shadow} overflow-hidden`}>
          
          {/* HEADER DE LA POSTULACIÓN */}
          <div className={`bg-gradient-to-r ${tema.header} p-6 sm:p-8 text-white flex flex-col md:flex-row items-center gap-5 sm:gap-6 relative transition-all duration-500`}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/30 rounded-3xl border-4 border-white/60 flex items-center justify-center text-4xl shadow-lg shrink-0 overflow-hidden">
              {postulacion.mascota.foto ? (
                <img src={postulacion.mascota.foto} alt="Mascota" className="w-full h-full object-cover" />
              ) : (
                "🐶"
              )}
            </div>

            <div className="text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold tracking-wide uppercase mb-2 backdrop-blur-sm">
                Postulación #{postulacion.id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mb-1 drop-shadow-sm">
                {postulacion.mascota.nombre}
              </h1>
              <p className="text-white/90 font-semibold text-sm flex items-center gap-1.5 justify-center md:justify-start">
                <Heart className="w-4 h-4 fill-white/40" /> {postulacion.fundacion.nombre}
              </p>
            </div>

            <div className="md:ml-auto mt-2 md:mt-0 text-center md:text-right">
              <div className="inline-block px-5 py-2.5 bg-white/25 rounded-2xl backdrop-blur-md border border-white/40 shadow-sm">
                <p className="text-[11px] text-white/90 font-bold uppercase tracking-wider">Estado Actual</p>
                <p className="text-base sm:text-lg font-black text-white">{postulacion.estado_general}</p>
              </div>
            </div>
          </div>

          {/* STEPPER VISUAL (LÍNEA DE TIEMPO) */}
          <div className={`p-6 sm:p-8 border-b ${tema.border} bg-white`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {/* Línea conectora de fondo (solo visible en desktop) */}
              <div className={`hidden sm:block absolute top-6 left-12 right-12 h-1.5 ${tema.stepperBg} rounded-full -z-0`}>
                <div 
                  className={`h-full bg-gradient-to-r ${tema.stepperLine} rounded-full transition-all duration-500`}
                  style={{ width: `${((postulacion.etapa_actual - 1) / (etapas.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              {etapas.map((etapa) => {
                const activo = postulacion.etapa_actual === etapa.id;
                const completado = postulacion.etapa_actual > etapa.id;

                return (
                  <div key={etapa.id} className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg mb-2.5 shadow-sm transition-all duration-300 ${
                      completado 
                        ? 'bg-emerald-400 text-white shadow-emerald-200' 
                        : activo 
                          ? tema.stepperActivo
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      {completado ? <CheckCircle className="w-6 h-6" /> : <span>{etapa.emoji}</span>}
                    </div>
                    <h3 className={`font-extrabold text-xs sm:text-sm ${
                      activo ? tema.stepperTexto : completado ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {etapa.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                      {etapa.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTENIDO DINÁMICO SEGÚN LA ETAPA */}
          <div className={`p-6 sm:p-8 bg-gradient-to-b ${tema.contenidoBg}`}>
            
            {/* VISTA ETAPA 1: Formulario */}
            {postulacion.etapa_actual === 1 && (
              <div className="text-center py-6 sm:py-8">
                {postulacion.estado_general === 'Rechazada' ? (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm max-w-lg mx-auto">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Postulación Rechazada</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Lamentablemente, la fundación ha decidido no avanzar con tu solicitud en esta ocasión. Revisa tu correo electrónico, donde te enviaron el motivo de la decisión.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm max-w-lg mx-auto">
                    <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Formulario en Revisión 💌</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      La fundación está leyendo tus respuestas con mucho cariño. Si cumples con el perfil inicial, avanzaremos a la etapa de evaluación. ¡Atento a tu correo!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VISTA ETAPA 2: Evaluación */}
            {postulacion.etapa_actual === 2 && (() => {
              const entrevistaOk = Boolean(postulacion.entrevista_realizada);
              const visitaOk = Boolean(postulacion.visita_realizada);
              const comiteOk = Boolean(postulacion.aprobacion_comite);
              const fotosGuardadas = Array.isArray(postulacion.fotos_hogar) ? postulacion.fotos_hogar : [];

              return (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${tema.etapa2Icon}`}>
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800">Evaluación y Entrevistas</h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">Etapa 2: Conociéndonos mejor</p>
                    </div>
                  </div>

                  {/* Checklist en vivo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className={`p-4 rounded-2xl border bg-white flex items-center gap-3 ${entrevistaOk ? 'border-emerald-200 bg-emerald-50/40' : tema.border}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${entrevistaOk ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {entrevistaOk ? <CheckCircle className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-800">1. Entrevista</p>
                        <p className={`text-[11px] font-bold ${entrevistaOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {entrevistaOk ? 'Completada' : 'Por coordinar'}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border bg-white flex items-center gap-3 ${visitaOk ? 'border-emerald-200 bg-emerald-50/40' : tema.border}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${visitaOk ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {visitaOk ? <CheckCircle className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-800">2. Hogar / Fotos</p>
                        <p className={`text-[11px] font-bold ${visitaOk ? 'text-emerald-600' : fotosGuardadas.length > 0 ? 'text-sky-600' : 'text-amber-600'}`}>
                          {visitaOk ? 'Verificado' : fotosGuardadas.length > 0 ? 'En revisión' : 'Pendiente'}
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border bg-white flex items-center gap-3 ${comiteOk ? 'border-emerald-200 bg-emerald-50/40' : tema.border}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${comiteOk ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        {comiteOk ? <CheckCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-800">3. Comité</p>
                        <p className={`text-[11px] font-bold ${comiteOk ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {comiteOk ? 'Aprobado' : 'En espera'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Paso 1: Entrevista */}
                  <div className={`bg-white p-5 sm:p-6 rounded-3xl border ${tema.border} shadow-sm space-y-4`}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${tema.icon}`} />
                        Paso 1: Coordinar entrevista
                      </h4>
                      {entrevistaOk && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          Listo ✓
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      ¡Felicidades! Tu formulario inicial fue aprobado. Coordina una breve llamada o videollamada para conocerte mejor y conversar sobre los cuidados de <strong className={tema.textoFuerte}>{postulacion.mascota.nombre}</strong>.
                    </p>

                    {!entrevistaOk && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={handleAgendar} 
                          className={`flex-1 bg-gradient-to-r ${tema.btnPrimario} text-white py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer`}
                        >
                          <Calendar className="w-4 h-4" /> Agendar Videollamada
                        </button>
                        <button 
                          onClick={handleAgendar} 
                          className="flex-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border-2 border-sky-200 py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          Contactar por WhatsApp
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Paso 2: Fotos del hogar (alternativa a visita domiciliaria) */}
                  <div className={`bg-white p-5 sm:p-6 rounded-3xl border ${tema.border} shadow-sm space-y-4`}>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                        <Camera className={`w-4 h-4 ${tema.icon}`} />
                        Paso 2: Fotos de tu hogar
                      </h4>
                      {visitaOk && (
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          Aprobado ✓
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      Si la fundación no realiza visita presencial, puedes subir hasta <strong>5 fotos</strong> de tu casa o departamento (cierres perimetrales, patio, mallas en ventanas o espacio donde dormirá) para validar que sea un entorno seguro.
                    </p>

                    {/* Galería de fotos ya subidas */}
                    {fotosGuardadas.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
                          Fotos enviadas ({fotosGuardadas.length})
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {fotosGuardadas.map((url, idx) => (
                            <a
                              key={idx}
                              href={formatearFoto(url)}
                              target="_blank"
                              rel="noreferrer"
                              className="aspect-square rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-sm hover:opacity-90 transition"
                            >
                              <img
                                src={formatearFoto(url)}
                                alt={`Hogar ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selector y envío de fotos */}
                    {!visitaOk && (
                      <div className="space-y-3">
                        <label className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed ${tema.border} bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition text-center`}>
                          <Upload className={`w-6 h-6 ${tema.icon}`} />
                          <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                            Seleccionar fotos del hogar
                          </span>
                          <span className="text-[11px] text-slate-400">
                            JPG, PNG o WEBP · Máximo 5 imágenes
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleSeleccionarFotosHogar}
                            className="hidden"
                          />
                        </label>

                        {previewsHogar.length > 0 && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                              {previewsHogar.map((src, idx) => (
                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200">
                                  <img src={src} alt="Previsualización" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => handleQuitarPreview(idx)}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/70 hover:bg-rose-500 text-white flex items-center justify-center transition cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={handleSubirFotosHogar}
                              disabled={subiendoFotos}
                              className={`w-full bg-gradient-to-r ${tema.btnPrimario} text-white py-3 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60`}
                            >
                              {subiendoFotos ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Subiendo fotos...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" /> Enviar {archivosHogar.length} {archivosHogar.length === 1 ? 'foto' : 'fotos'} a la fundación
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {mensajeFotos && (
                      <div className={`text-xs sm:text-sm font-bold p-3 rounded-xl border ${
                        mensajeFotos.tipo === 'ok'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {mensajeFotos.texto}
                      </div>
                    )}
                  </div>

                  {/* Aviso informativo de comité */}
                  <div className="flex gap-3 text-xs sm:text-sm text-amber-700 bg-amber-50/90 p-4 rounded-2xl border border-amber-200">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Una vez realizadas la entrevista y la revisión de tu hogar, el comité de la fundación evaluará tu caso para pasar a la etapa de documentos y contrato.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* VISTA ETAPA 3: Documentos */}
            {postulacion.etapa_actual === 3 && (() => {
              const docs = postulacion.documentos || {};
              const listaDomicilio = Array.isArray(docs.domicilio) ? docs.domicilio : [];

              return (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-sm">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-3">
                        <FileText className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-1">
                        Documentos y Verificación ✍️
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Sube tu carnet de identidad, comprobante de ingresos y respaldo de domicilio. Aquí podrás ver todo tu expediente completo.
                      </p>
                    </div>

                    <form onSubmit={handleSubirDocumentosKYC} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          Carnet de identidad (JPG, PNG, WEBP o PDF)
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setArchivosDoc((p) => ({ ...p, carnet: e.target.files?.[0] || null }))}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          Comprobante de ingresos / sueldo (JPG, PNG, WEBP o PDF)
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setArchivosDoc((p) => ({ ...p, sueldo: e.target.files?.[0] || null }))}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                          Comprobante o fotos adicionales de domicilio (hasta 5)
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          multiple
                          onChange={(e) => setArchivosDoc((p) => ({ ...p, domicilio: Array.from(e.target.files || []).slice(0, 5) }))}
                          className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                        />
                      </div>

                      {mensajeDocs && (
                        <div className={`text-xs sm:text-sm font-bold p-3 rounded-xl border ${
                          mensajeDocs.tipo === 'ok'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {mensajeDocs.texto}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={subiendoDocs}
                        className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white py-3.5 px-8 rounded-2xl font-extrabold text-sm shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {subiendoDocs ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Subiendo documentos...
                          </>
                        ) : (
                          'Subir Documentos'
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Expediente completo: todo lo subido en Etapa 2 y Etapa 3 */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
                      Expediente de documentos cargados
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
                        <p className="text-xs font-extrabold text-slate-700 mb-1">Carnet de identidad</p>
                        {docs.carnet ? (
                          <a
                            href={formatearFoto(docs.carnet)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-amber-600 underline break-all"
                          >
                            Ver carnet subido ↗
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400">Aún no cargado</p>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70">
                        <p className="text-xs font-extrabold text-slate-700 mb-1">Comprobante de ingresos / sueldo</p>
                        {docs.sueldo ? (
                          <a
                            href={formatearFoto(docs.sueldo)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-amber-600 underline break-all"
                          >
                            Ver comprobante de sueldo ↗
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400">Aún no cargado</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2.5">
                      <p className="text-xs font-extrabold text-slate-700">
                        Domicilio y fotos del hogar ({listaDomicilio.length})
                      </p>
                      {listaDomicilio.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                          {listaDomicilio.map((itemUrl, idx) => {
                            const urlFinal = formatearFoto(itemUrl);
                            const esPdf = String(itemUrl).toLowerCase().endsWith('.pdf');
                            return (
                              <a
                                key={idx}
                                href={urlFinal}
                                target="_blank"
                                rel="noreferrer"
                                className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2 hover:opacity-90 transition text-center"
                              >
                                {esPdf ? (
                                  <span className="text-[11px] font-extrabold text-amber-700">PDF #{idx + 1} ↗</span>
                                ) : (
                                  <img src={urlFinal} alt={`Domicilio ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                                )}
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Aún no hay fotos ni comprobante de domicilio.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VISTA ETAPA 4: Finalizada */}
            {postulacion.etapa_actual === 4 && (
              <div className={`bg-white p-6 sm:p-8 rounded-3xl border ${tema.border} shadow-sm text-center max-w-lg mx-auto`}>
                <div className={`w-16 h-16 ${tema.etapa2Icon} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Heart className="w-9 h-9 fill-current animate-bounce" />
                </div>
                <h3 className={`text-2xl sm:text-3xl font-black ${tema.textoFuerte} mb-2`}>
                  ¡Adopción Aprobada! 🎉
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  ¡Felicidades! Has completado todo el proceso. Ponte en contacto con la fundación para coordinar la entrega de tu nuevo mejor amigo.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}