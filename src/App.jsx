import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DataProvider } from './contexto/DataContext';
import { AuthProvider } from './contexto/AuthContext';
import ScrollToTop from './componentes/ScrollToTop';
import RutaProtegida from './componentes/RutaProtegida';

import Inicio from './paginas/inicio/inicio';
import InicioSesion from './paginas/Formularios/Inicio_sesion';
import Registrarse from './paginas/Formularios/Registrarse';
import Dashboard from './paginas/dashboard_admin/dashboard_admin';
import PanelUsuario from './paginas/panel_usuario/panel_usuario';
import DetalleEvento from './paginas/detalle_evento/detalle_evento';
import Checkout from './paginas/checkout/checkout';
import Confirmacion from './paginas/confirmacion/confirmacion';

/*
 * DataProvider va por fuera de AuthProvider porque la sesión necesita la lista de
 * usuarios para validar credenciales y para dar de alta una cuenta nueva.
 */
function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Inicio />} />
            <Route path="/login" element={<InicioSesion />} />
            <Route path="/registro" element={<Registrarse />} />
            <Route path="/evento/:id" element={<DetalleEvento />} />

            {/* Exigen sesión */}
            <Route
              path="/checkout/:id"
              element={
                <RutaProtegida>
                  <Checkout />
                </RutaProtegida>
              }
            />
            <Route
              path="/confirmacion/:compraId"
              element={
                <RutaProtegida>
                  <Confirmacion />
                </RutaProtegida>
              }
            />
            <Route
              path="/panel"
              element={
                <RutaProtegida>
                  <PanelUsuario />
                </RutaProtegida>
              }
            />

            {/* Solo administradores y empleados */}
            <Route
              path="/dashboard"
              element={
                <RutaProtegida soloAdmin>
                  <Dashboard />
                </RutaProtegida>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
