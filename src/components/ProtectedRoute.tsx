import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { firebaseUser, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has at least one of them
  if (allowedRoles && user) {
    const hasPermission = user.roles?.some(role => allowedRoles.includes(role));
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
