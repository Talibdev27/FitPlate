import { Navigate } from 'react-router-dom';
import { useStaffAuthStore, StaffRole } from '../store/staffAuthStore';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: StaffRole[];
}

export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { isAuthenticated, staff } = useStaffAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!staff || !allowedRoles.includes(staff.role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

