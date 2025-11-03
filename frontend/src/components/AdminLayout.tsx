import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStaffAuthStore, StaffRole } from '../store/staffAuthStore';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles: StaffRole[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: '📊',
    roles: ['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'DELIVERY_DRIVER', 'CUSTOMER_SUPPORT', 'NUTRITIONIST'],
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: '👥',
    roles: ['SUPER_ADMIN', 'CUSTOMER_SUPPORT', 'NUTRITIONIST'],
  },
  {
    label: 'Staff',
    path: '/admin/staff',
    icon: '👔',
    roles: ['SUPER_ADMIN', 'LOCATION_MANAGER'],
  },
  {
    label: 'Meals',
    path: '/admin/meals',
    icon: '🍽️',
    roles: ['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'NUTRITIONIST'],
  },
  {
    label: 'Orders',
    path: '/admin/orders',
    icon: '📦',
    roles: ['SUPER_ADMIN', 'LOCATION_MANAGER', 'CHEF', 'DELIVERY_DRIVER', 'CUSTOMER_SUPPORT'],
  },
  {
    label: 'Locations',
    path: '/admin/locations',
    icon: '📍',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: '📈',
    roles: ['SUPER_ADMIN', 'LOCATION_MANAGER'],
  },
];

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { staff, logout } = useStaffAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!staff) {
    return null;
  }

  // Filter menu items based on staff role
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(staff.role));

  const getRoleDisplayName = (role: StaffRole): string => {
    const roleNames: Record<StaffRole, string> = {
      SUPER_ADMIN: 'Super Admin',
      LOCATION_MANAGER: 'Location Manager',
      CHEF: 'Chef',
      DELIVERY_DRIVER: 'Delivery Driver',
      CUSTOMER_SUPPORT: 'Customer Support',
      NUTRITIONIST: 'Nutritionist',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-gray-800 text-white transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700">
            <h1 className="text-xl font-bold">FitPlate Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {visibleMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Staff Info */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-lg">
                  {staff.firstName?.[0]?.toUpperCase() || staff.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {staff.firstName} {staff.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate">{getRoleDisplayName(staff.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            ☰
          </button>
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {t('auth.logout', 'Logout')}
          </button>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

