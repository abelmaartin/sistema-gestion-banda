import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Panel from './pages/Panel';
import SubirPartitura from './pages/SubirPartitura';
import AdminPartituras from './pages/AdminPartituras';
import ProtectedRoute from './components/ProtectedRoute';
import RegistrarUsuario from './pages/RegistrarUsuario';
import AdminUsuarios from './pages/AdminUsuarios';
import Perfil from './pages/Perfil';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas PRIVADAS (Solo accesibles con Token JWT) */}
        
        {/* Panel general del músico */}
        <Route 
          path="/panel" 
          element={
            <ProtectedRoute>
              <Panel />
            </ProtectedRoute>
          } 
        />

        {/* Formulario para subir nuevas particellas */}
        <Route 
          path="/subir" 
          element={
            <ProtectedRoute>
              <SubirPartitura />
            </ProtectedRoute>
          } 
        />

        {/* Panel de administración general (CRUD completo) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPartituras />
            </ProtectedRoute>
          } 
        />

        {/* Registrar usuario (admin) */}
        <Route 
          path="/admin/registrar" 
          element={
            <ProtectedRoute>
              <RegistrarUsuario />
            </ProtectedRoute>
          } 
        />

        {/* Administrar usuarios */}
        <Route 
          path="/admin/usuarios" 
          element={
            <ProtectedRoute>
              <AdminUsuarios />
            </ProtectedRoute>
          } 
        />

        {/* Perfil Usuarios */}
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;