import { useState } from 'react';
import { Scale, ShieldCheck, ChevronDown, ChevronUp, Heart, FileSignature, Info } from 'lucide-react';

export default function MarcoLegal() {
  const [expandido, setExpandido] = useState(false);

  const leyes = [
    {
      numero: "Ley 21.020",
      nombre: "Tenencia Responsable (Ley Cholito)",
      icono: Heart,
      color: "text-pink-600",
      bg: "bg-pink-100",
      implicancia: "Establece las obligaciones del adoptante (alimentación, salud, registro y chipeo). Respalda a la fundación para exigir condiciones mínimas y penaliza legalmente el abandono y maltrato."
    },
    {
      numero: "Ley 19.628",
      nombre: "Protección de Datos Personales",
      icono: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      implicancia: "Garantiza que la información sensible recopilada en este formulario (RUT, ingresos, dirección, composición del hogar) será de uso exclusivo para el proceso de evaluación y no será compartida con terceros."
    },
    {
      numero: "Ley 19.799",
      nombre: "Firma Electrónica y Documentos Digitales",
      icono: FileSignature,
      color: "text-blue-600",
      bg: "bg-blue-100",
      implicancia: "Otorga validez legal y probatoria a los acuerdos, términos de adopción y contratos aceptados a través de esta plataforma digital por parte del postulante."
    },
    {
      numero: "Ley 20.380",
      nombre: "Protección de Animales",
      icono: Scale,
      color: "text-amber-600",
      bg: "bg-amber-100",
      implicancia: "Fija el estándar nacional sobre el bienestar animal, asegurando que el nuevo hogar cumpla con las condiciones para evitar el sufrimiento o estrés innecesario del animal rescatado."
    }
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
      {/* Cabecera / Botón "Ver más" */}
      <button 
        onClick={() => setExpandido(!expandido)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-100 transition focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-extrabold text-slate-700">Marco Legal y Privacidad</h4>
            <p className="text-xs text-slate-500 font-medium">Bases legales que rigen esta adopción</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          {expandido ? (
            <>Ocultar detalles <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Ver implicancias <ChevronDown className="w-4 h-4" /></>
          )}
        </div>
      </button>

      {/* Contenido desplegable */}
      {expandido && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-xl border border-blue-100">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Al procesar esta solicitud, ambas partes (fundación y adoptante) se acogen a la siguiente normativa chilena vigente:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leyes.map((ley, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${ley.bg} ${ley.color}`}>
                    {ley.numero}
                  </span>
                  <h5 className="font-bold text-slate-700 text-sm truncate">{ley.nombre}</h5>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {ley.implicancia}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}