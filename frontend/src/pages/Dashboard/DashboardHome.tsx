import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Subscription {
  id: string;
  planType: string;
  status: string;
  startDate: string;
  endDate?: string;
  price: number;
  mealsPerDay: number;
  orders?: Array<{
    id: string;
    deliveryDate: string;
    status: string;
    totalPrice: number;
  }>;
}

export const DashboardHome = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextDelivery, setNextDelivery] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (nextDelivery) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = nextDelivery.getTime() - now.getTime();

        if (diff <= 0) {
          setCountdown(t('dashboard.delivery.arrived', 'Delivery arrived!'));
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setCountdown(
          `${days}d ${hours}h ${minutes}m`
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextDelivery, t]);

  const fetchSubscription = async () => {
    try {
      const response = await apiClient.get('/subscriptions/current');
      if (response.data.success && response.data.data) {
        setSubscription(response.data.data);
        
        // Find next delivery
        if (response.data.data.orders && response.data.data.orders.length > 0) {
          const nextOrder = response.data.data.orders[0];
          setNextDelivery(new Date(nextOrder.deliveryDate));
        }
      }
    } catch (err: any) {
      // No subscription found or not authenticated
      console.log('No active subscription found');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
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
          {t('dashboard.welcome', 'Welcome back')}, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          {t('dashboard.overview', 'Here\'s an overview of your subscription and upcoming deliveries')}
        </p>
      </div>

      {/* Subscription Status Card */}
      {subscription ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Subscription Overview */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('dashboard.subscription.title', 'My Subscription')}
                </h2>
                <span className="text-3xl">📋</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.subscription.plan', 'Plan')}</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {subscription.planType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.subscription.status', 'Status')}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      subscription.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {subscription.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('dashboard.subscription.price', 'Price')}</p>
                  <p className="text-lg font-semibold text-emerald-600">
                    {formatPrice(subscription.price)}
                  </p>
                </div>
              </div>
              <Link
                to="/dashboard/subscription"
                className="mt-4 block text-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {t('dashboard.subscription.manage', 'Manage Subscription')}
              </Link>
            </div>

            {/* Next Delivery */}
            {nextDelivery && (
              <div className="bg-gradient-to-br from-orange-500 to-coral-500 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    {t('dashboard.delivery.next', 'Next Delivery')}
                  </h2>
                  <span className="text-3xl">🚚</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm opacity-90">
                    {nextDelivery.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-3xl font-bold">{countdown}</p>
                  <Link
                    to="/dashboard/deliveries"
                    className="mt-4 block text-center px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
                  >
                    {t('dashboard.delivery.viewSchedule', 'View Schedule')}
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('dashboard.quickActions', 'Quick Actions')}
                </h2>
                <span className="text-3xl">⚡</span>
              </div>
              <div className="space-y-3">
                <Link
                  to="/dashboard/meals"
                  className="block w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-center font-medium"
                >
                  {t('dashboard.actions.selectMeals', 'Select Meals')}
                </Link>
                <Link
                  to="/dashboard/orders"
                  className="block w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
                >
                  {t('dashboard.actions.viewOrders', 'View Orders')}
                </Link>
                <Link
                  to="/dashboard/progress"
                  className="block w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-center font-medium"
                >
                  {t('dashboard.actions.trackProgress', 'Track Progress')}
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          {subscription.orders && subscription.orders.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('dashboard.recentOrders', 'Upcoming Deliveries')}
                </h2>
                <Link
                  to="/dashboard/orders"
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {t('dashboard.viewAll', 'View All')} →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('dashboard.orders.date', 'Date')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('dashboard.orders.status', 'Status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('dashboard.orders.total', 'Total')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscription.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'DELIVERED'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'OUT_FOR_DELIVERY'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('dashboard.noSubscription', 'No Active Subscription')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('dashboard.subscribeNow', 'Start your healthy meal journey today!')}
          </p>
          <Link
            to="/onboarding/plan"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-coral-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-coral-600 transition-all shadow-lg"
          >
            {t('dashboard.startSubscription', 'Start Subscription')} →
          </Link>
        </div>
      )}
    </div>
  );
};
