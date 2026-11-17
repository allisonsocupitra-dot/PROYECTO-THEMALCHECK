import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: ReactNode;
  // Opcional: si se pasa, solo entran usuarios cuyo rol esté en la lista.
  rolesPermitidos?: string[];
}

export default function ProtectedRoute({ children, rolesPermitidos }: ProtectedRouteProps) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // AJUSTA: usa el campo real donde tu usuario guarda el rol
  // (por ejemplo usuario.rol, usuario.tipo_rol o usuario.id_rol).
  const rolUsuario = String((usuario as { rol?: string }).rol ?? '');

  if (rolesPermitidos && !rolesPermitidos.includes(rolUsuario)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}