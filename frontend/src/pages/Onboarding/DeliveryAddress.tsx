import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { OnboardingStepper } from '../../components/OnboardingStepper';
import { apiClient } from '../../api/client';

const deliveryAddressSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  deliveryAddress: z.string().min(10, 'Address must be at least 10 characters'),
  phone: z.string().optional(),
  deliveryTimeSlot: z.enum(['morning', 'afternoon', 'evening']),
  deliveryDays: z.array(z.number()).min(1, 'Select at least one delivery day'),
  deliveryNotes: z.string().optional(),
});

type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>;

interface Location {
  id: string;
  name: string;
  city: string;
  district?: string;
}

const deliveryDaysOptions = [
  { value: 0, label: { uz: 'Yakshanba', ru: 'Воскресенье', en: 'Sunday' } },
  { value: 1, label: { uz: 'Dushanba', ru: 'Понедельник', en: 'Monday' } },
  { value: 2, label: { uz: 'Seshanba', ru: 'Вторник', en: 'Tuesday' } },
  { value: 3, label: { uz: 'Chorshanba', ru: 'Среда', en: 'Wednesday' } },
  { value: 4, label: { uz: 'Payshanba', ru: 'Четверг', en: 'Thursday' } },
  { value: 5, label: { uz: 'Juma', ru: 'Пятница', en: 'Friday' } },
  { value: 6, label: { uz: 'Shanba', ru: 'Суббота', en: 'Saturday' } },
];

const timeSlotOptions = [
  { value: 'morning', label: { uz: 'Ertalab (8:00-12:00)', ru: 'Утро (8:00-12:00)', en: 'Morning (8:00-12:00)' } },
  { value: 'afternoon', label: { uz: 'Tushdan keyin (12:00-17:00)', ru: 'После полудня (12:00-17:00)', en: 'Afternoon (12:00-17:00)' } },
  { value: 'evening', label: { uz: 'Kechqurun (17:00-21:00)', ru: 'Вечер (17:00-21:00)', en: 'Evening (17:00-21:00)' } },
];

export const DeliveryAddress = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLanguage = i18n.language as 'uz' | 'ru' | 'en';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryAddressFormData>({
    resolver: zodResolver(deliveryAddressSchema),
    defaultValues: {
      deliveryDays: [],
      deliveryTimeSlot: 'afternoon',
    },
  });

  const selectedDays = watch('deliveryDays') || [];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      // TODO: Replace with actual locations API endpoint
      // For now, using mock data
      const mockLocations: Location[] = [
        { id: '1', name: 'Toshkent', city: 'Tashkent', district: 'Yunusabad' },
        { id: '2', name: 'Samarqand', city: 'Samarkand', district: 'Center' },
        { id: '3', name: 'Buxoro', city: 'Bukhara', district: 'Old City' },
      ];
      setLocations(mockLocations);
    } catch (err: any) {
      setError('Failed to load locations. Please try again.');
    }
  };

  const toggleDeliveryDay = (day: number) => {
    const current = selectedDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setValue('deliveryDays', updated);
  };

  const onSubmit = async (data: DeliveryAddressFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Save to sessionStorage
      const onboardingData = JSON.parse(sessionStorage.getItem('onboarding_data') || '{}');
      sessionStorage.setItem('onboarding_data', JSON.stringify({
        ...onboardingData,
        deliveryAddress: data,
        step: 4,
      }));

      navigate('/onboarding/payment');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save delivery address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/meals');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingStepper currentStep={4} />

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('onboarding.step4.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('onboarding.step4.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('onboarding.address.city', 'City/District')} *
              </label>
              <select
                {...register('locationId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('onboarding.address.selectLocation', 'Select location')}</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} {location.district && `- ${location.district}`}
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('onboarding.address.fullAddress', 'Full Address')} *
              </label>
              <textarea
                {...register('deliveryAddress')}
                rows={3}
                placeholder={t('onboarding.address.addressPlaceholder', 'Street, building, apartment number...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone')} ({t('common.optional')})
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+998901234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Delivery Time Slot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('onboarding.address.deliveryTime', 'Preferred Delivery Time')} *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {timeSlotOptions.map((option) => {
                  const label = option.label[currentLanguage] || option.label.en;
                  const isSelected = watch('deliveryTimeSlot') === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('deliveryTimeSlot')}
                        value={option.value}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.deliveryTimeSlot && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryTimeSlot.message}</p>
              )}
            </div>

            {/* Delivery Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('onboarding.address.deliveryDays', 'Delivery Days')} *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {deliveryDaysOptions.map((day) => {
                  const label = day.label[currentLanguage] || day.label.en;
                  const isSelected = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDeliveryDay(day.value)}
                      className={`p-3 rounded-lg font-medium text-sm transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.deliveryDays && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDays.message}</p>
              )}
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('onboarding.address.deliveryNotes', 'Delivery Instructions')} ({t('common.optional')})
              </label>
              <textarea
                {...register('deliveryNotes')}
                rows={3}
                placeholder={t('onboarding.address.notesPlaceholder', 'Any special instructions for delivery...')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← {t('onboarding.back', 'Back')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-coral-500 hover:from-orange-600 hover:to-coral-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {loading ? t('common.loading', 'Loading...') : `${t('onboarding.next', 'Next')} →`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
