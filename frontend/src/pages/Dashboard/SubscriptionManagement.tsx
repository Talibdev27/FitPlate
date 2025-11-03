import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../api/client';

interface Subscription {
  id: string;
  planType: string;
  mealsPerDay: number;
  status: string;
  startDate: string;
  endDate?: string;
  price: number;
  paymentStatus: string;
  deliveryDays: number[];
  deliveryTimeSlot?: string;
  selectedMeals: string[];
}

export const SubscriptionManagement = () => {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subscriptions/current');
      if (response.data.success && response.data.data) {
        setSubscription(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!confirm(t('dashboard.subscriptionManagement.confirmPause', 'Are you sure you want to pause your subscription?'))) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const response = await apiClient.post('/subscriptions/pause');
      if (response.data.success) {
        setSubscription(response.data.data);
        setSuccess(t('dashboard.subscriptionManagement.paused', 'Subscription paused successfully'));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to pause subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const response = await apiClient.post('/subscriptions/resume');
      if (response.data.success) {
        setSubscription(response.data.data);
        setSuccess(t('dashboard.subscriptionManagement.resumed', 'Subscription resumed successfully'));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t('dashboard.subscriptionManagement.confirmCancel', 'Are you sure you want to cancel your subscription? This action cannot be undone.'))) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const response = await apiClient.post('/subscriptions/cancel');
      if (response.data.success) {
        setSubscription(response.data.data);
        setSuccess(t('dashboard.subscriptionManagement.cancelled', 'Subscription cancelled successfully'));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
          statusClasses[status] || statusClasses.EXPIRED
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

  if (!subscription) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dashboard.subscriptionManagement.noSubscription', 'No Active Subscription')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('dashboard.subscriptionManagement.subscribeNow', 'Start your healthy meal journey today!')}
        </p>
        <a
          href="/onboarding/plan"
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-coral-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-coral-600 transition-all shadow-lg"
        >
          {t('dashboard.startSubscription', 'Start Subscription')} →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.subscriptionManagement.title', 'Subscription Management')}
        </h1>
        <p className="text-gray-600">
          {t('dashboard.subscriptionManagement.description', 'Manage your subscription, pause, resume, or cancel anytime')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Subscription Details Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t('dashboard.subscriptionManagement.details', 'Subscription Details')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscription.plan', 'Plan')}</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{subscription.planType}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscription.status', 'Status')}</p>
            {getStatusBadge(subscription.status)}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscriptionManagement.mealsPerDay', 'Meals Per Day')}</p>
            <p className="text-lg font-semibold text-gray-900">{subscription.mealsPerDay}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscription.price', 'Price')}</p>
            <p className="text-lg font-semibold text-emerald-600">{formatPrice(subscription.price)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscriptionManagement.startDate', 'Start Date')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(subscription.startDate).toLocaleDateString()}
            </p>
          </div>

          {subscription.endDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscriptionManagement.endDate', 'End Date')}</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscriptionManagement.paymentStatus', 'Payment Status')}</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                subscription.paymentStatus === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {subscription.paymentStatus}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">{t('dashboard.subscriptionManagement.selectedMeals', 'Selected Meals')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {Array.isArray(subscription.selectedMeals) ? subscription.selectedMeals.length : 0} meals
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t('dashboard.subscriptionManagement.actions', 'Actions')}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {subscription.status === 'ACTIVE' && (
            <button
              onClick={handlePause}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? t('common.loading', 'Loading...') : t('dashboard.subscriptionManagement.pause', 'Pause Subscription')}
            </button>
          )}

          {subscription.status === 'PAUSED' && (
            <button
              onClick={handleResume}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? t('common.loading', 'Loading...') : t('dashboard.subscriptionManagement.resume', 'Resume Subscription')}
            </button>
          )}

          {(subscription.status === 'ACTIVE' || subscription.status === 'PAUSED') && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? t('common.loading', 'Loading...') : t('dashboard.subscriptionManagement.cancel', 'Cancel Subscription')}
            </button>
          )}

          <a
            href="/onboarding/plan"
            className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-center"
          >
            {t('dashboard.subscriptionManagement.changePlan', 'Change Plan')}
          </a>
        </div>
      </div>
    </div>
  );
};
