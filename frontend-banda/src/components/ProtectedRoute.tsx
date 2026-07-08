import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  // Comprobamos si el token existe en el almacenamiento del navegador
  const token = localStorage.getItem('tokenBanda');

  // Si no hay token, el usuario es un intruso: lo mandamos al login de inmediato
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, le permitimos pasar y renderizamos el componente que esté dentro
  return <>{children}</>;
}