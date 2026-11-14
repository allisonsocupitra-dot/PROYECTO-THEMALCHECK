import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GaleriaProvider } from './context/GaleriaContext';
import { VisorProvider } from './context/VisorContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import RecuperarPage from './pages/RecuperarPage';
import RestablecerPage from './pages/RestablecerPage';
import DashboardPage from './pages/DashboardPage';
import VisorPage from './pages/VisorPage';
import MisReportesPage from './pages/ReportesPage';
import AdminReportsPage from './pages/AdminPage';

// Layout raíz: los providers viven aquí (dentro del router) y las páginas
// se pintan en el <Outlet />.
const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <LanguageProvider>
        <GaleriaProvider>
          <VisorProvider>
            <div className="route-view" key={location.pathname}>
              <Outlet />
            </div>
          </VisorProvider>
        </GaleriaProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/auth', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/recuperar', element: <RecuperarPage /> },
      { path: '/restablecer-contrasena', element: <RestablecerPage /> },

      { path: '/dashboard', element: <ProtectedRoute rolesPermitidos={['tecnico', 'admin']}><DashboardPage /></ProtectedRoute> },
      { path: '/visor', element: <ProtectedRoute rolesPermitidos={['tecnico', 'admin']}><VisorPage /></ProtectedRoute> },
      { path: '/mis-reportes', element: <ProtectedRoute rolesPermitidos={['tecnico', 'admin']}><MisReportesPage /></ProtectedRoute> },
      { path: '/admin/reportes', element: <ProtectedRoute rolesPermitidos={['admin']}><AdminReportsPage /></ProtectedRoute> },
    ],
  },
]);

const App: React.FC = () => <RouterProvider router={router} />;

export default App;