import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface DashboardStats {
  todayOrders: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingDeliveries: number;
}

interface RecentOrder {
  id: string;
  status: string;
  deliveryDate: string;
  totalPrice: number;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  location: {
    id: string;
    name: string;
    city: string;
  };
  items: Array<{
    id: string;
    meal: {
      id: string;
      name: any;
    };
    quantity: number;
  }>;
}

export const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ordersResponse] = await Promise.all([
        apiClient.get('/admin/dashboard/stats'),
        apiClient.get('/admin/dashboard/recent-orders'),
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (ordersResponse.data.success) {
        setRecentOrders(ordersResponse.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-blue-100 text-blue-800',
      READY: 'bg-purple-100 text-purple-800',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          statusClasses[status] || statusClasses.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('admin.dashboard.title', 'Admin Dashboard')}
        </h1>
        <p className="text-gray-600">
          {t('admin.dashboard.subtitle', 'Overview of your business operations')}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.dashboard.stats.todayOrders', "Today's Orders")}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <Link
              to="/admin/orders"
              className="mt-4 block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t('admin.dashboard.viewAll', 'View All')} →
            </Link>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.dashboard.stats.activeSubscriptions', 'Active Subscriptions')}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
            <Link
              to="/admin/users"
              className="mt-4 block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t('admin.dashboard.viewAll', 'View All')} →
            </Link>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">
                  {t('admin.dashboard.stats.todayRevenue', "Today's Revenue")}
                </p>
                <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <Link
              to="/admin/analytics"
              className="mt-4 block text-sm opacity-90 hover:opacity-100 font-medium"
            >
              {t('admin.dashboard.viewAnalytics', 'View Analytics')} →
            </Link>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.dashboard.stats.pendingDeliveries', 'Pending Deliveries')}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
              </div>
              <div className="text-4xl">🚚</div>
            </div>
            <Link
              to="/admin/orders"
              className="mt-4 block text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t('admin.dashboard.viewAll', 'View All')} →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {t('admin.dashboard.recentOrders', 'Recent Orders')}
          </h2>
          <Link
            to="/admin/orders"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t('admin.dashboard.viewAll', 'View All')} →
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.orderId', 'Order ID')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.customer', 'Customer')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.deliveryDate', 'Delivery Date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.status', 'Status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.dashboard.total', 'Total')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => {
                  const mealName = typeof order.items[0]?.meal?.name === 'object'
                    ? order.items[0].meal.name[currentLanguage] || order.items[0].meal.name.en || 'Meal'
                    : order.items[0]?.meal?.name || 'Meal';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {order.user.firstName && order.user.lastName
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : order.user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('admin.dashboard.noOrders', 'No orders found')}
          </div>
        )}
      </div>
    </div>
  );
};
