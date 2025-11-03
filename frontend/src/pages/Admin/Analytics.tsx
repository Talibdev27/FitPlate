import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';

export const Analytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/admin/dashboard/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('admin.analytics.title', 'Analytics & Reports')}
        </h1>
        <p className="text-gray-600">
          {t('admin.analytics.subtitle', 'Business insights and performance metrics')}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.analytics.todayOrders', "Today's Orders")}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.analytics.activeSubscriptions', 'Active Subscriptions')}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">
                  {t('admin.analytics.todayRevenue', "Today's Revenue")}
                </p>
                <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.analytics.pendingDeliveries', 'Pending Deliveries')}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
              </div>
              <div className="text-4xl">🚚</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('admin.analytics.revenueChart', 'Revenue Trends')}
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            {t('admin.analytics.chartPlaceholder', 'Chart visualization will be implemented with a charting library (e.g., Chart.js, Recharts)')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('admin.analytics.orderStats', 'Order Statistics')}
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">
            {t('admin.analytics.chartPlaceholder', 'Chart visualization will be implemented with a charting library (e.g., Chart.js, Recharts)')}
          </p>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700 text-sm">
          {t('admin.analytics.info', 'Note: Advanced analytics with charts and detailed reports can be implemented by integrating charting libraries like Chart.js or Recharts. The current implementation shows basic statistics.')}
        </p>
      </div>
    </div>
  );
};
