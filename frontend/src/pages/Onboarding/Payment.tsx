import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OnboardingStepper } from '../../components/OnboardingStepper';
import { paymentApi } from '../../api/payments';

interface OrderSummary {
  plan: {
    id: string;
    name: string;
    mealsPerWeek: number;
    price: number;
  };
  selectedMeals: string[];
  delivery: {
    location: string;
    address: string;
    timeSlot: string;
    days: number[];
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const Payment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  useEffect(() => {
    loadOrderSummary();
  }, []);

  const loadOrderSummary = () => {
    const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');
    
    if (!onboardingData.plan || !onboardingData.selectedMeals || !onboardingData.deliveryAddress) {
      navigate('/onboarding/plan');
      return;
    }

    // Calculate totals
    const planPrice = onboardingData.plan === 'daily' ? 350000 :
                      onboardingData.plan === 'weekly' ? 250000 : 900000;
    
    const deliveryFee = 0; // Free delivery for now
    const total = planPrice + deliveryFee;

    const planNames: Record<string, { uz: string; ru: string; en: string }> = {
      daily: { uz: 'Kunlik', ru: 'Ежедневный', en: 'Daily' },
      weekly: { uz: 'Haftalik', ru: 'Еженедельный', en: 'Weekly' },
      monthly: { uz: 'Oylik', ru: 'Ежемесячный', en: 'Monthly' },
    };

    const mealsPerWeek: Record<string, number> = {
      daily: 7,
      weekly: 5,
      monthly: 20,
    };

    setOrderSummary({
      plan: {
        id: onboardingData.plan,
        name: planNames[onboardingData.plan][currentLanguage] || planNames[onboardingData.plan].en,
        mealsPerWeek: mealsPerWeek[onboardingData.plan],
        price: planPrice,
      },
      selectedMeals: onboardingData.selectedMeals || [],
      delivery: {
        location: onboardingData.deliveryAddress.locationId || '',
        address: onboardingData.deliveryAddress.deliveryAddress || '',
        timeSlot: onboardingData.deliveryAddress.deliveryTimeSlot || 'afternoon',
        days: onboardingData.deliveryAddress.deliveryDays || [],
      },
      subtotal: planPrice,
      deliveryFee,
      total,
    });
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      setError(t('onboarding.payment.acceptTerms', 'Please accept the terms and conditions'));
      return;
    }

    if (!orderSummary) {
      setError('Order summary is missing. Please start over.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');

      // Create Payme payment
      const paymentResponse = await paymentApi.createPaymePayment({
        amount: orderSummary.total,
        subscriptionId: onboardingData.subscriptionId, // Will be created after payment
        description: `Payment for ${orderSummary.plan.name} subscription`,
        returnUrl: `${window.location.origin}/onboarding/payment/callback`,
      });

      if (paymentResponse.success && paymentResponse.data) {
        // Save payment info to session storage
        sessionStorage.setItem('onboarding_data', JSON.stringify({
          ...onboardingData,
          payment: {
            paymentId: paymentResponse.data.paymentId,
            invoiceId: paymentResponse.data.invoiceId,
            amount: paymentResponse.data.amount,
            method: 'payme',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          step: 5,
        }));

        // Redirect to Payme payment page
        window.location.href = paymentResponse.data.paymentUrl;
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/address');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!orderSummary) {
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
        <OnboardingStepper currentStep={5} />

        <div className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('onboarding.step5.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('onboarding.step5.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('onboarding.payment.orderSummary', 'Order Summary')}
                </h2>

                {/* Plan */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{orderSummary.plan.name}</h3>
                      <p className="text-sm text-gray-600">
                        {orderSummary.plan.mealsPerWeek} {t('onboarding.payment.mealsPerWeek', 'meals/week')}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">
                      {formatPrice(orderSummary.plan.price)}
                    </div>
                  </div>
                </div>

                {/* Selected Meals Count */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {t('onboarding.payment.selectedMeals', 'Selected Meals')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {orderSummary.selectedMeals.length} {t('onboarding.payment.meals', 'meals')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('onboarding.payment.delivery', 'Delivery')}
                  </h3>
                  <p className="text-sm text-gray-600">{orderSummary.delivery.address}</p>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>{t('onboarding.payment.subtotal', 'Subtotal')}</span>
                    <span>{formatPrice(orderSummary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{t('onboarding.payment.deliveryFee', 'Delivery Fee')}</span>
                    <span>{formatPrice(orderSummary.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>{t('onboarding.payment.total', 'Total')}</span>
                    <span className="text-emerald-600">{formatPrice(orderSummary.total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('onboarding.payment.paymentMethod', 'Payment Method')}
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Payme</p>
                      <p className="text-sm text-gray-600">
                        {t('onboarding.payment.paymeDescription', 'Pay securely with Payme')}
                      </p>
                    </div>
                    <div className="text-2xl">💳</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t('onboarding.payment.complete', 'Complete Order')}
                </h2>

                {/* Terms and Conditions */}
                <div className="mb-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {t('onboarding.payment.acceptTermsText', 'I accept the terms and conditions')}
                    </span>
                  </label>
                </div>

                {/* Total */}
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('onboarding.payment.total', 'Total')}</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(orderSummary.total)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={!acceptedTerms || loading}
                  className={`w-full px-6 py-4 rounded-lg font-semibold text-white transition-all duration-300 mb-4 ${
                    acceptedTerms && !loading
                      ? 'bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      {t('onboarding.payment.processing', 'Processing...')}
                    </span>
                  ) : (
                    t('onboarding.finish', 'Complete Order')
                  )}
                </button>

                {/* Back Button */}
                <button
                  onClick={handleBack}
                  className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← {t('onboarding.back', 'Back')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
