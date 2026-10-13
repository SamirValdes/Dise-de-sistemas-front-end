import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inicio from './paginas/inicio/inicio';
import Inicio_sesion from './paginas/Formularios/Inicio_sesion';
// 1. Importas tu nuevo componente de registro
import Registrarse from './paginas/Formularios/Registrarse';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La ruta base "/" cargará tu página de inicio con la imagen del concierto */}
        <Route path="/" element={<Inicio />} />
        
        {/* La ruta "/login" cargará tu formulario de inicio de sesión */}
        <Route path="/login" element={<Inicio_sesion />} />

        {/* 2. Agregas la nueva ruta para el registro */}
        <Route path="/registro" element={<Registrarse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;