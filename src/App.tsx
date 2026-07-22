import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlanesPagoPage from './pages/PlanesPagoPage';
import ImportacionesPage from './pages/ImportacionesPage';
import ReportesPage from './pages/Reportes/ReportesPage';
import NotificacionesPage from './pages/NotificacionesPage';
import HistorialGestionesPage from './pages/HistorialGestionesPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/notificaciones" element={<NotificacionesPage />} />
              <Route element={<ProtectedRoute allowedRoles={['admin', 'sys-admin']} />}>
                <Route
                  path="/historial-gestiones"
                  element={<HistorialGestionesPage />}
                />
                <Route path="/planes-pago" element={<PlanesPagoPage />} />
                <Route path="/importaciones" element={<ImportacionesPage />} />
                <Route path="/reportes" element={<ReportesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
