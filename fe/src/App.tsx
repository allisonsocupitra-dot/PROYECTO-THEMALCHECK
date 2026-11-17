import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { GaleriaProvider } from './context/GaleriaContext';

import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecuperarPage from './pages/RecuperarPage';
import RestablecerPage from './pages/RestablecerPage';
import DashboardPage from './pages/DashboardPage';
import VisorPage from './pages/VisorPage';
import ReportesPage from './pages/ReportesPage';
import AdminPage from './pages/AdminPage';

// AJUSTA: los paths según los que ya usas en NavLateral y en tus navigate(...)
const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },
  { path: '/recuperar', element: <RecuperarPage /> },
  { path: '/restablecer-contrasena', element: <RestablecerPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/visor',
    element: (
      <ProtectedRoute>
        <VisorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reportes',
    element: (
      <ProtectedRoute>
        <ReportesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      // AJUSTA: el valor real del rol admin. Si aún no tienes claro el campo
      // del rol, quita la prop rolesPermitidos y deja solo <ProtectedRoute>.
      <ProtectedRoute rolesPermitidos={['admin']}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
]);

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GaleriaProvider>
          <RouterProvider router={router} />
        </GaleriaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}