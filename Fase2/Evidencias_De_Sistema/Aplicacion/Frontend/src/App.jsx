import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PanelGestion from './pages/PanelGestion';
import Registro from './pages/Registro';

function App() {
  // Estado que lee el token directamente desde el almacenamiento del navegador
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Guarda el token y actualiza el estado para dar paso al panel
  const handleLoginSuccess = (nuevoToken) => {
    localStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
  };

  // Cierra sesión eliminando el token del sistema
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta pública: Si ya inició sesión, lo redirige automáticamente a /panel */}
        <Route 
          path="/" 
          element={
            token ? (
              <Navigate to="/panel" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Ruta de Registro pública */}
        <Route 
          path="/registro" 
          element={
            token ? (
              <Navigate to="/panel" replace />
            ) : (
              <Registro />
            )
          } 
        />
        
        {/* Ruta protegida: Solo accesible si existe un token activo */}
        <Route 
          path="/panel" 
          element={
            token ? (
              <PanelGestion onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        {/* Captura cualquier ruta inexistente y redirige según el estado de sesión */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/panel" : "/"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;