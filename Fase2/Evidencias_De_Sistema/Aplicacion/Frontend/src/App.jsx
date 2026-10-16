import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PanelGestion from './pages/PanelGestion';
import Registro from './pages/Registro';
import DirectorioAdoptantes from './pages/DirectorioAdoptantes';
import { Toaster } from 'react-hot-toast'; 
import PerfilFundacion from './pages/PerfilFundacion';
import FichaSolicitud from './pages/FichaSolicitud';
import PreferenciasAdoptante from './pages/PreferenciasAdoptante';
import PerfilAdoptante from './pages/PerfilAdoptante';
import DirectorioFundaciones from './pages/DirectorioFundaciones';
import CatalogoMascotasRefugio from './pages/CatalogoMascotasRefugio';
function App() {
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Actualiza el estado en memoria para dar paso al panel
  const handleLoginSuccess = (nuevoToken) => {
    setToken(nuevoToken);
  };

  // Centraliza la limpieza profunda de la sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
  };

  return (
    <Router>
      {/* El Toaster va justo dentro del Router, antes de las rutas */}
      <Toaster position="top-center" /> 
      
      <Routes>
        {/* 1. La ruta raíz redirige lógicamente */}
        <Route path="/" element={<Navigate to={token ? "/panel" : "/login"} replace />} />

        {/* 2. Ruta explícita de Login */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/panel" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* 3. Ruta de Registro */}
        <Route 
          path="/registro" 
          element={token ? <Navigate to="/panel" replace /> : <Registro />} 
        />
        
        {/* 4. Ruta Protegida del Panel */}
        <Route 
          path="/panel" 
          element={token ? <PanelGestion onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />

        {/* 5. Ruta Protegida del Directorio */}
        <Route 
          path="/directorio" 
          element={token ? <DirectorioAdoptantes onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        
        {/* 6. Ruta de Ajustes (Debe ir ANTES del comodín) */}
        <Route 
          path="/ajustes-perfil" 
          element={token ? <PerfilFundacion /> : <Navigate to="/login" replace />} 
        />

        {/* 7. NUEVA RUTA PARA LA FICHA COMPLETA (Debe ir ANTES del comodín) */}
        <Route 
          path="/solicitudes/:id" 
          element={token ? <FichaSolicitud /> : <Navigate to="/login" replace />} 
        />

        {/* 8. Comodín: Captura rutas rotas (SIEMPRE AL FINAL) */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/panel" : "/login"} replace />} 
        />
        <Route path="/preferencias-adoptante" element={<PreferenciasAdoptante />} 
        />

        <Route path="/perfil-adoptante" element={<PerfilAdoptante />} 
        />
        <Route path="/fundaciones" element={<DirectorioFundaciones />} /> 

        <Route path="/catalogo-adoptante" element={<CatalogoMascotasRefugio />} />
      </Routes>
    </Router>
  );
}

export default App;