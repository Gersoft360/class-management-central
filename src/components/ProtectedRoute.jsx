
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      console.log('User not authenticated, redirecting to login');
    }
  }, [loading, currentUser]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;
