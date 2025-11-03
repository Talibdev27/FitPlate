import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OnboardingStepper } from '../../components/OnboardingStepper';

interface SubscriptionDetails {
  plan: string;
  total: number;
  firstDeliveryDate: string;
}

export const Success = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  useEffect(() => {
    loadSubscriptionDetails();
  }, []);

  const loadSubscriptionDetails = () => {
    const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');
    
    if (!onboardingData.payment || onboardingData.payment.status !== 'completed') {
      navigate('/onboarding/plan');
      return;
    }

    // Calculate first delivery date (next week)
    const firstDeliveryDate = new Date();
    firstDeliveryDate.setDate(firstDeliveryDate.getDate() + 7);

    setSubscriptionDetails({
      plan: onboardingData.plan,
      total: onboardingData.payment.amount,
      firstDeliveryDate: firstDeliveryDate.toLocaleDateString(currentLanguage === 'uz' ? 'uz-UZ' : currentLanguage === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
  };

  const handleGoToDashboard = () => {
    // Clear onboarding data
    sessionStorage.removeItem('onboarding_data');
    navigate('/dashboard');
  };

  if (!subscriptionDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-block bg-gradient-to-br from-emerald-500 to-green-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-6xl shadow-xl animate-bounce-custom">
              ✓
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('onboarding.success.title', '🎉 Welcome to FitPlate!')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('onboarding.success.subtitle', 'Your subscription has been activated successfully!')}
          </p>

          {/* Subscription Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('onboarding.success.subscriptionDetails', 'Subscription Details')}
            </h2>

            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">{t('onboarding.success.plan', 'Plan')}</span>
                <span className="font-semibold text-gray-900">
                  {subscriptionDetails.plan === 'daily' ? t('onboarding.success.planDaily', 'Daily') :
                   subscriptionDetails.plan === 'weekly' ? t('onboarding.success.planWeekly', 'Weekly') :
                   t('onboarding.success.planMonthly', 'Monthly')}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">{t('onboarding.success.firstDelivery', 'First Delivery')}</span>
                <span className="font-semibold text-gray-900">{subscriptionDetails.firstDeliveryDate}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">{t('onboarding.success.total', 'Total Paid')}</span>
                <span className="font-semibold text-emerald-600 text-xl">
                  {new Intl.NumberFormat('uz-UZ', {
                    style: 'currency',
                    currency: 'UZS',
                    minimumFractionDigits: 0,
                  }).format(subscriptionDetails.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-blue-800">
              {t('onboarding.success.info', 'You will receive an email confirmation shortly. We\'ll start preparing your meals and deliver them according to your schedule!')}
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGoToDashboard}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg"
          >
            {t('onboarding.success.goToDashboard', 'Go to Dashboard')} →
          </button>
        </div>
      </div>
    </div>
  );
};
