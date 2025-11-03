import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Subscription', path: '/dashboard/subscription', icon: '📋' },
  { label: 'Meals', path: '/dashboard/meals', icon: '🍽️' },
  { label: 'Deliveries', path: '/dashboard/deliveries', icon: '🚚' },
  { label: 'Orders', path: '/dashboard/orders', icon: '📦' },
  { label: 'Progress', path: '/dashboard/progress', icon: '📈' },
  { label: 'Profile', path: '/dashboard/profile', icon: '👤' },
  { label: 'Payments', path: '/dashboard/payments', icon: '💳' },
];

export const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40 p-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-between w-full"
        >
          <span className="font-semibold text-gray-900">Menu</span>
          <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-600 to-green-600 text-white transform transition-transform duration-300 ease-in-out lg:transition-none`}
          style={{ top: '64px' }}
        >
          <div className="flex flex-col h-full">
            {/* User info */}
            <div className="p-4 border-b border-emerald-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'User'}
                  </p>
                  <p className="text-xs text-emerald-200 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-white text-emerald-600 shadow-lg'
                            : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{t(`dashboard.${item.label.toLowerCase()}`, item.label)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-emerald-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-700 hover:text-white transition-all"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">{t('auth.logout', 'Logout')}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ top: '64px' }}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
