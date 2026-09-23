import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();
  
  // Tipo de cuenta: 'adoptante' o 'fundacion'
  const [tipoCuenta, setTipoCuenta] = useState('adoptante');

  // Datos Compartidos
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  // Datos Adoptante
  const [nombreAdoptante, setNombreAdoptante] = useState('');
  const [apellidoAdoptante, setApellidoAdoptante] = useState('');

  // Datos Fundación
  const [nombreOrg, setNombreOrg] = useState('');
  const [rut, setRut] = useState('');
  const [direccion, setDireccion] = useState('');

  // Personalización Fundación
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [colorPrincipal, setColorPrincipal] = useState('#F9A8D4');
  const [colorSecundario, setColorSecundario] = useState('#93C5FD');

  const [loading, setLoading] = useState(false);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tipoCuenta === 'fundacion') {
        const formData = new FormData();
        formData.append('nombre_organizacion', nombreOrg);
        formData.append('rut', rut);
        formData.append('email', correo);
        formData.append('password', password);
        formData.append('telefono', telefono);
        formData.append('direccion', direccion);
        formData.append('color_principal', colorPrincipal);
        formData.append('color_secundario', colorSecundario);
        if (logo) formData.append('logo', logo);

        console.log('Datos de fundación (FormData):', Object.fromEntries(formData));
        alert('Fundación registrada. Pendiente de verificación.');

      } else {
        // CORRECCIÓN: Se ajusta al formato que espera el backend y a la ruta correcta
        const adoptanteData = {
          nombre_completo: `${nombreAdoptante} ${apellidoAdoptante}`,
          email: correo,
          password: password,
          telefono: telefono
        };

        const respuesta = await fetch('http://localhost:3000/adoptantes', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adoptanteData) 
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
           throw new Error(data.error || 'Hubo un error al registrar el adoptante');
        }
        
        alert('Cuenta de adoptante creada con éxito.');
      }
      
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-700">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-150">
        
        <div className="w-full lg:w-3/5 p-8 lg:p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 text-2xl">🐾</span>
              <h1 className="text-2xl font-bold text-slate-800">Huellita Segura</h1>
            </div>
            <Link to="/login" className="text-sm text-pink-400 hover:underline font-medium">
              Ya tengo cuenta
            </Link>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              type="button"
              onClick={() => setTipoCuenta('adoptante')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                tipoCuenta === 'adoptante' 
                  ? 'bg-white shadow-sm text-pink-500' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quiero Adoptar
            </button>
            <button 
              type="button"
              onClick={() => setTipoCuenta('fundacion')}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                tipoCuenta === 'fundacion' 
                  ? 'bg-white shadow-sm text-pink-500' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Soy una Fundación
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {tipoCuenta === 'adoptante' && (
              <div className="animate-fadeIn">
                <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Tus Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="👤 Nombre" 
                    value={nombreAdoptante} onChange={(e) => setNombreAdoptante(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                  />
                  <input 
                    type="text" placeholder="👤 Apellido" 
                    value={apellidoAdoptante} onChange={(e) => setApellidoAdoptante(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                  />
                  <input 
                    type="email" placeholder="✉️ Correo Electrónico" 
                    value={correo} onChange={(e) => setCorreo(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm md:col-span-2" required
                  />
                  <input 
                    type="password" placeholder="🔒 Contraseña" 
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                  />
                  <input 
                    type="text" placeholder="📱 Teléfono (Opcional)" 
                    value={telefono} onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm"
                  />
                </div>
              </div>
            )}

            {tipoCuenta === 'fundacion' && (
              <div className="animate-fadeIn space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">1. Datos de la Organización</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="🏢 Nombre (Ej. Refugio Esperanza)" 
                      value={nombreOrg} onChange={(e) => setNombreOrg(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    <input 
                      type="text" placeholder="📄 RUT Organización" 
                      value={rut} onChange={(e) => setRut(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    <input 
                      type="email" placeholder="✉️ Correo del Administrador" 
                      value={correo} onChange={(e) => setCorreo(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    <input 
                      type="password" placeholder="🔒 Contraseña Segura" 
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    <input 
                      type="text" placeholder="📞 Teléfono de Contacto" 
                      value={telefono} onChange={(e) => setTelefono(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm" required
                    />
                    <input 
                      type="text" placeholder="📍 Dirección Física" 
                      value={direccion} onChange={(e) => setDireccion(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-pink-300 text-sm md:col-span-2" required
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">🎨 2. Personalización de Marca</h2>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-600 mb-2">Logo Corporativo</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                      <input 
                        type="file" accept="image/*" onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-4xl text-slate-400 mb-2">☁️</div>
                      <p className="text-sm font-medium text-slate-600">Arrastra tu logo aquí o haz clic para subir</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG hasta 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Color Principal</label>
                      <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-2">
                        <input type="color" value={colorPrincipal} onChange={(e) => setColorPrincipal(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        <span className="text-sm text-slate-500 uppercase">{colorPrincipal}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Color Secundario</label>
                      <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-2">
                        <input type="color" value={colorSecundario} onChange={(e) => setColorSecundario(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                        <span className="text-sm text-slate-500 uppercase">{colorSecundario}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2 mt-4 shadow-lg shadow-pink-200"
            >
              {loading ? 'Procesando...' : (tipoCuenta === 'adoptante' ? 'Crear Cuenta' : 'Registrar Fundación')}
            </button>
          </form>
        </div>

        <div className="hidden lg:flex w-2/5 bg-slate-100 p-8 flex-col items-center justify-center relative border-l border-slate-200">
          {tipoCuenta === 'adoptante' ? (
            <div className="text-center flex flex-col items-center justify-center space-y-6 animate-fadeIn">
              <div className="text-8xl">🐶❤️🐱</div>
              <h3 className="text-2xl font-bold text-slate-700">Encuentra a tu mejor amigo</h3>
              <p className="text-slate-500 max-w-xs text-sm">
                Crea tu cuenta para guardar tus mascotas favoritas, agendar visitas y comenzar un proceso de adopción responsable.
              </p>
            </div>
          ) : (
            <div className="animate-fadeIn w-full flex flex-col items-center">
              <div className="text-center mb-6">
                <h3 className="font-bold text-slate-600">PREVISUALIZACIÓN EN VIVO</h3>
                <p className="text-xs text-slate-400">Así verán tu plataforma los usuarios</p>
              </div>

              <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg flex overflow-hidden h-96 transform scale-95 border border-slate-100">
                <div className="w-1/3 p-4 flex flex-col gap-4 text-white text-xs font-medium transition-colors" style={{ backgroundColor: colorPrincipal }}>
                  <div className="h-10 bg-white/20 rounded-lg flex items-center justify-center p-1">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-[10px]">Tu Logo</span>
                    )}
                  </div>
                  <div className="bg-white/20 p-2 rounded-md">🏠 Inicio</div>
                  <div className="p-2 opacity-80">🐾 Mascotas</div>
                  <div className="p-2 opacity-80">👥 Adoptantes</div>
                </div>
                
                <div className="w-2/3 p-4 flex flex-col gap-3">
                  <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                  <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center text-white text-xl transition-colors" style={{ backgroundColor: colorSecundario }}>🐾</div>
                    <p className="text-xs font-bold text-slate-700">Nueva Adopción</p>
                    <p className="text-[10px] text-slate-400 mt-1 mb-3">Gestiona un nuevo proceso para tu organización.</p>
                    <div className="px-4 py-2 rounded-lg text-white text-[10px] transition-colors" style={{ backgroundColor: colorPrincipal }}>
                      Iniciar Proceso
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}