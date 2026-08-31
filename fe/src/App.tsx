import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GaleriaProvider } from './context/GaleriaContext';
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

const RouteView: React.FC = () => {
  const location = useLocation();

  return (
    <div className="route-view" key={location.pathname}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recuperar" element={<RecuperarPage />} />
        <Route path="/restablecer-contrasena" element={<RestablecerPage />} />

        <Route path="/dashboard" element={<ProtectedRoute rolesPermitidos={['tecnico', 'admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/visor" element={<ProtectedRoute rolesPermitidos={['tecnico', 'admin']}><VisorPage /></ProtectedRoute>} />
        <Route path="/mis-reportes" element={<ProtectedRoute rolesPermitidos={['tecnico', 'admin']}><MisReportesPage /></ProtectedRoute>} />
        <Route path="/admin/reportes" element={<ProtectedRoute rolesPermitidos={['admin']}><AdminReportsPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <GaleriaProvider>
          <BrowserRouter>
            <RouteView />
          </BrowserRouter>
        </GaleriaProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;