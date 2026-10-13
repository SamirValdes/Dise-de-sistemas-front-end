import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inicio from './paginas/inicio/inicio';
import Inicio_sesion from './paginas/Formularios/Inicio_sesion';

import Registrarse from './paginas/Formularios/Registrarse';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Inicio />} />
        

        <Route path="/login" element={<Inicio_sesion />} />


        <Route path="/registro" element={<Registrarse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;