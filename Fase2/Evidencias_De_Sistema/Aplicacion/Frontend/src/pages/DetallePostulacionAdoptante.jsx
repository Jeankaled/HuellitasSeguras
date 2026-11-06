import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, FileText, Home, ArrowLeft, UploadCloud, Check } from 'lucide-react';

export default function DetallePostulacionAdoptante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postulacion, setPostulacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Estado para los documentos
  const [documentos, setDocumentos] = useState({
    carnet: null,
    sueldo: null,
    domicilio: null
  });
  const [subiendoDocs, setSubiendoDocs] = useState(false);
  const [docsEnviados, setDocsEnviados] = useState(false);

  const etapas = [
    { nombre: 'En Revisión', icono: Home, descripcion: 'Recibimos tu formulario' },
    { nombre: 'En Evaluación', icono: Clock, descripcion: 'Estamos revisando tus antecedentes' },
    { nombre: 'Revisión de Documentos', icono: FileText, descripcion: 'Verificación de identidad' },
    { nombre: 'Cierre y Contrato', icono: CheckCircle, descripcion: 'Firma final de adopción' }
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        const res = await fetch(`${apiBase}/postulaciones/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        setPostulacion(data.datos);
        if (data.datos?.documentos_subidos) setDocsEnviados(true);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const manejarArchivo = (e, tipo) => {
    setDocumentos({ ...documentos, [tipo]: e.target.files[0] });
  };

  const enviarDocumentos = async (e) => {
    e.preventDefault();
    setSubiendoDocs(true);
    
    // Aquí iría tu lógica de FormData para enviar al backend
    // Simulamos carga de 2 segundos:
    setTimeout(() => {
      setSubiendoDocs(false);
      setDocsEnviados(true);
    }, 2000);
  };

  if (cargando) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 flex items-center justify-center">
      <div className="animate-pulse text-pink-500 font-extrabold text-xl flex items-center gap-2">
        <span className="text-3xl animate-bounce">🐾</span> Cargando tu postulación...
      </div>
    </div>
  );

  if (!postulacion) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">😿</div>
      <div className="text-red-500 font-bold text-xl">Postulación no encontrada.</div>
      <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition">Volver</button>
    </div>
  );

  // Lógica de etapas
  const estadoBackend = (postulacion.estado_postulacion || '').toLowerCase();
  const indiceEtapaActual = etapas.findIndex(e => {
    const n = e.nombre.toLowerCase();
    return estadoBackend === n || 
           (estadoBackend.includes('documento') && n.includes('documento')) ||
           (estadoBackend.includes('evaluaci') && n.includes('evaluaci'));
  });

  const indiceSeguro = indiceEtapaActual !== -1 ? indiceEtapaActual : 0;
  const estaRechazada = estadoBackend.includes('rechazad');
  const esEtapaDocumentos = indiceSeguro === 2 && !estaRechazada;

  // Lógica para asignar colores dependiendo del nombre de la fundación
  const getTemaFundacion = (nombre) => {
    if (!nombre) return { texto: 'text-pink-600', fondo: 'bg-pink-50', borde: 'border-pink-200', boton: 'from-pink-500 to-purple-500', inputBg: 'bg-pink-100', inputHover: 'hover:bg-pink-200' };
    
    const inicial = nombre.charAt(0).toLowerCase();
    if (['a','e','i','o','u'].includes(inicial)) { // Fundaciones que empiezan con vocal -> Tema Teal
      return { texto: 'text-teal-600', fondo: 'bg-teal-50', borde: 'border-teal-200', boton: 'from-teal-400 to-emerald-500', inputBg: 'bg-teal-100', inputHover: 'hover:bg-teal-200' };
    }
    if (['b','c','d','f','g'].includes(inicial)) { // Tema Naranja
      return { texto: 'text-orange-600', fondo: 'bg-orange-50', borde: 'border-orange-200', boton: 'from-orange-400 to-red-400', inputBg: 'bg-orange-100', inputHover: 'hover:bg-orange-200' };
    }
    if (['h','j','k','l','m','n'].includes(inicial)) { // Tema Indigo
      return { texto: 'text-indigo-600', fondo: 'bg-indigo-50', borde: 'border-indigo-200', boton: 'from-indigo-400 to-blue-500', inputBg: 'bg-indigo-100', inputHover: 'hover:bg-indigo-200' };
    }
    // Por defecto -> Tema Rosado
    return { texto: 'text-pink-600', fondo: 'bg-pink-50', borde: 'border-pink-200', boton: 'from-pink-500 to-purple-500', inputBg: 'bg-pink-100', inputHover: 'hover:bg-pink-200' };
  };

  const tema = getTemaFundacion(postulacion.nombre_refugio);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-sky-50 to-purple-50 font-sans text-slate-700 relative overflow-hidden py-12 px-6">
      
      <div className="absolute top-10 left-10 text-5xl opacity-15 pointer-events-none animate-bounce">🐾</div>
      <div className="absolute top-1/3 right-12 text-6xl opacity-15 pointer-events-none">✨</div>
      <div className="absolute bottom-20 left-20 text-5xl opacity-15 pointer-events-none">🦴</div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-pink-600 font-bold mb-8 hover:bg-white transition shadow-sm border border-pink-100">
          <ArrowLeft className="w-4 h-4"/> Volver a mis postulaciones
        </button>

        {/* Tarjeta de Encabezado */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border-2 border-purple-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative group">
            {postulacion.foto_animal ? (
              <img src={postulacion.foto_animal} alt="Mascota" className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-32 h-32 bg-pink-100 text-pink-500 rounded-3xl flex items-center justify-center text-4xl shadow-inner border-4 border-white group-hover:scale-105 transition-transform">🐾</div>
            )}
            <div className="absolute -bottom-3 -right-3 text-3xl">💖</div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
              Postulación por {postulacion.nombre_animal}
            </h1>
            <p className="text-slate-500 font-bold text-lg">{postulacion.nombre_refugio}</p>
          </div>
        </div>

        {/* Tarjeta de Estado (Línea de Tiempo) */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border-2 border-pink-100 p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-10 flex items-center gap-2">
            Estado de tu solicitud ✨
          </h2>
          
          <div className="relative ml-6">
            <div className="absolute left-[15px] top-4 bottom-8 w-1 bg-slate-200 rounded-full z-0"></div>

            <div className="space-y-12 relative z-10">
              {etapas.map((etapa, index) => {
                const completada = index < indiceSeguro;
                const activa = index === indiceSeguro;
                const mostrarRechazoAqui = estaRechazada && activa;

                let colorFondoIcono = "bg-slate-100";
                let colorIcono = "text-slate-400";
                let bordeIcono = "border-white";
                let colorTextoTitulo = "text-slate-400";

                if (mostrarRechazoAqui) {
                  colorFondoIcono = "bg-red-100";
                  colorIcono = "text-red-500";
                  bordeIcono = "border-red-200";
                  colorTextoTitulo = "text-red-600";
                } else if (completada) {
                  colorFondoIcono = "bg-purple-500";
                  colorIcono = "text-white";
                  bordeIcono = "border-purple-200";
                  colorTextoTitulo = "text-slate-800";
                } else if (activa) {
                  colorFondoIcono = "bg-pink-500";
                  colorIcono = "text-white";
                  bordeIcono = "border-pink-200 shadow-md shadow-pink-200";
                  colorTextoTitulo = "text-pink-600";
                }

                return (
                  <div key={index} className="relative flex items-start gap-6 group">
                    {index > 0 && completada && <div className="absolute -top-12 left-[15px] h-12 w-1 bg-purple-500 rounded-full -z-10"></div>}
                    {index > 0 && activa && !estaRechazada && <div className="absolute -top-12 left-[15px] h-12 w-1 bg-pink-300 rounded-full -z-10"></div>}

                    <div className={`w-9 h-9 rounded-2xl border-4 ${bordeIcono} flex items-center justify-center shrink-0 ${colorFondoIcono} transition-all duration-300 ${activa ? 'scale-110' : ''}`}>
                      <etapa.icono className={`w-4 h-4 ${colorIcono}`} strokeWidth={activa ? 3 : 2} />
                    </div>
                    
                    <div className="pt-1">
                      <h3 className={`font-extrabold text-lg ${colorTextoTitulo} transition-colors`}>
                        {mostrarRechazoAqui ? 'Postulación Rechazada' : etapa.nombre}
                      </h3>
                      <p className={`mt-1.5 font-medium text-sm ${activa && !estaRechazada ? 'text-slate-600' : 'text-slate-400'}`}>
                        {mostrarRechazoAqui ? 'Lamentablemente no cumples con los requisitos. Te hemos enviado un correo con los detalles.' : etapa.descripcion}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tarjeta SEPARADA de Documentos (Solo aparece en Etapa 3) */}
        {esEtapaDocumentos && (
          <div className={`bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border-2 ${tema.borde} p-8 md:p-12 transition-all`}>
            {docsEnviados ? (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-2xl mb-2">¡Documentos recibidos! 🎉</h3>
                <p className="text-slate-500 font-medium">{postulacion.nombre_refugio} los está revisando. Te notificaremos el resultado muy pronto.</p>
              </div>
            ) : (
              <form onSubmit={enviarDocumentos}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${tema.fondo}`}>
                    <UploadCloud className={`w-6 h-6 ${tema.texto}`} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-extrabold ${tema.texto}`}>Sube tus antecedentes</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Requeridos por {postulacion.nombre_refugio} para continuar.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { id: 'carnet', label: 'Cédula de Identidad', desc: 'Frente y reverso', accept: 'image/*,.pdf' },
                    { id: 'sueldo', label: 'Liquidación de Sueldo', desc: 'Último mes (PDF)', accept: '.pdf' },
                    { id: 'domicilio', label: 'Comprobante Domicilio', desc: 'Luz, agua o internet', accept: 'image/*,.pdf' }
                  ].map((doc) => (
                    <div key={doc.id} className="bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-100 hover:border-slate-200 transition">
                      <label className="block text-sm font-extrabold text-slate-700 mb-1">{doc.label}</label>
                      <span className="block text-xs font-medium text-slate-400 mb-4">{doc.desc}</span>
                      
                      <input 
                        type="file" 
                        accept={doc.accept}
                        onChange={(e) => manejarArchivo(e, doc.id)}
                        required
                        className={`block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold ${tema.inputBg} ${tema.texto} ${tema.inputHover} transition cursor-pointer`}
                      />
                    </div>
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={subiendoDocs}
                  className={`w-full bg-gradient-to-r ${tema.boton} text-white font-extrabold text-lg py-4 px-6 rounded-2xl hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg`}
                >
                  {subiendoDocs ? 'Subiendo archivos...' : 'Enviar Documentos a la Fundación 🚀'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}