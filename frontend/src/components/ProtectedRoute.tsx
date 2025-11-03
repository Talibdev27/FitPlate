import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useStaffAuthStore } from '../store/staffAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireUser?: boolean; // If true, only allow users (not staff)
  requireStaff?: boolean; // If true, only allow staff (not users)
}

export const ProtectedRoute = ({ children, requireUser, requireStaff }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const { isAuthenticated: isStaffAuthenticated } = useStaffAuthStore();

  // If requireUser is true, only allow user authentication
  if (requireUser) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  // If requireStaff is true, only allow staff authentication
  if (requireStaff) {
    if (!isStaffAuthenticated) {
      return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
  }

  // Default: allow either user or staff
  if (!isAuthenticated && !isStaffAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

