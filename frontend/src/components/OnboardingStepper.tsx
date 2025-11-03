import { useTranslation } from 'react-i18next';

interface OnboardingStepperProps {
  currentStep: number;
  totalSteps?: number;
}

export const OnboardingStepper = ({ currentStep, totalSteps = 5 }: OnboardingStepperProps) => {
  const { t } = useTranslation();

  const steps = [
    { number: 1, label: t('onboarding.step1.label', 'Plan Selection') },
    { number: 2, label: t('onboarding.step2.label', 'Personal Details') },
    { number: 3, label: t('onboarding.step3.label', 'Meal Selection') },
    { number: 4, label: t('onboarding.step4.label', 'Delivery Address') },
    { number: 5, label: t('onboarding.step5.label', 'Payment') },
  ];

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                      step.number <= currentStep
                        ? 'bg-gradient-to-br from-orange-500 to-coral-500 shadow-lg scale-110'
                        : 'bg-gray-300'
                    }`}
                  >
                    {step.number < currentStep ? (
                      <span className="text-lg">✓</span>
                    ) : (
                      step.number
                    )}
                  </div>
                  {/* Step Label */}
                  <div className="mt-2 text-xs sm:text-sm text-center max-w-[80px]">
                    <span
                      className={`font-medium ${
                        step.number <= currentStep
                          ? 'text-orange-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 -mt-6">
                    <div
                      className={`h-full transition-all duration-300 ${
                        step.number < currentStep
                          ? 'bg-gradient-to-r from-orange-500 to-coral-500'
                          : 'bg-gray-300'
                      }`}
                      style={{
                        width: step.number < currentStep ? '100%' : '0%',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t('onboarding.progress', 'Step {{current}} of {{total}}', {
              current: currentStep,
              total: totalSteps,
            })}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
            <div
              className="bg-gradient-to-r from-orange-500 to-coral-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
