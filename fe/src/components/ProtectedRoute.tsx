import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types/auth';

interface ProtectedRouteProps {
  rolesPermitidos: Rol[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ rolesPermitidos, children }) => {
  const { usuario, estaAutenticado } = useAuth();

  if (!estaAutenticado || !usuario) {
    return <Navigate to="/" replace />;
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    // El usuario está logueado pero no tiene el rol adecuado para esta ruta:
    // lo mandamos a su panel correspondiente en vez de mostrar un error.
    return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;