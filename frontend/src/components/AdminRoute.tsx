import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStaffAuthStore } from '../store/staffAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isHydrated } = useStaffAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give Zustand a moment to hydrate, then check
    const timer = setTimeout(() => {
      setChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // While checking, also verify localStorage directly
  const hasTokenInStorage = typeof window !== 'undefined' && 
    !!localStorage.getItem('staffAccessToken');

  // If store says authenticated, trust it
  // If store not hydrated yet but we have token in localStorage, allow access
  // This handles the race condition where Zustand hasn't hydrated yet
  const isActuallyAuthenticated = isAuthenticated || 
    (!isHydrated && hasTokenInStorage);

  if (checking) {
    // Show loading state while checking
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isActuallyAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

