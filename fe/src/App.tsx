import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GaleriaProvider } from './context/GaleriaContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VisorPage from './pages/VisorPage';
import AdminReportsPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <GaleriaProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Explorador y Visor: compartidos por técnicos y administradores */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute rolesPermitidos={['tecnico', 'admin']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/visor"
                element={
                  <ProtectedRoute rolesPermitidos={['tecnico', 'admin']}>
                    <VisorPage />
                  </ProtectedRoute>
                }
              />

              {/* Solo administradores: revisión de reportes de técnicos */}
              <Route
                path="/admin/reportes"
                element={
                  <ProtectedRoute rolesPermitidos={['admin']}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </GaleriaProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;