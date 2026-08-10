import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Panel del técnico: solo accesible con rol "tecnico" */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute rolesPermitidos={['tecnico']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Panel del administrador: solo accesible con rol "admin" */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute rolesPermitidos={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;