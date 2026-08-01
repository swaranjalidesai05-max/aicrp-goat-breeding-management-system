import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import BreedingEventsPage from './pages/BreedingEventsPage';
import BucksPage from './pages/BucksPage';
import DashboardPage from './pages/DashboardPage';
import DoesPage from './pages/DoesPage';
import FarmersPage from './pages/FarmersPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import VillagesPage from './pages/VillagesPage';

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
        path="/breeding-events"
        element={
          <ProtectedRoute>
            <BreedingEventsPage />
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
