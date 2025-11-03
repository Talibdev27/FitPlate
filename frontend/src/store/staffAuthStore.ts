import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type StaffRole = 'SUPER_ADMIN' | 'LOCATION_MANAGER' | 'CHEF' | 'DELIVERY_DRIVER' | 'CUSTOMER_SUPPORT' | 'NUTRITIONIST';

interface Staff {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  locationId?: string | null;
  isActive: boolean;
}

interface StaffAuthState {
  staff: Staff | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (staff: Staff, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateStaff: (staff: Partial<Staff>) => void;
  setHydrated: () => void;
}

export const useStaffAuthStore = create<StaffAuthState>()(
  persist(
    (set) => ({
      staff: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (staff, accessToken, refreshToken) => {
        set({
          staff,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        localStorage.setItem('staffAccessToken', accessToken);
        localStorage.setItem('staffRefreshToken', refreshToken);
      },
      logout: () => {
        set({
          staff: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('staffAccessToken');
        localStorage.removeItem('staffRefreshToken');
      },
      updateStaff: (staffData) => {
        set((state) => ({
          staff: state.staff ? { ...state.staff, ...staffData } : null,
        }));
      },
      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: 'staff-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if we have a token and restore auth state
        if (state) {
          const token = localStorage.getItem('staffAccessToken');
          if (token && state.staff) {
            state.isAuthenticated = true;
            state.accessToken = token;
          }
          state.isHydrated = true;
        }
      },
    }
  )
);

