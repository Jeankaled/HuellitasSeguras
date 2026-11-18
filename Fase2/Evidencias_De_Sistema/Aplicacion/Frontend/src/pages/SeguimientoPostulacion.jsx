import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Video, FileText, Heart, AlertCircle, Calendar } from 'lucide-react';

export default function SeguimientoPostulacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postulacion, setPostulacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Mapeo de etapas para el Stepper visual
  const etapas = [
    { id: 1, titulo: 'Formulario', descripcion: 'Solicitud enviada' },
    { id: 2, titulo: 'Evaluación', descripcion: 'Entrevistas y visitas' },
    { id: 3, titulo: 'Documentos', descripcion: 'Contrato y firmas' },
    { id: 4, titulo: '¡Adopción!', descripcion: 'Bienvenida a casa' },
  ];

  // Función auxiliar para determinar la etapa numérica basada en el texto del backend
  const obtenerEtapaNumerica = (estadoBackend) => {
    switch (estadoBackend) {
      case 'En Revisión': return 1;
      case 'En Evaluación': return 2; // Ajustado según tu panel de fundación
      case 'Revisión de Documentos': return 3;
      case 'Cierre y Contrato': return 3;
      case 'Aprobada': return 4;
      case 'Rechazada': return 1; 
      default: return 1;
    }
  };

  useEffect(() => {
    const cargarPostulacion = async () => {
      if (!id || isNaN(Number(id))) {
        setError("ID de postulación no válido");
        setCargando(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        // Usamos la variable de entorno que apunta directo al backend (ej: http://localhost:3000)
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        // Fetch al endpoint del backend
        const respuesta = await fetch(`${apiBase}/postulaciones/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (respuesta.ok) {
          const json = await respuesta.json();
          const dataBD = json.datos; // El backend devuelve { mensaje: "...", datos: {...}, historial: [...] }

          // Mapeamos los datos de la BD a la estructura de la vista
          const datosFormateados = {
            id: dataBD.id,
            fecha_postulacion: dataBD.fecha_postulacion,
            etapa_actual: obtenerEtapaNumerica(dataBD.estado_postulacion),
            estado_general: dataBD.estado_postulacion,
            mascota: {
              nombre: dataBD.nombre_animal || 'Mascota',
              foto: dataBD.foto_animal ? (dataBD.foto_animal.startsWith('http') ? dataBD.foto_animal : `${apiBase}/uploads/${dataBD.foto_animal}`) : null,
            },
            fundacion: {
              nombre: dataBD.nombre_refugio || 'Fundación',
              // El backend (GET /:id para Adoptantes) no trae el teléfono del refugio en la query actual,
              // pero lo dejamos preparado por si lo agregas luego al SQL.
              telefono: dataBD.telefono_refugio || null 
            }
          };

          setPostulacion(datosFormateados);
        } else {
          // Si es 404, mostramos el mensaje que manda el backend
          const errData = await respuesta.json().catch(() => ({}));
          setError(errData.error || "No se pudo cargar la postulación");
        }
      } catch (err) {
        console.error("Error de red:", err);
        setError("Error de conexión al servidor");
      } finally {
        setCargando(false);
      }
    };

    cargarPostulacion();
  }, [id]);

  const handleAgendar = () => {
    if (postulacion?.fundacion?.telefono) {
      const mensaje = `Hola, mi postulación por ${postulacion.mascota.nombre} está en evaluación y me gustaría coordinar la entrevista.`;
      window.open(`https://wa.me/${postulacion.fundacion.telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    } else {
      alert("La fundación aún no ha configurado su número de contacto. Por favor revisa tu correo.");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin text-4xl">🐾</div>
      </div>
    );
  }

  if (error || !postulacion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">{error || "Postulación no encontrada"}</p>
          <button onClick={() => navigate(-1)} className="text-purple-600 underline font-medium">Volver a mis postulaciones</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 font-sans text-slate-700 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Volver a mis postulaciones
        </button>

        {/* TARJETA PRINCIPAL */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border-2 border-purple-100 shadow-xl overflow-hidden">
          
          {/* HEADER DE LA POSTULACIÓN */}
          <div className="bg-purple-600 p-8 text-white flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full border-4 border-white/40 flex items-center justify-center text-4xl shadow-inner shrink-0 overflow-hidden">
              {postulacion.mascota.foto ? (
                <img src={postulacion.mascota.foto} alt="Mascota" className="w-full h-full object-cover" />
              ) : (
                "🐶"
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold mb-1">
                Postulación por {postulacion.mascota.nombre}
              </h1>
              <p className="text-purple-200 font-medium flex items-center gap-2 justify-center md:justify-start">
                <Heart className="w-4 h-4" /> {postulacion.fundacion.nombre}
              </p>
            </div>
            <div className="md:ml-auto mt-4 md:mt-0 text-center md:text-right">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                <p className="text-xs text-purple-200 font-medium">Estado General</p>
                <p className="text-lg font-extrabold text-white">{postulacion.estado_general}</p>
              </div>
            </div>
          </div>

          {/* STEPPER VISUAL (LÍNEA DE TIEMPO) */}
          <div className="p-8 border-b border-purple-50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
              {/* Línea conectora de fondo (solo visible en desktop) */}
              <div className="hidden md:block absolute top-6 left-10 right-10 h-1 bg-slate-100 -z-10 rounded-full"></div>
              
              {etapas.map((etapa) => {
                const activo = postulacion.etapa_actual === etapa.id;
                const completado = postulacion.etapa_actual > etapa.id;

                return (
                  <div key={etapa.id} className="flex flex-col items-center text-center relative z-10 w-32">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg mb-3 shadow-sm transition-all duration-300 ${
                      completado ? 'bg-green-500 text-white shadow-green-200' :
                      activo ? 'bg-purple-600 text-white shadow-purple-200 scale-110 ring-4 ring-purple-100' :
                      'bg-slate-100 text-slate-400'
                    }`}>
                      {completado ? <CheckCircle className="w-6 h-6" /> : etapa.id}
                    </div>
                    <h3 className={`font-extrabold text-sm ${activo ? 'text-purple-700' : completado ? 'text-slate-700' : 'text-slate-400'}`}>
                      {etapa.titulo}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight hidden md:block">
                      {etapa.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTENIDO DINÁMICO SEGÚN LA ETAPA */}
          <div className="p-8 bg-slate-50/50">
            
            {/* VISTA ETAPA 1: Formulario */}
            {postulacion.etapa_actual === 1 && (
              <div className="text-center py-8">
                {postulacion.estado_general === 'Rechazada' ? (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Postulación Rechazada</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Lamentablemente, la fundación ha decidido no avanzar con tu solicitud en esta ocasión. Revisa tu correo electrónico, donde te enviaron el motivo de la decisión.
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Formulario en Revisión</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      La fundación está leyendo tus respuestas. Si cumples con el perfil inicial, avanzaremos a la etapa de evaluación. ¡Atento a tu correo!
                    </p>
                  </>
                )}
              </div>
            )}

            {/* VISTA ETAPA 2: Evaluación */}
            {postulacion.etapa_actual === 2 && (
              <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Evaluación y Entrevistas</h3>
                    <p className="text-sm text-slate-500">Etapa 2: Conociéndonos mejor</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm mb-6">
                  <p className="text-slate-600 mb-4">
                    ¡Felicidades! Tu formulario inicial fue aprobado. El siguiente paso es realizar una breve entrevista telefónica o por videollamada para conocerte mejor y conversar sobre los cuidados de <strong>{postulacion.mascota.nombre}</strong>.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleAgendar} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all shadow-md">
                      <Calendar className="w-5 h-5" /> Agendar Videollamada
                    </button>
                    <button onClick={handleAgendar} className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-200 py-3 px-6 rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all">
                      Contactar por WhatsApp
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 text-sm text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>
                    Dependiendo de la fundación, también se podría coordinar una visita domiciliaria para asegurar que el espacio sea seguro (Mallas en ventanas, cierres perimetrales, etc).
                  </p>
                </div>
              </div>
            )}

            {/* VISTA ETAPA 3: Documentos */}
            {postulacion.etapa_actual === 3 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Firma de Documentos</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  ¡Ya casi! Solo necesitamos que subas una copia de tu carnet de identidad y los documentos requeridos por la fundación.
                </p>
                <button className="bg-amber-500 hover:bg-amber-600 text-white py-3 px-8 rounded-2xl font-extrabold shadow-md transition-all">
                  Subir Documentos
                </button>
              </div>
            )}

            {/* VISTA ETAPA 4: Finalizada */}
            {postulacion.etapa_actual === 4 && (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
                  ¡Adopción Aprobada!
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Felicidades. Has completado todo el proceso. Ponte en contacto con la fundación para coordinar la entrega de tu nuevo mejor amigo.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}