import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OnboardingStepper } from '../../components/OnboardingStepper';

export type PlanType = 'daily' | 'weekly' | 'monthly';

export interface Plan {
  id: PlanType;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  mealsPerWeek: number;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'daily',
    name: {
      uz: 'Kunlik',
      ru: 'Ежедневный',
      en: 'Daily',
    },
    mealsPerWeek: 7,
    price: 350000,
    currency: 'UZS',
    features: [
      '7 ta ovqat/hafta',
      'Har kuni yangi ovqat',
      'Shaxsiylashtirilgan reja',
      'Bepul yetkazib berish',
    ],
  },
  {
    id: 'weekly',
    name: {
      uz: 'Haftalik',
      ru: 'Еженедельный',
      en: 'Weekly',
    },
    mealsPerWeek: 5,
    price: 250000,
    currency: 'UZS',
    features: [
      '5 ta ovqat/hafta',
      'Haftada 5 kun',
      'Shaxsiylashtirilgan reja',
      'Bepul yetkazib berish',
    ],
    popular: true,
  },
  {
    id: 'monthly',
    name: {
      uz: 'Oylik',
      ru: 'Ежемесячный',
      en: 'Monthly',
    },
    mealsPerWeek: 20,
    price: 900000,
    currency: 'UZS',
    features: [
      '20 ta ovqat/oy',
      'Eng yaxshi narx',
      'Shaxsiylashtirilgan reja',
      'Bepul yetkazib berish',
      'Maxsus chegirmalar',
    ],
  },
];

export const PlanSelection = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(false);

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  const handleContinue = () => {
    if (!selectedPlan) return;

    // Save selected plan to sessionStorage
    sessionStorage.setItem('onboarding_plan', selectedPlan);
    sessionStorage.setItem('onboarding_data', JSON.stringify({
      plan: selectedPlan,
      step: 1,
    }));

    navigate('/onboarding/details');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingStepper currentStep={1} />

        <div className="max-w-4xl mx-auto mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {t('onboarding.step1.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('onboarding.step1.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => {
              const planName = plan.name[currentLanguage] || plan.name.en;
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl shadow-lg p-6 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    isSelected
                      ? 'ring-4 ring-orange-500 border-2 border-orange-500'
                      : 'border-2 border-gray-200 hover:border-orange-300'
                  } ${plan.popular ? 'md:scale-105' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-coral-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        {t('onboarding.plan.popular', 'Most Popular')}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {planName}
                    </h3>
                    <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                      {formatPrice(plan.price)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {plan.mealsPerWeek} {t('onboarding.plan.mealsPerWeek', 'meals/week')}
                    </p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-coral-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                  >
                    {isSelected
                      ? t('onboarding.plan.selected', 'Selected')
                      : t('onboarding.plan.select', 'Select Plan')}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedPlan || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                selectedPlan && !loading
                  ? 'bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? t('common.loading', 'Loading...') : t('onboarding.next', 'Next')} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
