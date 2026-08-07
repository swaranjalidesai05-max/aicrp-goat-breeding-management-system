import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import BreedingEventsPage from './pages/BreedingEventsPage';
import BucksPage from './pages/BucksPage';
import ClustersPage from './pages/ClustersPage';
import DashboardPage from './pages/DashboardPage';
import DoesPage from './pages/DoesPage';
import FarmersPage from './pages/FarmersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import UsersPage from './pages/UsersPage';
import VillagesPage from './pages/VillagesPage';
import WeightsPage from './pages/WeightsPage';
import ProgenyPage from './pages/ProgenyPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-stone-600">
        Loading session...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-stone-600">
        Loading session...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/villages"
        element={
          <ProtectedRoute>
            <VillagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmers"
        element={
          <ProtectedRoute>
            <FarmersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bucks"
        element={
          <ProtectedRoute>
            <BucksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/does"
        element={
          <ProtectedRoute>
            <DoesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clusters"
        element={
          <ProtectedRoute>
            <ClustersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/breeding-events"
        element={
          <ProtectedRoute>
            <BreedingEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progeny"
        element={
          <ProtectedRoute>
            <ProgenyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/weights"
        element={
          <ProtectedRoute>
            <WeightsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
