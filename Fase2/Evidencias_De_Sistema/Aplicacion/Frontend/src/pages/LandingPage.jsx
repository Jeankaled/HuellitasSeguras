import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Building2, 
  Sparkles, 
  Lock, 
  PawPrint
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [tabLey, setTabLey] = useState('cholito');

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-sky-50/50 to-pink-100/60 text-slate-700 font-sans">
      
      {/* 🌸 NAVBAR CUTE */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 font-black text-2xl shadow-inner border border-pink-200 animate-pulse">
              🐾
            </div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-sky-600 via-pink-500 to-pink-400 bg-clip-text text-transparent">
                Huellita Segura
              </span>
              <p className="text-[10px] font-extrabold text-pink-400 tracking-wider uppercase">SaaS Multi-Tenant de Adopción</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
            <a href="#proposito" className="hover:text-pink-500 transition">¿De qué va?</a>
            <a href="#por-que-segura" className="hover:text-sky-600 transition">Seguridad y Legal</a>
            <a href="#marco-legal" className="hover:text-pink-500 transition">Leyes Chilenas</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm text-sky-700 bg-sky-50 hover:bg-sky-100 transition border border-sky-200 shadow-sm flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-sky-500" />
              Portal Fundaciones
            </button>
            <button 
              onClick={() => navigate('/registro')}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white shadow-md shadow-pink-200 transition flex items-center gap-2"
            >
              <PawPrint className="w-4 h-4" />
              Zona Adopción
            </button>
          </div>
        </div>
      </nav>

      {/* 💖 HERO SECTION CUTE */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100/70 border border-pink-200 text-pink-600 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Adopciones Responsables & Respaldo Legal
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
                Protegemos cada patita con <span className="bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent">amor y seguridad digital</span>.
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Unimos fundaciones y familias adoptantes en un espacio seguro, con historiales médicos transparentes y contratos digitales legalmente vinculantes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={() => navigate('/registro')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold shadow-lg shadow-sky-200 transition flex items-center justify-center gap-3 text-base"
                >
                  Comenzar Adopción 🐾
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-pink-50 text-pink-600 font-extrabold border-2 border-pink-200 transition text-center text-base shadow-sm"
                >
                  Acceso Fundaciones
                </button>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-pink-200/60 max-w-lg mx-auto lg:mx-0">
                <div className="bg-white/60 p-3 rounded-2xl border border-pink-100">
                  <p className="font-extrabold text-2xl text-sky-600">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Digital y Seguro</p>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-pink-100">
                  <p className="font-extrabold text-2xl text-pink-500">Ley 21.020</p>
                  <p className="text-xs text-slate-500 font-medium">Tenencia Legal</p>
                </div>
                <div className="bg-white/60 p-3 rounded-2xl border border-pink-100">
                  <p className="font-extrabold text-2xl text-sky-600">SaaS</p>
                  <p className="text-xs text-slate-500 font-medium">Multi-Tenant</p>
                </div>
              </div>
            </div>

            {/* Tarjeta interactiva lateral estética */}
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-pink-300/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl -z-10"></div>
              
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-2 border-pink-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500 font-bold">
                      📋
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Expediente Clínico & Legal</h4>
                      <p className="text-xs text-slate-500">Estado: Verificado con Hash</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Válido
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-sky-50/80 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 border border-sky-100">
                    <span className="flex items-center gap-2">🐶 Registro Microchip</span>
                    <span className="text-sky-600 font-bold">941000028391204</span>
                  </div>
                  <div className="p-3 bg-pink-50/80 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 border border-pink-100">
                    <span className="flex items-center gap-2">✍️ Contrato Digital FES</span>
                    <span className="text-pink-500 font-bold">Validado por OTP</span>
                  </div>
                  <div className="p-3 bg-sky-50/80 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 border border-sky-100">
                    <span className="flex items-center gap-2">🏥 Historial Médico</span>
                    <span className="text-sky-600 font-bold">Vacunas al día</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-sky-400 to-pink-400 p-4 rounded-2xl text-white text-center shadow-md">
                  <p className="text-xs font-bold">¿Eres parte de un refugio?</p>
                  <p className="text-[11px] opacity-90 mt-0.5">Gestiona tus rescates de forma profesional y segura.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🌸 SECCIÓN: ¿DE QUÉ VA HUELLITA SEGURA? */}
      <section id="proposito" className="py-16 bg-white/80 backdrop-blur-sm border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-4 py-1.5 rounded-full bg-sky-100 text-sky-600 text-xs font-bold">Propósito del Sistema</span>
            <h2 className="text-3xl font-black text-slate-800 mt-2">¿De qué trata el proyecto?</h2>
            <p className="text-slate-600 font-medium mt-2">
              Huellita Segura es una plataforma integral diseñada para erradicar la informalidad en las adopciones de animales y potenciar la labor de los refugios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-sky-50/70 p-6 rounded-3xl border border-sky-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                🏥
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">Fichas Médicas Digitales</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Almacenamos vacunas, desparasitaciones y cirugías para garantizar que las familias adopten con total transparencia sobre la salud del rescatado.
              </p>
            </div>

            <div className="bg-pink-50/70 p-6 rounded-3xl border border-pink-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                📜
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">Contratos Vinculantes</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Generamos automáticamente un contrato en PDF con firma electrónica y verificación OTP, otorgando total respaldo legal.
              </p>
            </div>

            <div className="bg-sky-50/70 p-6 rounded-3xl border border-sky-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-4 shadow-sm">
                🔎
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-2">Trazabilidad Post-Adopción</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Permite a los refugios realizar seguimiento continuo, recibir reportes y asegurar el bienestar permanente del animal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🔒 SECCIÓN: ¿POR QUÉ ES MÁS SEGURA? */}
      <section id="por-que-segura" className="py-16 bg-gradient-to-br from-pink-50/60 via-white to-sky-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-xs font-bold">Seguridad Avanzada</span>
            <h2 className="text-3xl font-black text-slate-800 mt-3">¿Por qué Huellita Segura es MÁS SEGURA?</h2>
            <p className="text-slate-600 font-medium mt-2">
              Superamos la informalidad de redes sociales con altos estándares de ingeniería y validación de identidad.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Verificación (KYC)</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Validamos RUN y datos de contacto de los postulantes antes de aprobar cualquier adopción.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Firma Electrónica</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Respaldada por la Ley 19.799 con registros de hora, IP y códigos OTP únicos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Aislamiento Multi-Tenant</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Cada refugio protege sus datos e historiales de forma aislada en nuestra base de datos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition space-y-3">
              <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Expedientes de Denuncia</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Consolidación rápida de antecedentes ante fiscalía o BIDEMA en caso de maltrato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ⚖️ SECCIÓN: MARCO LEGAL */}
      <section id="marco-legal" className="py-16 bg-white/90 backdrop-blur-sm border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="px-4 py-1.5 rounded-full bg-sky-100 text-sky-600 text-xs font-bold">Normativa Vigente</span>
            <h2 className="text-3xl font-black text-slate-800 mt-2">Marco Legal Chileno Integrado</h2>
            <p className="text-slate-600 font-medium mt-2">
              Nuestra plataforma cumple estrictamente con las leyes que protegen a los animales y la privacidad.
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <button 
              onClick={() => setTabLey('cholito')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
                tabLey === 'cholito' 
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-200' 
                  : 'bg-pink-50 text-slate-600 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              Ley 21.020 (Ley Cholito)
            </button>
            <button 
              onClick={() => setTabLey('firma')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
                tabLey === 'firma' 
                  ? 'bg-pink-400 text-white shadow-md shadow-pink-200' 
                  : 'bg-pink-50 text-slate-600 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              Ley 19.799 (Firma Electrónica)
            </button>
            <button 
              onClick={() => setTabLey('datos')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition ${
                tabLey === 'datos' 
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-200' 
                  : 'bg-pink-50 text-slate-600 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              Ley 19.628 / 21.719 (Protección de Datos)
            </button>
          </div>

          <div className="bg-pink-50/50 border border-pink-200 rounded-3xl p-8 max-w-4xl mx-auto shadow-sm">
            {tabLey === 'cholito' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-sky-100 text-sky-600 rounded-2xl font-bold text-lg">🐕</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Ley 21.020 sobre Tenencia Responsable de Mascotas</h3>
                    <p className="text-xs text-sky-600 font-bold">Regula obligaciones de dueños y refugios en Chile</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Huellita Segura facilita el registro obligatorio de microchip y exige compromisos formales de cuidado y prohibición de abandono en cada adopción gestionada.
                </p>
              </div>
            )}

            {tabLey === 'firma' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-pink-100 text-pink-500 rounded-2xl font-bold text-lg">✍️</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Ley 19.799 sobre Documentos y Firma Electrónica</h3>
                    <p className="text-xs text-pink-500 font-bold">Validez legal de actos celebrados por medios digitales</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Los acuerdos de adopción generados poseen validez jurídica gracias al registro de consentimiento digital y trazabilidad de identidad de los adoptantes.
                </p>
              </div>
            )}

            {tabLey === 'datos' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-sky-100 text-sky-600 rounded-2xl font-bold text-lg">🛡️</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">Ley 19.628 / 21.719 de Protección de la Vida Privada</h3>
                    <p className="text-xs text-sky-600 font-bold">Tratamiento confidencial de datos personales</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Aseguramos que la información sensible de fundaciones y adoptantes se mantenga protegida y cifrada bajo estrictos controles de acceso.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 💖 FOOTER CUTE */}
      <footer className="bg-white border-t border-pink-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce">🐾</span>
            <span className="font-black text-lg bg-gradient-to-r from-sky-600 to-pink-500 bg-clip-text text-transparent">
              Huellita Segura
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Proyecto Capstone desarrollado por Bárbara Quezada y Jean Ávila. Sistema de Adopción Responsable Multi-Tenant.
          </p>
          <p className="text-[11px] text-slate-400 font-semibold">
            © 2026 Huellita Segura — Conectando corazones con seguridad.
          </p>
        </div>
      </footer>

    </div>
  );
}