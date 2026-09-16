import { useState } from 'react'
import Login from './pages/Login'
import Registro from './pages/Registro'

export default function App() {
  // Estado para saber qué vista mostrar. Inicia en 'login'
  const [vistaActual, setVistaActual] = useState('login')

  return (
    <>
      {vistaActual === 'login' ? (
        <Login onNavigateToRegister={() => setVistaActual('registro')} />
      ) : (
        <Registro onNavigateToLogin={() => setVistaActual('login')} />
      )}
    </>
  )
}