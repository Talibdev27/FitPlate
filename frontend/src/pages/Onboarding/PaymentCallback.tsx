import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paymentApi } from '../../api/payments';

export const PaymentCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');
      
      if (!onboardingData.payment || !onboardingData.payment.paymentId) {
        setError('Payment information not found');
        setLoading(false);
        return;
      }

      // Verify payment status with backend
      const response = await paymentApi.verifyPayment(onboardingData.payment.paymentId);

      if (response.success && response.data) {
        const status = response.data.status;
        setPaymentStatus(status === 'COMPLETED' ? 'completed' : status === 'FAILED' ? 'failed' : 'pending');

        // Update payment in session storage
        sessionStorage.setItem('onboarding_data', JSON.stringify({
          ...onboardingData,
          payment: {
            ...onboardingData.payment,
            status: status.toLowerCase(),
            verifiedAt: new Date().toISOString(),
          },
        }));

        if (status === 'COMPLETED') {
          // Redirect to success page after a short delay
          setTimeout(() => {
            navigate('/onboarding/success');
          }, 2000);
        } else {
          setLoading(false);
        }
      } else {
        throw new Error('Failed to verify payment');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to verify payment');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">{t('onboarding.payment.verifying', 'Verifying payment...')}</p>
        </div>
      </div>
    );
  }

  if (error || paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('onboarding.payment.failed', 'Payment Failed')}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || t('onboarding.payment.failedMessage', 'Your payment could not be processed. Please try again.')}
          </p>
          <button
            onClick={() => navigate('/onboarding/payment')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            {t('onboarding.payment.tryAgain', 'Try Again')}
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('onboarding.payment.success', 'Payment Successful')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('onboarding.payment.redirecting', 'Redirecting to success page...')}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

